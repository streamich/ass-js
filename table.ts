import {SIZE, Register, Memory, Relative, Relative8, Relative16, Relative32,
    Immediate, Immediate8, Immediate16, Immediate32, Immediate64,
    ImmediateUnsigned, ImmediateUnsigned8, ImmediateUnsigned16, ImmediateUnsigned32, ImmediateUnsigned64} from './operand';


export var S        = SIZE;

// Operands
export var r        = Register;
export var m        = Memory;
export var imm      = Immediate;
export var immu     = ImmediateUnsigned;
export var imm8     = Immediate8;
export var immu8    = ImmediateUnsigned8;
export var imm16    = Immediate16;
export var immu16   = ImmediateUnsigned16;
export var imm32    = Immediate32;
export var immu32   = ImmediateUnsigned32;
export var imm64    = Immediate64;
export var immu64   = ImmediateUnsigned64;
export var rel      = Relative;
export var rel8     = Relative8;
export var rel16    = Relative16;
export var rel32    = Relative32;


export type TOperandTemplate = Register | typeof Register | typeof Memory |
    typeof Relative | typeof Relative8 | typeof Relative16 | typeof Relative32 |
    typeof Immediate | typeof Immediate8 | typeof Immediate16 | typeof Immediate32 | typeof Immediate64 |
    typeof ImmediateUnsigned | typeof ImmediateUnsigned8 | typeof ImmediateUnsigned16 | typeof ImmediateUnsigned32 | typeof ImmediateUnsigned64;


export interface Definition {
    o?: number;                                         // Opcode
    mn?: string;                                        // Mnemonic
    s?: number;                                         // Operand size, each operation can only have size of `SIZE.NONE`, when it
                                                        // has no operands or does not need them (like INT 0x80), or one of `SIZE.X`,
                                                        // it cannot have size of `SIZE.ANY`.
    ops?: (any|TOperandTemplate|TOperandTemplate[])[];  // Operands this instruction accepts.
    mns?: string[];                                     // Other mnemonics for exactly the same instruction, basically proxies.
}
export type GroupDefinition = Definition[];
export type TableDefinition = {[s: string]: GroupDefinition};

// Global defaults
export var defaults: Definition = {o: 0x00, mn: '', s: S.NONE, ops: null};

