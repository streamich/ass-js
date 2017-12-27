import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 80;
mnemonic_add_0.operands = [[a.r], [a.xmm]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 80;
mnemonic_add_1.operands = [[a.r], [a.ymm]];

const x86_mnemonic_variations_vmovmskpd = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_vmovmskpd.defaultOperandSize = 32;

export default x86_mnemonic_variations_vmovmskpd;
