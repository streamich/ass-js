import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 166;
mnemonic_add_0.operands = [];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 167;
mnemonic_add_1.operands = [];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 167;
mnemonic_add_2.operands = [];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 167;
mnemonic_add_3.operands = [];

const x86_mnemonic_variations_cmps = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
]);
x86_mnemonic_variations_cmps.defaultOperandSize = 32;

export default x86_mnemonic_variations_cmps;
