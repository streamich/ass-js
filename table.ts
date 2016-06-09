import {SIZE, Register, Memory, Relative, Relative8, Relative16, Relative32} from './operand';


export var S        = SIZE;

// Operands
export var r        = Register;
export var m        = Memory;
export var rel      = Relative;
export var rel8     = Relative8;
export var rel16    = Relative16;
export var rel32    = Relative32;


export type TOperandTemplate = Register | typeof Register | typeof Memory |
    typeof Relative | typeof Relative8 | typeof Relative16 | typeof Relative32;


export interface Definition {
    o?: number;                                         // Opcode
    mn?: string;                                        // Mnemonic
    s?: number;                                         // Operand size, each operation can only have size of `SIZE.NONE`, when it
                                                        // has no operands or does not need them (like INT 0x80), or one of `SIZE.X`,
                                                        // it cannot have size of `SIZE.ANY`.
    ops?: (any|TOperandTemplate|TOperandTemplate[])[];  // Operands this instruction accepts.
}
export type GroupDefinition = Definition[];
export type TableDefinition = {[s: string]: GroupDefinition};

// Global defaults
export var defaults: Definition = {o: 0x00, mn: '', s: S.NONE, ops: null};

