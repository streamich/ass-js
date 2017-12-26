import {S, rel, rel8, rel16, rel32, imm, imm8, imm16, imm32, imm64, immu, immu8, immu16, immu32, immu64,
    M, r, r8, r16, r32, r64, mm, st,
    xmm, xmmm, xmm_xmmm, xmm_xmm_xmmm,
    ymm, ymmm, ymm_ymmm, ymm_ymm_ymmm,
    zmm_zmm_zmmm,
    rvm, ext_avx} from '../atoms';
import {EXT} from "../../x86/consts";


export default {
    // 0F 58 /r ADDPS xmm1, xmm2/m128 V/V SSE
    vaddps: [{o: 0x58, en: rvm},
        // VEX.NDS.128.0F 58 /r VADDPS xmm1,xmm2, xmm3/m128 V/V AVX
        {vex: 'NDS.128.0F.WIG', ops: xmm_xmm_xmmm, ext: ext_avx},
        // VEX.NDS.256.0F 58 /r VADDPS ymm1, ymm2, ymm3/m256 V/V AVX
        {vex: 'NDS.256.0F.WIG', ops: ymm_ymm_ymmm, ext: ext_avx},
        // EVEX.NDS.128.0F.W0 58 /r VADDPS xmm1 {k1}{z}, xmm2, xmm3/m128/m32bcst V/V  AVX512VL AVX512F
        {evex: 'NDS.128.0F.W0', ops: xmm_xmm_xmmm, ext: [EXT.AVX512VL,  EXT.AVX512F]},
        // EVEX.NDS.256.0F.W0 58 /r VADDPS ymm1 {k1}{z}, ymm2, ymm3/m256/m32bcst V/V  AVX512VL AVX512F
        {evex: 'NDS.256.0F.W0', ops: ymm_ymm_ymmm, ext: [EXT.AVX512VL,  EXT.AVX512F]},
        // EVEX.NDS.512.0F.W0 58 /r VADDPS zmm1 {k1}{z}, zmm2, zmm3/m512/m32bcst {er} V/V AVX512F
        {evex: 'NDS.512.0F.W0', ops: zmm_zmm_zmmm, ext: [EXT.AVX512F]},
    ],
};
