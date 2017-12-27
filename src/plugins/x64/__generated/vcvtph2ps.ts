import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 19;
mnemonic_add_0.operands = [[a.ymm], [a.xmm, a.m]];

const x86_mnemonic_variations_vcvtph2ps = new MnemonicVariationsX86([
    mnemonic_add_0,
]);
x86_mnemonic_variations_vcvtph2ps.defaultOperandSize = 32;

export default x86_mnemonic_variations_vcvtph2ps;
