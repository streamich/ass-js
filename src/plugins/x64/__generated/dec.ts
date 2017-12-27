import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 254;
mnemonic_add_0.operands = [[a.r, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 255;
mnemonic_add_1.operands = [[a.r, a.m]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 255;
mnemonic_add_2.operands = [[a.r, a.m]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 255;
mnemonic_add_3.operands = [[a.r, a.m]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 72;
mnemonic_add_4.operands = [[a.r]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 72;
mnemonic_add_5.operands = [[a.r]];

const x86_mnemonic_variations_dec = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
]);
x86_mnemonic_variations_dec.defaultOperandSize = 32;

export default x86_mnemonic_variations_dec;
