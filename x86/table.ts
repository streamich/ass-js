import {extend} from '../util';
import {S, rel, rel8, rel16, rel32, imm, imm8, imm16, imm32, imm64, immu, immu8, immu16, immu32, immu64} from '../table';
import * as t from '../table';
import {Register, Register8, Register16, Register32, Register64, RegisterSegment,
    RegisterMmx, RegisterXmm, RegisterYmm, RegisterZmm,
    Memory, Memory8, Memory16, Memory32, Memory64} from './operand';


export enum MODE {
    REAL    = 0b1,
    PROT    = 0b10,
    X32     = 0b100,
    X64     = 0b1000,
    X32_64  = MODE.X32 | MODE.X64,
}

// Instructoins
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
    SHA,
    AES,
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
export var mmx      = RegisterMmx;
export var xmm      = RegisterXmm;
export var ymm      = RegisterYmm;
export var zmm      = RegisterZmm;
export var m        = Memory;
export var m8       = Memory8;
export var m16      = Memory16;
export var m32      = Memory32;
export var m64      = Memory64;
export var rm8      = [Register8,  Memory];
export var rm16     = [Register16, Memory];
export var rm32     = [Register32, Memory];
export var rm64     = [Register64, Memory];


export type TOperandTemplate = t.TOperandTemplate |
    typeof Register8 | typeof Register16 | typeof Register32 | typeof Register64 |
    typeof RegisterMmx | typeof RegisterXmm | typeof RegisterYmm | typeof RegisterZmm |
    typeof Memory8 | typeof Memory16 | typeof Memory32 | typeof Memory64;


export type TRexDefinition = [number, number, number, number];

// "VEX.DDS.LIG.66.0F38.W1" => {vvvv: 'DDS', L: 0, pp: 1, mmmmm: 2, W: 1}
export interface IVexDefinition {
    L: number;
    vvvv: string;
    pp: number;
    mmmmm: number;
    W: number;
    WIG: boolean;
}

export interface IEvexDefinition extends IVexDefinition {

}


export interface Definition extends t.Definition {
    ds?: number;                                    // Default size, usually 32 bits on x64, some instructions default to 64 bits.
    lock?: boolean;                                 // Whether LOCK prefix allowed.
    ops?: (TOperandTemplate|TOperandTemplate[])[];  // Operands this instruction accepts.
    or?: number;                                    // Opreg - 3bit opcode part in modrm.reg field, -1 if none.
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
export type TableDefinition = {[s: string]: GroupDefinition};


// x86 global defaults
export var defaults: Definition = extend<Definition>({}, t.defaults,
    {ds: S.D, lock: false, or: -1, r: false, dbit: false, rex: null, mr: true, rep: false, repne: false,
        pfx: null, vex: null, evex: null, en: 'rm', mod: M.X32_64, ext: null});


// Instruction are divided in groups, each group consists of list
// of possible instructions. The first object is NOT an instruction
// but defaults for the group.
export var table: TableDefinition = {

    cpuid: [{o: 0x0FA2}],
    // INT Software interrupt
    int: [{},
        // CC INT 3 NP Valid Valid Interrupt 3—trap to debugger.
        {o: 0xCC, ops: [3]},
        // CD ib INT imm8 I Valid Valid Interrupt vector specified by immediate byte.
        {o: 0xCD, ops: [immu8]},
    ],
};
