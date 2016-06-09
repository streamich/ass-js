"use strict";
var util_1 = require('../util');
var table_1 = require('../table');
var t = require('../table');
var operand_1 = require('./operand');
(function (MODE) {
    MODE[MODE["REAL"] = 0] = "REAL";
    MODE[MODE["COMPAT"] = 1] = "COMPAT";
    MODE[MODE["X64"] = 2] = "X64";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
exports.M = MODE;
// Operands
exports.r = operand_1.Register;
exports.r8 = operand_1.Register8;
exports.r16 = operand_1.Register16;
exports.r32 = operand_1.Register32;
exports.r64 = operand_1.Register64;
exports.m = operand_1.Memory;
exports.m8 = operand_1.Memory8;
exports.m16 = operand_1.Memory16;
exports.m32 = operand_1.Memory32;
exports.m64 = operand_1.Memory64;
exports.rm8 = [operand_1.Register8, operand_1.Memory];
exports.rm16 = [operand_1.Register16, operand_1.Memory];
exports.rm32 = [operand_1.Register32, operand_1.Memory];
exports.rm64 = [operand_1.Register64, operand_1.Memory];
exports.imm = operand_1.Immediate;
exports.immu = operand_1.ImmediateUnsigned;
exports.imm8 = operand_1.Immediate8;
exports.immu8 = operand_1.ImmediateUnsigned8;
exports.imm16 = operand_1.Immediate16;
exports.immu16 = operand_1.ImmediateUnsigned16;
exports.imm32 = operand_1.Immediate32;
exports.immu32 = operand_1.ImmediateUnsigned32;
exports.imm64 = operand_1.Immediate64;
exports.immu64 = operand_1.ImmediateUnsigned64;
// x86 global defaults
exports.defaults = util_1.extend({}, t.defaults, { ds: table_1.S.D, lock: false, or: -1, r: false, dbit: false, rex: false, mr: true, rep: false, repne: false, pfx: null });
// Instruction are divided in groups, each group consists of list
// of possible instructions. The first object is NOT an instruction
// but defaults for the group.
exports.table = {
    int: [{ o: 0xCD, ops: [exports.immu8] }],
};
