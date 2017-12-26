import {R64, R32, R16, R8, R8H, SEG} from './regfile';
import {number64, Tnumber, isTnumber, SIZE, TUiOperand, TUiOperandNormalized,
    Operand, Immediate, Relative, Register as RegisterBase, Memory as MemoryBase} from '../../operand';
import * as o from '../../operand';
import {Expression} from "../../expression";


export class DisplacementValue extends Immediate {
    static SIZE = {
        DISP8:  SIZE.B,
        DISP32: SIZE.D,
    };

    static fromExpression(expr: Expression) {
        var rel = o.Relative.fromExpression(expr);
        return DisplacementValue.fromVariable(rel);
    }

    static fromVariable(value: o.Tvariable) {
        var disp: DisplacementValue;
        if(value instanceof o.Variable) {
            disp = new DisplacementValue(0);
            disp.setVariable(value as o.Variable);
        } else if(o.isTnumber(value)) {
            disp = new DisplacementValue(value as o.Tnumber);
        } else
            throw TypeError('Displacement must be of type Tvariable.');
        return disp;
    }

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

    disp(value: o.Tvariable|Expression): Memory {
        return (new Memory).ref(this).disp(value);
    }

    // Whether the register is one of `%r8`, `%r9`, etc. extended registers.
    isExtended() {
        return this.id > 0b111;
    }

    getRegisterSized(size): Register {
        if(size === this.size) return this;
        switch(size) {
            case SIZE.B: return rb(this.id);
            case SIZE.W: return rw(this.id);
            case SIZE.D: return rd(this.id);
            case SIZE.Q: return rq(this.id);
            default:
                throw Error(`Do not have register of size ${size}.`);
        }
    }
}

export class RegisterGP extends Register {}

export class Register8 extends RegisterGP {
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

export class Register32 extends RegisterGP {
    constructor(id: number) {
        super(id, SIZE.D);
    }
}

export class Register64 extends RegisterGP {
    constructor(id: number) {
        super(id, SIZE.Q);
    }
}

export class Register128 extends RegisterGP {
    constructor(id: number) {
        super(id, SIZE.O);
    }
}

export class Register256 extends RegisterGP {
    constructor(id: number) {
        super(id, SIZE.H);
    }
}

export class Register512 extends RegisterGP {
    constructor(id: number) {
        super(id, SIZE.I);
    }
}

export class RegisterRip extends Register {
    name = 'rip';
    constructor() {
        super(0, SIZE.Q);
    }
}

export class RegisterSegment extends Register {
    constructor(id) {
        super(id, SIZE.W);
    }
}

export class RegisterBounds extends Register {
    constructor(id) {
        super(id, SIZE.O);
    }
}


export class RegisterFloatingPoint extends Register {

}

export class RegisterMm extends RegisterFloatingPoint {
    constructor(id: number) {
        super(id, SIZE.O);
        this.name = 'mm' + id;
    }
}

export class RegisterSt extends RegisterFloatingPoint {
    constructor(id: number) {
        super(id, SIZE.T);
        this.name = 'st' + id;
    }
}


export class RegisterVector extends Register {

}

export class RegisterXmm extends RegisterVector {
    constructor(id: number) {
        super(id, SIZE.O);
        this.name = 'xmm' + id;
    }
}

export class RegisterYmm extends RegisterVector {
    constructor(id: number) {
        super(id, SIZE.H);
        this.name = 'ymm' + id;
    }
}

export class RegisterZmm extends RegisterVector {
    constructor(id: number) {
        super(id, SIZE.I);
        this.name = 'zmm' + id;
    }
}

export class RegisterK extends Register {
    constructor(id: number) {
        super(id, SIZE.Q);
        this.name = 'k' + id;
    }
}

export class RegisterCr extends Register { // Control registers.
    constructor(id: number) {
        super(id, SIZE.Q);
        this.name = 'cr' + id;
    }
}

export class RegisterDr extends Register { // Debug registers.
    constructor(id: number) {
        super(id, SIZE.Q);
        this.name = 'dr' + id;
    }
}


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

