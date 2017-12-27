import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 4022;
mnemonic_add_0.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 4022;
mnemonic_add_1.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 4022;
mnemonic_add_2.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 4023;
mnemonic_add_3.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 4023;
mnemonic_add_4.operands = [[a.r], [a.r, a.m]];

const x86_mnemonic_variations_movzx = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
]);
x86_mnemonic_variations_movzx.defaultOperandSize = 32;

export default x86_mnemonic_variations_movzx;
