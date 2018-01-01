import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.mnemonic                = "vcvtps2pd";
mnemonic_add_0.operandSize             = 128;
mnemonic_add_0.opcode                  = 90;
mnemonic_add_0.operandTemplates        = [[a.xmm], [a.xmm, a.m]];
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
mnemonic_add_0.vex                     = {"vvvv":"","L":0,"pp":0,"mmmmm":1,"W":1,"WIG":true};
mnemonic_add_0.evex                    = null;
mnemonic_add_0.mode                    = 63;
mnemonic_add_0.extensions              = [24];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.mnemonic                = "vcvtps2pd";
mnemonic_add_1.operandSize             = 256;
mnemonic_add_1.opcode                  = 90;
mnemonic_add_1.operandTemplates        = [[a.ymm], [a.ymm, a.m]];
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
mnemonic_add_1.vex                     = {"vvvv":"","L":1,"pp":0,"mmmmm":1,"W":1,"WIG":true};
mnemonic_add_1.evex                    = null;
mnemonic_add_1.mode                    = 63;
mnemonic_add_1.extensions              = [24];

const x86_mnemonic_variations_vcvtps2pd = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_vcvtps2pd.defaultOperandSize = 32;

export default x86_mnemonic_variations_vcvtps2pd;
