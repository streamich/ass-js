import {UInt64} from './util';
import {Expression} from './expression';
import Label from './Label';


export enum SIZE {
    ANY     = -1,       // Any size.
    NONE    = 0,        // Either unknown or not specified yet.
    B       = 8,        // byte
    W       = 16,       // word
    D       = 32,       // double word = 2x word
    Q       = 64,       // quad word = 4x word
    T       = 80,       // ten = 10 bytes
    O       = 128,      // octa word = 8x word
    H       = 256,      // hexadeca word = 16x word
    I       = 512,      // dItriaconta word = 32x word
    X       = SIZE.O,   // xmm register
    Y       = SIZE.H,   // ymm register
    Z       = SIZE.Y,   // zmm register
    A       = 1024,     // amm register
}

export enum SIZEB {
    B1      = SIZE.B,
    B2      = SIZE.W,
    B4      = SIZE.D,
    B8      = SIZE.Q,
    B16     = SIZE.O,
    B32     = SIZE.H,
    B64     = SIZE.I,
}


// 64-bit numbers
export type number64 = [number, number];
export function isNumber64(num) {
    if((num instanceof Array) && (num.length === 2) && (typeof num[0] === 'number') && (typeof num[1] === 'number')) return true;
    else return false;
}

// 128-bit numbers
export type number128 = [number, number, number, number];
export function isNumber128(num) {
    if((num instanceof Array) && (num.length === 4) &&
        (typeof num[0] === 'number') && (typeof num[1] === 'number') &&
        (typeof num[1] === 'number') && (typeof num[2] === 'number')) return true;
    else return false;
}

function isNumberOfDoubles(doubles, num) {
    if(!(num instanceof Array) || (num.length !== doubles)) return false;
    for(var j = 0; j < doubles; j++)
        if(typeof num[j] !== 'number') return false;
    return true;
}

// 256-bit numbers
// export type number256 = [number, number, number, number, number, number, number, number];
// export function isNumber256(num) { return isNumberOfDoubles(8, num); }

// 512-bit numbers
// export type number512 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
// export function isNumber512(num) { return isNumberOfDoubles(16, num); }

// AVX-512 extension says registers will be "at least" 512 bits, so can be 1024 bits and maybe even 2048 bits.
// export type number1024 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
// export type number2048 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
// export function isNumber1024(num) { return isNumberOfDoubles(32, num); }
// export function isNumber2048(num) { return isNumberOfDoubles(64, num); }


// Combined type of all basic "numbers".
export type Tnumber = number|number64|number128;
// export type Tnumber = number|number64|number128|number256|number512|number1024|number2048;
export function isTnumber(num) {
    if(typeof num === 'number') return true;
    else if(isNumber64(num))    return true;
    // else if(isNumber128(num))   return true;
    // else if(isNumber256(num))   return true;
    // else if(isNumber512(num))   return true;
    // else if(isNumber1024(num))  return true;
    // else                        return isNumber2048(num);
    else                        return isNumber128(num);
}


export type TUiOperand           = Operand|Register|Memory|Tnumber|Relative|Expression;
export type TUiOperandNormalized = Operand|Register|Memory|Tnumber|Relative; // `Expression` gets converted to `Relative`.


// General operand used in our assembly "language".
export abstract class Operand {
    // Size in bits.
    size: SIZE | number = SIZE.ANY;

    // Convenience method to get `Register` associated with `Register` or `Memory`.
    reg(): Register {
        return null;
    }

    isRegister(): boolean {
        return this instanceof Register;
    }

    isMemory(): boolean {
        return this instanceof Memory;
    }

    toNumber(): Tnumber {
        return 0;
    }

    toString(): string {
        return '[operand]';
    }
}


// ## Constant
//
// Constants are everything where we directly type in a `number` value.
export class Constant extends Operand {

    static sizeClass (value) {
        if((value <= 0x7f) && (value >= -0x80))             return SIZE.B;
        if((value <= 0x7fff) && (value >= -0x8000))         return SIZE.W;
        if((value <= 0x7fffffff) && (value >= -0x80000000)) return SIZE.D;
        return SIZE.Q;
    }

    static sizeClassUnsigned (value) {
        if(value <= 0xff)           return SIZE.B;
        if(value <= 0xffff)         return SIZE.W;
        if(value <= 0xffffffff)     return SIZE.D;
        return SIZE.Q;
    }

    value: number|number64 = 0;

    // Each byte as a `number` in reverse order.
    octets: number[] = [];

    signed: boolean = true;

    constructor(value: Tnumber = 0, signed = true) {
        super();
        this.signed = signed;
        this.setValue(value);
    }

