"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var o = require("../../operand");
var table_1 = require("../../../table");
var table_2 = require("../../table");
function tpl_shrd(op) {
    if (op === void 0) { op = 0x0FAC; }
    return [{},
        // 0F AC /r ib SHRD r/m16, r16, imm8 MRI Valid Valid Shift r/m16 to right imm8 places while shifting bits from r16 in from the left.
        { o: op, ops: [table_2.rm16, table_2.r16, table_1.imm8] },
        // 0F AD /r SHRD r/m16, r16, CL MRC Valid Valid Shift r/m16 to right CL places while shifting bits from r16 in from the left.
        { o: op + 1, ops: [table_2.rm16, table_2.r16, o.cl], s: table_1.S.W },
        // 0F AC /r ib SHRD r/m32, r32, imm8 MRI Valid Valid Shift r/m32 to right imm8 places while shifting bits from r32 in from the left.
        { o: op, ops: [table_2.rm32, table_2.r32, table_1.imm8] },
        // REX.W + 0F AC /r ib SHRD r/m64, r64, imm8 MRI Valid N.E. Shift r/m64 to right imm8 places while shifting bits from r64 in from the left.
        { o: op, ops: [table_2.rm64, table_2.r64, table_1.imm8] },
        // 0F AD /r SHRD r/m32, r32, CL MRC Valid Valid Shift r/m32 to right CL places while shifting bits from r32 in from the left.
        { o: op + 1, ops: [table_2.rm32, table_2.r32, o.cl], s: table_1.S.D },
        // REX.W + 0F AD /r SHRD r/m64, r64, CL MRC Valid N.E. Shift r/m64 to right CL places while
        { o: op + 1, ops: [table_2.rm64, table_2.r64, o.cl], s: table_1.S.Q },
    ];
}
exports.default = {
    // ## Shift and Rotate
    // SHRD Shift right double
    shrd: tpl_shrd(),
    // SHLD Shift left double
    shld: tpl_shrd(0x0FA4),
};
