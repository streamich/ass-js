import {TTableOperand, defaults as  definitionDefaults, ITableDefinition} from '../../table';
import {IVexDefinition} from './parts/PrefixVex';
import {IEvexDefinition} from "./parts/PrefixEvex";
import {EXT, MODE} from "./consts";
import {S, M, immu8} from './atoms';
import {
    Register16, Register32, Register64, Register8, RegisterBounds, RegisterCr, RegisterDr, RegisterMm, RegisterSegment,
    RegisterSt,
    RegisterX86, RegisterXmm, RegisterYmm, RegisterZmm
} from "./operand/register";
import {MemoryX86, Memory128, Memory16, Memory256, Memory32, Memory64, Memory8} from "./operand/memory";



export type TTableOperandX86 = TTableOperand |
    typeof Register8 | typeof Register16 | typeof Register32 | typeof Register64 |
    typeof RegisterMm | typeof RegisterSt |
    typeof RegisterXmm | typeof RegisterYmm | typeof RegisterZmm |
    typeof RegisterSegment | typeof RegisterCr | typeof RegisterDr |
    typeof Memory8 | typeof Memory16 | typeof Memory32 | typeof Memory64;


export type TRexDefinition = [number, number, number, number];


export interface ITableDefinitionX86 extends ITableDefinition {
    ops?: (TTableOperandX86|TTableOperandX86[])[];  // Operands this instruction accepts.

    ds?: number;                                    // Default size, usually 32 bits on x64, some instructions default to 64 bits.
    lock?: boolean;                                 // Whether LOCK prefix allowed.
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
export type ITableGroupDefinitionX86 = ITableDefinitionX86[];
export type ITableX86 = {[s: string]: ITableGroupDefinitionX86|string[]};


// x86 global defaults
export const defaults: ITableDefinitionX86 = {
    ...definitionDefaults,
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

export const table = {
    cpuid: [{o: 0x0FA2}],
    int: [{},
        // CC INT 3 NP Valid Valid Interrupt 3—trap to debugger.
        {o: 0xCC, ops: [3]},
        // CD ib INT imm8 I Valid Valid Interrupt vector specified by immediate byte.
        {o: 0xCD, ops: [immu8]},
    ],
};
