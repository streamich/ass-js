import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.opcode = 136;
mnemonic_add_0.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.opcode = 138;
mnemonic_add_1.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.opcode = 137;
mnemonic_add_2.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.opcode = 139;
mnemonic_add_3.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.opcode = 137;
mnemonic_add_4.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.opcode = 139;
mnemonic_add_5.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.opcode = 137;
mnemonic_add_6.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.opcode = 139;
mnemonic_add_7.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_8 = new MnemonicX86;
mnemonic_add_8.opcode = 140;
mnemonic_add_8.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_9 = new MnemonicX86;
mnemonic_add_9.opcode = 142;
mnemonic_add_9.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_10 = new MnemonicX86;
mnemonic_add_10.opcode = 140;
mnemonic_add_10.operands = [[a.r, a.m], [a.r]];

const mnemonic_add_11 = new MnemonicX86;
mnemonic_add_11.opcode = 142;
mnemonic_add_11.operands = [[a.r], [a.r, a.m]];

const mnemonic_add_12 = new MnemonicX86;
mnemonic_add_12.opcode = 176;
mnemonic_add_12.operands = [[a.r], [a.imm8]];

const mnemonic_add_13 = new MnemonicX86;
mnemonic_add_13.opcode = 184;
mnemonic_add_13.operands = [[a.r], [a.imm16]];

const mnemonic_add_14 = new MnemonicX86;
mnemonic_add_14.opcode = 184;
mnemonic_add_14.operands = [[a.r], [a.imm32]];

const mnemonic_add_15 = new MnemonicX86;
mnemonic_add_15.opcode = 184;
mnemonic_add_15.operands = [[a.r], [a.imm64]];

const mnemonic_add_16 = new MnemonicX86;
mnemonic_add_16.opcode = 198;
mnemonic_add_16.operands = [[a.r, a.m], [a.imm8]];

const mnemonic_add_17 = new MnemonicX86;
mnemonic_add_17.opcode = 199;
mnemonic_add_17.operands = [[a.r, a.m], [a.imm16]];

const mnemonic_add_18 = new MnemonicX86;
mnemonic_add_18.opcode = 199;
mnemonic_add_18.operands = [[a.r, a.m], [a.imm32]];

const mnemonic_add_19 = new MnemonicX86;
mnemonic_add_19.opcode = 199;
mnemonic_add_19.operands = [[a.r, a.m], [a.imm32]];

const mnemonic_add_20 = new MnemonicX86;
mnemonic_add_20.opcode = 3872;
mnemonic_add_20.operands = [[a.r], [cr0, cr1, cr2, cr3, cr4, cr5, cr6, cr7]];

const mnemonic_add_21 = new MnemonicX86;
mnemonic_add_21.opcode = 3872;
mnemonic_add_21.operands = [[a.r], [cr0, cr1, cr2, cr3, cr4, cr5, cr6, cr7]];

const mnemonic_add_22 = new MnemonicX86;
mnemonic_add_22.opcode = 3872;
mnemonic_add_22.operands = [[a.r], [cr8]];

const mnemonic_add_23 = new MnemonicX86;
mnemonic_add_23.opcode = 3874;
mnemonic_add_23.operands = [[cr0, cr1, cr2, cr3, cr4, cr5, cr6, cr7], [a.r]];

const mnemonic_add_24 = new MnemonicX86;
mnemonic_add_24.opcode = 3874;
mnemonic_add_24.operands = [[cr0, cr1, cr2, cr3, cr4, cr5, cr6, cr7], [a.r]];

const mnemonic_add_25 = new MnemonicX86;
mnemonic_add_25.opcode = 3874;
mnemonic_add_25.operands = [[cr8], [a.r]];

const mnemonic_add_26 = new MnemonicX86;
mnemonic_add_26.opcode = 3873;
mnemonic_add_26.operands = [[a.r], [dr0, dr1, dr2, dr3, dr4, dr5, dr6, dr7]];

const mnemonic_add_27 = new MnemonicX86;
mnemonic_add_27.opcode = 3875;
mnemonic_add_27.operands = [[dr0, dr1, dr2, dr3, dr4, dr5, dr6, dr7], [a.r]];

const mnemonic_add_28 = new MnemonicX86;
mnemonic_add_28.opcode = 3873;
mnemonic_add_28.operands = [[a.r], [dr0, dr1, dr2, dr3, dr4, dr5, dr6, dr7]];

const mnemonic_add_29 = new MnemonicX86;
mnemonic_add_29.opcode = 3875;
mnemonic_add_29.operands = [[dr0, dr1, dr2, dr3, dr4, dr5, dr6, dr7], [a.r]];

const x86_mnemonic_variations_mov = new MnemonicVariationsX86([
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
    mnemonic_add_10,
    mnemonic_add_11,
    mnemonic_add_12,
    mnemonic_add_13,
    mnemonic_add_14,
    mnemonic_add_15,
    mnemonic_add_16,
    mnemonic_add_17,
    mnemonic_add_18,
    mnemonic_add_19,
    mnemonic_add_20,
    mnemonic_add_21,
    mnemonic_add_22,
    mnemonic_add_23,
    mnemonic_add_24,
    mnemonic_add_25,
    mnemonic_add_26,
    mnemonic_add_27,
    mnemonic_add_28,
    mnemonic_add_29,
]);
x86_mnemonic_variations_mov.defaultOperandSize = 32;

export default x86_mnemonic_variations_mov;
