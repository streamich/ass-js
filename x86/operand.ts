import {R64, R32, R16, R8, R8H} from './regfile';
import {UInt64} from '../util';
import * as t from './table';
import * as d from './def';
import * as i from './instruction';


export enum SIZE {
    ANY     = -1,   // Any size.
    NONE    = 0,    // Either unknown or not specified yet.
    B       = 8,
    W       = 16,
    D       = 32,
    Q       = 64,
}


export enum MODE {
    REAL,
    COMPAT,
    X64,
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

export class Immediate extends Constant {
    static factory(size, value: number|number64 = 0, signed = true) {
        switch(size) {
            case SIZE.B:    return new Immediate8(value, signed);
            case SIZE.W:    return new Immediate16(value, signed);
            case SIZE.D:    return new Immediate32(value, signed);
            case SIZE.Q:    return new Immediate64(value, signed);
            default:        return new Immediate(value, signed);
        }
    }

    static throwIfLarger(value, size, signed) {
        var val_size = signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        if(val_size > size) throw TypeError(`Value ${value} too big for imm8.`);
    }

    cast(ImmediateClass: typeof Immediate) {
        return new ImmediateClass(this.value);
    }
}

export class ImmediateUnsigned extends Immediate {
    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate8 extends Immediate {
    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.B, this.signed);
        super.setValue(value);
        this.extend(SIZE.B);
    }
}

export class ImmediateUnsigned8 extends Immediate8 {
    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate16 extends Immediate {
    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.W, this.signed);
        super.setValue(value);
        this.extend(SIZE.W);
    }
}

export class ImmediateUnsigned16 extends Immediate16 {
    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate32 extends Immediate {
    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.D, this.signed);
        super.setValue(value);
        this.extend(SIZE.D);
    }
}

export class ImmediateUnsigned32 extends Immediate32 {
    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}

export class Immediate64 extends Immediate {
    setValue(value: number|number64) {
        Immediate.throwIfLarger(value, SIZE.Q, this.signed);
        super.setValue(value);
        this.extend(SIZE.Q);
    }
}

export class ImmediateUnsigned64 extends Immediate64 {
    constructor(value: number|number64 = 0) {
        super(value, false);
    }
}


// Relative jump targets for jump instructions.
export class Relative {
    expr: i.Expression;
    offset: number;

    constructor(expr: i.Expression, offset: number) {
        this.expr = expr;
        this.offset = offset;
    }

    isRegister() {
        return false;
    }

    reg() {
        return null;
    }

    rebaseOffset(expr: i.Expression) {
        // if(expr.code !== this.expr.code)
        //     throw Error('Expressions of different code blocks, cannot rebase.');
        if(expr.offset === -1)
            return -1;
        // throw Error('Expression has no offset, cannot rebase.');
        return this.offset + this.expr.offset - expr.offset;
    }

    // Recalculate relative offset given a different Expression.
    rebase(expr: i.Expression): Relative {
        return new Relative(expr, this.rebaseOffset(expr));
        // this.offset = this.rebaseOffset(expr);
        // this.expr = expr;
    }

