import {X64} from "../../index";
import {bx, ebx, rbx} from "../../plugins/x86/operand/generator";


const compile = _ => _.compile([]);

describe('X64', function () {
    describe('Random Number', function () {
        it('rdrand bx', function() { // 66 0f c7 f3          	rdrand %bx
            const _ = X64();
            _._('rdrand', bx);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0x0F, 0xC7, 0xF3]);
        });

        it('rdrand ebx', function() { // 0f c7 f3             	rdrand %ebx
            const _ = X64();
            _._('rdrand', 'ebx');
            const bin = compile(_);
            expect(bin).toEqual([0x0F, 0xC7, 0xF3]);
        });

        it('rdrand rbx', function() { // 48 0f c7 f3          	rdrand %rbx
            const _ = X64();
            _._('rdrand', rbx);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x0F, 0xC7, 0xF3]);
        });

        it('rdseed bx', function() { // 66 0f c7 fb          	rdseed %bx
            const _ = X64();
            _._('rdseed', bx);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0x0F, 0xC7, 0xFB]);
        });

        it('rdseed ebx', function() { // 0f c7 fb             	rdseed %ebx
            const _ = X64();
            _._('rdseed', ebx);
            const bin = compile(_);
            expect(bin).toEqual([0x0F, 0xC7, 0xFB]);
        });

        it('rdseed rbx', function() { // 48 0f c7 fb          	rdseed %rbx
            const _ = X64();
            _._('rdseed', rbx);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x0F, 0xC7, 0xFB]);
        });
    });
});