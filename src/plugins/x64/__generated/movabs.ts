import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 160;
mnemonic_add_0.operands = [[al], [a.imm8]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 161;
mnemonic_add_1.operands = [[ax], [a.imm16]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 161;
mnemonic_add_2.operands = [[eax], [a.imm32]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 161;
mnemonic_add_3.operands = [[rax], [a.imm64]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 162;
mnemonic_add_4.operands = [[a.imm8], [al]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 163;
mnemonic_add_5.operands = [[a.imm16], [ax]];

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.opcode = 163;
mnemonic_add_6.operands = [[a.imm32], [eax]];

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.opcode = 163;
mnemonic_add_7.operands = [[a.imm64], [rax]];

const x86_mnemonic_variations_movabs = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
    mnemonic_add_6,
    mnemonic_add_7,
]);
x86_mnemonic_variations_movabs.defaultOperandSize = 32;

export default x86_mnemonic_variations_movabs;
