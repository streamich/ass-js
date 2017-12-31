import {X64} from "../../index";
import {k, rax, xmm, ymm, zmm} from "../../plugins/x86/operand/generator";


const compile = _ => _.compile([]);

describe('AVX', function() {
    describe('addps', function() {
        it('addps xmm2, xmm1', function() { // 0f 58 d1             	addps  %xmm1,%xmm2
            const _ = X64();
            _._('addps', [xmm(2), xmm(1)]);
            const bin = compile(_);
            expect([0x0F, 0x58, 0xD1]).toEqual(bin);
        });

        it('vaddps xmm3, xmm2, xmm1', function() { // c5 e8 58 d9          	vaddps %xmm1,%xmm2,%xmm3
            const _ = X64();
            _._('vaddps', [xmm(3), xmm(2), xmm(1)]);
            const bin = compile(_);
            expect([0xc5, 0xe8, 0x58, 0xD9]).toEqual(bin);
        });

        it('vaddps xmm2, xmm1, [rax]', function() { // c5 f0 58 10          	vaddps (%rax),%xmm1,%xmm2
            const _ = X64();
            _._('vaddps', [xmm(2), xmm(1), rax.ref()]);
            const bin = compile(_);
            expect([0xc5, 0xF0, 0x58, 0x10]).toEqual(bin);
        });

        it('vaddps ymm12, ymm11, ymm10', function() { // c4 41 24 58 e2       	vaddps %ymm10,%ymm11,%ymm12
            const _ = X64();
            _._('vaddps', [ymm(12), ymm(11), ymm(10)]);
            const bin = compile(_);
            expect([0xc4, 0x41, 0x24, 0x58, 0xe2]).toEqual(bin);
        });

        it('vaddps zmm20, zmm20, zmm20', function() { // 62 a1 5c 40 58 e4    	vaddps %zmm20,%zmm20,%zmm20
            const _ = X64();
            _._('vaddps', [zmm(20), zmm(20), zmm(20)]);
            const bin = compile(_);
            expect([0x62, 0xA1, 0x5C, 0x40, 0x58, 0xE4]).toEqual(bin);
        });

        it('vaddps zmm22, zmm21, zmm20', function() { // 62 a1 54 40 58 f4    	vaddps %zmm20,%zmm21,%zmm22
            const _ = X64();
            _._('vaddps', [zmm(22), zmm(21), zmm(20)]);
            const bin = compile(_);
            expect([0x62, 0xA1, 0x54, 0x40, 0x58, 0xF4]).toEqual(bin);
        });
    });

    describe('divsd', function() {
        it('divsd xmm1, xmm2', function() { // f2 0f 5e ca          	divsd  %xmm2,%xmm1
            const _ = X64();
            _._('divsd', [xmm(1), xmm(2)]);
            const bin = compile(_);
            expect([0xF2, 0x0F, 0x5E, 0xCA]).toEqual(bin);
        });

        it('vdivsd xmm1, xmm2, xmm3', function() { // c5 eb 5e cb          	vdivsd %xmm3,%xmm2,%xmm1
            const _ = X64();
            _._('vdivsd', [xmm(1), xmm(2), xmm(3)]);
            const bin = compile(_);
            expect([0xC5, 0xEB, 0x5E, 0xCB]).toEqual(bin);
        });

        it('vdivsd xmm1 {k1} {z}, xmm2, xmm3', function() { // 62 f1 ef 89 5e cb    	vdivsd %xmm3,%xmm2,%xmm1{%k1}{z}
            const _ = X64();
            _._('vdivsd', [xmm(1), xmm(2), xmm(3)], {mask: k(1), z: 1});
            const bin = compile(_);
            expect([0x62, 0xF1, 0xEF, 0x89, 0x5E, 0xCB]).toEqual(bin);
        });

        it('vdivsd xmm13 {k7}, xmm14, xmm15', function() { // 62 51 8f 0f 5e ef    	vdivsd %xmm15,%xmm14,%xmm13{%k7}
            const _ = X64();
            _._('vdivsd', [xmm(13), xmm(14), xmm(15)], {mask: k(7)});
            const bin = compile(_);
            expect([0x62, 0x51, 0x8F, 0x0F, 0x5E, 0xEF]).toEqual(bin);
        });
    });
});
