import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 226;
mnemonic_add_0.operands = [[a.rel8]];

const x86_mnemonic_variations_loop = new MnemonicVariationsX86([
    mnemonic_add_0,
]);
x86_mnemonic_variations_loop.defaultOperandSize = 32;

export default x86_mnemonic_variations_loop;
