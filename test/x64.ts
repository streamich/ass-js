import {expect} from 'chai';
import {rax, rbx, rcx, rdx, rbp, rsp, rsi, rdi, eax, r8, r9, r10, r11, r12, r13, r15,
        r10d, ax, bx, cx, dx, al, bl,
        rip} from '../x86/operand';
import {Code} from '../x64/code';


describe('x64', function() {

    function code64(): Code {
        return Code.create();
    }

    function compile(code: Code) {
        return code.compile();
    }

    describe('toString()', function() {
        it('incq rbx', function() {
            var _ = code64();
            _.incq(rbx);
            var str = _.toString(false);
            expect(str).to.equal('    incq    rbx');
        });
    });

    describe('data', function() {
        describe('db', function() {
            it('octets', function() {
                var _ = code64();
                var data = [1, 2, 3];
                _.db(data);
                expect(compile(_)).to.eql(data);
            });
            it('buffer', function() {
                var _ = code64();
                var data = [1, 2, 3];
                _.db(new Buffer(data));
                expect(compile(_)).to.eql(data);
            });
            it('string', function() {
                var _ = code64();
                var str = 'Hello World!\n';
                _.db(str);
                var bin = compile(_);
                expect(bin.length).to.be.equal(str.length);
                expect(bin).to.eql([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 10]);
            });
        });
        describe('incbin', function() {
            it('.incbin(filepath)', function() {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt');
                expect(ins.octets).to.eql([49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });
            it('.incbin(filepath, offset)', function() {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt', 3);
                expect(ins.octets).to.eql([52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });
            it('.incbin(filepath, offset, length)', function() {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt', 3, 3);
                expect(ins.octets).to.eql([52, 53, 54]);
            });
        });
    });

    describe('system', function() {
        it('syscall', function() {
            var _ = code64();
            _.syscall();
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x05]);
        });
        it('sysenter', function() {
            var _ = code64();
            _.sysenter();
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x34]);
        });
        it('sysexit', function() {
            var _ = code64();
            _.sysexit();
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x35]);
        });
        it('int 0x80', function() {
            var _ = code64();
            _.int(0x80);
            var bin = compile(_);
            expect(bin).to.eql([0xCD, 0x80]);
        });
    });

    describe('mov', function() {
        it('movq rax, rax', function() {
            var _ = code64();
            _.movq(rax, rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xc0]);
        });
        it('movq rbx, rax', function() {
            var _ = code64();
            _.movq(rbx, rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xc3]);
        });
        it('movq [rax], rax', function() {
            var _ = code64();
            _.movq(rax.ref(), rax);
            var bin = compile(_);
            // console.log(new Buffer(bin));
            expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rax], rax', function() {
            var _ = code64();
            _.movq(rax.ref(), rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rcx], rbx', function() {
            var _ = code64();
            _.movq(rcx.ref(), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x19]);
        });
        it('movq rdx, [rbx]', function() {
            var _ = code64();
            _.movq(rdx, rbx.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x13]);
        });
        it('movq r9, r8', function() {
            var _ = code64();
            _.movq(r9, r8);
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x89, 0xC1]);
        });
        it('movq [r11], r10', function() {
            var _ = code64();
            _.movq(r11.ref(), r10);
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x89, 0x13]);
        });
        it('movq r13, [r12]', function() {
            var _ = code64();
            _.movq(r13, r12.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x8B, 0x2C, 0x24]);
        });
        it('movq rcx, [rbx + 0x11]', function() {
            var _ = code64();
            _.movq(rcx, rbx.disp(0x11));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x4B, 0x11]);
        });
        it('movq rsi, [rcx + rdx]', function() {
            var _ = code64();
            _.movq(rsi, rcx.ref().ind(rdx, 1));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x34, 0x11]);
        });
        it('movq rcx, [rax + rbx * 4 + 0x1234]', function() {
            var _ = code64();
            _.movq(rcx, rax.ref().ind(rbx, 4).disp(0x1234));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x8C, 0x98, 0x34, 0x12, 0x00, 0x00]);
        });
        it('movq rbp, [0x1]', function() {
            var _ = code64();
            _.movq(rbp, _.mem(0x1));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq rsp, [0x1]', function() {
            var _ = code64();
            _.movq(rsp, _.mem(0x1));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x24, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq [rsp], rbx', function() {
            var _ = code64();
            _.movq(rsp.ref(), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x1C, 0x24]);
        });
        it('movq rsp, rbx', function() {
            var _ = code64();
            _.movq(rsp, rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xDC]);
        });
        it('movq [rbp], rbx', function() {
            var _ = code64();
            _.movq(rbp.ref(), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x5D, 0x00]);
        });
        it('movq [rsp + rbp * 2], rbx', function() {
            var _ = code64();
            _.movq(rsp.ref().ind(rbp, 2), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x1C, 0x6C]);
        });
        it('movq rbx, [rbp + rax * 8]', function() {
            var _ = code64();
            _.movq(rbx, rbp.ref().ind(rax, 8));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x5C, 0xC5, 0x00]);
        });
        it('movq rbp, [rdx * 2]', function() {
            var _ = code64();
            _.movq(rbp, rdx.ind(2));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x55, 0x00, 0x00, 0x00, 0x00]);
        });
        it('movq [rbp * 8 + -0x123], rsp', function() {
            var _ = code64();
            _.movq(rbp.ind(8).disp(-0x123), rsp);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x24, 0xED, 0xDD, 0xFE, 0xFF, 0xFF]);
        });
        it('movq rax, 0x1', function() {
            var _ = code64();
            _.movq(rax, 0x1);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00]);
        });
        // 48 c7 c5 cd cc ff ff 	movq $-0x3333, %rbp
        it('movq rax, 0x1', function() {
            var _ = code64();
            _.movq(rbp, -0x3333);
            var bin = compile(_);
            // console.log(new Buffer(bin));
            expect(bin).to.eql([0x48, 0xC7, 0xC5, 0xCD, 0xCC, 0xFF, 0xFF]);
        });
    });

    describe('add', function() {
        it('add rax, 0x19', function() { // 48 83 c0 19          	add    $0x19,%rax
            var _ = code64();
            _.add(rax, 0x19);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x83, 0xC0, 0x19]);
        });
        it('add rax, rax', function() { // 48 01 c0             	add    %rax,%rax
            var _ = code64();
            _.add(rax, rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x01, 0xC0]);
        });
        it('add rbx, rsp', function() { // 48 01 e3             	add    %rsp,%rbx
            var _ = code64();
            _.add(rbx, rsp);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x01, 0xE3]);
        });
        it('add rcx, [rbx]', function() { // 48 03 0b             	add    (%rbx),%rcx
            var _ = code64();
            _.add(rcx, rbx.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x03, 0x0B]);
        });
        it('add rcx, [rcx + rdx]', function() { // 48 03 0c 11          	add    (%rcx,%rdx,1),%rcx
            var _ = code64();
            _.add(rcx, rcx.ref().ind(rdx));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x03, 0x0C, 0x11]);
        });
        it('add rcx, [rcx + rbp * 4]', function() { // 48 03 0c a9          	add    (%rcx,%rbp,4),%rcx
            var _ = code64();
            _.add(rcx, rcx.ref().ind(rbp, 4));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x03, 0x0C, 0xA9]);
        });
        it('add rcx, [rsp + rbp * 4 + 0x11]', function() { // 48 03 4c ac 11       	add    0x11(%rsp,%rbp,4),%rcx
            var _ = code64();
            _.add(rcx, rsp.ref().ind(rbp, 4).disp(0x11));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x03, 0x4C, 0xAC, 0x11]);
        });
        it('add rcx, [rsp + rbp * 4 + -0x11223344]', function() { // 48 03 8c ac bc cc dd ee 	add    -0x11223344(%rsp,%rbp,4),%rcx
            var _ = code64();
            _.add(rcx, rsp.ref().ind(rbp, 4).disp(-0x11223344));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x03, 0x8C, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
        });
        it('add [rsp + rbp * 4 + -0x11223344], rax', function() { // 48 01 84 ac bc cc dd ee 	add    %rax,-0x11223344(%rsp,%rbp,4)
            var _ = code64();
            _.add(rsp.ref().ind(rbp, 4).disp(-0x11223344), rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x01, 0x84, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
        });
        it('add rbx, 1', function() { // 48 83 c3 01          	add    $0x1,%rbx
            var _ = code64();
            _.add(rbx, 1);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x83, 0xC3, 0x01]);
        });
        it('add rbx, [1]', function() { // 48 03 1c 25 01 00 00 00 	add    0x1,%rbx
            var _ = code64();
            _.add(rbx, _.mem(1));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x03, 0x1C, 0x25, 0x01, 0, 0, 0]);
        });
        it('add [1], rbx', function() { // 48 01 1c 25 01 00 00 00 	add    %rbx,0x1
            var _ = code64();
            _.add(_.mem(1), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x01, 0x1C, 0x25, 0x01, 0, 0, 0]);
        });
        it('add al, 0x11', function() { // 04 11                	add    $0x11,%al
            var _ = code64();
            _.add(al, 0x11);
            var bin = compile(_);
            expect(bin).to.eql([0x04, 0x11]);
        });
        it('add ax, 0x1122', function() { // 66 05 22 11          	add    $0x1122,%ax
            var _ = code64();
            _.add(ax, 0x1122);
            var bin = compile(_);
            expect(bin).to.eql([0x66, 0x05, 0x22, 0x11]);
        });
        it('add eax, 0x11223344', function() { // 05 44 33 22 11       	add    $0x11223344,%eax
            var _ = code64();
            _.add(eax, 0x11223344);
            var bin = compile(_);
            expect(bin).to.eql([0x05, 0x44, 0x33, 0x22, 0x11]);
        });
        it('add rax, -0x11223344', function() { // 48 05 bc cc dd ee    	add $-0x11223344, %rax
            var _ = code64();
            _.add(rax, -0x11223344);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x05, 0xbc, 0xcc, 0xdd, 0xee]);
        });
        it('add bl, 0x22', function() { // 80 c3 22             	add    $0x22,%bl
            var _ = code64();
            _.add(bl, 0x22);
            var bin = compile(_);
            expect(bin).to.eql([0x80, 0xc3, 0x22]);
        });
        it('add ah, 0x22', function() { // 80 c4 22             	add    $0x22,%ah
            var _ = code64();
            _.add(ah, 0x22);
            var bin = compile(_);
            expect(bin).to.eql([0x80, 0xc3, 0x22]);
        });
        // 400696:
        // 400699:
        // 40069c:	66 81 c3 22 11       	add    $0x1122,%bx
        // 4006a1:	66 83 c3 11          	add    $0x11,%bx
        // 4006a5:	81 c3 22 11 00 00    	add    $0x1122,%ebx
    });

    describe('lea', function() {
        it('lea rax, [rax]', function() { // 400657:	48 8d 00             	lea    (%rax),%rax
            var _ = code64();
            _.lea(rax, rax.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x00]);
        });
        it('lea rbx, [rbx]', function() { // 40065a:	48 8d 1b             	lea    (%rbx),%rbx
            var _ = code64();
            _.lea(rbx, rbx.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x1B]);
        });
        it('lea eax, [rax]', function() { // 40065d:	8d 00                	lea    (%rax),%eax
            var _ = code64();
            _.lea(eax, rax.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x8D, 0x00]);
        });
        it('lea ax, [rax]', function() { // 40065f:	66 8d 00             	lea    (%rax),%ax
            var _ = code64();
            _.lea(ax, rax.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x66, 0x8D, 0x00]);
        });
        it('lea rax, [rip]', function() { // 400662:	48 8d 05 00 00 00 00 	lea    0x0(%rip),%rax        # 400669 <lea+0x12>
            var _ = code64();
            _.lea(rax, rip.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x05, 0x00, 0x00, 0x00, 0x00]);
        });
        it('lea rax, [rbx]', function() { // 400669:	48 8d 03             	lea    (%rbx),%rax
            var _ = code64();
            _.lea(rax, rbx.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x03]);
        });
        it('lea rax, [rsp]', function() { // 40066c:	48 8d 04 24          	lea    (%rsp),%rax
            var _ = code64();
            _.lea(rax, rsp.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x04, 0x24]);
        });
        it('lea rax, [rbp]', function() { // 400670:	48 8d 45 00          	lea    0x0(%rbp),%rax
            var _ = code64();
            _.lea(rax, rbp.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x45, 0x00]);
        });
        it('lea r8, [rip + 0x11]', function() { // 400674:	4c 8d 05 11 00 00 00 	lea    0x11(%rip),%r8        # 40068c <lea+0x35>
            var _ = code64();
            _.lea(r8, rip.disp(0x11));
            var bin = compile(_);
            // console.log(_.toString());
            expect(bin).to.eql([0x4C, 0x8D, 0x05, 0x11, 0, 0, 0]);
        });
        it('lea r9, [rip + 0x11223344]', function() { // 40067b:	4c 8d 0d 44 33 22 11 	lea    0x11223344(%rip),%r9
            var _ = code64();
            _.lea(r9, rip.disp(0x11223344));
            var bin = compile(_);
            expect(bin).to.eql([0x4C, 0x8D, 0x0D, 0x44, 0x33, 0x22, 0x11]);
        });
        it('lea r9, [rbx + rcx + 0x11]', function() { // 400682:	4c 8d 4c 0b 11       	lea    0x11(%rbx,%rcx,1),%r9
            var _ = code64();
            _.lea(r9, rbx.disp(0x11).ind(rcx));
            var bin = compile(_);
            expect(bin).to.eql([0x4C, 0x8D, 0x4C, 0x0B, 0x11]);
        });
        it('lea r9, [0x43]', function() { // 400687:	4c 8d 0c 25 43 00 00 00 	lea    0x43,%r9
            var _ = code64();
            _.lea(r9, _.mem(0x43));
            var bin = compile(_);
            expect(bin).to.eql([0x4C, 0x8D, 0x0C, 0x25, 0x43, 0, 0, 0]);
        });
    });

    describe('inc', function() {
        it('incq rbx', function() {
            var _ = code64();
            _.incq(rbx);
            expect(compile(_)).to.eql([0x48, 0xff, 0xc3]);
        });
        it('incq [rax]', function() {
            var _ = code64();
            _.incq(rax.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x00]);
        });
        it('incq [rbx]', function() {
            var _ = code64();
            _.incq(rbx.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x03]);
        });
        it('incq [rbx + rcx]', function() {
            var _ = code64();
            _.incq(rbx.ref().ind(rcx));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x0b]);
        });
        it('incq [rbx + rcx * 8]', function() {
            var _ = code64();
            _.incq(rbx.ref().ind(rcx, 8));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0xcb]);
        });
        it('incq [rax + rbx * 8 + 0x11]', function() {
            var _ = code64();
            _.incq(rax.ref().ind(rbx, 8).disp(0x11));
            expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xd8, 0x11]);
        });
        it('incq [rax + rbx * 8 + -0x11223344]', function() {
            var _ = code64();
            var ins = _.incq(rax.ref().ind(rbx, 8).disp(-0x11223344));
            expect(compile(_)).to.eql([0x48, 0xff, 0x84, 0xd8, 0xbc, 0xcc, 0xdd, 0xee]);
        });
        it('incq [rbx + r15 * 8 + -0x123]', function() {
            var _ = code64();
            var ins = _.incq(rbx.ref().ind(r15, 8).disp(-0x123));
            expect(compile(_)).to.eql([0x4a, 0xff, 0x84, 0xfb, 0xdd, 0xfe, 0xff, 0xff]);
        });
        it('incq [rbp + rbp * 8]', function() {
            var _ = code64();
            var ins = _.incq(rbp.ref().ind(rbp, 8));
            expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xed, 0x00]);
        });
        it('incq [rbp]', function() {
            var _ = code64();
            var ins = _.incq(rbp.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x45, 0x00]);
        });
        it('incq [rsp]', function() {
            var _ = code64();
            var ins = _.incq(rsp.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x24]);
        });
        it('incq [r12]', function() {
            var _ = code64();
            var ins = _.incq(r12.ref());
            expect(compile(_)).to.eql([0x49, 0xff, 0x04, 0x24]);
        });
        it('incq [r13]', function() {
            var _ = code64();
            var ins = _.incq(r13.ref());
            expect(compile(_)).to.eql([0x49, 0xff, 0x45, 0x00]);
        });
        it('incq r15', function() {
            var _ = code64();
            var ins = _.incq(r15);
            expect(compile(_)).to.eql([0x49, 0xff, 0xc7]);
        });
        it('incq [0x11]', function() {
            var _ = code64();
            var ins = _.incq(_.mem(0x11));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x11, 0x00, 0x00, 0x00]);
        });
        it('incq [0x11223344]', function() {
            var _ = code64();
            var ins = _.incq(_.mem(0x11223344));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x44, 0x33, 0x22, 0x11]);
        });
    });
    describe('dec', function() {
        it('decq rbx', function () {
            var _ = code64();
            _.decq(rax);
            expect(compile(_)).to.eql([0x48, 0xff, 0xc8]);
        });
    });
});
