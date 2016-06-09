import {R64, R32, R16, R8} from './regfile';
import * as oo from '../operand';
import * as o from './operand';


// # x86_64 Instruction
//
// Each CPU instruction is encoded in the following form, where only
// *Op-code* byte is required:
//
//     |-------------------------------------------------|--------------------------------------------|
//     |                  Instruction                    |               Next instruction             |
//     |-------------------------------------------------|--------------------------------------------|
//     |byte 1   |byte 2   |byte 3   |byte 4   |byte 5   |
//     |---------|---------|---------|---------|---------|                     ...
//     |REX      |Op-code  |Mod-R/M  |SIB      |Immediat |                     ...
//     |---------|---------|---------|---------|---------|                     ...
//     |optional |required |optional |optional |optional |
//     |-------------------------------------------------|
export abstract class InstructionPart {
    // ins: Instruction;
    abstract write(arr: number[]): number[];
}


export abstract class Prefix extends InstructionPart {}

export enum PREFIX {
    LOCK    = 0xF0,
    REP     = 0xF3,         // REP prefix.
    REPE    = 0xF3,         // REPE/REPZ prefix.
    REPNE   = 0xF2,         // REPNE/REPNZ prefix
    CS      = 0x2E,
    SS      = 0x36,
    DS      = 0x3E,
    ES      = 0x26,
    FS      = 0x64,
    GS      = 0x65,
    REX     = 0b01000000,   // 0x40
    BNT     = 0x2E,         // Branch not taken, same as CS.
    BT      = 0x3E,         // Branch taken, same as DS.
    OS      = 0x66,         // Operand size override.
    AS      = 0x67,         // Address size override.
}

// Prefixes that consist of a single static byte.
export class PrefixStatic extends Prefix {
    value: PREFIX;

    constructor(value: number) {
        super();
        this.value = value;
    }

    write(arr: number[]): number[] {
        arr.push(this.value);
        return arr;
    }

    toString() {
        return PREFIX[this.value].toLowerCase();
    }
}

export class PrefixOperandSizeOverride extends PrefixStatic {
    constructor() {
        super(PREFIX.OS);
    }
}

export class PrefixAddressSizeOverride extends PrefixStatic {
    constructor() {
        super(PREFIX.AS);
    }
}

export class PrefixRep extends PrefixStatic {
    static supported = ['ins', 'lods', 'movs', 'outs', 'stos'];

    constructor() {
        super(PREFIX.REP);
    }
}

export class PrefixRepe extends PrefixStatic {
    static supported = ['cmps', 'cmpsb', 'cmpbd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];

    constructor() {
        super(PREFIX.REPE);
    }
}

export class PrefixRepne extends PrefixStatic {
    static supported = ['cmps', 'cmpsb', 'cmpsd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];

    constructor() {
        super(PREFIX.REPNE);
    }
}

// Lock prefix for performing atomic memory operations.
export class PrefixLock extends PrefixStatic {
    static supported = ['adc', 'add', 'and', 'btc', 'btr', 'bts', 'cmpxchg', 'cmpxchg8b', 'cmpxchg16b',
        'dec', 'inc', 'neg', 'not', 'or', 'sbb', 'sub', 'xadd', 'xchg', 'xor'];

    constructor() {
        super(PREFIX.LOCK);
    }
}

// ## REX
//
// REX is an optional prefix used for two reasons:
//
//  1. For 64-bit instructions that require this prefix to be used.
//  2. When using extended registers: r8, r9, r10, etc..; r8d, r9d, r10d, etc...
//
// REX byte layout:
//
//     76543210
//     .1..WRXB
//     .......B <--- R/M field in Mod-R/M byte, or BASE field in SIB byte addresses one of the extended registers.
//     ......X <---- INDEX field in SIB byte addresses one of the extended registers.
//     .....R <----- REG field in Mod-R/M byte addresses one of the extended registers.
//     ....W <------ Used instruction needs REX prefix.
//     .1 <--------- 0x40 identifies the REX prefix.
export class PrefixRex extends Prefix {
    W: number; // 0 or 1
    R: number; // 0 or 1
    X: number; // 0 or 1
    B: number; // 0 or 1

    constructor(W, R, X, B) {
        super();
        this.W = W;
        this.R = R;
        this.X = X;
        this.B = B;
    }

    write(arr: number[]): number[] {
        arr.push(PREFIX.REX | (this.W << 3) | (this.R << 2) | (this.X << 1) | this.B);
        return arr;
    }
}


// ## Op-code
//
// Primary op-code of the instruction. Often the lower 2 or 3 bits of the
// instruction op-code may be set independently.
//
// `d` and `s` bits, specify: d - direction of the instruction, and s - size of the instruction.
//  - **s**
//      - 1 -- word size
//      - 0 -- byte size
//  - **d**
//      - 1 -- register is destination
//      - 0 -- register is source
//
//     76543210
//     ......ds
//
// Lower 3 bits may also be used to encode register for some instructions. We set
// `.regInOp = true` if that is the case.
//
//     76543210
//     .....000 = RAX
export class Opcode extends InstructionPart {

    /* Now we support up to 3 byte instructions */
    static MASK_SIZE        = 0b111111111111111111111110;   // `s` bit
    static MASK_DIRECTION   = 0b111111111111111111111101;   // `d` bit
    static MASK_OP          = 0b111111111111111111111000;   // When register is encoded into op-code.

