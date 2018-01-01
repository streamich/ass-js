import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.mnemonic                = "vmovsd";
mnemonic_add_0.operandSize             = 128;
mnemonic_add_0.opcode                  = 16;
mnemonic_add_0.operandTemplates        = [[a.xmm], [a.xmm], [a.xmm]];
mnemonic_add_0.opreg                   = -1;
mnemonic_add_0.operandSizeDefault      = 32;
mnemonic_add_0.lock                    = false;
mnemonic_add_0.regInOp                 = false;
mnemonic_add_0.opcodeDirectionBit      = false;
mnemonic_add_0.useModrm                = true;
mnemonic_add_0.rep                     = false;
mnemonic_add_0.repne                   = false;
mnemonic_add_0.prefixes                = null;
mnemonic_add_0.opEncoding              = "rvm";
mnemonic_add_0.rex                     = null;
mnemonic_add_0.vex                     = {"vvvv":"NDS","L":0,"pp":3,"mmmmm":1,"W":1,"WIG":true};
mnemonic_add_0.evex                    = null;
mnemonic_add_0.mode                    = 63;
mnemonic_add_0.extensions              = [24];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.mnemonic                = "vmovsd";
mnemonic_add_1.operandSize             = 128;
mnemonic_add_1.opcode                  = 16;
mnemonic_add_1.operandTemplates        = [[a.xmm], [a.m]];
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
mnemonic_add_1.vex                     = {"vvvv":"","L":0,"pp":3,"mmmmm":1,"W":1,"WIG":true};
mnemonic_add_1.evex                    = null;
mnemonic_add_1.mode                    = 63;
mnemonic_add_1.extensions              = [24];

const mnemonic_add_2 = new MnemonicX86;
mnemonic_add_2.mnemonic                = "vmovsd";
mnemonic_add_2.operandSize             = 128;
mnemonic_add_2.opcode                  = 17;
mnemonic_add_2.operandTemplates        = [[a.xmm], [a.xmm], [a.xmm]];
mnemonic_add_2.opreg                   = -1;
mnemonic_add_2.operandSizeDefault      = 32;
mnemonic_add_2.lock                    = false;
mnemonic_add_2.regInOp                 = false;
mnemonic_add_2.opcodeDirectionBit      = false;
mnemonic_add_2.useModrm                = true;
mnemonic_add_2.rep                     = false;
mnemonic_add_2.repne                   = false;
mnemonic_add_2.prefixes                = null;
mnemonic_add_2.opEncoding              = "mvr";
mnemonic_add_2.rex                     = null;
mnemonic_add_2.vex                     = {"vvvv":"NDS","L":0,"pp":3,"mmmmm":1,"W":1,"WIG":true};
mnemonic_add_2.evex                    = null;
mnemonic_add_2.mode                    = 63;
mnemonic_add_2.extensions              = [24];

const mnemonic_add_3 = new MnemonicX86;
mnemonic_add_3.mnemonic                = "vmovsd";
mnemonic_add_3.operandSize             = 128;
mnemonic_add_3.opcode                  = 17;
mnemonic_add_3.operandTemplates        = [[a.m], [a.xmm]];
mnemonic_add_3.opreg                   = -1;
mnemonic_add_3.operandSizeDefault      = 32;
mnemonic_add_3.lock                    = false;
mnemonic_add_3.regInOp                 = false;
mnemonic_add_3.opcodeDirectionBit      = false;
mnemonic_add_3.useModrm                = true;
mnemonic_add_3.rep                     = false;
mnemonic_add_3.repne                   = false;
mnemonic_add_3.prefixes                = null;
mnemonic_add_3.opEncoding              = "mr";
mnemonic_add_3.rex                     = null;
mnemonic_add_3.vex                     = {"vvvv":"","L":0,"pp":3,"mmmmm":1,"W":1,"WIG":true};
mnemonic_add_3.evex                    = null;
mnemonic_add_3.mode                    = 63;
mnemonic_add_3.extensions              = [24];

const x86_mnemonic_variations_vmovsd = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
    mnemonic_add_2,
    mnemonic_add_3,
]);
x86_mnemonic_variations_vmovsd.defaultOperandSize = 32;

export default x86_mnemonic_variations_vmovsd;
