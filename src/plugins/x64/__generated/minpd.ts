import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 6688605;
mnemonic_add_0.operands = [[a.xmm], [a.xmm, a.m]];

const x86_mnemonic_variations_minpd = new MnemonicVariationsX86([
    mnemonic_add_0,
]);
x86_mnemonic_variations_minpd.defaultOperandSize = 32;

export default x86_mnemonic_variations_minpd;
