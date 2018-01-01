import {X64} from "../../index";
import {rax, st} from "../../plugins/x86/operand/generator";


const compile = _ => _.compile([]);

describe('x64', function() {
    describe('x87', function() {
        it('fadd [rax]', function() {
            const _ = X64();

            // d8 00 -> fadds  (%rax)
            _._('fadd', rax.ref(), 32);
            const bin = compile(_);

            expect([0xD8, 0x00]).toEqual(bin);
        });

        it('fadd %st(0), %st(0)', function() {
            const _ = X64();

            // d8 c0 -> fadd   %st(0),%st
            _._('fadd', [_._('st')(0), st(0)]);

            const bin = compile(_);
            expect([0xD8, 0xC0]).toEqual(bin);
        });

        it('fadd %st(0), %st(1)', function() {
            const _ = X64();

            // d8 c1 -> fadd   %st(1),%st
            _._('fadd', [st(0), st(1)]);

            const bin = compile(_);
            expect([0xD8, 0xC1]).toEqual(bin);
        });
    });
});
