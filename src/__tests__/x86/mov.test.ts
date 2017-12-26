import {rax, rbx, rcx, rdx, rbp, rsp, rsi, rdi, r8, r9, r10, r11, r12, r13, r15,
    ebx, eax, esp, ebp, ecx,
    r10d, ax, bx, cx, dx, al, bl, cl, dl, ah, ch, dil, bpl, spl, r8b, r10b,
    rip} from '../../plugins/x86/operand/operand';
import * as o from '../../plugins/x86/operand/operand';
import {Code} from '../../plugins/x64/code';


describe('mov', () => {
    let _: Code;

    beforeEach(() => {
        _ = new Code;
    });

    afterEach(() => {
        expect(_.compile()).toMatchSnapshot();
    });

    describe('capture snapshots', () => {
        it('movq rax, rax', () => {
            _._('mov', [rax, rax], 64);
        });
        it('movq rbx, rax', () => {
            _._('mov', [rbx, rax], 64);
        });
        it('movq [rax], rax', () => {
            _._('mov', [rax.ref(), rax], 64);
        });
        it('movq [rcx], rbx', () => {
            _._('mov', [rcx.ref(), rbx], 64);
        });
        it('movq rdx, [rbx]', () => {
            _._('mov', [rdx, rbx.ref()], 64);
        });
        it('movq r9, r8', () => {
            _._('mov', [r9, r8], 64);
        });
        it('movq [r11], r10', () => {
            _._('mov', [r11.ref(), r10], 64);
        });
        it('movq r13, [r12]', () => {
            _._('mov', [r13, r12.ref()], 64);
        });
        it('movq rcx, [rbx + 0x11]', () => {
            _._('mov', [rcx, rbx.disp(0x11)], 64);
        });
        it('movq rsi, [rcx + rdx]', () => {
            _._('mov', [rsi, rcx.ref().ind(rdx, 1)], 64);
        });
        it('movq rcx, [rax + rbx * 4 + 0x1234]', () => {
            _._('mov', [rcx, rax.ref().ind(rbx, 4).disp(0x1234)], 64);
        });
        it('movq rbp, [0x1]', () => {
            _._('mov', [rbp, _.mem(0x1)], 64);
        });
        it('movq rsp, [0x1]', () => {
            _._('mov', [rsp, _.mem(0x1)], 64);
        });
        it('movq [rsp], rbx', () => {
            _._('mov', [rsp.ref(), rbx], 64);
        });
        it('movq rsp, rbx', () => {
            _._('mov', [rsp, rbx], 64);
        });
        it('movq [rbp], rbx', () => {
            _._('mov', [rbp.ref(), rbx], 64);
        });
        it('movq [rsp + rbp * 2], rbx', () => {
            _._('mov', [rsp.ref().ind(rbp, 2), rbx], 64);
        });
        it('movq rbx, [rbp + rax * 8]', () => {
            _._('mov', [rbx, rbp.ref().ind(rax, 8)], 64);
        });
        it('movq rbp, [rdx * 2]', () => {
            _._('mov', [rbp, rdx.ind(2)], 64);
        });
        it('movq [rbp * 8 + -0x123], rsp', () => {
            _._('mov', [rbp.ind(8).disp(-0x123), rsp], 64);
        });
        it('movq rax, 0x1', () => {
            _._('mov', [rax, 0x1], 64);
        });
        // 48 c7 c5 cd cc ff ff 	movq $-0x3333, %rbp
        it('movq rax, 0x1', () => {
            _._('mov', [rbp, -0x3333], 64);
        });
        // 4c 89 eb             	mov    %r13,%rbx
        it('movq rbx, r13', () => {
            _._('mov', [rbx, r13], 64);
        });
    });
});
