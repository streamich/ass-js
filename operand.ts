import {UInt64} from './util';
import {Expression, Label} from './instruction';


export enum SIZE {
    ANY     = -1,   // Any size.
    NONE    = 0,    // Either unknown or not specified yet.
    B       = 8,
    W       = 16,
    D       = 32,
    Q       = 64,
    T       = 80,
    O       = 128,
}


// 64-bit numbers
export type number64 = [number, number];
export function isNumber64(num) {
    if((num instanceof Array) && (num.length === 2) && (typeof num[0] === 'number') && (typeof num[1] === 'number')) return true;
    else return false;
}

export type Tnumber = number|number64;
export function isTnumber(num) {
    if(typeof num === 'number') return true;
    else return isNumber64(num);
}


export type TUiOperand           = Register|Memory|Tnumber|Relative|Expression;
export type TUiOperandNormalized = Register|Memory|Tnumber|Relative; // `Expression` gets converted to `Relative`.


// General operand used in our assembly "language".
export abstract class Operand {
    // Size in bits.
    size: SIZE = SIZE.ANY;

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

    static sizeClass(value) {
        if((value <= 0x7f) && (value >= -0x80))             return SIZE.B;
        if((value <= 0x7fff) && (value >= -0x8000))         return SIZE.W;
        if((value <= 0x7fffffff) && (value >= -0x80000000)) return SIZE.D;
        return SIZE.Q;
    }

    static sizeClassUnsigned(value) {
        if(value <= 0xff)           return SIZE.B;
        if(value <= 0xffff)         return SIZE.W;
        if(value <= 0xffffffff)     return SIZE.D;
        return SIZE.Q;
    }

    value: number|number64 = 0;

    // Each byte as a `number` in reverse order.
    octets: number[] = [];

    signed: boolean = true;

    constructor(value: number|number64 = 0, signed = true) {
        super();
        this.signed = signed;
        this.setValue(value);
    }

    setValue(value: number|number64) {
        if(value instanceof Array) {
            if(value.length !== 2) throw TypeError('number64 must be a 2-tuple, given: ' + value);
            this.setValue64(value as number64);
        } else if(typeof value === 'number') {
            var clazz = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
            /* JS integers are 53-bit, so split here `number`s over 32 bits into [number, number]. */
            if(clazz === SIZE.Q) this.setValue64([UInt64.lo(value), UInt64.hi(value)]);
            else                    this.setValue32(value);
        } else
            throw TypeError('Constant value must be of type number|number64.');
    }

    protected setValue32(value: number) {
        var size = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
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
        this.size = 64;
        this.value = value;
        this.octets = [];
        var [lo, hi] = value;
        this.octets[0] = (lo) & 0xFF;
        this.octets[1] = (lo >> 8) & 0xFF;
        this.octets[2] = (lo >> 16) & 0xFF;
        this.octets[3] = (lo >> 24) & 0xFF;
        this.octets[4] = (hi) & 0xFF;
        this.octets[5] = (hi >> 8) & 0xFF;
        this.octets[6] = (hi >> 16) & 0xFF;
        this.octets[7] = (hi >> 24) & 0xFF;
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

    toString() {
        var str = '';
        for(var i = this.octets.length - 1; i >= 0; i--) {
            var oct = this.octets[i];
            str += oct > 0xF ? oct.toString(16).toUpperCase() : '0' + oct.toString(16).toUpperCase();
        }
        return '0x' + str;
    }
}


// Relative jump targets for jump instructions.
export class Relative extends Operand {
    expr: Expression;
    offset: number;

    constructor(expr: Expression, offset: number) {
        super();
        this.expr = expr;
        this.offset = offset;
    }

    rebaseOffset(expr: Expression) {
        // if(expr.code !== this.expr.code)
        //     throw Error('Rebase from different code blocks not implemented yet.');
        if(expr.offset === -1)
            throw Error('Expression has no offset, cannot rebase.');
        return this.offset + this.expr.offset - expr.offset;
    }

    // Recalculate relative offset given a different Expression.
    rebase(expr: Expression): Relative {
        return new Relative(expr, this.rebaseOffset(expr));
        // this.offset = this.rebaseOffset(expr);
        // this.expr = expr;
    }

