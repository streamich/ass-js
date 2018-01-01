import * as o from "../../../operand";
import {Memory, Operand, SIZE} from "../../../operand";
import {RegisterRip, RegisterX86} from "./register";
import {DisplacementValue} from "./displacement";
import {R64} from "../regfile";
import {Expression} from "../../../expression";

// # Scale
//
// `Scale` used in SIB byte in two bit `SCALE` field.
export class Scale extends Operand {
    static VALUES = [1, 2, 4, 8];

    value: number;

    constructor(scale: number = 1) {
        super();
        if (Scale.VALUES.indexOf(scale) < 0)
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
export class MemoryX86 extends Memory {

    static factory(size: SIZE) {
        switch (size) {
            case SIZE.B:
                return new Memory8;
            case SIZE.W:
                return new Memory16;
            case SIZE.D:
                return new Memory32;
            case SIZE.Q:
                return new Memory64;
            default:
                return new MemoryX86;
        }
    }

    base: RegisterX86 = null;
    index: RegisterX86 = null;
    scale: Scale = null;
    displacement: DisplacementValue = null;

    // Case memory to some size.
    cast(size: SIZE): MemoryX86 {
        var mem = MemoryX86.factory(size);
        mem.base = this.base;
        mem.index = this.index;
        mem.scale = this.scale;
        mem.displacement = this.displacement;
        return mem;
    }

    reg(): RegisterX86 {
        if (this.base) return this.base;
        if (this.index) return this.index;
        // throw Error('No backing register.');
        return null;
    }

    needsSib() {
        return !!this.index || !!this.scale;
    }

    ref(base: RegisterX86): this {
        if (this.index) {
            if (base.size !== this.index.size)
                throw TypeError('Registers dereferencing memory must be of the same size.');
        }

        // RBP, EBP etc.. always need displacement for ModRM and SIB bytes.
        var is_ebp = (R64.RBP & 0b111) === base.get3bitId();
        if (is_ebp && !this.displacement)
            this.displacement = new DisplacementValue(0);

        return super.ref(base) as this;
    }

    ind(index: RegisterX86, scale_factor: number = 1): this {
        if (this.base) {
            if (this.base instanceof RegisterRip)
                throw TypeError(`Cannot have index in memory reference that bases on ${this.base.toString()}.`);
            if (this.base.size !== index.size)
                throw TypeError('Registers dereferencing memory must be of the same size.');
        }

        if (!(index instanceof RegisterX86))
            throw TypeError('Index must by of type Register.');

        var esp = (R64.RSP & 0b111);
        if (index.get3bitId() === esp)
            throw TypeError('%esp, %rsp or other 0b100 registers cannot be used as addressing index.');

        this.index = index;
        this.scale = new Scale(scale_factor);
        return this;
    }

    disp(value: o.Tvariable | Expression): this {
        if (value instanceof Expression)
            this.displacement = DisplacementValue.fromExpression(value as Expression);
        else
            this.displacement = DisplacementValue.fromVariable(value as o.Tvariable);
        return this;
    }

    toString() {
        var parts = [];
        if (this.base) parts.push(this.base.toString());
        if (this.index) parts.push(this.index.toString() + ' * ' + this.scale.toString());
        if (this.displacement) parts.push(this.displacement.toString());

        return `[${parts.join(' + ')}]`;
    }
}

export class Memory8 extends MemoryX86 {
    size = SIZE.B;
}

export class Memory16 extends MemoryX86 {
    size = SIZE.W;
}

export class Memory32 extends MemoryX86 {
    size = SIZE.D;
}

export class Memory64 extends MemoryX86 {
    size = SIZE.Q;
}

export class Memory128 extends MemoryX86 {
    size = SIZE.O;
}

export class Memory256 extends MemoryX86 {
    size = SIZE.H;
}

export class Memory512 extends MemoryX86 {
    size = SIZE.I;
}