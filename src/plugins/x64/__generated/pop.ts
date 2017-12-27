import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 143;
mnemonic_add_0.operands = [[a.r, a.m]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 143;
mnemonic_add_1.operands = [[a.r, a.m]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 88;
mnemonic_add_2.operands = [[a.r]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 88;
mnemonic_add_3.operands = [[a.r]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 4001;
mnemonic_add_4.operands = [[sp]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 4001;
mnemonic_add_5.operands = [[sp]];

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.opcode = 4009;
mnemonic_add_6.operands = [[bp]];

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.opcode = 4009;
mnemonic_add_7.operands = [[bp]];

const x86_mnemonic_variations_pop = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
    mnemonic_add_6,
    mnemonic_add_7,
]);
x86_mnemonic_variations_pop.defaultOperandSize = 64;

export default x86_mnemonic_variations_pop;
