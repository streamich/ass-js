"use strict";
var util_1 = require('../util');
var table_1 = require('../table');
var t = require('../table');
var operand_1 = require('./operand');
(function (MODE) {
    MODE[MODE["X32"] = 1] = "X32";
    MODE[MODE["X64"] = 1] = "X64";
    MODE[MODE["BOTH"] = 1] = "BOTH";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
(function (CPUID) {
    CPUID[CPUID["NONE"] = 0] = "NONE";
    CPUID[CPUID["MMX"] = 1] = "MMX";
    CPUID[CPUID["SSE2"] = 2] = "SSE2";
    CPUID[CPUID["AVX"] = 4] = "AVX";
    CPUID[CPUID["AVX2"] = 8] = "AVX2";
})(exports.CPUID || (exports.CPUID = {}));
var CPUID = exports.CPUID;
exports.M = MODE;
exports.r = operand_1.Register;
exports.r8 = operand_1.Register8;
exports.r16 = operand_1.Register16;
exports.r32 = operand_1.Register32;
exports.r64 = operand_1.Register64;
exports.sreg = operand_1.RegisterSegment;
exports.mmx = operand_1.RegisterMmx;
exports.xmm = operand_1.RegisterXmm;
exports.ymm = operand_1.RegisterYmm;
exports.zmm = operand_1.RegisterZmm;
exports.m = operand_1.Memory;
exports.m8 = operand_1.Memory8;
exports.m16 = operand_1.Memory16;
exports.m32 = operand_1.Memory32;
exports.m64 = operand_1.Memory64;
exports.rm8 = [operand_1.Register8, operand_1.Memory];
exports.rm16 = [operand_1.Register16, operand_1.Memory];
exports.rm32 = [operand_1.Register32, operand_1.Memory];
exports.rm64 = [operand_1.Register64, operand_1.Memory];
exports.defaults = util_1.extend({}, t.defaults, { ds: table_1.S.D, lock: false, or: -1, r: false, dbit: false, rex: false, mr: true, rep: false, repne: false,
    pfx: null, vex: null, en: 'rm', mod: MODE.BOTH, cpu: CPUID.NONE });
exports.table = {
    cpuid: [{ o: 0x0FA2 }],
    int: [{},
        { o: 0xCC, ops: [3] },
        { o: 0xCD, ops: [table_1.immu8] },
    ],
};
