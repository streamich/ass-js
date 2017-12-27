import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 110;
mnemonic_add_0.operands = [];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 111;
mnemonic_add_1.operands = [];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 111;
mnemonic_add_2.operands = [];

const x86_mnemonic_variations_outs = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
]);
x86_mnemonic_variations_outs.defaultOperandSize = 32;

export default x86_mnemonic_variations_outs;
