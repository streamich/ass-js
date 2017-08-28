"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var table_1 = require("../../table");
var table_2 = require("../table");
exports.default = {
    // 0F 58 /r ADDPS xmm1, xmm2/m128 V/V SSE
    vaddps: [{ o: 0x58, en: table_2.rvm },
        // VEX.NDS.128.0F 58 /r VADDPS xmm1,xmm2, xmm3/m128 V/V AVX
        { vex: 'NDS.128.0F.WIG', ops: table_1.xmm_xmm_xmmm, ext: table_2.ext_avx },
        // VEX.NDS.256.0F 58 /r VADDPS ymm1, ymm2, ymm3/m256 V/V AVX
        { vex: 'NDS.256.0F.WIG', ops: table_1.ymm_ymm_ymmm, ext: table_2.ext_avx },
        // EVEX.NDS.128.0F.W0 58 /r VADDPS xmm1 {k1}{z}, xmm2, xmm3/m128/m32bcst V/V  AVX512VL AVX512F
        { evex: 'NDS.128.0F.W0', ops: table_1.xmm_xmm_xmmm, ext: [table_1.EXT.AVX512VL, table_1.EXT.AVX512F] },
        // EVEX.NDS.256.0F.W0 58 /r VADDPS ymm1 {k1}{z}, ymm2, ymm3/m256/m32bcst V/V  AVX512VL AVX512F
        { evex: 'NDS.256.0F.W0', ops: table_1.ymm_ymm_ymmm, ext: [table_1.EXT.AVX512VL, table_1.EXT.AVX512F] },
        // EVEX.NDS.512.0F.W0 58 /r VADDPS zmm1 {k1}{z}, zmm2, zmm3/m512/m32bcst {er} V/V AVX512F
        { evex: 'NDS.512.0F.W0', ops: table_1.zmm_zmm_zmmm, ext: [table_1.EXT.AVX512F] },
    ],
};
