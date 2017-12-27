import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 3918;
mnemonic_add_0.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 3918;
mnemonic_add_1.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 3918;
mnemonic_add_2.operands = [[a.r], [a.r, a.m]];

const x86_mnemonic_variations_cmovle = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
]);
x86_mnemonic_variations_cmovle.defaultOperandSize = 32;

export default x86_mnemonic_variations_cmovle;
