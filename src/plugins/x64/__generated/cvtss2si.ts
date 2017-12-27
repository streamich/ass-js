import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 3885;
mnemonic_add_0.operands = [[a.r], [a.xmm, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 3885;
mnemonic_add_1.operands = [[a.r], [a.xmm, a.m]];

const x86_mnemonic_variations_cvtss2si = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_cvtss2si.defaultOperandSize = 32;

export default x86_mnemonic_variations_cvtss2si;
