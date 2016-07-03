import {expect} from 'chai';
import {rax, rbx, rcx, rdx, rbp, rsp, rsi, rdi, r8, r9, r10, r11, r12, r13, r15,
        ebx, eax, esp, ebp, ecx,
        r10d, ax, bx, cx, dx, al, bl, cl, dl, ah, ch, dil, bpl, spl, r8b, r10b,
        rip} from '../x86/operand';
import * as o from '../x86/operand';
import {Code} from '../x86/x64/code';


describe('x64', function() {

    function code64(): Code {
        return new Code;
    }

    function compile(code: Code) {
        return code.compile();
    }

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
            _._('syscall');
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x05]);
        });
        it('sysenter', function() {
            var _ = code64();
            _._('sysenter');
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x34]);
        });
        it('sysexit', function() {
            var _ = code64();
            _._('sysexit');
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x35]);
        });
    });

    describe('mov', function() {
        it('movq rax, rax', function() {
            var _ = code64();
            _._('mov', [rax, rax], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xc0]);
        });
        it('movq rbx, rax', function() {
            var _ = code64();
            _._('mov', [rbx, rax], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xc3]);
        });
        it('movq [rax], rax', function() {
            var _ = code64();
            _._('mov', [rax.ref(), rax], 64);
            var bin = compile(_);
            // console.log(new Buffer(bin));
            expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rax], rax', function() {
            var _ = code64();
            _._('mov', [rax.ref(), rax], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rcx], rbx', function() {
            var _ = code64();
            _._('mov', [rcx.ref(), rbx], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x19]);
        });
        it('movq rdx, [rbx]', function() {
            var _ = code64();
            _._('mov', [rdx, rbx.ref()], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x13]);
        });
        it('movq r9, r8', function() {
            var _ = code64();
            _._('mov', [r9, r8], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x89, 0xC1]);
        });
        it('movq [r11], r10', function() {
            var _ = code64();
            _._('mov', [r11.ref(), r10], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x89, 0x13]);
        });
        it('movq r13, [r12]', function() {
            var _ = code64();
            _._('mov', [r13, r12.ref()], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x8B, 0x2C, 0x24]);
        });
        it('movq rcx, [rbx + 0x11]', function() {
            var _ = code64();
            _._('mov', [rcx, rbx.disp(0x11)], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x4B, 0x11]);
        });
        it('movq rsi, [rcx + rdx]', function() {
            var _ = code64();
            _._('mov', [rsi, rcx.ref().ind(rdx, 1)], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x34, 0x11]);
        });
        it('movq rcx, [rax + rbx * 4 + 0x1234]', function() {
            var _ = code64();
            _._('mov', [rcx, rax.ref().ind(rbx, 4).disp(0x1234)], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x8C, 0x98, 0x34, 0x12, 0x00, 0x00]);
        });
        it('movq rbp, [0x1]', function() {
            var _ = code64();
            _._('mov', [rbp, _.mem(0x1)], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq rsp, [0x1]', function() {
            var _ = code64();
            _._('mov', [rsp, _.mem(0x1)], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x24, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq [rsp], rbx', function() {
            var _ = code64();
            _._('mov', [rsp.ref(), rbx], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x1C, 0x24]);
        });
        it('movq rsp, rbx', function() {
            var _ = code64();
            _._('mov', [rsp, rbx], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xDC]);
        });
        it('movq [rbp], rbx', function() {
            var _ = code64();
            _._('mov', [rbp.ref(), rbx], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x5D, 0x00]);
        });
        it('movq [rsp + rbp * 2], rbx', function() {
            var _ = code64();
            _._('mov', [rsp.ref().ind(rbp, 2), rbx], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x1C, 0x6C]);
        });
        it('movq rbx, [rbp + rax * 8]', function() {
            var _ = code64();
            _._('mov', [rbx, rbp.ref().ind(rax, 8)], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x5C, 0xC5, 0x00]);
        });
        it('movq rbp, [rdx * 2]', function() {
            var _ = code64();
            _._('mov', [rbp, rdx.ind(2)], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x55, 0x00, 0x00, 0x00, 0x00]);
        });
        it('movq [rbp * 8 + -0x123], rsp', function() {
            var _ = code64();
            _._('mov', [rbp.ind(8).disp(-0x123), rsp], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x24, 0xED, 0xDD, 0xFE, 0xFF, 0xFF]);
        });
        it('movq rax, 0x1', function() {
            var _ = code64();
            _._('mov', [rax, 0x1], 64);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00]);
        });
        // 48 c7 c5 cd cc ff ff 	movq $-0x3333, %rbp
        it('movq rax, 0x1', function() {
            var _ = code64();
            _._('mov', [rbp, -0x3333], 64);
            var bin = compile(_);
            // console.log(new Buffer(bin));
            expect(bin).to.eql([0x48, 0xC7, 0xC5, 0xCD, 0xCC, 0xFF, 0xFF]);
        });
    });
    
    describe('Binary Arithmetic', function() {
        describe('adcx', function () {
            it('adcx rcx, rbx', function () { // 66 48 0f 38 f6 cb    	adcx   %rbx,%rcx
                var _ = code64();
                _._('adcx', [rcx, rbx]);
                var bin = compile(_);
                // console.log(new Buffer(bin));
                expect(bin).to.eql([0x66, 0x48, 0x0F, 0x38, 0xF6, 0xCB]);
            });
            it('adcx rax, rax', function () { // 66 48 0f 38 f6 c0    	adcx   %rax,%rax
                var _ = code64();
                _._('adcx', [rax, rax]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x48, 0x0F, 0x38, 0xF6, 0xC0]);
            });
        });
        describe('adox', function () {
            it('adox r12, r9', function () { // f3 4d 0f 38 f6 e1    	adox   %r9,%r12
                var _ = code64();
                _._('adox', [r12, r9]);
                var bin = compile(_);
                expect(bin).to.eql([0xF3, 0x4D, 0x0F, 0x38, 0xF6, 0xE1]);
            });
        });
        describe('add', function () {
            it('add rax, 0x19', function () { // 48 83 c0 19          	add    $0x19,%rax
                var _ = code64();
                _._('add', [rax, 0x19]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x83, 0xC0, 0x19]);
            });
            it('add rax, rax', function () { // 48 01 c0             	add    %rax,%rax
                var _ = code64();
                _._('add', [rax, rax]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x01, 0xC0]);
            });
            it('add rbx, rsp', function () { // 48 01 e3             	add    %rsp,%rbx
                var _ = code64();
                _._('add', [rbx, rsp]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x01, 0xE3]);
            });
            it('add rcx, [rbx]', function () { // 48 03 0b             	add    (%rbx),%rcx
                var _ = code64();
                _._('add', [rcx, rbx.ref()]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x03, 0x0B]);
            });
            it('add rcx, [rcx + rdx]', function () { // 48 03 0c 11          	add    (%rcx,%rdx,1),%rcx
                var _ = code64();
                _._('add', [rcx, rcx.ref().ind(rdx)]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x03, 0x0C, 0x11]);
            });
            it('add rcx, [rcx + rbp * 4]', function () { // 48 03 0c a9          	add    (%rcx,%rbp,4),%rcx
                var _ = code64();
                _._('add', [rcx, rcx.ref().ind(rbp, 4)]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x03, 0x0C, 0xA9]);
            });
            it('add rcx, [rsp + rbp * 4 + 0x11]', function () { // 48 03 4c ac 11       	add    0x11(%rsp,%rbp,4),%rcx
                var _ = code64();
                _._('add', [rcx, rsp.ref().ind(rbp, 4).disp(0x11)]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x03, 0x4C, 0xAC, 0x11]);
            });
            it('add rcx, [rsp + rbp * 4 + -0x11223344]', function () { // 48 03 8c ac bc cc dd ee 	add    -0x11223344(%rsp,%rbp,4),%rcx
                var _ = code64();
                _._('add', [rcx, rsp.ref().ind(rbp, 4).disp(-0x11223344)]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x03, 0x8C, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
            });
            it('add [rsp + rbp * 4 + -0x11223344], rax', function () { // 48 01 84 ac bc cc dd ee 	add    %rax,-0x11223344(%rsp,%rbp,4)
                var _ = code64();
                _._('add', [rsp.ref().ind(rbp, 4).disp(-0x11223344), rax]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x01, 0x84, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
            });
            it('add rbx, 1', function () { // 48 83 c3 01          	add    $0x1,%rbx
                var _ = code64();
                _._('add', [rbx, 1]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x83, 0xC3, 0x01]);
            });
            it('add rbx, [1]', function () { // 48 03 1c 25 01 00 00 00 	add    0x1,%rbx
                var _ = code64();
                _._('add', [rbx, _.mem(1)]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x03, 0x1C, 0x25, 0x01, 0, 0, 0]);
            });
            it('add [1], rbx', function () { // 48 01 1c 25 01 00 00 00 	add    %rbx,0x1
                var _ = code64();
                _._('add', [_.mem(1), rbx]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x01, 0x1C, 0x25, 0x01, 0, 0, 0]);
            });
            it('add al, 0x11', function () { // 04 11                	add    $0x11,%al
                var _ = code64();
                _._('add', [al, 0x11]);
                var bin = compile(_);
                expect(bin).to.eql([0x04, 0x11]);
            });
            it('add ax, 0x1122', function () { // 66 05 22 11          	add    $0x1122,%ax
                var _ = code64();
                _._('add', [ax, 0x1122]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x05, 0x22, 0x11]);
            });
            it('add eax, 0x11223344', function () { // 05 44 33 22 11       	add    $0x11223344,%eax
                var _ = code64();
                _._('add', [eax, 0x11223344]);
                var bin = compile(_);
                expect(bin).to.eql([0x05, 0x44, 0x33, 0x22, 0x11]);
            });
            it('add rax, -0x11223344', function () { // 48 05 bc cc dd ee    	add $-0x11223344, %rax
                var _ = code64();
                _._('add', [rax, -0x11223344]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x05, 0xbc, 0xcc, 0xdd, 0xee]);
            });
            it('add bl, 0x22', function () { // 80 c3 22             	add    $0x22,%bl
                var _ = code64();
                _._('add', [bl, 0x22]);
                var bin = compile(_);
                expect(bin).to.eql([0x80, 0xc3, 0x22]);
            });
            it('add ah, 0x22', function () { // 80 c4 22             	add    $0x22,%ah
                var _ = code64();
                _._('add', [ah, 0x22]);
                var bin = compile(_);
                expect(bin).to.eql([0x80, 0xc4, 0x22]);
            });
            it('add bx, 0x1122', function () { // 66 81 c3 22 11       	add    $0x1122,%bx
                var _ = code64();
                _._('add', [bx, 0x1122]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x81, 0xC3, 0x22, 0x11]);
            });
            it('add bx, 0x11', function () { // 66 83 c3 11          	add    $0x11,%bx
                var _ = code64();
                _._('add', [bx, 0x11]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x83, 0xC3, 0x11]);
            });
            it('add ebx, 0x1122', function () { // 81 c3 22 11 00 00    	add    $0x1122,%ebx
                var _ = code64();
                _._('add', [ebx, 0x1122]);
                var bin = compile(_);
                expect(bin).to.eql([0x81, 0xC3, 0x22, 0x11, 0, 0]);
            });
            it('add ch, 0x22', function () { // 80 c5 22             	add    $0x22,%ch
                var _ = code64();
                _._('add', [ch, 0x22]);
                var bin = compile(_);
                expect(bin).to.eql([0x80, 0xC5, 0x22]);
            });
            it('add dil, 0x22', function () { // 40 80 c7 22          	add    $0x22,%dil
                var _ = code64();
                _._('add', [dil, 0x22]);
                var bin = compile(_);
                expect(bin).to.eql([0x40, 0x80, 0xC7, 0x22]);
            });
            it('add bpl, 0x22', function () { // 40 80 c5 22          	add    $0x22,%bpl
                var _ = code64();
                _._('add', [bpl, 0x22]);;
                var bin = compile(_);
                expect(bin).to.eql([0x40, 0x80, 0xC5, 0x22]);
            });
            it('add spl, 0x22', function () { // 40 80 c4 22          	add    $0x22,%spl
                var _ = code64();
                _._('add', [spl, 0x22]);
                var bin = compile(_);
                expect(bin).to.eql([0x40, 0x80, 0xC4, 0x22]);
            });
            it('add r8b, 0x22', function () { // 41 80 c0 22          	add    $0x22,%r8b
                var _ = code64();
                _._('add', [r8b, 0x22]);
                var bin = compile(_);
                expect(bin).to.eql([0x41, 0x80, 0xC0, 0x22]);
            });
            it('add esp, 0x12', function () { // 83 c4 12             	add    $0x12,%esp
                var _ = code64();
                _._('add', [esp, 0x12]);
                var bin = compile(_);
                expect(bin).to.eql([0x83, 0xC4, 0x12]);
            });
            it('add dl, cl', function () { // 00 ca                	add    %cl,%dl
                var _ = code64();
                _._('add', [dl, cl]);
                var bin = compile(_);
                expect(bin).to.eql([0x00, 0xCA]);
            });
            it('add bx, ax', function () { // 66 01 c3             	add    %ax,%bx
                var _ = code64();
                _._('add', [bx, ax]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x01, 0xC3]);
            });
            it('add ecx, eax', function () { // 01 c1                	add    %eax,%ecx
                var _ = code64();
                _._('add', [ecx, eax]);
                var bin = compile(_);
                expect(bin).to.eql([0x01, 0xC1]);
            });
        });

        describe('adc', function() {
            it('adc [rbx + rcx * 4 + 0x11], rax', function() {// 48 11 44 8b 11       	adc    %rax,0x11(%rbx,%rcx,4)
                var _ = code64();
                _._('adc', [rbx.ref().ind(rcx, 4).disp(0x11), rax]);
                expect(compile(_)).to.eql([0x48, 0x11, 0x44, 0x8B, 0x11]);
            });
        });

        describe('mul', function() {
            it('mul al', function() {// 400580:	f6 e0                	mul    %al
                var _ = code64();
                _._('mul', al);
                expect(compile(_)).to.eql([0xf6, 0xe0]);
            });
            it('mul ax', function() {// 66 f7 e0             	mul    %ax
                var _ = code64();
                _._('mul', ax);
                expect(compile(_)).to.eql([0x66, 0xf7, 0xe0]);
            });
            it('mul eax', function() {// f7 e0                	mul    %eax
                var _ = code64();
                _._('mul', eax);
                expect(compile(_)).to.eql([0xf7, 0xe0]);
            });
            it('mul rax', function() {// 48 f7 e0             	mul    %rax
                var _ = code64();
                _._('mul', rax);
                expect(compile(_)).to.eql([0x48, 0xf7, 0xe0]);
            });
            it('mulq [rax]', function() {// 48 f7 20             	mulq   (%rax)
                var _ = code64();
                _._('mul', rax.ref(), 64);
                expect(compile(_)).to.eql([0x48, 0xf7, 0x20]);
            });
            it('mulq [eax]', function() {// 67 48 f7 20          	mulq   (%eax)
                var _ = code64();
                _._('mul', eax.ref(), 64);
                expect(compile(_)).to.eql([0x67, 0x48, 0xf7, 0x20]);
            });
            it('muld [rax]', function() {// f7 20                	mull   (%rax)
                var _ = code64();
                _._('mul', rax.ref(), 32);
                expect(compile(_)).to.eql([0xf7, 0x20]);
            });
            it('muld [eax]', function() {// 67 f7 20             	mull   (%eax)
                var _ = code64();
                _._('mul', eax.ref(), 32);
                expect(compile(_)).to.eql([0x67, 0xf7, 0x20]);
            });
            it('mulw [rax]', function() {// 66 f7 20             	mulw   (%rax)
                var _ = code64();
                _._('mul', rax.ref(), 16);
                expect(compile(_)).to.eql([0x66, 0xf7, 0x20]);
            });
            it('mulw [eax]', function() {// 67 66 f7 20          	mulw   (%eax)
                var _ = code64();
                _._('mul', eax.ref(), 16);
                expect(compile(_)).to.eql([0x67, 0x66, 0xf7, 0x20]);
            });
            it('mulb [rax]', function() {// f6 20                	mulb   (%rax)
                var _ = code64();
                _._('mul', rax.ref(), 8);
                expect(compile(_)).to.eql([0xf6, 0x20]);
            });
            it('mulb [eax]', function() {// 67 f6 20             	mulb   (%eax)
                var _ = code64();
                _._('mul', eax.ref(), 8);
                expect(compile(_)).to.eql([0x67, 0xf6, 0x20]);
            });
        });

        describe('div', function() {
            it('div bl', function() {// f6 f3                	div    %bl
                var _ = code64();
                _._('div', bl);
                expect(compile(_)).to.eql([0xf6, 0xF3]);
            });
            it('div bx', function() {// 66 f7 f3             	div    %bx
                var _ = code64();
                _._('div', bx);
                expect(compile(_)).to.eql([0x66, 0xf7, 0xF3]);
            });
            it('div ebx', function() {// f7 f3                	div    %ebx
                var _ = code64();
                _._('div', ebx);
                expect(compile(_)).to.eql([0xf7, 0xF3]);
            });
            it('div rbx', function() {// 48 f7 f3             	div    %rbx
                var _ = code64();
                _._('div', rbx);
                expect(compile(_)).to.eql([0x48, 0xf7, 0xF3]);
            });
        });
        describe('inc', function() {
            it('incq rbx', function() {
                var _ = code64();
                _._('inc', rbx, 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0xc3]);
            });
            it('incq [rax]', function() {
                var _ = code64();
                _._('inc', rax.ref(), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x00]);
            });
            it('incq [rbx]', function() {
                var _ = code64();
                _._('inc', rbx.ref(), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x03]);
            });
            it('incq [rbx + rcx]', function() {
                var _ = code64();
                _._('inc', rbx.ref().ind(rcx), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x0b]);
            });
            it('incq [rbx + rcx * 8]', function() {
                var _ = code64();
                _._('inc', rbx.ref().ind(rcx, 8), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0xcb]);
            });
            it('incq [rax + rbx * 8 + 0x11]', function() {
                var _ = code64();
                _._('inc', rax.ref().ind(rbx, 8).disp(0x11), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xd8, 0x11]);
            });
            it('incq [rax + rbx * 8 + -0x11223344]', function() {
                var _ = code64();
                var ins = _._('inc', rax.ref().ind(rbx, 8).disp(-0x11223344), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x84, 0xd8, 0xbc, 0xcc, 0xdd, 0xee]);
            });
            it('incq [rbx + r15 * 8 + -0x123]', function() {
                var _ = code64();
                var ins = _._('inc', rbx.ref().ind(r15, 8).disp(-0x123), 64);
                expect(compile(_)).to.eql([0x4a, 0xff, 0x84, 0xfb, 0xdd, 0xfe, 0xff, 0xff]);
            });
            it('incq [rbp + rbp * 8]', function() {
                var _ = code64();
                var ins = _._('inc', rbp.ref().ind(rbp, 8), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xed, 0x00]);
            });
            it('incq [rbp]', function() {
                var _ = code64();
                var ins = _._('inc', rbp.ref(), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x45, 0x00]);
            });
            it('incq [rsp]', function() {
                var _ = code64();
                var ins = _._('inc', rsp.ref(), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x24]);
            });
            it('incq [r12]', function() {
                var _ = code64();
                var ins = _._('inc', r12.ref(), 64);
                expect(compile(_)).to.eql([0x49, 0xff, 0x04, 0x24]);
            });
            it('incq [r13]', function() {
                var _ = code64();
                var ins = _._('inc', r13.ref(), 64);
                expect(compile(_)).to.eql([0x49, 0xff, 0x45, 0x00]);
            });
            it('incq r15', function() {
                var _ = code64();
                var ins = _._('inc', r15, 64);
                expect(compile(_)).to.eql([0x49, 0xff, 0xc7]);
            });
            it('incq [0x11]', function() {
                var _ = code64();
                var ins = _._('inc', _.mem(0x11), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x11, 0x00, 0x00, 0x00]);
            });
            it('incq [0x11223344]', function() {
                var _ = code64();
                var ins = _._('inc', _.mem(0x11223344), 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x44, 0x33, 0x22, 0x11]);
            });
        });
        describe('dec', function() {
            it('decq rbx', function () {
                var _ = code64();
                _._('dec', rax, 64);
                expect(compile(_)).to.eql([0x48, 0xff, 0xc8]);
            });
            it('dec r10b', function () { // 41 fe ca             	dec    %r10b
                var _ = code64();
                _._('dec', r10b);
                expect(compile(_)).to.eql([0x41, 0xFE, 0xCA]);
            });
            it('dec ax', function () { // 66 ff c8             	dec    %ax
                var _ = code64();
                _._('dec', ax);
                expect(compile(_)).to.eql([0x66, 0xFF, 0xC8]);
            });
            it('dec eax', function () { // ff c8                	dec    %eax
                var _ = code64();
                _._('dec', eax);
                expect(compile(_)).to.eql([0xFF, 0xC8]);
            });
            it('dec rax', function () { // 48 ff c8             	dec    %rax
                var _ = code64();
                _._('dec', rax);
                expect(compile(_)).to.eql([0x48, 0xFF, 0xC8]);
            });
        });
        describe('neg', function () {
            it('neg al', function () { // f6 d8                	neg    %al
                var _ = code64();
                _._('neg', al);
                var bin = compile(_);
                expect(bin).to.eql([0xF6, 0xD8]);
            });
            it('neg dil', function () { // 40 f6 df             	neg    %dil
                var _ = code64();
                _._('neg', dil);
                var bin = compile(_);
                expect(bin).to.eql([0x40, 0xF6, 0xDF]);
            });
            it('neg bx', function () { // 66 f7 db             	neg    %bx
                var _ = code64();
                _._('neg', bx);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0xF7, 0xDB]);
            });
            it('neg ecx', function () { // f7 d9                	neg    %ecx
                var _ = code64();
                _._('neg', ecx);
                var bin = compile(_);
                expect(bin).to.eql([0xF7, 0xD9]);
            });
            it('neg rdx', function () { // 48 f7 da             	neg    %rdx
                var _ = code64();
                _._('neg', rdx);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0xF7, 0xDA]);
            });
        });
        describe('cmp', function () {
            it('cmp al, 0x11', function () { // 3c 11                	cmp    $0x11,%al
                var _ = code64();
                _._('cmp', [al, 0x11]);
                var bin = compile(_);
                expect(bin).to.eql([0x3C, 0x11]);
            });
            it('cmp ax, 0x1122', function () { // 66 3d 22 11          	cmp    $0x1122,%ax
                var _ = code64();
                _._('cmp', [ax, 0x1122]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x3D, 0x22, 0x11]);
            });
            it('cmp eax, 0x11223344', function () { // 3d 44 33 22 11       	cmp    $0x11223344,%eax
                var _ = code64();
                _._('cmp', [eax, 0x11223344]);
                var bin = compile(_);
                expect(bin).to.eql([0x3D, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp rax, 0x11223344', function () { // 48 3d 44 33 22 11    	cmp    $0x11223344,%rax
                var _ = code64();
                _._('cmp', [rax, 0x11223344]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x3D, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp bl, 0x11', function () { // 80 fb 11             	cmp    $0x11,%bl
                var _ = code64();
                _._('cmp', [bl, 0x11]);
                var bin = compile(_);
                expect(bin).to.eql([0x80, 0xFB, 0x11]);
            });
            it('cmp bx, 0x1122', function () { // 66 81 fb 22 11       	cmp    $0x1122,%bx
                var _ = code64();
                _._('cmp', [bx, 0x1122]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x81, 0xFB, 0x22, 0x11]);
            });
            it('cmp ebx, 0x11223344', function () { // 81 fb 44 33 22 11    	cmp    $0x11223344,%ebx
                var _ = code64();
                _._('cmp', [ebx, 0x11223344]);
                var bin = compile(_);
                expect(bin).to.eql([0x81, 0xFB, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp rbx, 0x11223344', function () { // 48 81 fb 44 33 22 11 	cmp    $0x11223344,%rbx
                var _ = code64();
                _._('cmp', [rbx, 0x11223344]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x81, 0xFB, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp cx, 0x11', function () { // 66 83 f9 11          	cmp    $0x11,%cx
                var _ = code64();
                _._('cmp', [cx, 0x11]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x83, 0xF9, 0x11]);
            });
            it('cmp ecx, 0x11', function () { // 83 f9 11             	cmp    $0x11,%ecx
                var _ = code64();
                _._('cmp', [ecx, 0x11]);
                var bin = compile(_);
                expect(bin).to.eql([0x83, 0xF9, 0x11]);
            });
            it('cmp rcx, 0x11', function () { // 48 83 f9 11          	cmp    $0x11,%rcx
                var _ = code64();
                _._('cmp', [rcx, 0x11]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x83, 0xF9, 0x11]);
            });
            it('cmp al, bl', function () { // 38 d8                	cmp    %bl,%al
                var _ = code64();
                _._('cmp', [al, bl]);
                var bin = compile(_);
                expect(bin).to.eql([0x38, 0xD8]);
            });
            it('cmp ax, bx', function () { // 66 39 d8             	cmp    %bx,%ax
                var _ = code64();
                _._('cmp', [ax, bx]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x39, 0xD8]);
            });
            it('cmp ebx, eax', function () { // 39 c3                	cmp    %eax,%ebx
                var _ = code64();
                _._('cmp', [ebx, eax]);
                var bin = compile(_);
                expect(bin).to.eql([0x39, 0xC3]);
            });
            it('cmp rbx, rax', function () { // 48 39 c3             	cmp    %rax,%rbx
                var _ = code64();
                _._('cmp', [rbx, rax]);
                var bin = compile(_);
                expect(bin).to.eql([0x48, 0x39, 0xC3]);
            });
        });
    });

    describe('Control Transfer', function() {
        describe('jmp', function () {
            it('jmp rel8', function () {
                var _ = code64();
                var lbl = _.label('test');
                _._('jmp', lbl);
                var bin = compile(_);
                expect(bin).to.eql([0xEB, 0xFE]);
            });
            it('jmp rel32', function () {
                var _ = code64();
                var lbl = _.lbl('test');
                _._('jmp', lbl);
                _.db(0, 150);
                _.insert(lbl);
                var bin = compile(_);
                bin = bin.splice(0, 8);
                expect(bin).to.eql([0xE9, 0x96, 0, 0, 0, 0, 0, 0]);
            });
            it('jmp rax', function () { // ff e0                	jmpq   *%rax
                var _ = code64();
                _._('jmp', rax);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0xE0]);
            });
            it('jmp rbx', function () { // ff e3                	jmpq   *%rbx
                var _ = code64();
                _._('jmp', rbx);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0xE3]);
            });
            it('jmpq [rcx + rbx]', function () { // ff 24 19             	jmpq   *(%rcx,%rbx,1)
                var _ = code64();
                _._('jmp', rcx.ref().ind(rbx), 64);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0x24, 0x19]);
            });
            it('jmpq 0x11223344', function () { // ff 24 25 44 33 22 11 	jmpq   *0x11223344
                var _ = code64();
                _._('jmp', _.mem(0x11223344), 64);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0x24, 0x25, 0x44, 0x33, 0x22, 0x11]);
            });
        });
        describe('ljmp', function () {
            it('ljmpq 0x11223344', function () { // ff 2c 25 44 33 22 11 	ljmpq  *0x11223344
                var _ = code64();
                _._('ljmp', _.mem(0x11223344), 64);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0x2C, 0x25, 0x44, 0x33, 0x22, 0x11]);
            });
            it('ljmp [rip + 0x11]', function () { // ff 2d 11 00 00 00    	ljmpq  *0x11(%rip)
                var _ = code64();
                _._('ljmp', rip.disp(0x11), 64);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0x2D, 0x11, 0, 0, 0]);
            });
            it('ljmp [rax + 0x11]', function () { // ff 68 11             	ljmpq  *0x11(%rax)
                var _ = code64();
                _._('ljmp', rax.disp(0x11), 64);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0x68, 0x11]);
            });
            it('ljmp [eax]', function () { // 67 ff 28             	ljmpq  *(%eax)
                var _ = code64();
                _._('ljmp', eax.ref(), 64);
                var bin = compile(_);
                expect(bin).to.eql([0x67, 0xFF, 0x28]);
            });
            it('ljmp [rax]', function () { // ff 28                	ljmpq  *(%rax)
                var _ = code64();
                _._('ljmp', rax.ref(), 64);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0x28]);
            });
            it('ljmp [rax + rbx]', function () { // ff 2c 18             	ljmpq  *(%rax,%rbx,1)
                var _ = code64();
                _._('ljmp', rax.ref().ind(rbx), 64);
                var bin = compile(_);
                expect(bin).to.eql([0xFF, 0x2C, 0x18]);
            });
            it('ljmp [r15 + 0x11]', function () { // 41 ff 6f 11          	ljmpq  *0x11(%r15)
                var _ = code64();
                _._('ljmp', r15.disp(0x11), 64);
                var bin = compile(_);
                expect(bin).to.eql([0x41, 0xFF, 0x6F, 0x11]);
            });
        });
        describe('jcc', function () {
            describe('ja', function () {
                it('ja rel8', function () {
                    var _ = code64();
                    var lbl = _.label('test');
                    _._('ja', lbl);
                    var bin = compile(_);
                    expect(bin).to.eql([0x77, 0xFE]);
                });
                it('ja rel32', function () {
                    var _ = code64();
                    var lbl = _.lbl('test');
                    _._('ja', lbl);
                    _.db(0, 150);
                    _.insert(lbl);
                    var bin = compile(_);
                    bin = bin.splice(0, 8);
                    expect(bin).to.eql([0x0F, 0x87, 0x96, 0, 0, 0, 0, 0]);
                });
            });
            describe('jae', function () {
                it('jae rel8', function () {
                    var _ = code64();
                    var lbl = _.label('test');
                    _._('jae', lbl);
                    var bin = compile(_);
                    expect(bin).to.eql([0x73, 0xFE]);
                });
                it('jae rel32', function () {
                    var _ = code64();
                    var lbl = _.lbl('test');
                    _._('jae', lbl);
                    _.db(0, 150);
                    _.insert(lbl);
                    var bin = compile(_);
                    bin = bin.splice(0, 8);
                    expect(bin).to.eql([0x0F, 0x83, 0x96, 0, 0, 0, 0, 0]);
                });
            });
        });
        describe('int', function () {
            it('int 0x80', function() {
                var _ = code64();
                _._('int', 0x80);
                var bin = compile(_);
                expect(bin).to.eql([0xCD, 0x80]);
            });
            it('int 3', function() {
                var _ = code64();
                _._('int', 3);
                var bin = compile(_);
                expect(bin).to.eql([0xCC]);
            });
        });
        describe('loop', function () {
            it('loop rel8', function() { // e2 fe                	loop   4008c7 <loop>
                var _ = code64();
                var start = _.label('start');
                _._('loop', start);
                var bin = compile(_);
                expect(bin).to.eql([0xE2, 0xFE]);
            });
            it('loope rel8', function() { // e1 fe                	loope  4008c7 <loop>
                var _ = code64();
                var start = _.label('start');
                _._('loope', start);
                var bin = compile(_);
                expect(bin).to.eql([0xE1, 0xFE]);
            });
            it('loopne rel8', function() { // e0 fe                	loopne  4008c7 <loop>
                var _ = code64();
                var start = _.label('start');
                _._('loopne', start);
                var bin = compile(_);
                expect(bin).to.eql([0xE0, 0xFE]);
            });
        });
        describe('call', function () {
            it('call rel32', function () { // In 64-bit mode
                var _ = code64();
                var start = _.label('start');
                _._('call', start);
                var bin = compile(_);
                expect([0xE8, 0xFB, 0xFF, 0xFF, 0xFF]).to.eql(bin);
            });
        });
    });

    describe('Enter and Leave', function () {
        describe('enter', function () {
            it('enter 1, 2', function() { // c8 01 00 02          	enterq $0x1,$0x2
                var _ = code64();
                _._('enter', [1, 2]);
                var bin = compile(_);
                expect(bin).to.eql([0xC8, 1, 0, 2]);
            });
            it('enter -1, -2', function() { // c8 ff ff fe          	enterq $0xffff,$0xfe
                var _ = code64();
                _._('enter', [-1, -2]);
                var bin = compile(_);
                expect(bin).to.eql([0xC8, 0xFF, 0xFF, 0xFE]);
            });
        });
        describe('leave', function () {
            it('leaveq', function() { // c9                   	leaveq
                var _ = code64();
                _._('leave', [], 64);
                var bin = compile(_);
                expect(bin).to.eql([0xC9]);
            });
            it('leavew', function() { // 66 c9                	leavew
                var _ = code64();
                _._('leave', [], 16);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0xC9]);
            });
        });
    });

    describe('I/O', function () {
        describe('in', function () {
            it('in al, 5', function() { // e4 05                	in     $0x5,%al
                var _ = code64();
                _._('in', [al, 5]);
                var bin = compile(_);
                expect(bin).to.eql([0xE4, 5]);
            });
            it('in ax, 5', function() { // 66 e5 05             	in     $0x5,%ax
                var _ = code64();
                _._('in', [ax, 5]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0xE5, 5]);
            });
            it('in eax, 5', function() { // e5 05                	in     $0x5,%eax
                var _ = code64();
                _._('in', [eax, 5]);
                var bin = compile(_);
                expect(bin).to.eql([0xE5, 5]);
            });
            it('in al, dx', function() { // ec                   	in     (%dx),%al
                var _ = code64();
                _._('in', [al, dx]);
                var bin = compile(_);
                expect(bin).to.eql([0xEC]);
            });
            it('in ax, dx', function() { // 66 ed                	in     (%dx),%ax
                var _ = code64();
                _._('in', [ax, dx]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0xED]);
            });
            it('in eax, dx', function() { // ed                   	in     (%dx),%eax
                var _ = code64();
                _._('in', [eax, dx]);
                var bin = compile(_);
                expect(bin).to.eql([0xED]);
            });
        });
        describe('out', function () {
            it('out 5, al', function() { // e6 05                	out    %al,$0x5
                var _ = code64();
                _._('out', [5, al]);
                var bin = compile(_);
                expect(bin).to.eql([0xE6, 5]);
            });
            it('out 5, ax', function() { // 66 e7 05             	out    %ax,$0x5
                var _ = code64();
                _._('out', [5, ax]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0xE7, 5]);
            });
            it('out 5, eax', function() { // e7 05                	out    %eax,$0x5
                var _ = code64();
                _._('out', [5, eax]);
                var bin = compile(_);
                expect(bin).to.eql([0xE7, 5]);
            });
            it('out dx, al', function() { // ee                   	out    %al,(%dx)
                var _ = code64();
                _._('out', [dx, al], 8);
                var bin = compile(_);
                expect(bin).to.eql([0xEE]);
            });
            it('out dx, ax', function() { // 66 ef                	out    %ax,(%dx)
                var _ = code64();
                _._('out', [dx, ax]);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0xEF]);
            });
            it('out dx, eax', function() { // ef                   	out    %eax,(%dx)
                var _ = code64();
                _._('out', [dx, eax], 32);
                var bin = compile(_);
                expect(bin).to.eql([0xEF]);
            });
        });
        describe('ins', function () {
            it('insb', function() { // 6c                   	insb   (%dx),%es:(%rdi)
                var _ = code64();
                _._('ins', [], 8);
                var bin = compile(_);
                expect(bin).to.eql([0x6C]);
            });
            it('insw', function() { // 66 6d                	insw   (%dx),%es:(%rdi)
                var _ = code64();
                _._('ins', [], 16);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x6D]);
            });
            it('insd', function() { // 6d                   	insl   (%dx),%es:(%rdi)
                var _ = code64();
                _._('ins', [], 32);
                var bin = compile(_);
                expect(bin).to.eql([0x6D]);
            });
        });
        describe('outs', function () {
            it('outsb', function() { // 6e                   	outsb  %ds:(%rsi),(%dx)
                var _ = code64();
                _._('outs', [], 8);
                var bin = compile(_);
                expect(bin).to.eql([0x6E]);
            });
            it('outsw', function() { // 66 6f                	outsw  %ds:(%rsi),(%dx)
                var _ = code64();
                _._('outs', [], 16);
                var bin = compile(_);
                expect(bin).to.eql([0x66, 0x6F]);
            });
            it('outsd', function() { // 6f                   	outsl  %ds:(%rsi),(%dx)
                var _ = code64();
                _._('outs', [], 32);
                var bin = compile(_);
                expect(bin).to.eql([0x6F]);
            });
        });
    });

    describe('Flag Control', function () {
        it('stc', function() { // f9                   	stc
            var _ = code64();
            _._('stc');
            var bin = compile(_);
            expect(bin).to.eql([0xF9]);
        });
        it('clc', function() { // f8                   	clc
            var _ = code64();
            _._('clc');
            var bin = compile(_);
            expect(bin).to.eql([0xF8]);
        });
        it('cmc', function() { // f5                   	cmc
            var _ = code64();
            _._('cmc');
            var bin = compile(_);
            expect(bin).to.eql([0xF5]);
        });
        it('cld', function() { // fc                   	cld
            var _ = code64();
            _._('cld');
            var bin = compile(_);
            expect(bin).to.eql([0xFC]);
        });
        it('std', function() { // fd                   	std
            var _ = code64();
            _._('std');
            var bin = compile(_);
            expect(bin).to.eql([0xFD]);
        });
        it('pushf', function() { // 9c                   	pushfq
            var _ = code64();
            _._('pushf');
            var bin = compile(_);
            expect(bin).to.eql([0x9C]);
        });
        it('popf', function() { // 9d                   	popfq
            var _ = code64();
            _._('popf');
            var bin = compile(_);
            expect(bin).to.eql([0x9D]);
        });
        it('sti', function() { // fb                   	sti
            var _ = code64();
            _._('sti');
            var bin = compile(_);
            expect(bin).to.eql([0xFB]);
        });
        it('cli', function() { // fa                   	cli
            var _ = code64();
            _._('cli');
            var bin = compile(_);
            expect(bin).to.eql([0xFA]);
        });
    });

    describe('Random Number', function () {
        it('rdrand bx', function() { // 66 0f c7 f3          	rdrand %bx
            var _ = code64();
            _._('rdrand', bx);
            var bin = compile(_);
            expect(bin).to.eql([0x66, 0x0F, 0xC7, 0xF3]);
        });
        it('rdrand ebx', function() { // 0f c7 f3             	rdrand %ebx
            var _ = code64();
            _._('rdrand', ebx);
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0xC7, 0xF3]);
        });
        it('rdrand rbx', function() { // 48 0f c7 f3          	rdrand %rbx
            var _ = code64();
            _._('rdrand', rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x0F, 0xC7, 0xF3]);
        });
        it('rdseed bx', function() { // 66 0f c7 fb          	rdseed %bx
            var _ = code64();
            _._('rdseed', bx);
            var bin = compile(_);
            expect(bin).to.eql([0x66, 0x0F, 0xC7, 0xFB]);
        });
        it('rdseed ebx', function() { // 0f c7 fb             	rdseed %ebx
            var _ = code64();
            _._('rdseed', ebx);
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0xC7, 0xFB]);
        });
        it('rdseed rbx', function() { // 48 0f c7 fb          	rdseed %rbx
            var _ = code64();
            _._('rdseed', rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x0F, 0xC7, 0xFB]);
        });
    });

    describe('lea', function() {
        it('lea rax, [rax]', function() { // 400657:	48 8d 00             	lea    (%rax),%rax
            var _ = code64();
            _._('lea', [rax, rax.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x00]);
        });
        it('lea rbx, [rbx]', function() { // 40065a:	48 8d 1b             	lea    (%rbx),%rbx
            var _ = code64();
            _._('lea', [rbx, rbx.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x1B]);
        });
        it('lea eax, [rax]', function() { // 40065d:	8d 00                	lea    (%rax),%eax
            var _ = code64();
            _._('lea', [eax, rax.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x8D, 0x00]);
        });
        it('lea ax, [rax]', function() { // 40065f:	66 8d 00             	lea    (%rax),%ax
            var _ = code64();
            _._('lea', [ax, rax.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x66, 0x8D, 0x00]);
        });
        it('lea rax, [rip]', function() { // 400662:	48 8d 05 00 00 00 00 	lea    0x0(%rip),%rax        # 400669 <lea+0x12>
            var _ = code64();
            _._('lea', [rax, rip.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x05, 0x00, 0x00, 0x00, 0x00]);
        });
        it('lea rax, [rbx]', function() { // 400669:	48 8d 03             	lea    (%rbx),%rax
            var _ = code64();
            _._('lea', [rax, rbx.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x03]);
        });
        it('lea rax, [rsp]', function() { // 40066c:	48 8d 04 24          	lea    (%rsp),%rax
            var _ = code64();
            _._('lea', [rax, rsp.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x04, 0x24]);
        });
        it('lea rax, [rbp]', function() { // 400670:	48 8d 45 00          	lea    0x0(%rbp),%rax
            var _ = code64();
            _._('lea', [rax, rbp.ref()]);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8D, 0x45, 0x00]);
        });
        it('lea r8, [rip + 0x11]', function() { // 400674:	4c 8d 05 11 00 00 00 	lea    0x11(%rip),%r8        # 40068c <lea+0x35>
            var _ = code64();
            _._('lea', [r8, rip.disp(0x11)]);
            var bin = compile(_);
            // console.log(_.toString());
            expect(bin).to.eql([0x4C, 0x8D, 0x05, 0x11, 0, 0, 0]);
        });
        it('lea r9, [rip + 0x11223344]', function() { // 40067b:	4c 8d 0d 44 33 22 11 	lea    0x11223344(%rip),%r9
            var _ = code64();
            _._('lea', [r9, rip.disp(0x11223344)]);
            var bin = compile(_);
            expect(bin).to.eql([0x4C, 0x8D, 0x0D, 0x44, 0x33, 0x22, 0x11]);
        });
        it('lea r9, [rbx + rcx + 0x11]', function() { // 400682:	4c 8d 4c 0b 11       	lea    0x11(%rbx,%rcx,1),%r9
            var _ = code64();
            _._('lea', [r9, rbx.disp(0x11).ind(rcx)]);
            var bin = compile(_);
            expect(bin).to.eql([0x4C, 0x8D, 0x4C, 0x0B, 0x11]);
        });
        it('lea r9, [0x43]', function() { // 400687:	4c 8d 0c 25 43 00 00 00 	lea    0x43,%r9
            var _ = code64();
            _._('lea', [r9, _.mem(0x43)]);
            var bin = compile(_);
            expect(bin).to.eql([0x4C, 0x8D, 0x0C, 0x25, 0x43, 0, 0, 0]);
        });
    });

    describe('Data Transfer', function() {
        describe('cmpxchg', function () {
            it('cmpxchg rcx, rbx', function () { // 48 0f b1 d9          	cmpxchg %rbx,%rcx
                var _ = code64();
                _._('cmpxchg', [rcx, rbx]);
                var bin = compile(_);
                expect([0x48, 0x0F, 0xB1, 0xD9]).to.eql(bin);
            });
            it('cmpxchg [rcx], rbx', function () { // 48 0f b1 19          	cmpxchg %rbx,(%rcx)
                var _ = code64();
                _._('cmpxchg', [rcx.ref(), rbx]);
                var bin = compile(_);
                expect([0x48, 0x0F, 0xB1, 0x19]).to.eql(bin);
            });
            it('lock cmpxchg [rcx], rbx', function () { // f0 48 0f b1 19       	lock cmpxchg %rbx,(%rcx)
                var _ = code64();
                _.lock();
                _._('cmpxchg', [rcx.ref(), rbx]).lock();
                _.lock();
                var bin = compile(_);
                expect([0xF0, 0xF0, 0x48, 0x0F, 0xB1, 0x19, 0xF0]).to.eql(bin);
            });
        });
    });

    describe('x87', function() {
        it('fadd [rax]', function() { // d8 00                	fadds  (%rax)
            var _ = code64();
            _._('fadd', o.rax.ref());
            var bin = compile(_);
            expect([0xD8, 0x00]).to.eql(bin);
        });
        it('fadd %st(0), %st(0)', function() { // d8 c0                	fadd   %st(0),%st
            var _ = code64();
            _._('fadd', [o.st(0), o.st(0)]);
            var bin = compile(_);
            expect([0xD8, 0xC0]).to.eql(bin);
        });
        it('fadd %st(0), %st(1)', function() { // d8 c1                	fadd   %st(1),%st
            var _ = code64();
            _._('fadd', [o.st(0), o.st(1)]);
            var bin = compile(_);
            expect([0xD8, 0xC1]).to.eql(bin);
        });
    });

    describe('AVX', function() {
        describe('addps', function() {
            it('addps xmm2, xmm1', function() { // 0f 58 d1             	addps  %xmm1,%xmm2
                var _ = code64();
                _._('addps', [o.xmm(2), o.xmm(1)]);
                var bin = compile(_);
                expect([0x0F, 0x58, 0xD1]).to.eql(bin);
            });
            it('vaddps xmm3, xmm2, xmm1', function() { // c5 e8 58 d9          	vaddps %xmm1,%xmm2,%xmm3
                var _ = code64();
                _._('vaddps', [o.xmm(3), o.xmm(2), o.xmm(1)]);
                var bin = compile(_);
                expect([0xc5, 0xe8, 0x58, 0xD9]).to.eql(bin);
            });
            it('vaddps xmm2, xmm1, [rax]', function() { // c5 f0 58 10          	vaddps (%rax),%xmm1,%xmm2
                var _ = code64();
                _._('vaddps', [o.xmm(2), o.xmm(1), o.rax.ref()]);
                var bin = compile(_);
                expect([0xc5, 0xF0, 0x58, 0x10]).to.eql(bin);
            });
            it('vaddps ymm12, ymm11, ymm10', function() { // c4 41 24 58 e2       	vaddps %ymm10,%ymm11,%ymm12
                var _ = code64();
                _._('vaddps', [o.ymm(12), o.ymm(11), o.ymm(10)]);
                var bin = compile(_);
                expect([0xc4, 0x41, 0x24, 0x58, 0xe2]).to.eql(bin);
            });
            it('vaddps zmm20, zmm20, zmm20', function() { // 62 a1 5c 40 58 e4    	vaddps %zmm20,%zmm20,%zmm20
                var _ = code64();
                _._('vaddps', [o.zmm(20), o.zmm(20), o.zmm(20)]);
                var bin = compile(_);
                expect([0x62, 0xA1, 0x5C, 0x40, 0x58, 0xE4]).to.eql(bin);
            });
            it('vaddps zmm22, zmm21, zmm20', function() { // 62 a1 54 40 58 f4    	vaddps %zmm20,%zmm21,%zmm22
                var _ = code64();
                _._('vaddps', [o.zmm(22), o.zmm(21), o.zmm(20)]);
                var bin = compile(_);
                expect([0x62, 0xA1, 0x54, 0x40, 0x58, 0xF4]).to.eql(bin);
            });
        });
        describe('divsd', function() {
            it('divsd xmm1, xmm2', function() { // f2 0f 5e ca          	divsd  %xmm2,%xmm1
                var _ = code64();
                _._('divsd', [o.xmm(1), o.xmm(2)]);
                var bin = compile(_);
                expect([0xF2, 0x0F, 0x5E, 0xCA]).to.eql(bin);
            });
            it('vdivsd xmm1, xmm2, xmm3', function() { // c5 eb 5e cb          	vdivsd %xmm3,%xmm2,%xmm1
                var _ = code64();
                _._('vdivsd', [o.xmm(1), o.xmm(2), o.xmm(3)]);
                var bin = compile(_);
                expect([0xC5, 0xEB, 0x5E, 0xCB]).to.eql(bin);
            });
            it('vdivsd xmm1 {k1} {z}, xmm2, xmm3', function() { // 62 f1 ef 89 5e cb    	vdivsd %xmm3,%xmm2,%xmm1{%k1}{z}
                var _ = code64();
                _._('vdivsd', [o.xmm(1), o.xmm(2), o.xmm(3)], {mask: o.k(1), z: 1});
                var bin = compile(_);
                expect([0x62, 0xF1, 0xEF, 0x89, 0x5E, 0xCB]).to.eql(bin);
            });
            it('vdivsd xmm13 {k7}, xmm14, xmm15', function() { // 62 51 8f 0f 5e ef    	vdivsd %xmm15,%xmm14,%xmm13{%k7}
                var _ = code64();
                _._('vdivsd', [o.xmm(13), o.xmm(14), o.xmm(15)], {mask: o.k(7)});
                var bin = compile(_);
                expect([0x62, 0x51, 0x8F, 0x0F, 0x5E, 0xEF]).to.eql(bin);
            });
        });
    });
});
