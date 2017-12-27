import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 120;
mnemonic_add_0.operands = [[a.rel8]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 3976;
mnemonic_add_1.operands = [[a.rel32]];

const x86_mnemonic_variations_js = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_js.defaultOperandSize = 32;

export default x86_mnemonic_variations_js;
