import {SIZE, Register, Memory, Relative, Relative8, Relative16, Relative32,
    Immediate, Immediate8, Immediate16, Immediate32, Immediate64,
    ImmediateUnsigned, ImmediateUnsigned8, ImmediateUnsigned16, ImmediateUnsigned32, ImmediateUnsigned64} from './operand';

export const S      = SIZE;

// Operands
export const r      = Register;
export const m      = Memory;
export const imm    = Immediate;
export const immu   = ImmediateUnsigned;
export const imm8   = Immediate8;
export const immu8  = ImmediateUnsigned8;
export const imm16  = Immediate16;
export const immu16 = ImmediateUnsigned16;
export const imm32  = Immediate32;
export const immu32 = ImmediateUnsigned32;
export const imm64  = Immediate64;
export const immu64 = ImmediateUnsigned64;
export const rel    = Relative;
export const rel8   = Relative8;
export const rel16  = Relative16;
export const rel32  = Relative32;
