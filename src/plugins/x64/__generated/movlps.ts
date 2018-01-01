import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.mnemonic                = "movlps";
mnemonic_add_0.operandSize             = 128;
mnemonic_add_0.opcode                  = 18;
mnemonic_add_0.operandTemplates        = [[a.xmm], [a.m]];
mnemonic_add_0.opreg                   = -1;
mnemonic_add_0.operandSizeDefault      = 32;
mnemonic_add_0.lock                    = false;
mnemonic_add_0.regInOp                 = false;
mnemonic_add_0.opcodeDirectionBit      = true;
mnemonic_add_0.useModrm                = true;
mnemonic_add_0.rep                     = false;
mnemonic_add_0.repne                   = false;
mnemonic_add_0.prefixes                = [15];
mnemonic_add_0.opEncoding              = "rm";
mnemonic_add_0.rex                     = null;
mnemonic_add_0.vex                     = null;
mnemonic_add_0.evex                    = null;
mnemonic_add_0.mode                    = 63;
mnemonic_add_0.extensions              = [16];

const mnemonic_add_1 = new MnemonicX86;
mnemonic_add_1.mnemonic                = "movlps";
mnemonic_add_1.operandSize             = 128;
mnemonic_add_1.opcode                  = 19;
mnemonic_add_1.operandTemplates        = [[a.m], [a.xmm]];
mnemonic_add_1.opreg                   = -1;
mnemonic_add_1.operandSizeDefault      = 32;
mnemonic_add_1.lock                    = false;
mnemonic_add_1.regInOp                 = false;
mnemonic_add_1.opcodeDirectionBit      = true;
mnemonic_add_1.useModrm                = true;
mnemonic_add_1.rep                     = false;
mnemonic_add_1.repne                   = false;
mnemonic_add_1.prefixes                = [15];
mnemonic_add_1.opEncoding              = "mr";
mnemonic_add_1.rex                     = null;
mnemonic_add_1.vex                     = null;
mnemonic_add_1.evex                    = null;
mnemonic_add_1.mode                    = 63;
mnemonic_add_1.extensions              = [16];

const x86_mnemonic_variations_movlps = new MnemonicVariationsX86([
    mnemonic_add_0,
    mnemonic_add_1,
]);
x86_mnemonic_variations_movlps.defaultOperandSize = 32;

export default x86_mnemonic_variations_movlps;
