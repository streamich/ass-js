import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 144;
mnemonic_add_0.operands = [[ax], [a.r]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 144;
mnemonic_add_1.operands = [[a.r], [ax]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 144;
mnemonic_add_2.operands = [[eax], [a.r]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 144;
mnemonic_add_3.operands = [[rax], [a.r]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 144;
mnemonic_add_4.operands = [[a.r], [eax]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 144;
mnemonic_add_5.operands = [[a.r], [rax]];

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.opcode = 134;
mnemonic_add_6.operands = [[a.r, a.m], [a.r, a.m]];

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.opcode = 135;
mnemonic_add_7.operands = [[a.r, a.m], [a.r, a.m]];

const mnemonic_add_8 = new MnemonicX86;
mnemonic_add_8.opcode = 135;
mnemonic_add_8.operands = [[a.r, a.m], [a.r, a.m]];

const mnemonic_add_9 = new MnemonicX86;
mnemonic_add_9.opcode = 135;
mnemonic_add_9.operands = [[a.r, a.m], [a.r, a.m]];

const x86_mnemonic_variations_xchg = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
    mnemonic_add_4,
    mnemonic_add_5,
    mnemonic_add_6,
    mnemonic_add_7,
    mnemonic_add_8,
    mnemonic_add_9,
]);
x86_mnemonic_variations_xchg.defaultOperandSize = 32;

export default x86_mnemonic_variations_xchg;
