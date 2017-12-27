import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 89;
mnemonic_add_0.operands = [[a.xmm], [a.xmm, a.m]];

const x86_mnemonic_variations_mulsd = new MnemonicVariationsX86([
    mnemonic_add_0,
]);
x86_mnemonic_variations_mulsd.defaultOperandSize = 32;

export default x86_mnemonic_variations_mulsd;
