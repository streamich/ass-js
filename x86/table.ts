import * as o from './operand';


export var S        = o.SIZE;
export var M        = o.MODE;

// Operands
export var r        = o.Register;
export var r8       = o.Register8;
export var r16      = o.Register16;
export var r32      = o.Register32;
export var r64      = o.Register64;
export var m        = o.Memory;
export var m8       = o.Memory8;
export var m16      = o.Memory16;
export var m32      = o.Memory32;
export var m64      = o.Memory64;
export var rm8      = [o.Register8,  o.Memory];
export var rm16     = [o.Register16, o.Memory];
export var rm32     = [o.Register32, o.Memory];
export var rm64     = [o.Register64, o.Memory];
export var imm      = o.Immediate;
export var immu     = o.ImmediateUnsigned;
export var imm8     = o.Immediate8;
export var immu8    = o.ImmediateUnsigned8;
export var imm16    = o.Immediate16;
export var immu16   = o.ImmediateUnsigned16;
export var imm32    = o.Immediate32;
export var immu32   = o.ImmediateUnsigned32;
export var imm64    = o.Immediate64;
export var immu64   = o.ImmediateUnsigned64;


export type TOperandTemplate = o.Register |
    typeof o.Register | typeof o.Register8 | typeof o.Register16 | typeof o.Register32 | typeof o.Register64 |
    typeof o.Memory | typeof o.Memory8 | typeof o.Memory16 | typeof o.Memory32 | typeof o.Memory64 |
    typeof o.Immediate | typeof o.Immediate8 | typeof o.Immediate16 | typeof o.Immediate32 | typeof o.Immediate64 |
    typeof o.ImmediateUnsigned | typeof o.ImmediateUnsigned8 | typeof o.ImmediateUnsigned16 | typeof o.ImmediateUnsigned32 | typeof o.ImmediateUnsigned64;


export interface Definition {
    s?: number;                                     // Operand size, each operation can only have size of `o.SIZE.NONE`, when it
                                                    // has no operands or does not need them (like INT 0x80), or one of `o.SIZE.X`,
                                                    // it cannot have size of `o.SIZE.ANY`.
    ds?: number;                                    // Default size, usually 32 bits on x64, some instructions default to 64 bits.
    lock?: boolean;                                 // Whether LOCK prefix allowed.
    ops?: (TOperandTemplate|TOperandTemplate[])[];  // Operands this instruction accepts.
    mn?: string;                                    // Mnemonic
    o?: number;                                     // Opcode
    or?: number;                                    // Opreg - 3bit opcode part in modrm.reg field, -1 if none.
    r?: boolean;                                    // 3bit register encoded in lowest opcode bits.
    dbit?: boolean;                                 // Whether it is allowed to change `d` bit in opcode.
    rex?: boolean;                                  // Whether REX prefix is mandatory for this instruction.
    mr?: boolean;                                   // Whether to include Mod-REG-R/M byte if deemed necessary.
    rep?: boolean;                                  // REP and REPE/REPZ prefix allowed.
    repne?: boolean;                                // REPNE/REPNZ prefix allowed.
    pfx?: number[];                                 // List of mandatory prefixes.
}
export type GroupDefinition = Definition[];
export type TableDefinition = {[s: string]: GroupDefinition};


// Global defaults
export var defaults: Definition
    = {s: S.NONE, ds: S.D, lock: false, ops: null, or: -1, r: false, dbit: false, rex: false, mr: true, rep: false, repne: false, pfx: null};


// Instruction are divided in groups, each group consists of list
// of possible instructions. The first object is NOT an instruction
// but defaults for the group.
export var table: TableDefinition = {
    mov: [
        {mn: 'mov'},
        {o: 0x8B, mn: 'movq', ops: [r64, r64]},
        {o: 0xC7, ops: [r64, imm32]},
    ],
    inc: [
        {o: 0xFF, or: 0, lock: true},
        {o: 0xFE, ops: [rm8]},
        {ops: [rm32]},
        {ops: [rm64]},
    ]
};
