import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 235;
mnemonic_add_0.operands = [[a.rel8]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 233;
mnemonic_add_1.operands = [[a.rel32]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 255;
mnemonic_add_2.operands = [[a.r, a.m]];

const x86_mnemonic_variations_jmp = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
]);
x86_mnemonic_variations_jmp.defaultOperandSize = 64;

export default x86_mnemonic_variations_jmp;
