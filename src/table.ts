import {S} from './atoms';
import {Register, Memory, Relative, Relative8, Relative16, Relative32,
    Immediate, Immediate8, Immediate16, Immediate32, Immediate64,
    ImmediateUnsigned, ImmediateUnsigned8, ImmediateUnsigned16, ImmediateUnsigned32, ImmediateUnsigned64} from './operand';


export type TTableOperand =
      number
    | Register
    | (new (...args) => Register)
    | (new (...args) => Memory)
    | (new (...args) => Relative)
    | (new (...args) => Immediate)
    // | typeof Register
    // | typeof Memory
    // | typeof Relative
    // | typeof Relative8
    // | typeof Relative16
    // | typeof Relative32
    // | typeof Immediate
    // | typeof Immediate8
    // | typeof Immediate16
    // | typeof Immediate32
    // | typeof Immediate64
    // | typeof ImmediateUnsigned
    // | typeof ImmediateUnsigned8
    // | typeof ImmediateUnsigned16
    // | typeof ImmediateUnsigned32
    // | typeof ImmediateUnsigned64
    ;

export interface ITableDefinition {
    // Opcode
    o?: number;

    // Mnemonic
    mn?: string;

    // Operand size, each operation can only have size of `SIZE.NONE`, when it
    // has no operands or does not need them (like INT 0x80), or one of `SIZE.X`,
    // it cannot have size of `SIZE.ANY`.
    s?: number;

    // Operands this instruction accepts.
    ops?: (any | TTableOperand | TTableOperand[])[];
}

// Proxy to some other mnemonic, which have exactly the same definition.
export type Tproxy = [string];
export type GroupDefinition = (ITableDefinition|Tproxy)[];
export type TableDefinition = {[s: string]: GroupDefinition};

// Global defaults
export const defaults: ITableDefinition = {
    o: 0x00,
    mn: '',
    s: S.NONE,
    ops: null
};
