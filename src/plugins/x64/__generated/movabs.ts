import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.mnemonic                = "movabs";
mnemonic_add_0.operandSize             = 8;
mnemonic_add_0.opcode                  = 160;
mnemonic_add_0.operandTemplates        = [[a.al], [a.imm8]];
mnemonic_add_0.opreg                   = -1;
mnemonic_add_0.operandSizeDefault      = 32;
mnemonic_add_0.lock                    = false;
mnemonic_add_0.regInOp                 = false;
mnemonic_add_0.opcodeDirectionBit      = false;
mnemonic_add_0.useModrm                = true;
mnemonic_add_0.rep                     = false;
mnemonic_add_0.repne                   = false;
mnemonic_add_0.prefixes                = null;
mnemonic_add_0.opEncoding              = "rm";
mnemonic_add_0.rex                     = null;
mnemonic_add_0.vex                     = null;
mnemonic_add_0.evex                    = null;
mnemonic_add_0.mode                    = 63;
mnemonic_add_0.extensions              = null;

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.mnemonic                = "movabs";
mnemonic_add_1.operandSize             = 16;
mnemonic_add_1.opcode                  = 161;
mnemonic_add_1.operandTemplates        = [[a.ax], [a.imm16]];
mnemonic_add_1.opreg                   = -1;
mnemonic_add_1.operandSizeDefault      = 32;
mnemonic_add_1.lock                    = false;
mnemonic_add_1.regInOp                 = false;
mnemonic_add_1.opcodeDirectionBit      = false;
mnemonic_add_1.useModrm                = true;
mnemonic_add_1.rep                     = false;
mnemonic_add_1.repne                   = false;
mnemonic_add_1.prefixes                = null;
mnemonic_add_1.opEncoding              = "rm";
mnemonic_add_1.rex                     = null;
mnemonic_add_1.vex                     = null;
mnemonic_add_1.evex                    = null;
mnemonic_add_1.mode                    = 63;
mnemonic_add_1.extensions              = null;

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.mnemonic                = "movabs";
mnemonic_add_2.operandSize             = 32;
mnemonic_add_2.opcode                  = 161;
mnemonic_add_2.operandTemplates        = [[a.eax], [a.imm32]];
mnemonic_add_2.opreg                   = -1;
mnemonic_add_2.operandSizeDefault      = 32;
mnemonic_add_2.lock                    = false;
mnemonic_add_2.regInOp                 = false;
mnemonic_add_2.opcodeDirectionBit      = false;
mnemonic_add_2.useModrm                = true;
mnemonic_add_2.rep                     = false;
mnemonic_add_2.repne                   = false;
mnemonic_add_2.prefixes                = null;
mnemonic_add_2.opEncoding              = "rm";
mnemonic_add_2.rex                     = null;
mnemonic_add_2.vex                     = null;
mnemonic_add_2.evex                    = null;
mnemonic_add_2.mode                    = 63;
mnemonic_add_2.extensions              = null;

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.mnemonic                = "movabs";
mnemonic_add_3.operandSize             = 64;
mnemonic_add_3.opcode                  = 161;
mnemonic_add_3.operandTemplates        = [[a.rax], [a.imm64]];
mnemonic_add_3.opreg                   = -1;
mnemonic_add_3.operandSizeDefault      = 32;
mnemonic_add_3.lock                    = false;
mnemonic_add_3.regInOp                 = false;
mnemonic_add_3.opcodeDirectionBit      = false;
mnemonic_add_3.useModrm                = true;
mnemonic_add_3.rep                     = false;
mnemonic_add_3.repne                   = false;
mnemonic_add_3.prefixes                = null;
mnemonic_add_3.opEncoding              = "rm";
mnemonic_add_3.rex                     = null;
mnemonic_add_3.vex                     = null;
mnemonic_add_3.evex                    = null;
mnemonic_add_3.mode                    = 63;
mnemonic_add_3.extensions              = null;

