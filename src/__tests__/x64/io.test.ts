import {X64} from "../../index";
import {al, ax, dx, eax} from "../../plugins/x86/operand/generator";


const compile = _ => _.compile([]);

describe('I/O', function () {
    describe('in', function () {
        it('in al, 5', function() { // e4 05                	in     $0x5,%al
            const _ = X64();
            _._('in', ['al', 5]);
            const bin = compile(_);
            expect(bin).toEqual([0xE4, 5]);
        });

        it('in ax, 5', function() { // 66 e5 05             	in     $0x5,%ax
            const _ = X64();
            _._('in', ['ax', 5]);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0xE5, 5]);
        });

        it('in eax, 5', function() { // e5 05                	in     $0x5,%eax
            const _ = X64();
            _._('in', ['eax', 5]);
            const bin = compile(_);
            expect(bin).toEqual([0xE5, 5]);
        });

        it('in al, dx', function() { // ec                   	in     (%dx),%al
            const _ = X64();
            _._('in', ['al', dx]);
            const bin = compile(_);
            expect(bin).toEqual([0xEC]);
        });

        it('in ax, dx', function() { // 66 ed                	in     (%dx),%ax
            const _ = X64();
            _._('in', [ax, 'dx']);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0xED]);
        });

        it('in eax, dx', function() { // ed                   	in     (%dx),%eax
            const _ = X64();
            _._('in', ['eax', dx]);
            const bin = compile(_);
            expect(bin).toEqual([0xED]);
        });
    });

    describe('out', function () {
        it('out 5, al', function() { // e6 05                	out    %al,$0x5
            const _ = X64();
            _._('out', [5, al]);
            const bin = compile(_);
            expect(bin).toEqual([0xE6, 5]);
        });

        it('out 5, ax', function() { // 66 e7 05             	out    %ax,$0x5
            const _ = X64();
            _._('out', [5, ax]);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0xE7, 5]);
        });

        it('out 5, eax', function() { // e7 05                	out    %eax,$0x5
            const _ = X64();
            _._('out', [5, eax]);
            const bin = compile(_);
            expect(bin).toEqual([0xE7, 5]);
        });

        it('out dx, al', function() { // ee                   	out    %al,(%dx)
            const _ = X64();
            _._('out', [dx, al], 8);
            const bin = compile(_);
            expect(bin).toEqual([0xEE]);
        });

        it('out dx, ax', function() { // 66 ef                	out    %ax,(%dx)
            const _ = X64();
            _._('out', [dx, ax]);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0xEF]);
        });

        it('out dx, eax', function() { // ef                   	out    %eax,(%dx)
            const _ = X64();
            _._('out', [dx, eax], 32);
            const bin = compile(_);
            expect(bin).toEqual([0xEF]);
        });
    });

    describe('ins', function () {
        it('insb', function() { // 6c                   	insb   (%dx),%es:(%rdi)
            const _ = X64();
            _._('ins', [], 8);
            const bin = compile(_);
            expect(bin).toEqual([0x6C]);
        });

        it('insw', function() { // 66 6d                	insw   (%dx),%es:(%rdi)
            const _ = X64();
            _._('ins', [], 16);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0x6D]);
        });

        it('insd', function() { // 6d                   	insl   (%dx),%es:(%rdi)
            const _ = X64();
            _._('ins', [], 32);
            const bin = compile(_);
            expect(bin).toEqual([0x6D]);
        });
    });

    describe('outs', function () {
        it('outsb', function() { // 6e                   	outsb  %ds:(%rsi),(%dx)
            const _ = X64();
            _._('outs', [], 8);
            const bin = compile(_);
            expect(bin).toEqual([0x6E]);
        });

        it('outsw', function() { // 66 6f                	outsw  %ds:(%rsi),(%dx)
            const _ = X64();
            _._('outs', [], 16);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0x6F]);
        });

        it('outsd', function() { // 6f                   	outsl  %ds:(%rsi),(%dx)
            const _ = X64();
            _._('outs', [], 32);
            const bin = compile(_);
            expect(bin).toEqual([0x6F]);
        });
    });
});
