import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 6688528;
mnemonic_add_0.operands = [[a.xmm], [a.xmm, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 6688529;
mnemonic_add_1.operands = [[a.xmm, a.m], [a.xmm]];

const x86_mnemonic_variations_movupd = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_movupd.defaultOperandSize = 32;

export default x86_mnemonic_variations_movupd;
