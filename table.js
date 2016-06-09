"use strict";
var operand_1 = require('./operand');
exports.S = operand_1.SIZE;
// Operands
exports.r = operand_1.Register;
exports.m = operand_1.Memory;
exports.rel = operand_1.Relative;
exports.rel8 = operand_1.Relative8;
exports.rel16 = operand_1.Relative16;
exports.rel32 = operand_1.Relative32;
// Global defaults
exports.defaults = { o: 0x00, mn: '', s: exports.S.NONE, ops: null };
