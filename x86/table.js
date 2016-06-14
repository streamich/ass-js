"use strict";
var util_1 = require('../util');
var table_1 = require('../table');
var t = require('../table');
var operand_1 = require('./operand');
(function (MODE) {
    MODE[MODE["REAL"] = 1] = "REAL";
    MODE[MODE["PROT"] = 2] = "PROT";
    MODE[MODE["COMP"] = 4] = "COMP";
    MODE[MODE["LEG"] = 8] = "LEG";
    MODE[MODE["OLD"] = 12] = "OLD";
    MODE[MODE["X32"] = 16] = "X32";
    MODE[MODE["X64"] = 32] = "X64";
    MODE[MODE["X32_64"] = 48] = "X32_64";
    MODE[MODE["ALL"] = 63] = "ALL";
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
    EXT[EXT["BMI1"] = 9] = "BMI1";
    EXT[EXT["BMI2"] = 10] = "BMI2";
    EXT[EXT["SHA"] = 11] = "SHA";
    EXT[EXT["AES"] = 12] = "AES";
    EXT[EXT["INVPCID"] = 13] = "INVPCID";
    EXT[EXT["LZCNT"] = 14] = "LZCNT";
    EXT[EXT["MMX"] = 15] = "MMX";
    EXT[EXT["SSE"] = 16] = "SSE";
    EXT[EXT["SSE2"] = 17] = "SSE2";
    EXT[EXT["SSE3"] = 18] = "SSE3";
    EXT[EXT["SSSE3"] = 19] = "SSSE3";
    EXT[EXT["SSE4"] = 20] = "SSE4";
    EXT[EXT["SSE4_1"] = 21] = "SSE4_1";
    EXT[EXT["SSE4_2"] = 22] = "SSE4_2";
    EXT[EXT["ADX"] = 23] = "ADX";
    EXT[EXT["AVX"] = 24] = "AVX";
    EXT[EXT["AVX2"] = 25] = "AVX2";
    EXT[EXT["AVX3"] = 26] = "AVX3";
    EXT[EXT["AVX512F"] = 26] = "AVX512F";
    EXT[EXT["AVX512CDI"] = 27] = "AVX512CDI";
    EXT[EXT["AVX512PFI"] = 28] = "AVX512PFI";
    EXT[EXT["AVX512ERI"] = 29] = "AVX512ERI";
    EXT[EXT["AVX512VL"] = 30] = "AVX512VL";
    EXT[EXT["AVX512VLI"] = 31] = "AVX512VLI";
    EXT[EXT["AVX512BW"] = 32] = "AVX512BW";
    EXT[EXT["AVX512DQ"] = 33] = "AVX512DQ";
    EXT[EXT["AVX512IFMA52"] = 34] = "AVX512IFMA52";
    EXT[EXT["AVX512VBMI"] = 35] = "AVX512VBMI";
    EXT[EXT["FMA3"] = 36] = "FMA3";
    EXT[EXT["FMA4"] = 37] = "FMA4";
    EXT[EXT["CDI"] = 38] = "CDI";
})(exports.EXT || (exports.EXT = {}));
var EXT = exports.EXT;
exports.M = MODE;
exports.r = operand_1.Register;
exports.r8 = operand_1.Register8;
exports.r16 = operand_1.Register16;
exports.r32 = operand_1.Register32;
exports.r64 = operand_1.Register64;
exports.sreg = operand_1.RegisterSegment;
exports.mm = operand_1.RegisterMm;
exports.st = operand_1.RegisterSt;
exports.xmm = operand_1.RegisterXmm;
exports.ymm = operand_1.RegisterYmm;
exports.zmm = operand_1.RegisterZmm;
exports.bnd = operand_1.RegisterBounds;
exports.cr = operand_1.RegisterCr;
exports.dr = operand_1.RegisterDr;
exports.m = operand_1.Memory;
exports.m8 = operand_1.Memory8;
exports.m16 = operand_1.Memory16;
exports.m32 = operand_1.Memory32;
exports.m64 = operand_1.Memory64;
exports.m128 = operand_1.Memory128;
exports.m256 = operand_1.Memory256;
exports.m512 = operand_1.Memory512;
exports.rm8 = [operand_1.Register8, operand_1.Memory];
exports.rm16 = [operand_1.Register16, operand_1.Memory];
exports.rm32 = [operand_1.Register32, operand_1.Memory];
exports.rm64 = [operand_1.Register64, operand_1.Memory];
exports.defaults = util_1.extend({}, t.defaults, { ds: table_1.S.D, lock: false, or: -1, i: null, r: false, dbit: false, rex: null, mr: true, rep: false, repne: false,
    pfx: null, vex: null, evex: null, en: 'rm', mod: exports.M.ALL, ext: null });
exports.table = {
    cpuid: [{ o: 0x0FA2 }],
    int: [{},
        { o: 0xCC, ops: [3] },
        { o: 0xCD, ops: [table_1.immu8] },
    ],
};
