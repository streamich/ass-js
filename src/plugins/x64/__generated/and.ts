import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 36;
mnemonic_add_0.operands = [[al], [a.imm8]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 37;
mnemonic_add_1.operands = [[ax], [a.imm16]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 37;
mnemonic_add_2.operands = [[eax], [a.imm32]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 37;
mnemonic_add_3.operands = [[rax], [a.imm32]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 128;
mnemonic_add_4.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 129;
mnemonic_add_5.operands = [[a.r, a.m], [a.imm16]];

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.opcode = 129;
mnemonic_add_6.operands = [[a.r, a.m], [a.imm32]];

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.opcode = 129;
mnemonic_add_7.operands = [[a.r, a.m], [a.imm32]];

const mnemonic_add_8 = new MnemonicX86;
mnemonic_add_8.opcode = 131;
mnemonic_add_8.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_9 = new MnemonicX86;
mnemonic_add_9.opcode = 131;
mnemonic_add_9.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_10 = new MnemonicX86;
mnemonic_add_10.opcode = 131;
mnemonic_add_10.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_11 = new MnemonicX86;
mnemonic_add_11.opcode = 32;
mnemonic_add_11.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_12 = new MnemonicX86;
mnemonic_add_12.opcode = 34;
mnemonic_add_12.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_13 = new MnemonicX86;
mnemonic_add_13.opcode = 33;
mnemonic_add_13.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_14 = new MnemonicX86;
mnemonic_add_14.opcode = 35;
mnemonic_add_14.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_15 = new MnemonicX86;
mnemonic_add_15.opcode = 33;
mnemonic_add_15.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_16 = new MnemonicX86;
mnemonic_add_16.opcode = 35;
mnemonic_add_16.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_17 = new MnemonicX86;
mnemonic_add_17.opcode = 33;
mnemonic_add_17.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_18 = new MnemonicX86;
mnemonic_add_18.opcode = 35;
mnemonic_add_18.operands = [[a.r], [a.r, a.m]];

const x86_mnemonic_variations_and = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
    mnemonic_add_6,
    mnemonic_add_7,
    mnemonic_add_8,
    mnemonic_add_9,
    mnemonic_add_10,
    mnemonic_add_11,
    mnemonic_add_12,
    mnemonic_add_13,
    mnemonic_add_14,
    mnemonic_add_15,
    mnemonic_add_16,
    mnemonic_add_17,
    mnemonic_add_18,
]);
x86_mnemonic_variations_and.defaultOperandSize = 32;

export default x86_mnemonic_variations_and;
