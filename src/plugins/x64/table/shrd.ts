import * as o from '../../x86/operand';
import {S, imm8, r8, r16, r32, r64, rm8, rm16, rm32, rm64} from '../atoms';


function tpl_shrd(op = 0x0FAC) {
    return [{},
        // 0F AC /r ib SHRD r/m16, r16, imm8 MRI Valid Valid Shift r/m16 to right imm8 places while shifting bits from r16 in from the left.
        {o: op, ops: [rm16, r16, imm8]},
        // 0F AD /r SHRD r/m16, r16, CL MRC Valid Valid Shift r/m16 to right CL places while shifting bits from r16 in from the left.
        {o: op + 1, ops: [rm16, r16, o.cl], s: S.W},
        // 0F AC /r ib SHRD r/m32, r32, imm8 MRI Valid Valid Shift r/m32 to right imm8 places while shifting bits from r32 in from the left.
        {o: op, ops: [rm32, r32, imm8]},
        // REX.W + 0F AC /r ib SHRD r/m64, r64, imm8 MRI Valid N.E. Shift r/m64 to right imm8 places while shifting bits from r64 in from the left.
        {o: op, ops: [rm64, r64, imm8]},
        // 0F AD /r SHRD r/m32, r32, CL MRC Valid Valid Shift r/m32 to right CL places while shifting bits from r32 in from the left.
        {o: op + 1, ops: [rm32, r32, o.cl], s: S.D},
        // REX.W + 0F AD /r SHRD r/m64, r64, CL MRC Valid N.E. Shift r/m64 to right CL places while
        {o: op + 1, ops: [rm64, r64, o.cl], s: S.Q},
    ];
}


export default {
    // ## Shift and Rotate
    // SHRD Shift right double
    shrd: tpl_shrd(),
    // SHLD Shift left double
    shld: tpl_shrd(0x0FA4),
};
