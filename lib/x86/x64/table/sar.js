"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var o = require("../../operand");
var table_1 = require("../../../table");
var table_2 = require("../../table");
function tpl_sar(or, o_r, o_imm) {
    if (or === void 0) { or = 7; }
    if (o_r === void 0) { o_r = 0xD0; }
    if (o_imm === void 0) { o_imm = 0xC0; }
    return [{ or: or },
        // D0 /7 SAR r/m8, 1 M1 Valid Valid Signed divide* r/m8 by 2, once.
        // REX + D0 /7 SAR r/m8**, 1 M1 Valid N.E. Signed divide* r/m8 by 2, once.
        { o: o_r, ops: [table_2.rm8, 1] },
        // D2 /7 SAR r/m8, CL MC Valid Valid Signed divide* r/m8 by 2, CL times.
        // REX + D2 /7 SAR r/m8**, CL MC Valid N.E. Signed divide* r/m8 by 2, CL times.
        { o: o_r + 2, ops: [table_2.rm8, o.cl], s: table_1.S.B },
        // C0 /7 ib SAR r/m8, imm8 MI Valid Valid Signed divide* r/m8 by 2, imm8 time.
        // REX + C0 /7 ib SAR r/m8**, imm8 MI Valid N.E. Signed divide* r/m8 by 2, imm8 times.
        { o: o_imm, ops: [table_2.rm8, table_1.imm8] },
        // D1 /7 SAR r/m16,1 M1 Valid Valid Signed divide* r/m16 by 2, once.
        { o: o_r + 1, ops: [table_2.rm16, 1] },
        // D3 /7 SAR r/m16, CL MC Valid Valid Signed divide* r/m16 by 2, CL times.
        { o: o_r + 3, ops: [table_2.rm16, o.cl], s: table_1.S.W },
        // C1 /7 ib SAR r/m16, imm8 MI Valid Valid Signed divide* r/m16 by 2, imm8 times.
        { o: o_imm + 1, ops: [table_2.rm16, table_1.imm8] },
        // D1 /7 SAR r/m32, 1 M1 Valid Valid Signed divide* r/m32 by 2, once.
        { o: o_r + 1, ops: [table_2.rm32, 1] },
        // REX.W + D1 /7 SAR r/m64, 1 M1 Valid N.E. Signed divide* r/m64 by 2, once.
        { o: o_r + 1, ops: [table_2.rm64, 1] },
        // D3 /7 SAR r/m32, CL MC Valid Valid Signed divide* r/m32 by 2, CL times.
        { o: o_r + 3, ops: [table_2.rm32, o.cl], s: table_1.S.D },
        // REX.W + D3 /7 SAR r/m64, CL MC Valid N.E. Signed divide* r/m64 by 2, CL times.
        { o: o_r + 3, ops: [table_2.rm64, o.cl], s: table_1.S.Q },
        // C1 /7 ib SAR r/m32, imm8 MI Valid Valid Signed divide* r/m32 by 2, imm8 times.
        { o: o_imm + 1, ops: [table_2.rm32, table_1.imm8] },
        // REX.W + C1 /7 ib SAR r/m64, imm8 MI Valid N.E. Signed divide* r/m64 by 2, imm8 times
        { o: o_imm + 1, ops: [table_2.rm64, table_1.imm8] },
    ];
}
exports.default = {
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
