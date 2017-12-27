import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 228;
mnemonic_add_0.operands = [[al], [a.imm8]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 229;
mnemonic_add_1.operands = [[ax], [a.imm8]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 229;
mnemonic_add_2.operands = [[eax], [a.imm8]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 236;
mnemonic_add_3.operands = [[al], [dx]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 237;
mnemonic_add_4.operands = [[ax], [dx]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 237;
mnemonic_add_5.operands = [[eax], [dx]];

const x86_mnemonic_variations_in = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
]);
x86_mnemonic_variations_in.defaultOperandSize = 32;

export default x86_mnemonic_variations_in;
