import {X64} from '../..';
import {r10, r11, r12, r13, r8, r9, rax, rbp, rbx, rcx, rdx, rsi, rsp} from "../../plugins/x86/operand/generator";

describe('mov', () => {
    it('movq rax, rax', function() {
        const _ = X64();
        _._('mov', [rax, rax], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0xc0]);
    });

    it('movq rbx, rax', function() {
        const _ = X64();
        _._('mov', [rbx, rax], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0xc3]);
    });

    it('movq [rax], rax', function() {
        const _ = X64();
        _._('mov', [rax.ref(), rax], 64);
        const bin = _.compile([]);
        // console.log(new Buffer(bin));
        expect(bin).toEqual([0x48, 0x89, 0x00]);
    });

    it('movq [rax], rax', function() {
        const _ = X64();
        _._('mov', [rax.ref(), rax], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0x00]);
    });

    it('movq [rcx], rbx', function() {
        const _ = X64();
        _._('mov', [rcx.ref(), rbx], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0x19]);
    });

    it('movq rdx, [rbx]', function() {
        const _ = X64();
        _._('mov', [rdx, rbx.ref()], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x13]);
    });

    it('movq r9, r8', function() {
        const _ = X64();
        _._('mov', [r9, r8], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x4D, 0x89, 0xC1]);
    });

    it('movq [r11], r10', function() {
        const _ = X64();
        _._('mov', [r11.ref(), r10], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x4D, 0x89, 0x13]);
    });

    it('movq r13, [r12]', function() {
        const _ = X64();
        _._('mov', [r13, r12.ref()], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x4D, 0x8B, 0x2C, 0x24]);
    });

    it('movq rcx, [rbx + 0x11]', function() {
        const _ = X64();
        _._('mov', [rcx, rbx.disp(0x11)], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x4B, 0x11]);
    });

    it('movq rsi, [rcx + rdx]', function() {
        const _ = X64();
        _._('mov', [rsi, rcx.ref().ind(rdx, 1)], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x34, 0x11]);
    });

    it('movq rcx, [rax + rbx * 4 + 0x1234]', function() {
        const _ = X64();
        _._('mov', [rcx, rax.ref().ind(rbx, 4).disp(0x1234)], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x8C, 0x98, 0x34, 0x12, 0x00, 0x00]);
    });

    it('movq rbp, [0x1]', function() {
        const _ = X64();
        _._('mov', [rbp, _._('mem', 0x1)], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x2C, 0x25, 0x01, 0x00, 0x00, 0x00]);
    });

    it('movq rsp, [0x1]', function() {
        const _ = X64();
        _._('mov', [rsp, _._('mem', 0x1)], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x24, 0x25, 0x01, 0x00, 0x00, 0x00]);
    });

    it('movq [rsp], rbx', function() {
        const _ = X64();
        _._('mov', [rsp.ref(), rbx], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0x1C, 0x24]);
    });

    it('movq rsp, rbx', function() {
        const _ = X64();
        _._('mov', [rsp, rbx], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0xDC]);
    });

    it('movq [rbp], rbx', function() {
        const _ = X64();
        _._('mov', [rbp.ref(), rbx], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0x5D, 0x00]);
    });

    it('movq [rsp + rbp * 2], rbx', function() {
        const _ = X64();
        _._('mov', [rsp.ref().ind(rbp, 2), rbx], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0x1C, 0x6C]);
    });

    it('movq rbx, [rbp + rax * 8]', function() {
        const _ = X64();
        _._('mov', [rbx, rbp.ref().ind(rax, 8)], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x5C, 0xC5, 0x00]);
    });

    it('movq rbp, [rdx * 2]', function() {
        const _ = X64();
        _._('mov', [rbp, rdx.ind(2)], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x8B, 0x2C, 0x55, 0x00, 0x00, 0x00, 0x00]);
    });

    it('movq [rbp * 8 + -0x123], rsp', function() {
        const _ = X64();
        _._('mov', [rbp.ind(8).disp(-0x123), rsp], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0x89, 0x24, 0xED, 0xDD, 0xFE, 0xFF, 0xFF]);
    });

    it('movq rax, 0x1', function() {
        const _ = X64();
        _._('mov', [rax, 0x1], 64);
        const bin = _.compile([]);
        expect(bin).toEqual([0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00]);
    });

    // 48 c7 c5 cd cc ff ff 	movq $-0x3333, %rbp
    it('movq rax, 0x1', function() {
        const _ = X64();
        _._('mov', [rbp, -0x3333], 64);
        const bin = _.compile([]);
        // console.log(new Buffer(bin));
        expect(bin).toEqual([0x48, 0xC7, 0xC5, 0xCD, 0xCC, 0xFF, 0xFF]);
    });

    // 4c 89 eb             	mov    %r13,%rbx
    it('movq rbx, r13', function() {
        const _ = X64();
        _._('mov', [rbx, r13], 64);
        const bin = _.compile([]);
        // console.log(new Buffer(bin));
        expect([0x4c, 0x89, 0xeb]).toEqual(bin);
    });
});
