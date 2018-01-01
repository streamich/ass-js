import {X64} from "../../index";
import {ax, eax, r8, r9, rax, rbp, rbx, rcx, rip, rsp} from "../../plugins/x86/operand/generator";


const compile = _ => _.compile([]);

describe('X64', function() {
    describe('lea', function() {
        it('lea rax, [rax]', function() { // 400657:	48 8d 00             	lea    (%rax),%rax
            const _ = X64();
            _._('lea', [rax, _._('rax').ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x8D, 0x00]);
        });
        
        it('lea rbx, [rbx]', function() { // 40065a:	48 8d 1b             	lea    (%rbx),%rbx
            const _ = X64();
            _._('lea', [rbx, rbx.ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x8D, 0x1B]);
        });
        
        it('lea eax, [rax]', function() { // 40065d:	8d 00                	lea    (%rax),%eax
            const _ = X64();
            _._('lea', [eax, rax.ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x8D, 0x00]);
        });

        it('lea ax, [rax]', function() { // 40065f:	66 8d 00             	lea    (%rax),%ax
            const _ = X64();
            _._('lea', [ax, rax.ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x66, 0x8D, 0x00]);
        });

        it('lea rax, [rip]', function() { // 400662:	48 8d 05 00 00 00 00 	lea    0x0(%rip),%rax        # 400669 <lea+0x12>
            const _ = X64();
            _._('lea', [rax, _._('rip').ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x8D, 0x05, 0x00, 0x00, 0x00, 0x00]);
        });

        it('lea rax, [rbx]', function() { // 400669:	48 8d 03             	lea    (%rbx),%rax
            const _ = X64();
            _._('lea', [rax, rbx.ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x8D, 0x03]);
        });

        it('lea rax, [rsp]', function() { // 40066c:	48 8d 04 24          	lea    (%rsp),%rax
            const _ = X64();
            _._('lea', [rax, rsp.ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x8D, 0x04, 0x24]);
        });

        it('lea rax, [rbp]', function() { // 400670:	48 8d 45 00          	lea    0x0(%rbp),%rax
            const _ = X64();
            _._('lea', [rax, rbp.ref()]);
            const bin = compile(_);
            expect(bin).toEqual([0x48, 0x8D, 0x45, 0x00]);
        });

        it('lea r8, [rip + 0x11]', function() { // 400674:	4c 8d 05 11 00 00 00 	lea    0x11(%rip),%r8        # 40068c <lea+0x35>
            const _ = X64();
            _._('lea', [r8, rip.disp(0x11)]);
            const bin = compile(_);
            // console.log(_.toString());
            expect(bin).toEqual([0x4C, 0x8D, 0x05, 0x11, 0, 0, 0]);
        });

        it('lea r9, [rip + 0x11223344]', function() { // 40067b:	4c 8d 0d 44 33 22 11 	lea    0x11223344(%rip),%r9
            const _ = X64();
            _._('lea', [r9, rip.disp(0x11223344)]);
            const bin = compile(_);
            expect(bin).toEqual([0x4C, 0x8D, 0x0D, 0x44, 0x33, 0x22, 0x11]);
        });

        it('lea r9, [rbx + rcx + 0x11]', function() { // 400682:	4c 8d 4c 0b 11       	lea    0x11(%rbx,%rcx,1),%r9
            const _ = X64();
            _._('lea', [r9, rbx.disp(0x11).ind(rcx)]);
            const bin = compile(_);
            expect(bin).toEqual([0x4C, 0x8D, 0x4C, 0x0B, 0x11]);
        });

        it('lea r9, [0x43]', function() { // 400687:	4c 8d 0c 25 43 00 00 00 	lea    0x43,%r9
            const _ = X64();
            _._('lea', [r9, _._('mem', 0x43)]);
            const bin = compile(_);
            expect(bin).toEqual([0x4C, 0x8D, 0x0C, 0x25, 0x43, 0, 0, 0]);
        });
    });
});