    setValue(value: number|number64) {
        if(isNumber64(value)) {
            this.setValue64(value as number64);
        } else if(typeof value === 'number') {
            const Klass = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
            /* JS integers are 53-bit, so split here `number`s over 32 bits into [number, number]. */
            if(Klass === SIZE.Q) this.setValue64([UInt64.lo(value), UInt64.hi(value)]);
            else                 this.setValue32(value);
        } else
            throw TypeError(`Constant value must be of type TNumber, "${String(value)}" given.`);
    }

    protected setValue32(value: number) {
        const size = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        this.size = size;
        this.value = value;
        this.octets = [value & 0xFF];
        if(size > SIZE.B) this.octets[1] = (value >> 8) & 0xFF;
        if(size > SIZE.W) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    }

    protected setValue64(value: number64) {
        this.size = SIZE.Q;
        this.value = value;
        const [lo, hi] = value;
        this.octets = [
            (lo) & 0xFF,
            (lo >> 8) & 0xFF,
            (lo >> 16) & 0xFF,
            (lo >> 24) & 0xFF,
            (hi) & 0xFF,
            (hi >> 8) & 0xFF,
            (hi >> 16) & 0xFF,
            (hi >> 24) & 0xFF,
        ];
    }

    protected setValue128(value: number128) {
        this.size = SIZE.O;
        this.value = value;
        var [b0, b1, b2, b3] = value;
        this.octets = [
            (b0) & 0xFF,
            (b0 >> 8) & 0xFF,
            (b0 >> 16) & 0xFF,
            (b0 >> 24) & 0xFF,
            (b1) & 0xFF,
            (b1 >> 8) & 0xFF,
            (b1 >> 16) & 0xFF,
            (b1 >> 24) & 0xFF,
            (b2) & 0xFF,
            (b2 >> 8) & 0xFF,
            (b2 >> 16) & 0xFF,
            (b2 >> 24) & 0xFF,
            (b3) & 0xFF,
            (b3 >> 8) & 0xFF,
            (b3 >> 16) & 0xFF,
            (b3 >> 24) & 0xFF,
        ];
    }

    zeroExtend(size) {
        if(this.size === size) return;
        if(this.size > size) throw Error(`Already larger than ${size} bits, cannot zero-extend.`);
        var missing_bytes = (size - this.size) / 8;
        this.size = size;
        for(var i = 0; i < missing_bytes; i++) this.octets.push(0);
    }

    signExtend(size) {
        if(this.size === size) return;
        if(this.size > size) throw Error(`Already larger than ${size} bits, cannot zero-extend.`);

        // TODO: Make it work with 128-bit numbers too, below.

        // We know it is not number64, because we don't deal with number larger than 64-bit,
        // and if it was 64-bit already there would be nothing to extend.
        var value = this.value as number;

        if(size === SIZE.Q) {
            this.setValue64([UInt64.lo(value), UInt64.hi(value)]);
            return;
        }

        this.size = size;
        this.octets = [value & 0xFF];
        if(size > SIZE.B) this.octets[1] = (value >> 8) & 0xFF;
        if(size > SIZE.W) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    }

    extend(size: SIZE) {
        if(this.signed) this.signExtend(size);
        else this.zeroExtend(size);
    }

    fitsSize(num: Tnumber) {
        const size = this.signed ? Constant.sizeClass(num) : Constant.sizeClassUnsigned(num);

        return size <= this.size;
    }

    toString() {
        var str = '';
        for(var i = this.octets.length - 1; i >= 0; i--) {
            var oct = this.octets[i];
            str += oct > 0xF ? oct.toString(16).toUpperCase() : '0' + oct.toString(16).toUpperCase();
        }
        return '0x' + str;
    }
}

// A constant that can be a variable.
export class Immediate extends Constant {
    static atomName = 'imm';

    static factory (size, value: number|number64 = 0, signed = true) {
        switch(size) {
            case SIZE.B:    return new Immediate8(value, signed);
            case SIZE.W:    return new Immediate16(value, signed);
            case SIZE.D:    return new Immediate32(value, signed);
            case SIZE.Q:    return new Immediate64(value, signed);
            default:        return new Immediate(value, signed);
        }
    }

    static throwIfLarger (value, size, signed) {
        var val_size = signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        if(val_size > size) throw TypeError(`Value ${value} too big for imm8.`);
    }

    variable: Variable = null;

    setVariable (variable: Variable) {
        this.variable = variable;
    }

    cast (ImmediateClass: typeof Immediate) {
        return new ImmediateClass(this.value);
    }

    toString () {
        if(this.variable) return this.variable.toString();
        else return super.toString();
    }
}

export class ImmediateUnsigned extends Immediate {
    static atomName = 'immu';

    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate8 extends Immediate {
    static atomName = 'imm8';

    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.B, this.signed);
        super.setValue(value);
        this.extend(SIZE.B);
    }
}