    disp(value: o.Tvariable|Expression): this {
        if(value instanceof Expression)
            this.displacement = DisplacementValue.fromExpression(value as Expression);
        else
            this.displacement = DisplacementValue.fromVariable(value as o.Tvariable);
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

export class Memory128 extends Memory {
    size = SIZE.O;
}

export class Memory256 extends Memory {
    size = SIZE.H;
}

export class Memory512 extends Memory {
    size = SIZE.I;
}

export type TInstructionOperand             = Register|Memory|o.Immediate|Relative; // `Tnumber` gets converted to `Immediate` or `Relative` to current instruction. `Relative` is converted to `Immediate`.

// Collection of operands an instruction might have.
export class Operands extends o.Operands {

    static findSize(ops: TUiOperand[]): SIZE {
        for(var operand of ops) {
            if(operand instanceof Register) return (operand as Register).size;
        }
        return SIZE.NONE;
    }

    // getRegisterOperand(dst_first = true): Register {
    //     var [dst, src] = this.list;
    //     var first, second;
    //     if(dst_first) {
    //         first = dst;
    //         second = src;
    //     } else {
    //         first = src;
    //         second = dst;
    //     }
    //     if(first instanceof Register) return first as Register;
    //     if(second instanceof Register) return second as Register;
    //     return null;
    // }

    hasImmediate(): boolean {
        return !!this.getImmediate();
    }

    hasExtendedRegister(): boolean {
        for(var op of this.list) {
            if(op instanceof o.Register) {
                if((op as o.Register).idSize() > 3) return true;
            } else if(op instanceof o.Memory) {
                var mem = op as Memory;
                if(mem.base && (mem.base.idSize() > 3)) return true;
                if(mem.index && (mem.index.idSize() > 3)) return true;
            }
        }
        return false;
    }
}



// ## Export Registers

function validateRegId(id: number, min, max, Clazz) {
    if(typeof id !== 'number') throw TypeError(Clazz.name + ' register ID must be a number.');
    if(id < min) throw TypeError(`${Clazz.name} register ID must be at least ${min}.`);
    if(id > max) throw TypeError(`${Clazz.name} register ID must be at most ${max}.`);
}

function createRegisterGenerator<T>(Clazz, min_id = 0, max_id = 15) {
    var cache: T[];
    return function(id: number): T {
        validateRegId(id, min_id, max_id, Clazz);
        if(!cache) cache = new Array(max_id + 1);
        if(!cache[id]) cache[id] = new Clazz(id);
        return cache[id];
    };
}


export const rb   = createRegisterGenerator<Register8>(Register8, 0, 15);
export const rw   = createRegisterGenerator<Register16>(Register16, 0, 15);
export const rd   = createRegisterGenerator<Register32>(Register32, 0, 15);
export const rq   = createRegisterGenerator<Register64>(Register64, 0, 15);
export const r    = rq;
export const seg  = createRegisterGenerator<RegisterSegment>(RegisterSegment, 0, 15);
export const mm   = createRegisterGenerator<RegisterMm>(RegisterMm, 0, 15);
export const st   = createRegisterGenerator<RegisterSt>(RegisterSt, 0, 7);
export const xmm  = createRegisterGenerator<RegisterXmm>(RegisterXmm, 0, 31);
export const ymm  = createRegisterGenerator<RegisterYmm>(RegisterYmm, 0, 31);
export const zmm  = createRegisterGenerator<RegisterZmm>(RegisterZmm, 0, 31);
export const k    = createRegisterGenerator<RegisterK>(RegisterK, 0, 7);
export const bnd  = createRegisterGenerator<RegisterBounds>(RegisterBounds, 0, 3);
export const cr   = createRegisterGenerator<RegisterCr>(RegisterCr, 0, 15);
export const dr   = createRegisterGenerator<RegisterDr>(RegisterDr, 0, 15);


export const al   = rb(R8.AL);
export const bl   = rb(R8.BL);
export const cl   = rb(R8.CL);
export const dl   = rb(R8.DL);
export const sil  = rb(R8.SIL);
export const dil  = rb(R8.DIL);
export const bpl  = rb(R8.BPL);
export const spl  = rb(R8.SPL);
export const r8b  = rb(R8.R8B);
export const r9b  = rb(R8.R9B);
export const r10b = rb(R8.R10B);
export const r11b = rb(R8.R11B);
export const r12b = rb(R8.R12B);
export const r13b = rb(R8.R13B);
export const r14b = rb(R8.R14B);
export const r15b = rb(R8.R15B);

export const ah   = new Register8High(R8H.AH);
export const bh   = new Register8High(R8H.BH);
export const ch   = new Register8High(R8H.CH);
export const dh   = new Register8High(R8H.DH);


export const ax   = rw(R16.AX);
export const bx   = rw(R16.BX);
export const cx   = rw(R16.CX);
export const dx   = rw(R16.DX);
export const si   = rw(R16.SI);
export const di   = rw(R16.DI);
export const bp   = rw(R16.BP);
export const sp   = rw(R16.SP);
export const r8w  = rw(R16.R8W);
export const r9w  = rw(R16.R9W);
export const r10w = rw(R16.R10W);
export const r11w = rw(R16.R11W);
export const r12w = rw(R16.R12W);
export const r13w = rw(R16.R13W);
export const r14w = rw(R16.R14W);
export const r15w = rw(R16.R15W);


export const eax  = rd(R32.EAX);
export const ebx  = rd(R32.EBX);
export const ecx  = rd(R32.ECX);
export const edx  = rd(R32.EDX);
export const esi  = rd(R32.ESI);
export const edi  = rd(R32.EDI);
export const ebp  = rd(R32.EBP);
export const esp  = rd(R32.ESP);
export const r8d  = rd(R32.R8D);
export const r9d  = rd(R32.R9D);
export const r10d = rd(R32.R10D);
export const r11d = rd(R32.R11D);
export const r12d = rd(R32.R12D);
export const r13d = rd(R32.R13D);
export const r14d = rd(R32.R14D);
export const r15d = rd(R32.R15D);


export const rax  = rq(R64.RAX);
export const rcx  = rq(R64.RCX);
export const rdx  = rq(R64.RDX);
export const rbx  = rq(R64.RBX);
export const rsp  = rq(R64.RSP);
export const rbp  = rq(R64.RBP);
export const rsi  = rq(R64.RSI);
export const rdi  = rq(R64.RDI);
export const r8   = rq(R64.R8);
export const r9   = rq(R64.R9);
export const r10  = rq(R64.R10);
export const r11  = rq(R64.R11);
export const r12  = rq(R64.R12);
export const r13  = rq(R64.R13);
export const r14  = rq(R64.R14);
export const r15  = rq(R64.R15);

export const rip  = new RegisterRip;


export const es   = seg(SEG.ES);
export const cs   = seg(SEG.CS);
export const ss   = seg(SEG.SS);
export const ds   = seg(SEG.DS);
export const fs   = seg(SEG.FS);
export const gs   = seg(SEG.GS);
