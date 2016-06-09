import {R64, R32, R16, R8, R8H} from './regfile';
import {number64, Tnumber, isTnumber, SIZE, TUiOperand, TUiOperandNormalized,
    Operand, Constant, Relative, Register as RegisterBase, Memory as MemoryBase} from '../operand';
import * as o from '../operand';
import * as t from './table';
import * as i from './instruction';


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
export class Register extends RegisterBase {

    static getName(size, id) {
        var def = 'REG';
        if(typeof size !== 'number') return def;
        if(typeof id !== 'number') return def;
        switch(size) {
            case SIZE.Q:                            return R64[id];
            case SIZE.D:                            return R32[id];
            case SIZE.W:                            return R16[id];
            case SIZE.B:
                if(this instanceof Register8High)   return R8H[id];
                else                                return R8[id];
            default:                                return def;
        }
    }

    constructor(id, size) {
        super(id, size);
        this.name = Register.getName(size, id).toLowerCase();
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
export class Memory extends MemoryBase {

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

        return super.ref(base) as this;
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

export type TInstructionOperand             = Register|Memory|Immediate|Relative; // `Tnumber` gets converted to `Immediate` or `Relative` to current instruction. `Relative` is converted to `Immediate`.

// Collection of operands an instruction might have.
export class Operands extends o.OperandsNormalized {

    static findSize(ops: TUiOperand[]): SIZE {
        for(var operand of ops) {
            if(operand instanceof Register) return (operand as Register).size;
        }
        return SIZE.NONE;
    }

    static fromUiOpsAndTpl(insn: i.Instruction, ops: TUiOperand[], tpls: t.TOperandTemplate[]): Operands {
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

    getRegisterOperand(dst_first = true): Register {
        var [dst, src] = this.list;
        var first, second;
        if(dst_first) {
            first = dst;
            second = src;
        } else {
            first = src;
            second = dst;
        }
        if(first instanceof Register) return first as Register;
        if(second instanceof Register) return second as Register;
        return null;
    }

    getImmediate(): Immediate {
        return this.getFirstOfClass(Immediate) as Immediate;
    }

    hasImmediate(): boolean {
        return !!this.getImmediate();
    }

    hasExtendedRegister(): boolean {
        var [dst, src] = this.list;
        if(dst && dst.reg() && (dst.reg() as Register).isExtended()) return true;
        if(src && src.reg() && (src.reg() as Register).isExtended()) return true;
        return false;
    }
}


export interface Operands {
    getMemoryOperand(): Memory;
}
