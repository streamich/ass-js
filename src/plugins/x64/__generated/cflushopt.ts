import MnemonicX86 from '../../x86/MnemonicX86';
import MnemonicVariationsX86 from '../../x86/MnemonicVariationsX86';
import * as a from '../atoms';

const mnemonic_add_0 = new MnemonicX86;
mnemonic_add_0.mnemonic                = "cflushopt";
mnemonic_add_0.operandSize             = 0;
mnemonic_add_0.opcode                  = 4014;
mnemonic_add_0.operandTemplates        = [[a.m]];
mnemonic_add_0.opreg                   = 7;
mnemonic_add_0.operandSizeDefault      = 32;
mnemonic_add_0.lock                    = false;
mnemonic_add_0.regInOp                 = false;
mnemonic_add_0.opcodeDirectionBit      = false;
mnemonic_add_0.useModrm                = true;
mnemonic_add_0.rep                     = false;
mnemonic_add_0.repne                   = false;
mnemonic_add_0.prefixes                = [102];
mnemonic_add_0.opEncoding              = "rm";
mnemonic_add_0.rex                     = null;
mnemonic_add_0.vex                     = null;
mnemonic_add_0.evex                    = null;
mnemonic_add_0.mode                    = 63;
mnemonic_add_0.extensions              = null;

const x86_mnemonic_variations_cflushopt = new MnemonicVariationsX86([
    mnemonic_add_0,
]);
x86_mnemonic_variations_cflushopt.defaultOperandSize = 32;

export default x86_mnemonic_variations_cflushopt;
