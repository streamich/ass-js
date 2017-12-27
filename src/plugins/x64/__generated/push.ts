import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 255;
mnemonic_add_0.operands = [[a.r, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 255;
mnemonic_add_1.operands = [[a.r, a.m]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 80;
mnemonic_add_2.operands = [[a.r]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 80;
mnemonic_add_3.operands = [[a.r]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 106;
mnemonic_add_4.operands = [[a.imm8]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 104;
mnemonic_add_5.operands = [[a.imm16]];

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.opcode = 104;
mnemonic_add_6.operands = [[a.imm32]];

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.opcode = 4000;
mnemonic_add_7.operands = [[sp]];

const mnemonic_add_8 = new MnemonicX86;
mnemonic_add_8.opcode = 4008;
mnemonic_add_8.operands = [[bp]];

const x86_mnemonic_variations_push = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
    mnemonic_add_6,
    mnemonic_add_7,
    mnemonic_add_8,
]);
x86_mnemonic_variations_push.defaultOperandSize = 64;

export default x86_mnemonic_variations_push;
