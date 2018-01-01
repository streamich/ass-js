import {cl} from '../../x86/operand';
import {S, imm8, rm8, rm16, rm32, rm64} from '../atoms';

function tpl_sar(or = 7, o_r = 0xD0, o_imm = 0xC0) {
    return [{or: or},
        // D0 /7 SAR r/m8, 1 M1 Valid Valid Signed divide* r/m8 by 2, once.
        // REX + D0 /7 SAR r/m8**, 1 M1 Valid N.E. Signed divide* r/m8 by 2, once.
        {o: o_r, ops: [rm8, 1]},
        // D2 /7 SAR r/m8, CL MC Valid Valid Signed divide* r/m8 by 2, CL times.
        // REX + D2 /7 SAR r/m8**, CL MC Valid N.E. Signed divide* r/m8 by 2, CL times.
        {o: o_r + 2, ops: [rm8, cl], s: S.B},
        // C0 /7 ib SAR r/m8, imm8 MI Valid Valid Signed divide* r/m8 by 2, imm8 time.
        // REX + C0 /7 ib SAR r/m8**, imm8 MI Valid N.E. Signed divide* r/m8 by 2, imm8 times.
        {o: o_imm, ops: [rm8, imm8]},
        // D1 /7 SAR r/m16,1 M1 Valid Valid Signed divide* r/m16 by 2, once.
        {o: o_r + 1, ops: [rm16, 1]},
        // D3 /7 SAR r/m16, CL MC Valid Valid Signed divide* r/m16 by 2, CL times.
        {o: o_r + 3, ops: [rm16, cl], s: S.W},
        // C1 /7 ib SAR r/m16, imm8 MI Valid Valid Signed divide* r/m16 by 2, imm8 times.
        {o: o_imm + 1, ops: [rm16, imm8]},
        // D1 /7 SAR r/m32, 1 M1 Valid Valid Signed divide* r/m32 by 2, once.
        {o: o_r + 1, ops: [rm32, 1]},
        // REX.W + D1 /7 SAR r/m64, 1 M1 Valid N.E. Signed divide* r/m64 by 2, once.
        {o: o_r + 1, ops: [rm64, 1]},
        // D3 /7 SAR r/m32, CL MC Valid Valid Signed divide* r/m32 by 2, CL times.
        {o: o_r + 3, ops: [rm32, cl], s: S.D},
        // REX.W + D3 /7 SAR r/m64, CL MC Valid N.E. Signed divide* r/m64 by 2, CL times.
        {o: o_r + 3, ops: [rm64, cl], s: S.Q},
        // C1 /7 ib SAR r/m32, imm8 MI Valid Valid Signed divide* r/m32 by 2, imm8 times.
        {o: o_imm + 1, ops: [rm32, imm8]},
        // REX.W + C1 /7 ib SAR r/m64, imm8 MI Valid N.E. Signed divide* r/m64 by 2, imm8 times
        {o: o_imm + 1, ops: [rm64, imm8]},
    ];
}

export default {
    // ## Shift and Rotate
    // SAR Shift arithmetic right
    sar: tpl_sar(),
    // SHR Shift logical right
    shr: tpl_sar(5),
    // SAL/SHL Shift arithmetic left/Shift logical left
    shl: tpl_sar(4, 0xD0, 0xC0),
    sal: ['shl'],
    // ROR Rotate right
    ror: tpl_sar(1),
    // ROL Rotate left
    rol: tpl_sar(0),
    // RCR Rotate through carry right
    rcr: tpl_sar(3),
    // RCL Rotate through carry left
    rcl: tpl_sar(2),
};