export class ImmediateUnsigned8 extends Immediate8 {
    static atomName = 'immu8';

    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate16 extends Immediate {
    static atomName = 'imm16';

    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.W, this.signed);
        super.setValue(value);
        this.extend(SIZE.W);
    }
}

export class ImmediateUnsigned16 extends Immediate16 {
    static atomName = 'immu16';

    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate32 extends Immediate {
    static atomName = 'imm32';

    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.D, this.signed);
        super.setValue(value);
        this.extend(SIZE.D);
    }
}

export class ImmediateUnsigned32 extends Immediate32 {
    static atomName = 'immu32';

    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate64 extends Immediate {
    static atomName = 'imm64';

    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.Q, this.signed);
        super.setValue(value);
        this.extend(SIZE.Q);
    }
}

export class ImmediateUnsigned64 extends Immediate64 {
    static atomName = 'immu64';

    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}


// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
export abstract class Register extends Operand {
    static atomName = 'r';

    id: number = 0; // Number value of register.
    name: string = 'reg';

    constructor(id: number, size: SIZE) {
        super();
        this.id = id;
        this.size = size;
    }

    abstract ref(): Memory;

    reg(): Register {
        return this;
    }

    getName() {
        return this.name;
    }

    idSize() { // In bits
        if(this.id < 0b1000)    return 3;
        if(this.id < 0b10000)   return 4;
        if(this.id < 0b100000)  return 5;
        throw Error('Register ID too big.');
    }

    get3bitId() {
        return this.id & 0b111;
    }

    get4bitId() {
        return this.id & 0b1111;
    }

    toNumber() {
        return this.id;
    }

    toString() {
        return this.name;
    }
}


// ## Memory
//
// `Memory` is RAM addresses which `Register`s can *dereference*.
export class Memory extends Operand {
    static atomName = 'm';

    base: Register = null;

    reg (): Register {
        return this.base;
    }

    getAddressSize (): SIZE {
        const reg = this.reg();

        if(reg) return reg.size;

        return SIZE.NONE;
    }

    getOperandSize (): SIZE {
        return this.size;
    }

    ref (base: Register): this {
        this.base = base;
        return this;
    }

    toString () {
        return `[${this.base.toString()}]`;
    }
}


// Operand which needs `evaluation`, it may be that it cannot evaluate on first two passes.
export class Variable extends Operand {
    result: Tnumber = null; // Result of evaluation.

    canEvaluate(owner: Expression): boolean {
        return true;
    }

    evaluate(owner: Expression): Tnumber {
        return 0;
    }

    // Evaluate approximately during 2nd pass.
    evaluatePreliminary(owner: Expression): Tnumber {
        return 0;
    }
}


export type Tvariable = Tnumber|Variable;
export function isTvariable(val) {
    if(val instanceof Variable) return true;
    else return isTnumber(val);
}


// Relative jump targets for jump instructions.
export class Relative extends Variable {
    static atomName = 'rel';
    static size = SIZE.ANY;

    static fromExpression(expr: Expression) {
        return new Relative(expr);
    }

    signed = true;

    target: Expression; // Target `Expression` which is referenced by this `Relative`.
    offset: number;

    constructor(target: Expression, offset: number = 0) {
        super();
        this.target = target;
        this.offset = offset;
    }

    canEvaluate(owner) {
        if(!owner || (owner.offset === -1)) return false;
        if(this.target.offset === -1) return false;

        return true;
    }

    evaluate(owner) {
        return this.result = this.rebaseOffset(owner) - owner.bytes();
        // return this.result = this.rebaseOffset(owner);
    }

    evaluatePreliminary(owner: Expression) {
        return this.offset + this.target.offsetMax - owner.offsetMax;
    }

    canHoldMaxOffset(owner: Expression) {
        const value = this.evaluatePreliminary(owner);
        const size = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);

        return size <= this.size;
    }

    clone(): Relative {
        return new Relative(this.target, this.offset);
    }

    cast(RelativeClass: typeof Relative): Relative {
    // cast(RelativeClass: typeof Relative) {
        this.size = RelativeClass.size;
        // return new RelativeClass(this.target, this.offset);
        return this;
    }

    rebaseOffset(new_target: Expression): number {
        // if(expr.code !== this.expr.code)
        //     throw Error('Rebase from different code blocks not implemented yet.');
        if(new_target.offset === -1)
            throw Error('Expression has no offset, cannot rebase.');
        return this.offset + this.target.offset - new_target.offset;
    }

    // Recalculate relative offset given a different Expression.
    // rebase(target: Expression): Relative {
    rebase(target: Expression) {
        // return new Relative(target, this.rebaseOffset(expr));
        this.offset = this.rebaseOffset(target);
        this.target = target;
    }

    toNumber() {
        return this.offset;
    }

    toString() {
        let result = '';

        if (this.result !== null)
            result = ' = ' + this.result;

        if (this.target instanceof require('./Label').default) {
            const lbl = this.target as Label;
            const off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';

            return `<${lbl.getName()}${off}${result}>`;
        } else if (this.target.asm) {
            // var lbl = this.target.asm.getStartLabel();
            const lbl = this.target.asm.expressions[0] as any as Label;
            const expr = `+[${this.target.index}]`;
            const off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';

            return `<${lbl.getName()}${expr}${off}${result}>`;
        } else {
            const expr = `+[${this.target.index}]`;
            const off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';

            return `<${expr}${off}${result}>`;
        }
    }
}

