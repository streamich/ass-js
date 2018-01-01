import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.mnemonic                = "vextractps";
mnemonic_add_0.operandSize             = 64;
mnemonic_add_0.opcode                  = 23;
mnemonic_add_0.operandTemplates        = [[a.r, a.m], [a.xmm], [a.imm8]];
mnemonic_add_0.opreg                   = -1;
mnemonic_add_0.operandSizeDefault      = 32;
mnemonic_add_0.lock                    = false;
mnemonic_add_0.regInOp                 = false;
mnemonic_add_0.opcodeDirectionBit      = false;
mnemonic_add_0.useModrm                = true;
mnemonic_add_0.rep                     = false;
mnemonic_add_0.repne                   = false;
mnemonic_add_0.prefixes                = null;
mnemonic_add_0.opEncoding              = "mr";
mnemonic_add_0.rex                     = null;
mnemonic_add_0.vex                     = {"vvvv":"","L":0,"pp":1,"mmmmm":3,"W":1,"WIG":true};
mnemonic_add_0.evex                    = null;
mnemonic_add_0.mode                    = 63;
mnemonic_add_0.extensions              = [24];

const x86_mnemonic_variations_vextractps = new MnemonicVariationsX86([
    mnemonic_add_0,
]);
x86_mnemonic_variations_vextractps.defaultOperandSize = 32;

export default x86_mnemonic_variations_vextractps;
