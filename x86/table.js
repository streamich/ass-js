"use strict";
var o = require('./operand');
exports.S = o.SIZE;
exports.M = o.MODE;
// Operands
exports.r = o.Register;
exports.r8 = o.Register8;
exports.r16 = o.Register16;
exports.r32 = o.Register32;
exports.r64 = o.Register64;
exports.m = o.Memory;
exports.m8 = o.Memory8;
exports.m16 = o.Memory16;
exports.m32 = o.Memory32;
exports.m64 = o.Memory64;
exports.rm8 = [o.Register8, o.Memory];
exports.rm16 = [o.Register16, o.Memory];
exports.rm32 = [o.Register32, o.Memory];
exports.rm64 = [o.Register64, o.Memory];
exports.imm = o.Immediate;
exports.immu = o.ImmediateUnsigned;
exports.imm8 = o.Immediate8;
exports.immu8 = o.ImmediateUnsigned8;
exports.imm16 = o.Immediate16;
exports.immu16 = o.ImmediateUnsigned16;
exports.imm32 = o.Immediate32;
exports.immu32 = o.ImmediateUnsigned32;
exports.imm64 = o.Immediate64;
exports.immu64 = o.ImmediateUnsigned64;
exports.rel = o.Relative;
exports.rel8 = o.Relative8;
exports.rel16 = o.Relative16;
exports.rel32 = o.Relative32;
// Global defaults
exports.defaults = { s: exports.S.NONE, ds: exports.S.D, lock: false, ops: null, or: -1, r: false, dbit: false, rex: false, mr: true, rep: false, repne: false, pfx: null };
// Instruction are divided in groups, each group consists of list
// of possible instructions. The first object is NOT an instruction
// but defaults for the group.
exports.table = {
    mov: [
        { mn: 'mov' },
        { o: 0x8B, mn: 'movq', ops: [exports.r64, exports.r64] },
        { o: 0xC7, ops: [exports.r64, exports.imm32] },
    ],
    inc: [
        { o: 0xFF, or: 0, lock: true },
        { o: 0xFE, ops: [exports.rm8] },
        { ops: [exports.rm32] },
        { ops: [exports.rm64] },
    ]
};
