import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 174;
mnemonic_add_0.operands = [];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 175;
mnemonic_add_1.operands = [];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 175;
mnemonic_add_2.operands = [];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 175;
mnemonic_add_3.operands = [];

const x86_mnemonic_variations_scas = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
]);
x86_mnemonic_variations_scas.defaultOperandSize = 32;

export default x86_mnemonic_variations_scas;
