import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 208;
mnemonic_add_0.operands = [[a.r, a.m], [1]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 210;
mnemonic_add_1.operands = [[a.r, a.m], [cl]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 192;
mnemonic_add_2.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 209;
mnemonic_add_3.operands = [[a.r, a.m], [1]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 211;
mnemonic_add_4.operands = [[a.r, a.m], [cl]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 193;
mnemonic_add_5.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.opcode = 209;
mnemonic_add_6.operands = [[a.r, a.m], [1]];

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.opcode = 209;
mnemonic_add_7.operands = [[a.r, a.m], [1]];

const mnemonic_add_8 = new MnemonicX86;
mnemonic_add_8.opcode = 211;
mnemonic_add_8.operands = [[a.r, a.m], [cl]];

const mnemonic_add_9 = new MnemonicX86;
mnemonic_add_9.opcode = 211;
mnemonic_add_9.operands = [[a.r, a.m], [cl]];

const mnemonic_add_10 = new MnemonicX86;
mnemonic_add_10.opcode = 193;
mnemonic_add_10.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_11 = new MnemonicX86;
mnemonic_add_11.opcode = 193;
mnemonic_add_11.operands = [[a.r, a.m], [a.imm8]];

const x86_mnemonic_variations_shr = new MnemonicVariationsX86([
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
]);
x86_mnemonic_variations_shr.defaultOperandSize = 32;

export default x86_mnemonic_variations_shr;
