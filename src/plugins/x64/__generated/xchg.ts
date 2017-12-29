import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.mnemonic                = "xchg";
mnemonic_add_0.operandSize             = 16;
mnemonic_add_0.opcode                  = 144;
mnemonic_add_0.operandTemplates        = [[a.ax], [a.r]];
mnemonic_add_0.opreg                   = -1;
mnemonic_add_0.operandSizeDefault      = 32;
mnemonic_add_0.lock                    = false;
mnemonic_add_0.regInOp                 = true;
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
mnemonic_add_1.mnemonic                = "xchg";
mnemonic_add_1.operandSize             = 16;
mnemonic_add_1.opcode                  = 144;
mnemonic_add_1.operandTemplates        = [[a.r], [a.ax]];
mnemonic_add_1.opreg                   = -1;
mnemonic_add_1.operandSizeDefault      = 32;
mnemonic_add_1.lock                    = false;
mnemonic_add_1.regInOp                 = true;
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
mnemonic_add_2.mnemonic                = "xchg";
mnemonic_add_2.operandSize             = 32;
mnemonic_add_2.opcode                  = 144;
mnemonic_add_2.operandTemplates        = [[a.eax], [a.r]];
mnemonic_add_2.opreg                   = -1;
mnemonic_add_2.operandSizeDefault      = 32;
mnemonic_add_2.lock                    = false;
mnemonic_add_2.regInOp                 = true;
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
mnemonic_add_3.mnemonic                = "xchg";
mnemonic_add_3.operandSize             = 64;
mnemonic_add_3.opcode                  = 144;
mnemonic_add_3.operandTemplates        = [[a.rax], [a.r]];
mnemonic_add_3.opreg                   = -1;
mnemonic_add_3.operandSizeDefault      = 32;
mnemonic_add_3.lock                    = false;
mnemonic_add_3.regInOp                 = true;
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
mnemonic_add_4.mnemonic                = "xchg";
mnemonic_add_4.operandSize             = 32;
mnemonic_add_4.opcode                  = 144;
mnemonic_add_4.operandTemplates        = [[a.r], [a.eax]];
mnemonic_add_4.opreg                   = -1;
mnemonic_add_4.operandSizeDefault      = 32;
mnemonic_add_4.lock                    = false;
mnemonic_add_4.regInOp                 = true;
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
mnemonic_add_5.mnemonic                = "xchg";
mnemonic_add_5.operandSize             = 64;
mnemonic_add_5.opcode                  = 144;
mnemonic_add_5.operandTemplates        = [[a.r], [a.rax]];
mnemonic_add_5.opreg                   = -1;
mnemonic_add_5.operandSizeDefault      = 32;
mnemonic_add_5.lock                    = false;
mnemonic_add_5.regInOp                 = true;
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
mnemonic_add_6.mnemonic                = "xchg";
mnemonic_add_6.operandSize             = 8;
mnemonic_add_6.opcode                  = 134;
mnemonic_add_6.operandTemplates        = [[a.r, a.m], [a.r, a.m]];
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
mnemonic_add_7.mnemonic                = "xchg";
mnemonic_add_7.operandSize             = 16;
mnemonic_add_7.opcode                  = 135;
mnemonic_add_7.operandTemplates        = [[a.r, a.m], [a.r, a.m]];
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

const mnemonic_add_8 = new MnemonicX86;
mnemonic_add_8.mnemonic                = "xchg";
mnemonic_add_8.operandSize             = 32;
mnemonic_add_8.opcode                  = 135;
mnemonic_add_8.operandTemplates        = [[a.r, a.m], [a.r, a.m]];
mnemonic_add_8.opreg                   = -1;
mnemonic_add_8.operandSizeDefault      = 32;
mnemonic_add_8.lock                    = false;
mnemonic_add_8.regInOp                 = false;
mnemonic_add_8.opcodeDirectionBit      = false;
mnemonic_add_8.useModrm                = true;
mnemonic_add_8.rep                     = false;
mnemonic_add_8.repne                   = false;
mnemonic_add_8.prefixes                = null;
mnemonic_add_8.opEncoding              = "rm";
mnemonic_add_8.rex                     = null;
mnemonic_add_8.vex                     = null;
mnemonic_add_8.evex                    = null;
mnemonic_add_8.mode                    = 63;
mnemonic_add_8.extensions              = null;

const mnemonic_add_9 = new MnemonicX86;
mnemonic_add_9.mnemonic                = "xchg";
mnemonic_add_9.operandSize             = 64;
mnemonic_add_9.opcode                  = 135;
mnemonic_add_9.operandTemplates        = [[a.r, a.m], [a.r, a.m]];
mnemonic_add_9.opreg                   = -1;
mnemonic_add_9.operandSizeDefault      = 32;
mnemonic_add_9.lock                    = false;
mnemonic_add_9.regInOp                 = false;
mnemonic_add_9.opcodeDirectionBit      = false;
mnemonic_add_9.useModrm                = true;
mnemonic_add_9.rep                     = false;
mnemonic_add_9.repne                   = false;
mnemonic_add_9.prefixes                = null;
mnemonic_add_9.opEncoding              = "rm";
mnemonic_add_9.rex                     = null;
mnemonic_add_9.vex                     = null;
mnemonic_add_9.evex                    = null;
mnemonic_add_9.mode                    = 63;
mnemonic_add_9.extensions              = null;

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