    toNumber() {
        return this.offset;
    }

    toString() {
        if(this.expr instanceof Label) {
            var lbl = this.expr as Label;
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return `<${lbl.name}${off}>`;
        } else if(this.expr.code) {
            var lbl = this.expr.code.getStartLabel();
            var expr = `+[${this.expr.index}]`;
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return `<${lbl.name}${expr}${off}>`;
        } else {
            var expr = `+[${this.expr.index}]`;
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return `<${expr}${off}>`;
        }
    }
}

export class Relative8 extends Relative {
    size = SIZE.B;
}

export class Relative16 extends Relative {
    size = SIZE.W;
}

export class Relative32 extends Relative {
    size = SIZE.D;
}


// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
export abstract class Register extends Operand {
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

    base: Register = null;

    reg(): Register {
        return this.base;
    }

    getAddressSize(): SIZE {
        var reg = this.reg();
        if(reg) return reg.size;
        return SIZE.NONE;
    }

    getOperandSize(): SIZE {
        return this.size;
    }

    ref(base: Register): this {
        this.base = base;
        return this;
    }

    toString() {
        return `[${this.base.toString()}]`;
    }
}


export type TOperand = (Tnumber|Operand|Expression);
export type TOperandN1 = (Tnumber|Operand);
export type TOperandN2 = Operand;

// Collection of operands an `Expression` might have.
export class Operands {

    static findSize(ops: TUiOperand[]): SIZE {
        for(var operand of ops) {
            if(operand instanceof Register) return (operand as Register).size;
        }
        return SIZE.NONE;
    }

    static uiOpsNormalize(ops: TUiOperand[]): TUiOperandNormalized[] {
        var i = require('./instruction');
        // Wrap `Expression` into `Relative`.
        for(var j = 0; j < ops.length; j++) {
            if(ops[j] instanceof Expression) {
                ops[j] = (ops[j] as Expression).rel();
            }
        }
        return ops as TUiOperandNormalized[];
    }

    list: TOperand[] = [];

    size: SIZE = SIZE.ANY; // Size of each operand.


    constructor(list: TOperand[] = [], size: SIZE = SIZE.ANY) {
        this.size = size;
        this.list = list;
    }

    clone() {
        return new Operands(this.list, this.size);
    }

    // Wrap `Expression` into `Relative`.
    normalizeExpressionToRelative() {
        var i = require('./instruction');
        var ops = this.list;
        for(var j = 0; j < ops.length; j++) {
            if(ops[j] instanceof i.Expression) {
                ops[j] = (ops[j] as Expression).rel();
            }
        }
    }

    validateSize() {
        // Verify operand sizes.
        for(var op of this.list) {
            // We can determine operand size only by Register; Memory and Immediate and others don't tell us the right size.
            if(op instanceof Register) {
                if (this.size !== SIZE.ANY) {
                    if (this.size !== op.size)
                        throw TypeError('Operand size mismatch.');
                } else this.setSize(op.size);
            }
        }
    }

    setSize(size: SIZE) {
        if(this.size === SIZE.ANY) this.size = size;
        else throw TypeError('Operand size mismatch.');
    }

    getFirstOfClass(Clazz) {
        for(var op of this.list) if(op instanceof Clazz) return op;
        return null;
    }

    getRegisterOperand(): Register {
        return this.getFirstOfClass(Register) as Register;
    }

    getMemoryOperand(): Memory {
        return this.getFirstOfClass(Memory) as Memory;
    }

    getRelative(): Relative {
        return this.getFirstOfClass(Relative) as Relative;
    }

    getAddressSize(): SIZE {
        var mem = this.getMemoryOperand();
        if(mem) return mem.size;
        else return SIZE.NONE;
    }

    hasRegister(): boolean {
        return !!this.getRegisterOperand();
    }

    hasMemory(): boolean {
        return !!this.getMemoryOperand();
    }

    hasRelative(): boolean {
        return !!this.getRelative();
    }

    hasRegisterOrMemory(): boolean {
        return this.hasRegister() || this.hasMemory();
    }

    toString() {
        return this.list.map((op) => { return op.toString(); }).join(', ');
    }
}


export class OperandsNormalized extends Operands {
    list: TOperandN2[];
}
