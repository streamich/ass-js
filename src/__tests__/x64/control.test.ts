import {X64} from "../../index";
import {eax, r15, rax, rbx, rcx, rip} from "../../plugins/x86/operand/generator";

describe('Control Transfer', function() {
    describe('jmp', function () {
        it('jmp rel8', function () {
            const _ = X64();
            const lbl = _._('label', 'test');
            _._('jmp', lbl);
            const bin = _.compile([]);

            expect(bin).toEqual([0xEB, 0xFE]);
        });

        it('jmp rel32', function () {
            const _ = X64();
            const lbl = _.lbl('test');
            _._('jmp', lbl);
            _._('db', 0, 150);
            _.insert(lbl);
            let bin = _.compile([]) as number[];
            bin = bin.splice(0, 8);

            expect(bin).toEqual([0xE9, 0x96, 0, 0, 0, 0, 0, 0]);
        });

        it('jmp rax', function () { // ff e0                	jmpq   *%rax
            const _ = X64();
            _._('jmp', rax);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0xE0]);
        });

        it('jmp rbx', function () { // ff e3                	jmpq   *%rbx
            const _ = X64();
            _._('jmp', rbx);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0xE3]);
        });

        it('jmpq [rcx + rbx]', function () { // ff 24 19             	jmpq   *(%rcx,%rbx,1)
            const _ = X64();
            _._('jmp', rcx.ref().ind(rbx), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0x24, 0x19]);
        });

        it('jmpq 0x11223344', function () { // ff 24 25 44 33 22 11 	jmpq   *0x11223344
            const _ = X64();
            
            _._('jmp', _._('mem', 0x11223344), 64);
            const bin = _.compile([]);
            
            expect(bin).toEqual([0xFF, 0x24, 0x25, 0x44, 0x33, 0x22, 0x11]);
        });
    });

    describe('ljmp', function () {
        it('ljmpq 0x11223344', function () { // ff 2c 25 44 33 22 11 	ljmpq  *0x11223344
            const _ = X64();
            _._('ljmp', _._('mem', 0x11223344), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0x2C, 0x25, 0x44, 0x33, 0x22, 0x11]);
        });

        it('ljmp [rip + 0x11]', function () { // ff 2d 11 00 00 00    	ljmpq  *0x11(%rip)
            const _ = X64();
            _._('ljmp', rip.disp(0x11), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0x2D, 0x11, 0, 0, 0]);
        });

        it('ljmp [rax + 0x11]', function () { // ff 68 11             	ljmpq  *0x11(%rax)
            const _ = X64();
            _._('ljmp', rax.disp(0x11), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0x68, 0x11]);
        });

        it('ljmp [eax]', function () { // 67 ff 28             	ljmpq  *(%eax)
            const _ = X64();
            _._('ljmp', eax.ref(), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0x67, 0xFF, 0x28]);
        });

        it('ljmp [rax]', function () { // ff 28                	ljmpq  *(%rax)
            const _ = X64();
            _._('ljmp', rax.ref(), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0x28]);
        });

        it('ljmp [rax + rbx]', function () { // ff 2c 18             	ljmpq  *(%rax,%rbx,1)
            const _ = X64();
            _._('ljmp', rax.ref().ind(rbx), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0xFF, 0x2C, 0x18]);
        });

        it('ljmp [r15 + 0x11]', function () { // 41 ff 6f 11          	ljmpq  *0x11(%r15)
            const _ = X64();
            _._('ljmp', r15.disp(0x11), 64);
            const bin = _.compile([]);
            expect(bin).toEqual([0x41, 0xFF, 0x6F, 0x11]);
        });
    });

    describe('jcc', function () {
        describe('ja', function () {
            it('ja rel8', function () {
                const _ = X64();
                const lbl = _._('label', 'test');
                _._('ja', lbl);
                const bin = _.compile([]);
                expect(bin).toEqual([0x77, 0xFE]);
            });

            it('ja rel32', function () {
                const _ = X64();
                const lbl = _.lbl('test');
                
                _._('ja', lbl);
                _._('db', 0, 150);
                _.insert(lbl);
                
                let bin = _.compile([]) as number[];
                
                bin = bin.splice(0, 8);
                
                expect(bin).toEqual([0x0F, 0x87, 0x96, 0, 0, 0, 0, 0]);
            });
        });

        describe('jae', function () {
            it('jae rel8', function () {
                const _ = X64();
                const lbl = _._('label', 'test');
                
                _._('jae', lbl);
                
                const bin = _.compile([]);
                
                expect(bin).toEqual([0x73, 0xFE]);
            });

            it('jae rel32', function () {
                const _ = X64();
                const lbl = _.lbl('test');
                
                _._('jae', lbl);
                _._('db', 0, 150);
                _.insert(lbl);
                
                let bin = _.compile([]) as number[];
                
                bin = bin.splice(0, 8);
                
                expect(bin).toEqual([0x0F, 0x83, 0x96, 0, 0, 0, 0, 0]);
            });
        });
    });
    describe('int', function () {
        it('int 0x80', function() {
            const _ = X64();
            _._('int', 0x80);
            const bin = _.compile([]);
            expect(bin).toEqual([0xCD, 0x80]);
        });

        it('int 3', function() {
            const _ = X64();
            _._('int', 3);
            const bin = _.compile([]);
            expect(bin).toEqual([0xCC]);
        });
    });

    describe('loop', function () {
        it('loop rel8', function() { // e2 fe                	loop   4008c7 <loop>
            const _ = X64();
            const start = _._('label', 'start');
            _._('loop', start);
            const bin = _.compile([]);
            expect(bin).toEqual([0xE2, 0xFE]);
        });

        it('loope rel8', function() { // e1 fe                	loope  4008c7 <loop>
            const _ = X64();
            const start = _._('label', 'start');
            _._('loope', start);
            const bin = _.compile([]);
            expect(bin).toEqual([0xE1, 0xFE]);
        });

        it('loopne rel8', function() { // e0 fe                	loopne  4008c7 <loop>
            const _ = X64();
            const start = _._('label', 'start');
            _._('loopne', start);
            const bin = _.compile([]);
            expect(bin).toEqual([0xE0, 0xFE]);
        });
    });

    describe('call', function () {
        it('call rel32', function () { // In 64-bit mode
            const _ = X64();
            const start = _._('label', 'start');
            _._('call', start);
            const bin = _.compile([]);
            expect([0xE8, 0xFB, 0xFF, 0xFF, 0xFF]).toEqual(bin);
        });
    });
});