export class Relative8 extends Relative {
    static atomName = 'rel8';
    static size = SIZE.B;
}

export class Relative16 extends Relative {
    static atomName = 'rel16';
    static size = SIZE.W;
}

export class Relative32 extends Relative {
    static atomName = 'rel32';
    static size = SIZE.D;
}


export class Symbol extends Relative {
    static atomName = 'sym';
    private static cnt = 0;

    name: string;

    constructor(target: Expression, offset: number = 0, name?: string) {
        super(target, offset);
        this.name = name ? name : 'symbol_' + (Symbol.cnt++);
    }
}


export type TOperand = (Tnumber|Operand|Expression);

// Collection of operands an `Expression` might have.
export class Operands {
    list: TOperand[] = [];

    size: SIZE = SIZE.ANY; // Size of each operand.


    constructor (list: TOperand[] = [], size: SIZE = SIZE.ANY) {
        this.size = size;
        this.list = list;
    }

    clone (Klass: typeof Operands = Operands) {
        const list = [];
        for (const op of this.list) list.push(op);
        return new Klass(list, this.size);
    }

    validateSize () {
        // Verify operand sizes.
        for(let op of this.list) {
            // We can determine operand size only by Register; Memory and Immediate and others don't tell us the right size.
            if(op instanceof Register) {
                if (this.size !== SIZE.ANY) {
                    // if (this.size !== op.size)
                    //     throw TypeError('Operand size mismatch.');
                } else this.setSize(op.size);
            }
        }
    }

    setSize (size: SIZE) {
        if(this.size === SIZE.ANY) this.size = size;
        else throw TypeError('Operand size mismatch.');
    }

    getAtIndexOfClass (index, Clazz) {
        const op = this.list[index];
        if (op instanceof Clazz) return op;
        else return null;
    }

    getFirstOfClass (Klass, skip = 0) {
        for (const op of this.list) {
            if (op instanceof Klass) {
                if(!skip) return op;
                else skip--;
            }
        }
        return null;
    }

    getRegisterOperand (skip = 0): Register {
        return this.getFirstOfClass(Register, skip) as Register;
    }

    getMemoryOperand (skip = 0): Memory {
        return this.getFirstOfClass(Memory, skip) as Memory;
    }

    getVariable (skip = 0): Variable {
        return this.getFirstOfClass(Variable, skip) as Variable;
    }

    getRelative (skip = 0): Relative {
        return this.getFirstOfClass(Relative, skip) as Relative;
    }

    getImmediate (skip = 0): Immediate {
        return this.getFirstOfClass(Immediate, skip) as Immediate;
    }

    getAddressSize (): SIZE {
        var mem = this.getMemoryOperand();
        if(mem) return mem.size;
        else return SIZE.NONE;
    }

    hasRegister (): boolean {
        return !!this.getRegisterOperand();
    }

    hasMemory (): boolean {
        return !!this.getMemoryOperand();
    }

    hasVariable (): boolean {
        return !!this.getMemoryOperand();
    }

    hasRelative (): boolean {
        return !!this.getRelative();
    }

    hasRegisterOrMemory (): boolean {
        return this.hasRegister() || this.hasMemory();
    }

    canEvaluate (owner: Expression): boolean {
        for(const op of this.list) {
            if(op instanceof Variable)
                if(!(op as Variable).canEvaluate(owner)) return false;
        }
        return true;
    }

    evaluate (owner: Expression) {
        for(const op of this.list)
            if(op instanceof Variable) (op as Variable).evaluate(owner);
    }

    // EVEX may encode up to 4 operands, 32 registers, so register can be up to 5-bits wide,
    // we need to check for that because in that case we cannot use VEX.
    has5bitRegister () {
        for(let j = 0; j < 4; j++) {
            const op = this.list[j];
            if (!op) break;
            if (op instanceof Register) {
                if ((op as Register).idSize() > 4) return true;
            }
        }
        return false;
    }

    toString () {
        return this.list.map(op => op.toString()).join(', ');
    }
}