    static SIZE = { // `s` bit
        BYTE: 0b0,
        WORD_OR_DOUBLE: 0b1,
    };

    static DIRECTION = { // `d` bit
        REG_IS_SRC: 0b00,
        REG_IS_DST: 0b10,
    };

    // Main op-code value.
    op: number = 0;

    bytes(): number {
        if(this.op > 0xFFFF) return 3;
        if(this.op > 0xFF) return 2;
        return 1;
    }

    write(arr: number[]): number[] {
        // Op-code can be up to 3 bytes long.
        var op = this.op;
        if(op > 0xFFFF) arr.push((op & 0xFF0000) >> 16);
        if(op > 0xFF) arr.push((op & 0xFF00) >> 8);
        arr.push(op & 0xFF);
        return arr;
    }
}


// ## Mod-R/M
//
// Mod-R/M is an optional byte after the op-code that specifies the direction
// of operation or extends the op-code.
//
//     76543210
//     .....XXX <--- R/M field: Register or Memory
//     ..XXX <------ REG field: Register or op-code extension
//     XX <--------- MOD field: mode of operation
export class Modrm extends InstructionPart {

    // Two bits of `MOD` field in `Mod-R/M` byte.
    static MOD = {
        INDIRECT:   0b00,
        DISP8:      0b01,
        DISP32:     0b10,
        REG_TO_REG: 0b11,
    };

    static RM = {
        // When this value is encoded in R/M field, SIB byte has to follow Mod-R/M byte.
        NEEDS_SIB: R64.RSP & 0b111,

        // When this value is encoded in R/M field, and MOD is 0b00 = INDIRECT,
        // disp32 bytes have to follow Mod-R/M byte. But not in long-mode,
        // in long-mode it is used for RIP-relative adressing.
        INDIRECT_DISP: R64.RBP & 0b111,
    };

    static getModDispSize(mem: o.Memory) {
        if(!mem.displacement || !mem.base)                                  return Modrm.MOD.INDIRECT;
        else if(mem.displacement.size === o.DisplacementValue.SIZE.DISP8)   return Modrm.MOD.DISP8;
        else if(mem.displacement.size <= o.DisplacementValue.SIZE.DISP32)   return Modrm.MOD.DISP32;
        else throw Error('64-bit displacement not supported yet.');
    }

    mod: number = 0;
    reg: number = 0;
    rm: number  = 0;

    constructor(mod, reg, rm) {
        super();
        this.mod = mod;
        this.reg = reg;
        this.rm = rm;
    }

    write(arr: number[] = []): number[] {
        arr.push((this.mod << 6) | (this.reg << 3) | this.rm);
        return arr;
    }
}


// ## SIB
//
// SIB (scale-index-base) is optional byte used when dereferencing memory
// with complex offset, like when you do:
//
//     mov rax, [rbp + rdx * 8]
//
// The above operation in SIB byte is encoded as follows:
//
//     rbp + rdx * 8 = BASE + INDEX * USERSCALE
//
// Where `USERSCALE` can only be 1, 2, 4 or 8; and is encoded as follows:
//
//     USERSCALE (decimal) | SCALE (binary)
//     ------------------- | --------------
//     1                   | 00
//     2                   | 01
//     4                   | 10
//     8                   | 11
//
// The layout of SIB byte:
//
//     76543210
//     .....XXX <--- BASE field: base register address
//     ..XXX <------ INDEX field: address of register used as scale
//     XX <--------- SCALE field: specifies multiple of INDEX: USERSCALE * INDEX
export class Sib extends InstructionPart {
    // When index set to 0b100 it means INDEX = 0 and SCALE = 0.
    static INDEX_NONE = R64.RSP & 0b111;

    // If Modrm.mod = 0b00, BASE = 0b101, means no BASE.
    // if Modrm.mod is 0b01 or 0b10, use RBP + disp8 or RBP + disp32, respectively.
    static BASE_NONE = R64.RBP & 0b111;

    S: number = 0;
    I: number = 0;
    B: number = 0;

    constructor(scalefactor, I, B) {
        super();
        this.setScale(scalefactor);
        this.I = I;
        this.B = B;
    }

    setScale(scalefactor) {
        switch(scalefactor) {
            case 1: this.S = 0b00; break;
            case 2: this.S = 0b01; break;
            case 4: this.S = 0b10; break;
            case 8: this.S = 0b11; break;
            default: this.S = 0;
            // default: throw TypeError(`User scale must be on of [1, 2, 4, 8], given: ${userscale}.`);
        }
    }

    write(arr: number[] = []): number[] {
        arr.push((this.S << 6) | (this.I << 3) | this.B);
        return arr;
    }
}


// ## Displacement
export class Displacement extends InstructionPart {
    value: o.DisplacementValue;

    constructor(value: o.DisplacementValue) {
        super();
        this.value = value;
    }

    write(arr: number[] = []): number[] {
        this.value.octets.forEach((octet) => { arr.push(octet); });
        return arr;
    }
}


// ## Immediate
//
// Immediate constant value that follows other instruction bytes.
export class Immediate extends InstructionPart {
    value: oo.Immediate;

    constructor(value: oo.Immediate) {
        super();
        this.value = value;
    }

    write(arr: number[] = []): number[] {
        this.value.octets.forEach((octet) => { arr.push(octet); });
        return arr;
    }
}
