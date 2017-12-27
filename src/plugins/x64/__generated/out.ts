import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 230;
mnemonic_add_0.operands = [[a.imm8], [al]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 231;
mnemonic_add_1.operands = [[a.imm8], [ax]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 231;
mnemonic_add_2.operands = [[a.imm8], [eax]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 238;
mnemonic_add_3.operands = [[dx], [al]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 239;
mnemonic_add_4.operands = [[dx], [ax]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 239;
mnemonic_add_5.operands = [[dx], [eax]];

const x86_mnemonic_variations_out = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
]);
x86_mnemonic_variations_out.defaultOperandSize = 32;

export default x86_mnemonic_variations_out;
