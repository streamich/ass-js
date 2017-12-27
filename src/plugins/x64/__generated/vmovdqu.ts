import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 111;
mnemonic_add_0.operands = [[a.xmm], [a.xmm, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 127;
mnemonic_add_1.operands = [[a.xmm, a.m], [a.xmm]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 111;
mnemonic_add_2.operands = [[a.ymm], [a.ymm, a.m]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 127;
mnemonic_add_3.operands = [[a.ymm, a.m], [a.ymm]];

const x86_mnemonic_variations_vmovdqu = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
]);
x86_mnemonic_variations_vmovdqu.defaultOperandSize = 32;

export default x86_mnemonic_variations_vmovdqu;