    toString() {
        if(this.expr instanceof i.Label) {
            var lbl = this.expr as i.Label;
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


export class DisplacementValue extends Constant {
    static SIZE = {
        DISP8:  SIZE.B,
        DISP32: SIZE.D,
    };

    constructor(value: number|number64) {
        super(value, true);
    }

    protected setValue32(value: number) {
        super.setValue32(value);
        /* Make sure `Displacement` is 1 or 4 bytes, not 2. */
        // if(this.size > DisplacementValue.SIZE.DISP8) this.zeroExtend(DisplacementValue.SIZE.DISP32);
    }

    // protected setValue64() {
    //     throw TypeError(`Displacement can be only of these sizes: ${DisplacementValue.SIZE.DISP8} and ${DisplacementValue.SIZE.DISP32}.`);
    // }
}


// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
export class Register extends Operand {
    id: number = 0; // Number value of register.

    constructor(id: number, size: SIZE) {
        super();
        this.id = id;
        this.size = size;
    }

    reg(): Register {
        return this;
    }

    ref(): Memory {
        return (new Memory).ref(this);
    }

    ind(scale_factor: number): Memory {
        return (new Memory).ind(this, scale_factor);
    }

    disp(value: number): Memory {
        return (new Memory).ref(this).disp(value);
    }

    // Whether the register is one of `%r8`, `%r9`, etc. extended registers.
    isExtended() {
        return this.id > 0b111;
    }

    get3bitId() {
        return this.id & 0b111;
    }

    getName() {
        switch(this.size) {
            case SIZE.Q:                            return R64[this.id];
            case SIZE.D:                            return R32[this.id];
            case SIZE.W:                            return R16[this.id];
            case SIZE.B:
                if(this instanceof Register8High)   return R8H[this.id];
                else                                return R8[this.id];
            default:                                return 'REG';
        }
    }

    toString() {
        return this.getName().toLowerCase();
    }
}

export class Register8 extends Register {
    constructor(id: number) {
        super(id, SIZE.B);
    }
}

export class Register8High extends Register8 {}

export class Register16 extends Register {
    constructor(id: number) {
        super(id, SIZE.W);
    }
}

export class Register32 extends Register {
    constructor(id: number) {
        super(id, SIZE.D);
    }
}

export class Register64 extends Register {
    constructor(id: number) {
        super(id, SIZE.Q);
    }
}

export class RegisterRip extends Register64 {
    constructor() {
        super(0);
    }

    getName() {
        return 'rip';
    }
}


export var rax  = new Register64(R64.RAX);
export var rbx  = new Register64(R64.RBX);
export var rcx  = new Register64(R64.RCX);
export var rdx  = new Register64(R64.RDX);
export var rsi  = new Register64(R64.RSI);
export var rdi  = new Register64(R64.RDI);
export var rbp  = new Register64(R64.RBP);
export var rsp  = new Register64(R64.RSP);
export var r8   = new Register64(R64.R8);
export var r9   = new Register64(R64.R9);
export var r10  = new Register64(R64.R10);
export var r11  = new Register64(R64.R11);
export var r12  = new Register64(R64.R12);
export var r13  = new Register64(R64.R13);
export var r14  = new Register64(R64.R14);
export var r15  = new Register64(R64.R15);

export var rip  = new RegisterRip;


export var eax  = new Register32(R32.EAX);
export var ebx  = new Register32(R32.EBX);
export var ecx  = new Register32(R32.ECX);
export var edx  = new Register32(R32.EDX);
export var esi  = new Register32(R32.ESI);
export var edi  = new Register32(R32.EDI);
export var ebp  = new Register32(R32.EBP);
export var esp  = new Register32(R32.ESP);
export var r8d  = new Register32(R32.R8D);
export var r9d  = new Register32(R32.R9D);
export var r10d = new Register32(R32.R10D);
export var r11d = new Register32(R32.R11D);
export var r12d = new Register32(R32.R12D);
export var r13d = new Register32(R32.R13D);
export var r14d = new Register32(R32.R14D);
export var r15d = new Register32(R32.R15D);


export var ax   = new Register16(R16.AX);
export var bx   = new Register16(R16.BX);
export var cx   = new Register16(R16.CX);
export var dx   = new Register16(R16.DX);
export var si   = new Register16(R16.SI);
export var di   = new Register16(R16.DI);
export var bp   = new Register16(R16.BP);
export var sp   = new Register16(R16.SP);
export var r8w  = new Register16(R16.R8W);
export var r9w  = new Register16(R16.R9W);
export var r10w = new Register16(R16.R10W);
export var r11w = new Register16(R16.R11W);
export var r12w = new Register16(R16.R12W);
export var r13w = new Register16(R16.R13W);
export var r14w = new Register16(R16.R14W);
export var r15w = new Register16(R16.R15W);


export var al   = new Register8(R8.AL);
export var bl   = new Register8(R8.BL);
export var cl   = new Register8(R8.CL);
export var dl   = new Register8(R8.DL);
export var sil  = new Register8(R8.SIL);
export var dil  = new Register8(R8.DIL);
export var bpl  = new Register8(R8.BPL);
export var spl  = new Register8(R8.SPL);
export var r8b  = new Register8(R8.R8B);
export var r9b  = new Register8(R8.R9B);
export var r10b = new Register8(R8.R10B);
export var r11b = new Register8(R8.R11B);
export var r12b = new Register8(R8.R12B);
export var r13b = new Register8(R8.R13B);
export var r14b = new Register8(R8.R14B);
export var r15b = new Register8(R8.R15B);

export var ah   = new Register8High(R8H.AH);
export var bh   = new Register8High(R8H.BH);
export var ch   = new Register8High(R8H.CH);
export var dh   = new Register8High(R8H.DH);


// # Scale
//
// `Scale` used in SIB byte in two bit `SCALE` field.
export class Scale extends Operand {
    static VALUES = [1, 2, 4, 8];

    value: number;

    constructor(scale: number = 1) {
        super();
        if(Scale.VALUES.indexOf(scale) < 0)
            throw TypeError(`Scale must be one of [1, 2, 4, 8].`);
        this.value = scale;
    }

    toString() {
        return '' + this.value;
    }
}


// ## Memory
//
// `Memory` is RAM addresses which `Register`s can *dereference*.
export class Memory extends Operand {

    static factory(size: SIZE) {
        switch(size) {
            case SIZE.B:    return new Memory8;
            case SIZE.W:    return new Memory16;
            case SIZE.D:    return new Memory32;
            case SIZE.Q:    return new Memory64;
            default:        return new Memory;
        }
    }

    base: Register = null;
    index: Register = null;
    scale: Scale = null;
    displacement: DisplacementValue = null;

    // Case memory to some size.
    cast(size: SIZE): Memory {
        var mem = Memory.factory(size);
        mem.base = this.base;
        mem.index = this.index;
        mem.scale = this.scale;
        mem.displacement = this.displacement;
        return mem;
    }

    reg(): Register {
        if(this.base) return this.base;
        if(this.index) return this.index;
        // throw Error('No backing register.');
        return null;
    }

    getAddressSize(): SIZE {
        var reg = this.reg();
        if(reg) return reg.size;
        return SIZE.NONE;
    }

    getOperandSize(): SIZE {
        return this.size;
    }

    needsSib() {
        return !!this.index || !!this.scale;
    }

    ref(base: Register): this {
        if(this.index) {
            if(base.size !== this.index.size)
                throw TypeError('Registers dereferencing memory must be of the same size.');
        }

        // RBP, EBP etc.. always need displacement for ModRM and SIB bytes.
        var is_ebp = (R64.RBP & 0b111) === base.get3bitId();
        if(is_ebp && !this.displacement)
            this.displacement = new DisplacementValue(0);

        this.base = base;
        return this;
    }

    ind(index: Register, scale_factor: number = 1): this {
        if(this.base) {
            if(this.base instanceof RegisterRip)
                throw TypeError(`Cannot have index in memory reference that bases on ${this.base.toString()}.`);
            if(this.base.size !== index.size)
                throw TypeError('Registers dereferencing memory must be of the same size.');
        }

        if(!(index instanceof Register))
            throw TypeError('Index must by of type Register.');

        var esp = (R64.RSP & 0b111);
        if(index.get3bitId() === esp)
            throw TypeError('%esp, %rsp or other 0b100 registers cannot be used as addressing index.');

        this.index = index;
        this.scale = new Scale(scale_factor);
        return this;
    }

    disp(value: number|number64): this {
        this.displacement = new DisplacementValue(value);
        return this;
    }

    toString() {
        var parts = [];
        if(this.base) parts.push(this.base.toString());
        if(this.index) parts.push(this.index.toString() + ' * ' + this.scale.toString());
        if(this.displacement) parts.push(this.displacement.toString());

        return `[${parts.join(' + ')}]`;
    }
}

export class Memory8 extends Memory {
    size = SIZE.B;
}

export class Memory16 extends Memory {
    size = SIZE.W;
}

export class Memory32 extends Memory {
    size = SIZE.D;
}

export class Memory64 extends Memory {
    size = SIZE.Q;
}


export type TUserInterfaceOperand           = Register|Memory|Tnumber|Relative|i.Expression;
export type TUserInterfaceOperandNormalized = Register|Memory|Tnumber|Relative; // `i.Expression` gets converted to `Relative`.
export type TInstructionOperand             = Register|Memory|Immediate|Relative; // `Tnumber` gets converted to `Immediate` or `Relative` to current instruction. `Relative` is converted to `Immediate`.

// Collection of operands an instruction might have.
export class Operands {

    static findSize(ops: TUserInterfaceOperand[]): SIZE {
        for(var operand of ops) {
            if(operand instanceof Register) return (operand as Register).size;
        }
        return SIZE.NONE;
    }

    static uiOpsNormalize(ops: TUserInterfaceOperand[]): TUserInterfaceOperandNormalized[] {
        var i = require('./instruction');
        // Wrap `i.Expression` into `o.Relative`.
        for(var j = 0; j < ops.length; j++) {
            if(ops[j] instanceof i.Expression) {
                ops[j] = (ops[j] as i.Expression).rel();
            }
        }
        return ops as TUserInterfaceOperandNormalized[];
    }

    static fromUiOpsAndTpl(insn: i.Instruction, ops: TUserInterfaceOperand[], tpls: t.TOperandTemplate[]): Operands {
        var iops: TInstructionOperand[] = [];
        for(var j = 0; j < ops.length; j++) {
            var op = ops[j];
            if((op instanceof Memory) || (op instanceof Register) || (op instanceof Immediate) || (op instanceof Relative)) {
                iops.push(op as any);
            } else if(isTnumber(op)) {
                var Clazz = tpls[j] as any;
                // if(typeof Clazz !== 'function') throw Error('Expected construction operand definition');
                if(Clazz.name.indexOf('Immediate') === 0) {
                    var ImmediateClass = Clazz as typeof Immediate;
                    var imm = new ImmediateClass(op as Tnumber);
                    iops.push(imm);
                } else if(Clazz.name.indexOf('Relative') === 0) {
                    var RelativeClass = Clazz as typeof Relative;
                    var rel = new RelativeClass(insn, op as number);
                    iops.push(rel);
                }
            } else
                throw TypeError('Invalid operand expected Register, Memory, Relative, number or number64.');
        }
        return new Operands(iops);
    }

    dst: TInstructionOperand;            // Destination
    src: TInstructionOperand;            // Source
    op3: TInstructionOperand;
    op4: TInstructionOperand;

    list: TInstructionOperand[];

    size: SIZE = SIZE.ANY;

    // constructor(dst: TInstructionOperand = null, src: TInstructionOperand = null, op3: TInstructionOperand = null, op4: TInstructionOperand = null) {
    constructor(list: TInstructionOperand[] = [], size: SIZE = SIZE.ANY) {
        this.size = size;

        // Verify operand sizes.
        for(var op of list) {
            // We can determine operand size only by Register; Memory and Immediate don't tell us the right size.
            if(op instanceof Register) {
                if (this.size !== SIZE.ANY) {
                    if (this.size !== op.size)
                        throw TypeError('Operand size mismatch.');
                } else this.setSize(op.size);
            }
        }

        this.list = list;
        [this.dst, this.src, this.op3, this.op4] = list;
    }

    setSize(size: SIZE) {
        if(this.size === SIZE.ANY) this.size = size;
        else throw TypeError('Operand size mismatch.');
    }

    getFirstOfClass(Clazz): TInstructionOperand {
        for(var op of this.list) if(op instanceof Clazz) return op;
        return null;
    }

    getRegisterOperand(dst_first = true): Register {
        var first, second;
        if(dst_first) {
            first = this.dst;
            second = this.src;
        } else {
            first = this.src;
            second = this.dst;
        }
        if(first instanceof Register) return first as Register;
        if(second instanceof Register) return second as Register;
        return null;
    }

    getMemoryOperand(): Memory {
        if(this.dst instanceof Memory) return this.dst as Memory;
        if(this.src instanceof Memory) return this.src as Memory;
        return null;
    }

    getImmediate(): Immediate {
        return this.getFirstOfClass(Immediate) as Immediate;
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

    hasRegisterOrMemory(): boolean {
        return this.hasRegister() || this.hasMemory();
    }

    hasExtendedRegister(): boolean {
        var {dst, src} = this;
        if(dst && dst.reg() && (dst.reg() as Register).isExtended()) return true;
        if(src && src.reg() && (src.reg() as Register).isExtended()) return true;
        return false;
    }

    toString() {
        var parts = [];
        if(this.dst) parts.push(this.dst.toString());
        if(this.src) parts.push(this.src.toString());
        if(this.op3) parts.push(this.op3.toString());
        if(this.op4) parts.push(this.op4.toString());
        return parts.join(', ');
    }
}
