import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 54282;
mnemonic_add_0.operands = [];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 212;
mnemonic_add_1.operands = [[a.imm8]];

const x86_mnemonic_variations_aam = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_aam.defaultOperandSize = 32;

export default x86_mnemonic_variations_aam;