const mnemonic_add_4 = new MnemonicX86;
mnemonic_add_4.mnemonic                = "movabs";
mnemonic_add_4.operandSize             = 8;
mnemonic_add_4.opcode                  = 162;
mnemonic_add_4.operandTemplates        = [[a.imm8], [a.al]];
mnemonic_add_4.opreg                   = -1;
mnemonic_add_4.operandSizeDefault      = 32;
mnemonic_add_4.lock                    = false;
mnemonic_add_4.regInOp                 = false;
mnemonic_add_4.opcodeDirectionBit      = false;
mnemonic_add_4.useModrm                = true;
mnemonic_add_4.rep                     = false;
mnemonic_add_4.repne                   = false;
mnemonic_add_4.prefixes                = null;
mnemonic_add_4.opEncoding              = "rm";
mnemonic_add_4.rex                     = null;
mnemonic_add_4.vex                     = null;
mnemonic_add_4.evex                    = null;
mnemonic_add_4.mode                    = 63;
mnemonic_add_4.extensions              = null;

const mnemonic_add_5 = new MnemonicX86;
mnemonic_add_5.mnemonic                = "movabs";
mnemonic_add_5.operandSize             = 16;
mnemonic_add_5.opcode                  = 163;
mnemonic_add_5.operandTemplates        = [[a.imm16], [a.ax]];
mnemonic_add_5.opreg                   = -1;
mnemonic_add_5.operandSizeDefault      = 32;
mnemonic_add_5.lock                    = false;
mnemonic_add_5.regInOp                 = false;
mnemonic_add_5.opcodeDirectionBit      = false;
mnemonic_add_5.useModrm                = true;
mnemonic_add_5.rep                     = false;
mnemonic_add_5.repne                   = false;
mnemonic_add_5.prefixes                = null;
mnemonic_add_5.opEncoding              = "rm";
mnemonic_add_5.rex                     = null;
mnemonic_add_5.vex                     = null;
mnemonic_add_5.evex                    = null;
mnemonic_add_5.mode                    = 63;
mnemonic_add_5.extensions              = null;

const mnemonic_add_6 = new MnemonicX86;
mnemonic_add_6.mnemonic                = "movabs";
mnemonic_add_6.operandSize             = 32;
mnemonic_add_6.opcode                  = 163;
mnemonic_add_6.operandTemplates        = [[a.imm32], [a.eax]];
mnemonic_add_6.opreg                   = -1;
mnemonic_add_6.operandSizeDefault      = 32;
mnemonic_add_6.lock                    = false;
mnemonic_add_6.regInOp                 = false;
mnemonic_add_6.opcodeDirectionBit      = false;
mnemonic_add_6.useModrm                = true;
mnemonic_add_6.rep                     = false;
mnemonic_add_6.repne                   = false;
mnemonic_add_6.prefixes                = null;
mnemonic_add_6.opEncoding              = "rm";
mnemonic_add_6.rex                     = null;
mnemonic_add_6.vex                     = null;
mnemonic_add_6.evex                    = null;
mnemonic_add_6.mode                    = 63;
mnemonic_add_6.extensions              = null;

const mnemonic_add_7 = new MnemonicX86;
mnemonic_add_7.mnemonic                = "movabs";
mnemonic_add_7.operandSize             = 64;
mnemonic_add_7.opcode                  = 163;
mnemonic_add_7.operandTemplates        = [[a.imm64], [a.rax]];
mnemonic_add_7.opreg                   = -1;
mnemonic_add_7.operandSizeDefault      = 32;
mnemonic_add_7.lock                    = false;
mnemonic_add_7.regInOp                 = false;
mnemonic_add_7.opcodeDirectionBit      = false;
mnemonic_add_7.useModrm                = true;
mnemonic_add_7.rep                     = false;
mnemonic_add_7.repne                   = false;
mnemonic_add_7.prefixes                = null;
mnemonic_add_7.opEncoding              = "rm";
mnemonic_add_7.rex                     = null;
mnemonic_add_7.vex                     = null;
mnemonic_add_7.evex                    = null;
mnemonic_add_7.mode                    = 63;
mnemonic_add_7.extensions              = null;

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
