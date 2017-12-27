import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 232;
mnemonic_add_0.operands = [[a.rel16]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 232;
mnemonic_add_1.operands = [[a.rel32]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 255;
mnemonic_add_2.operands = [[a.r, a.m]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 255;
mnemonic_add_3.operands = [[a.r, a.m]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 255;
mnemonic_add_4.operands = [[a.r, a.m]];

const x86_mnemonic_variations_call = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
]);
x86_mnemonic_variations_call.defaultOperandSize = 64;

export default x86_mnemonic_variations_call;
