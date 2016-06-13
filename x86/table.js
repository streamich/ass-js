"use strict";
var util_1 = require('../util');
var table_1 = require('../table');
var t = require('../table');
var operand_1 = require('./operand');
(function (MODE) {
    MODE[MODE["REAL"] = 1] = "REAL";
    MODE[MODE["PROT"] = 2] = "PROT";
    MODE[MODE["X32"] = 4] = "X32";
    MODE[MODE["X64"] = 8] = "X64";
    MODE[MODE["X32_64"] = 12] = "X32_64";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
(function (INS) {
    INS[INS["NONE"] = 0] = "NONE";
    INS[INS["MMX"] = 1] = "MMX";
    INS[INS["AES_NI"] = 2] = "AES_NI";
    INS[INS["CLMUL"] = 4] = "CLMUL";
    INS[INS["FMA3"] = 8] = "FMA3";
})(exports.INS || (exports.INS = {}));
var INS = exports.INS;
(function (EXT) {
    EXT[EXT["NONE"] = 0] = "NONE";
    EXT[EXT["x86_64"] = 1] = "x86_64";
    EXT[EXT["Intel_64"] = 2] = "Intel_64";
    EXT[EXT["MPX"] = 3] = "MPX";
    EXT[EXT["TXT"] = 4] = "TXT";
    EXT[EXT["TSX"] = 5] = "TSX";
    EXT[EXT["SGX"] = 6] = "SGX";
    EXT[EXT["VT_x"] = 7] = "VT_x";
    EXT[EXT["VT_d"] = 8] = "VT_d";
    EXT[EXT["SHA"] = 9] = "SHA";
    EXT[EXT["AES"] = 10] = "AES";
    EXT[EXT["SSE"] = 11] = "SSE";
    EXT[EXT["SSE2"] = 12] = "SSE2";
    EXT[EXT["SSE3"] = 13] = "SSE3";
    EXT[EXT["SSSE3"] = 14] = "SSSE3";
    EXT[EXT["SSE4"] = 15] = "SSE4";
    EXT[EXT["SSE4_1"] = 16] = "SSE4_1";
    EXT[EXT["SSE4_2"] = 17] = "SSE4_2";
    EXT[EXT["ADX"] = 18] = "ADX";
    EXT[EXT["AVX"] = 19] = "AVX";
    EXT[EXT["AVX2"] = 20] = "AVX2";
    EXT[EXT["AVX3"] = 21] = "AVX3";
    EXT[EXT["AVX512F"] = 21] = "AVX512F";
    EXT[EXT["AVX512CDI"] = 22] = "AVX512CDI";
    EXT[EXT["AVX512PFI"] = 23] = "AVX512PFI";
    EXT[EXT["AVX512ERI"] = 24] = "AVX512ERI";
    EXT[EXT["AVX512VL"] = 25] = "AVX512VL";
    EXT[EXT["AVX512VLI"] = 26] = "AVX512VLI";
    EXT[EXT["AVX512BW"] = 27] = "AVX512BW";
    EXT[EXT["AVX512DQ"] = 28] = "AVX512DQ";
    EXT[EXT["AVX512IFMA52"] = 29] = "AVX512IFMA52";
    EXT[EXT["AVX512VBMI"] = 30] = "AVX512VBMI";
    EXT[EXT["FMA3"] = 31] = "FMA3";
    EXT[EXT["FMA4"] = 32] = "FMA4";
    EXT[EXT["CDI"] = 33] = "CDI";
})(exports.EXT || (exports.EXT = {}));
var EXT = exports.EXT;
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
exports.defaults = util_1.extend({}, t.defaults, { ds: table_1.S.D, lock: false, or: -1, r: false, dbit: false, rex: null, mr: true, rep: false, repne: false,
    pfx: null, vex: null, evex: null, en: 'rm', mod: exports.M.X32_64, ext: null });
exports.table = {
    cpuid: [{ o: 0x0FA2 }],
    int: [{},
        { o: 0xCC, ops: [3] },
        { o: 0xCD, ops: [table_1.immu8] },
    ],
};
