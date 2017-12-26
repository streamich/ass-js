import {extend} from '../../util';
import {S, rel, rel8, rel16, rel32, imm, imm8, imm16, imm32, imm64, immu, immu8, immu16, immu32, immu64} from '../../table';
import * as t from '../../table';
import {
    Register, Register8, Register16, Register32, Register64,
    RegisterMm, RegisterSt, RegisterXmm, RegisterYmm, RegisterZmm,
    RegisterSegment, RegisterCr, RegisterDr, RegisterBounds,
    Memory, Memory8, Memory16, Memory32, Memory64, Memory128, Memory256, Memory512
} from './operand';
import {IVexDefinition} from './parts/PrefixVex';
import {IEvexDefinition} from "./parts/PrefixEvex";


export enum MODE {
    REAL        = 0b1,
    PROT        = 0b10,
    COMP        = 0b100,
    LEG         = 0b1000,
    OLD         = MODE.COMP | MODE.LEG,
    X32         = 0b10000,
    X64         = 0b100000,
    X32_64      = MODE.X32 | MODE.X64,
    ALL         = MODE.REAL | MODE.PROT | MODE.COMP | MODE.LEG | MODE.X32 | MODE.X64,
}

// Instructions
export enum INS {
    NONE        = 0b0,
    MMX         = 0b1,
    AES_NI      = 0b10,
    CLMUL       = 0b100,
    FMA3        = 0b1000,
}

// Extensions
export enum EXT {
    NONE,
    x86_64,
    Intel_64,
    MPX,
    TXT,
    TSX,
    SGX,
    VT_x,
    VT_d,
    BMI1,
    BMI2,
    SHA,
    AES,
    INVPCID,
    LZCNT,
    MMX,
    SSE,
    SSE2,
    SSE3,
    SSSE3,
    SSE4,
    SSE4_1,
    SSE4_2,
    ADX,
    AVX,
    AVX2,
    AVX3, // AVX-512
    AVX512F = EXT.AVX3, // Foundation
    AVX512CDI,
    AVX512PFI,
    AVX512ERI,
    AVX512VL,
    AVX512VLI,
    AVX512BW,
    AVX512DQ,
    AVX512IFMA52,
    AVX512VBMI,
    FMA3,
    FMA4,
    CDI,
}


export var M        = MODE;

// Operands
export var r        = Register;
export var r8       = Register8;
export var r16      = Register16;
export var r32      = Register32;
export var r64      = Register64;
export var sreg     = RegisterSegment;
export var mm       = RegisterMm;
export var st       = RegisterSt;
export var xmm      = RegisterXmm;
export var ymm      = RegisterYmm;
export var zmm      = RegisterZmm;
export var bnd      = RegisterBounds;
export var cr       = RegisterCr;
export var dr       = RegisterDr;
export var m        = Memory;
export var m8       = Memory8;
export var m16      = Memory16;
export var m32      = Memory32;
export var m64      = Memory64;
export var m128     = Memory128;
export var m256     = Memory256;
export var m512     = Memory512;
export var rm8      = [r8,  m];
export var rm16     = [r16, m];
export var rm32     = [r32, m];
export var rm64     = [r64, m];
export var xmmm             = [xmm, m];
export var xmm_xmmm         = [xmm, xmmm];
export var xmm_xmm_xmmm     = [xmm, xmm, xmmm];
export var ymmm             = [ymm, m];
export var ymm_ymmm         = [ymm, ymmm];
export var ymm_ymm_ymmm     = [ymm, ymm, ymmm];
export var zmmm             = [zmm, m];
export var zmm_zmmm         = [zmm, zmmm];
export var zmm_zmm_zmmm     = [zmm, zmm, zmmm];


export type TOperandTemplate = t.TOperandTemplate |
    typeof Register8 | typeof Register16 | typeof Register32 | typeof Register64 |
    typeof RegisterMm | typeof RegisterSt |
    typeof RegisterXmm | typeof RegisterYmm | typeof RegisterZmm |
    typeof RegisterSegment | typeof RegisterCr | typeof RegisterDr |
    typeof Memory8 | typeof Memory16 | typeof Memory32 | typeof Memory64;


export type TRexDefinition = [number, number, number, number];


export interface Definition extends t.Definition {
    ds?: number;                                    // Default size, usually 32 bits on x64, some instructions default to 64 bits.
    lock?: boolean;                                 // Whether LOCK prefix allowed.
    ops?: (TOperandTemplate|TOperandTemplate[])[];  // Operands this instruction accepts.
    or?: number;                                    // Opreg - 3bit opcode part in modrm.reg field, -1 if none.
    i?: number;                                     // Hex octet, when +i provided in x87 floating point operations.
    r?: boolean;                                    // 3bit register encoded in lowest opcode bits.
    dbit?: boolean;                                 // Whether it is allowed to change `d` bit in opcode. `en` encoding field is ignored then.
    mr?: boolean;                                   // Whether to include Mod-REG-R/M byte if deemed necessary.
    rep?: boolean;                                  // REP and REPE/REPZ prefix allowed.
    repne?: boolean;                                // REPNE/REPNZ prefix allowed.
    pfx?: number[];                                 // List of mandatory prefixes.
    en?: string;                                    // Operand encoding, e.g. "rvmr" -> (1) modmr.reg; (2) VEX.vvv; (3) modrm.rm; (4) imm8
    mod?: MODE;                                     // CPU mode
    rex?: TRexDefinition;                           // Whether REX prefix is mandatory for this instruction. Holds array of [W, R, X, B].
    vex?: string|IVexDefinition;                    // VEX prefix definitions string as it appears in manual, e.g. "256.66.0F3A.W0"
    evex?: string|IEvexDefinition;                  // VEX prefix definitions string as it appears in manual, e.g. "256.66.0F3A.W0"
    ext?: EXT[];                                    // CPUID extensions required to run this instruction.
}
export type GroupDefinition = Definition[];
export type TableDefinition = {[s: string]: GroupDefinition|string[]};


// x86 global defaults
export const defaults: Definition = {
    ...t.defaults,
    ds: S.D,
    lock: false,
    or: -1,
    i: null,
    r: false,
    dbit: false,
    rex: null,
    mr: true,
    rep: false,
    repne: false,
    pfx: null,
    vex: null,
    evex: null,
    en: 'rm',
    mod: M.ALL,
    ext: null
};


// Instruction are divided in groups, each group consists of list
// of possible instructions. The first object is NOT an instruction
// but defaults for the group.
export const table: TableDefinition = {

    cpuid: [{o: 0x0FA2}],
    // INT Software interrupt
    int: [{},
        // CC INT 3 NP Valid Valid Interrupt 3—trap to debugger.
        {o: 0xCC, ops: [3]},
        // CD ib INT imm8 I Valid Valid Interrupt vector specified by immediate byte.
        {o: 0xCD, ops: [immu8]},
    ],
};
