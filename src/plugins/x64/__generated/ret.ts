import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 195;
mnemonic_add_0.operands = [];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 194;
mnemonic_add_1.operands = [[a.imm16]];

const x86_mnemonic_variations_ret = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_ret.defaultOperandSize = 64;

export default x86_mnemonic_variations_ret;
