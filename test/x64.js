"use strict";
var chai_1 = require('chai');
var operand_1 = require('../x86/operand');
var o = require('../x86/operand');
var code_1 = require('../x86/x64/code');
describe('x64', function () {
    function code64() {
        return new code_1.Code;
    }
    function compile(code) {
        return code.compile();
    }
    describe('data', function () {
        describe('db', function () {
            it('octets', function () {
                var _ = code64();
                var data = [1, 2, 3];
                _.db(data);
                chai_1.expect(compile(_)).to.eql(data);
            });
            it('buffer', function () {
                var _ = code64();
                var data = [1, 2, 3];
                _.db(new Buffer(data));
                chai_1.expect(compile(_)).to.eql(data);
            });
            it('string', function () {
                var _ = code64();
                var str = 'Hello World!\n';
                _.db(str);
                var bin = compile(_);
                chai_1.expect(bin.length).to.be.equal(str.length);
                chai_1.expect(bin).to.eql([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 10]);
            });
        });
        describe('incbin', function () {
            it('.incbin(filepath)', function () {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt');
                chai_1.expect(ins.octets).to.eql([49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });
            it('.incbin(filepath, offset)', function () {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt', 3);
                chai_1.expect(ins.octets).to.eql([52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });
            it('.incbin(filepath, offset, length)', function () {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt', 3, 3);
                chai_1.expect(ins.octets).to.eql([52, 53, 54]);
            });
        });
    });
    describe('system', function () {
        it('syscall', function () {
            var _ = code64();
            _._('syscall');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0x05]);
        });
        it('sysenter', function () {
            var _ = code64();
            _._('sysenter');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0x34]);
        });
        it('sysexit', function () {
            var _ = code64();
            _._('sysexit');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0x35]);
        });
    });
    describe('mov', function () {
        it('movq rax, rax', function () {
            var _ = code64();
            _._('mov', [operand_1.rax, operand_1.rax], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0xc0]);
        });
        it('movq rbx, rax', function () {
            var _ = code64();
            _._('mov', [operand_1.rbx, operand_1.rax], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0xc3]);
        });
        it('movq [rax], rax', function () {
            var _ = code64();
            _._('mov', [operand_1.rax.ref(), operand_1.rax], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rax], rax', function () {
            var _ = code64();
            _._('mov', [operand_1.rax.ref(), operand_1.rax], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rcx], rbx', function () {
            var _ = code64();
            _._('mov', [operand_1.rcx.ref(), operand_1.rbx], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x19]);
        });
        it('movq rdx, [rbx]', function () {
            var _ = code64();
            _._('mov', [operand_1.rdx, operand_1.rbx.ref()], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x13]);
        });
        it('movq r9, r8', function () {
            var _ = code64();
            _._('mov', [operand_1.r9, operand_1.r8], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4D, 0x89, 0xC1]);
        });
        it('movq [r11], r10', function () {
            var _ = code64();
            _._('mov', [operand_1.r11.ref(), operand_1.r10], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4D, 0x89, 0x13]);
        });
        it('movq r13, [r12]', function () {
            var _ = code64();
            _._('mov', [operand_1.r13, operand_1.r12.ref()], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4D, 0x8B, 0x2C, 0x24]);
        });
        it('movq rcx, [rbx + 0x11]', function () {
            var _ = code64();
            _._('mov', [operand_1.rcx, operand_1.rbx.disp(0x11)], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x4B, 0x11]);
        });
        it('movq rsi, [rcx + rdx]', function () {
            var _ = code64();
            _._('mov', [operand_1.rsi, operand_1.rcx.ref().ind(operand_1.rdx, 1)], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x34, 0x11]);
        });
        it('movq rcx, [rax + rbx * 4 + 0x1234]', function () {
            var _ = code64();
            _._('mov', [operand_1.rcx, operand_1.rax.ref().ind(operand_1.rbx, 4).disp(0x1234)], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x8C, 0x98, 0x34, 0x12, 0x00, 0x00]);
        });
        it('movq rbp, [0x1]', function () {
            var _ = code64();
            _._('mov', [operand_1.rbp, _.mem(0x1)], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq rsp, [0x1]', function () {
            var _ = code64();
            _._('mov', [operand_1.rsp, _.mem(0x1)], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x24, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq [rsp], rbx', function () {
            var _ = code64();
            _._('mov', [operand_1.rsp.ref(), operand_1.rbx], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x1C, 0x24]);
        });
        it('movq rsp, rbx', function () {
            var _ = code64();
            _._('mov', [operand_1.rsp, operand_1.rbx], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0xDC]);
        });
        it('movq [rbp], rbx', function () {
            var _ = code64();
            _._('mov', [operand_1.rbp.ref(), operand_1.rbx], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x5D, 0x00]);
        });
        it('movq [rsp + rbp * 2], rbx', function () {
            var _ = code64();
            _._('mov', [operand_1.rsp.ref().ind(operand_1.rbp, 2), operand_1.rbx], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x1C, 0x6C]);
        });
        it('movq rbx, [rbp + rax * 8]', function () {
            var _ = code64();
            _._('mov', [operand_1.rbx, operand_1.rbp.ref().ind(operand_1.rax, 8)], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x5C, 0xC5, 0x00]);
        });
        it('movq rbp, [rdx * 2]', function () {
            var _ = code64();
            _._('mov', [operand_1.rbp, operand_1.rdx.ind(2)], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x55, 0x00, 0x00, 0x00, 0x00]);
        });
        it('movq [rbp * 8 + -0x123], rsp', function () {
            var _ = code64();
            _._('mov', [operand_1.rbp.ind(8).disp(-0x123), operand_1.rsp], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x24, 0xED, 0xDD, 0xFE, 0xFF, 0xFF]);
        });
        it('movq rax, 0x1', function () {
            var _ = code64();
            _._('mov', [operand_1.rax, 0x1], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq rax, 0x1', function () {
            var _ = code64();
            _._('mov', [operand_1.rbp, -0x3333], 64);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0xC7, 0xC5, 0xCD, 0xCC, 0xFF, 0xFF]);
        });
    });
    describe('Binary Arithmetic', function () {
        describe('adcx', function () {
            it('adcx rcx, rbx', function () {
                var _ = code64();
                _._('adcx', [operand_1.rcx, operand_1.rbx]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x48, 0x0F, 0x38, 0xF6, 0xCB]);
            });
            it('adcx rax, rax', function () {
                var _ = code64();
                _._('adcx', [operand_1.rax, operand_1.rax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x48, 0x0F, 0x38, 0xF6, 0xC0]);
            });
        });
        describe('adox', function () {
            it('adox r12, r9', function () {
                var _ = code64();
                _._('adox', [operand_1.r12, operand_1.r9]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xF3, 0x4D, 0x0F, 0x38, 0xF6, 0xE1]);
            });
        });
        describe('add', function () {
            it('add rax, 0x19', function () {
                var _ = code64();
                _._('add', [operand_1.rax, 0x19]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x83, 0xC0, 0x19]);
            });
            it('add rax, rax', function () {
                var _ = code64();
                _._('add', [operand_1.rax, operand_1.rax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x01, 0xC0]);
            });
            it('add rbx, rsp', function () {
                var _ = code64();
                _._('add', [operand_1.rbx, operand_1.rsp]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x01, 0xE3]);
            });
            it('add rcx, [rbx]', function () {
                var _ = code64();
                _._('add', [operand_1.rcx, operand_1.rbx.ref()]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x03, 0x0B]);
            });
            it('add rcx, [rcx + rdx]', function () {
                var _ = code64();
                _._('add', [operand_1.rcx, operand_1.rcx.ref().ind(operand_1.rdx)]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x03, 0x0C, 0x11]);
            });
            it('add rcx, [rcx + rbp * 4]', function () {
                var _ = code64();
                _._('add', [operand_1.rcx, operand_1.rcx.ref().ind(operand_1.rbp, 4)]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x03, 0x0C, 0xA9]);
            });
            it('add rcx, [rsp + rbp * 4 + 0x11]', function () {
                var _ = code64();
                _._('add', [operand_1.rcx, operand_1.rsp.ref().ind(operand_1.rbp, 4).disp(0x11)]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x03, 0x4C, 0xAC, 0x11]);
            });
            it('add rcx, [rsp + rbp * 4 + -0x11223344]', function () {
                var _ = code64();
                _._('add', [operand_1.rcx, operand_1.rsp.ref().ind(operand_1.rbp, 4).disp(-0x11223344)]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x03, 0x8C, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
            });
            it('add [rsp + rbp * 4 + -0x11223344], rax', function () {
                var _ = code64();
                _._('add', [operand_1.rsp.ref().ind(operand_1.rbp, 4).disp(-0x11223344), operand_1.rax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x01, 0x84, 0xAC, 0xBC, 0xCC, 0xDD, 0xEE]);
            });
            it('add rbx, 1', function () {
                var _ = code64();
                _._('add', [operand_1.rbx, 1]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x83, 0xC3, 0x01]);
            });
            it('add rbx, [1]', function () {
                var _ = code64();
                _._('add', [operand_1.rbx, _.mem(1)]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x03, 0x1C, 0x25, 0x01, 0, 0, 0]);
            });
            it('add [1], rbx', function () {
                var _ = code64();
                _._('add', [_.mem(1), operand_1.rbx]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x01, 0x1C, 0x25, 0x01, 0, 0, 0]);
            });
            it('add al, 0x11', function () {
                var _ = code64();
                _._('add', [operand_1.al, 0x11]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x04, 0x11]);
            });
            it('add ax, 0x1122', function () {
                var _ = code64();
                _._('add', [operand_1.ax, 0x1122]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x05, 0x22, 0x11]);
            });
            it('add eax, 0x11223344', function () {
                var _ = code64();
                _._('add', [operand_1.eax, 0x11223344]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x05, 0x44, 0x33, 0x22, 0x11]);
            });
            it('add rax, -0x11223344', function () {
                var _ = code64();
                _._('add', [operand_1.rax, -0x11223344]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x05, 0xbc, 0xcc, 0xdd, 0xee]);
            });
            it('add bl, 0x22', function () {
                var _ = code64();
                _._('add', [operand_1.bl, 0x22]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x80, 0xc3, 0x22]);
            });
            it('add ah, 0x22', function () {
                var _ = code64();
                _._('add', [operand_1.ah, 0x22]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x80, 0xc4, 0x22]);
            });
            it('add bx, 0x1122', function () {
                var _ = code64();
                _._('add', [operand_1.bx, 0x1122]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x81, 0xC3, 0x22, 0x11]);
            });
            it('add bx, 0x11', function () {
                var _ = code64();
                _._('add', [operand_1.bx, 0x11]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x83, 0xC3, 0x11]);
            });
            it('add ebx, 0x1122', function () {
                var _ = code64();
                _._('add', [operand_1.ebx, 0x1122]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x81, 0xC3, 0x22, 0x11, 0, 0]);
            });
            it('add ch, 0x22', function () {
                var _ = code64();
                _._('add', [operand_1.ch, 0x22]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x80, 0xC5, 0x22]);
            });
            it('add dil, 0x22', function () {
                var _ = code64();
                _._('add', [operand_1.dil, 0x22]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x40, 0x80, 0xC7, 0x22]);
            });
            it('add bpl, 0x22', function () {
                var _ = code64();
                _._('add', [operand_1.bpl, 0x22]);
                ;
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x40, 0x80, 0xC5, 0x22]);
            });
            it('add spl, 0x22', function () {
                var _ = code64();
                _._('add', [operand_1.spl, 0x22]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x40, 0x80, 0xC4, 0x22]);
            });
            it('add r8b, 0x22', function () {
                var _ = code64();
                _._('add', [operand_1.r8b, 0x22]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x41, 0x80, 0xC0, 0x22]);
            });
            it('add esp, 0x12', function () {
                var _ = code64();
                _._('add', [operand_1.esp, 0x12]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x83, 0xC4, 0x12]);
            });
            it('add dl, cl', function () {
                var _ = code64();
                _._('add', [operand_1.dl, operand_1.cl]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x00, 0xCA]);
            });
            it('add bx, ax', function () {
                var _ = code64();
                _._('add', [operand_1.bx, operand_1.ax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x01, 0xC3]);
            });
            it('add ecx, eax', function () {
                var _ = code64();
                _._('add', [operand_1.ecx, operand_1.eax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x01, 0xC1]);
            });
        });
        describe('adc', function () {
            it('adc [rbx + rcx * 4 + 0x11], rax', function () {
                var _ = code64();
                _._('adc', [operand_1.rbx.ref().ind(operand_1.rcx, 4).disp(0x11), operand_1.rax]);
                chai_1.expect(compile(_)).to.eql([0x48, 0x11, 0x44, 0x8B, 0x11]);
            });
        });
        describe('mul', function () {
            it('mul al', function () {
                var _ = code64();
                _._('mul', operand_1.al);
                chai_1.expect(compile(_)).to.eql([0xf6, 0xe0]);
            });
            it('mul ax', function () {
                var _ = code64();
                _._('mul', operand_1.ax);
                chai_1.expect(compile(_)).to.eql([0x66, 0xf7, 0xe0]);
            });
            it('mul eax', function () {
                var _ = code64();
                _._('mul', operand_1.eax);
                chai_1.expect(compile(_)).to.eql([0xf7, 0xe0]);
            });
            it('mul rax', function () {
                var _ = code64();
                _._('mul', operand_1.rax);
                chai_1.expect(compile(_)).to.eql([0x48, 0xf7, 0xe0]);
            });
            it('mulq [rax]', function () {
                var _ = code64();
                _._('mul', operand_1.rax.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xf7, 0x20]);
            });
            it('mulq [eax]', function () {
                var _ = code64();
                _._('mul', operand_1.eax.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x67, 0x48, 0xf7, 0x20]);
            });
            it('muld [rax]', function () {
                var _ = code64();
                _._('mul', operand_1.rax.ref(), 32);
                chai_1.expect(compile(_)).to.eql([0xf7, 0x20]);
            });
            it('muld [eax]', function () {
                var _ = code64();
                _._('mul', operand_1.eax.ref(), 32);
                chai_1.expect(compile(_)).to.eql([0x67, 0xf7, 0x20]);
            });
            it('mulw [rax]', function () {
                var _ = code64();
                _._('mul', operand_1.rax.ref(), 16);
                chai_1.expect(compile(_)).to.eql([0x66, 0xf7, 0x20]);
            });
            it('mulw [eax]', function () {
                var _ = code64();
                _._('mul', operand_1.eax.ref(), 16);
                chai_1.expect(compile(_)).to.eql([0x67, 0x66, 0xf7, 0x20]);
            });
            it('mulb [rax]', function () {
                var _ = code64();
                _._('mul', operand_1.rax.ref(), 8);
                chai_1.expect(compile(_)).to.eql([0xf6, 0x20]);
            });
            it('mulb [eax]', function () {
                var _ = code64();
                _._('mul', operand_1.eax.ref(), 8);
                chai_1.expect(compile(_)).to.eql([0x67, 0xf6, 0x20]);
            });
        });
        describe('div', function () {
            it('div bl', function () {
                var _ = code64();
                _._('div', operand_1.bl);
                chai_1.expect(compile(_)).to.eql([0xf6, 0xF3]);
            });
            it('div bx', function () {
                var _ = code64();
                _._('div', operand_1.bx);
                chai_1.expect(compile(_)).to.eql([0x66, 0xf7, 0xF3]);
            });
            it('div ebx', function () {
                var _ = code64();
                _._('div', operand_1.ebx);
                chai_1.expect(compile(_)).to.eql([0xf7, 0xF3]);
            });
            it('div rbx', function () {
                var _ = code64();
                _._('div', operand_1.rbx);
                chai_1.expect(compile(_)).to.eql([0x48, 0xf7, 0xF3]);
            });
        });
        describe('inc', function () {
            it('incq rbx', function () {
                var _ = code64();
                _._('inc', operand_1.rbx, 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0xc3]);
            });
            it('incq [rax]', function () {
                var _ = code64();
                _._('inc', operand_1.rax.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x00]);
            });
            it('incq [rbx]', function () {
                var _ = code64();
                _._('inc', operand_1.rbx.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x03]);
            });
            it('incq [rbx + rcx]', function () {
                var _ = code64();
                _._('inc', operand_1.rbx.ref().ind(operand_1.rcx), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x0b]);
            });
            it('incq [rbx + rcx * 8]', function () {
                var _ = code64();
                _._('inc', operand_1.rbx.ref().ind(operand_1.rcx, 8), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0xcb]);
            });
            it('incq [rax + rbx * 8 + 0x11]', function () {
                var _ = code64();
                _._('inc', operand_1.rax.ref().ind(operand_1.rbx, 8).disp(0x11), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xd8, 0x11]);
            });
            it('incq [rax + rbx * 8 + -0x11223344]', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.rax.ref().ind(operand_1.rbx, 8).disp(-0x11223344), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x84, 0xd8, 0xbc, 0xcc, 0xdd, 0xee]);
            });
            it('incq [rbx + r15 * 8 + -0x123]', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.rbx.ref().ind(operand_1.r15, 8).disp(-0x123), 64);
                chai_1.expect(compile(_)).to.eql([0x4a, 0xff, 0x84, 0xfb, 0xdd, 0xfe, 0xff, 0xff]);
            });
            it('incq [rbp + rbp * 8]', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.rbp.ref().ind(operand_1.rbp, 8), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xed, 0x00]);
            });
            it('incq [rbp]', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.rbp.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x45, 0x00]);
            });
            it('incq [rsp]', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.rsp.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x24]);
            });
            it('incq [r12]', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.r12.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x49, 0xff, 0x04, 0x24]);
            });
            it('incq [r13]', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.r13.ref(), 64);
                chai_1.expect(compile(_)).to.eql([0x49, 0xff, 0x45, 0x00]);
            });
            it('incq r15', function () {
                var _ = code64();
                var ins = _._('inc', operand_1.r15, 64);
                chai_1.expect(compile(_)).to.eql([0x49, 0xff, 0xc7]);
            });
            it('incq [0x11]', function () {
                var _ = code64();
                var ins = _._('inc', _.mem(0x11), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x11, 0x00, 0x00, 0x00]);
            });
            it('incq [0x11223344]', function () {
                var _ = code64();
                var ins = _._('inc', _.mem(0x11223344), 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x44, 0x33, 0x22, 0x11]);
            });
        });
        describe('dec', function () {
            it('decq rbx', function () {
                var _ = code64();
                _._('dec', operand_1.rax, 64);
                chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0xc8]);
            });
            it('dec r10b', function () {
                var _ = code64();
                _._('dec', operand_1.r10b);
                chai_1.expect(compile(_)).to.eql([0x41, 0xFE, 0xCA]);
            });
            it('dec ax', function () {
                var _ = code64();
                _._('dec', operand_1.ax);
                chai_1.expect(compile(_)).to.eql([0x66, 0xFF, 0xC8]);
            });
            it('dec eax', function () {
                var _ = code64();
                _._('dec', operand_1.eax);
                chai_1.expect(compile(_)).to.eql([0xFF, 0xC8]);
            });
            it('dec rax', function () {
                var _ = code64();
                _._('dec', operand_1.rax);
                chai_1.expect(compile(_)).to.eql([0x48, 0xFF, 0xC8]);
            });
        });
        describe('neg', function () {
            it('neg al', function () {
                var _ = code64();
                _._('neg', operand_1.al);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xF6, 0xD8]);
            });
            it('neg dil', function () {
                var _ = code64();
                _._('neg', operand_1.dil);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x40, 0xF6, 0xDF]);
            });
            it('neg bx', function () {
                var _ = code64();
                _._('neg', operand_1.bx);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0xF7, 0xDB]);
            });
            it('neg ecx', function () {
                var _ = code64();
                _._('neg', operand_1.ecx);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xF7, 0xD9]);
            });
            it('neg rdx', function () {
                var _ = code64();
                _._('neg', operand_1.rdx);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0xF7, 0xDA]);
            });
        });
        describe('cmp', function () {
            it('cmp al, 0x11', function () {
                var _ = code64();
                _._('cmp', [operand_1.al, 0x11]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x3C, 0x11]);
            });
            it('cmp ax, 0x1122', function () {
                var _ = code64();
                _._('cmp', [operand_1.ax, 0x1122]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x3D, 0x22, 0x11]);
            });
            it('cmp eax, 0x11223344', function () {
                var _ = code64();
                _._('cmp', [operand_1.eax, 0x11223344]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x3D, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp rax, 0x11223344', function () {
                var _ = code64();
                _._('cmp', [operand_1.rax, 0x11223344]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x3D, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp bl, 0x11', function () {
                var _ = code64();
                _._('cmp', [operand_1.bl, 0x11]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x80, 0xFB, 0x11]);
            });
            it('cmp bx, 0x1122', function () {
                var _ = code64();
                _._('cmp', [operand_1.bx, 0x1122]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x81, 0xFB, 0x22, 0x11]);
            });
            it('cmp ebx, 0x11223344', function () {
                var _ = code64();
                _._('cmp', [operand_1.ebx, 0x11223344]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x81, 0xFB, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp rbx, 0x11223344', function () {
                var _ = code64();
                _._('cmp', [operand_1.rbx, 0x11223344]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x81, 0xFB, 0x44, 0x33, 0x22, 0x11]);
            });
            it('cmp cx, 0x11', function () {
                var _ = code64();
                _._('cmp', [operand_1.cx, 0x11]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x83, 0xF9, 0x11]);
            });
            it('cmp ecx, 0x11', function () {
                var _ = code64();
                _._('cmp', [operand_1.ecx, 0x11]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x83, 0xF9, 0x11]);
            });
            it('cmp rcx, 0x11', function () {
                var _ = code64();
                _._('cmp', [operand_1.rcx, 0x11]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x83, 0xF9, 0x11]);
            });
            it('cmp al, bl', function () {
                var _ = code64();
                _._('cmp', [operand_1.al, operand_1.bl]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x38, 0xD8]);
            });
            it('cmp ax, bx', function () {
                var _ = code64();
                _._('cmp', [operand_1.ax, operand_1.bx]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x39, 0xD8]);
            });
            it('cmp ebx, eax', function () {
                var _ = code64();
                _._('cmp', [operand_1.ebx, operand_1.eax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x39, 0xC3]);
            });
            it('cmp rbx, rax', function () {
                var _ = code64();
                _._('cmp', [operand_1.rbx, operand_1.rax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x48, 0x39, 0xC3]);
            });
        });
    });
    describe('Control Transfer', function () {
        describe('jmp', function () {
            it('jmp rel8', function () {
                var _ = code64();
                var lbl = _.label('test');
                _._('jmp', lbl);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xEB, 0xFE]);
            });
            it('jmp rel32', function () {
                var _ = code64();
                var lbl = _.lbl('test');
                _._('jmp', lbl);
                _.db(0, 150);
                _.insert(lbl);
                var bin = compile(_);
                bin = bin.splice(0, 8);
                chai_1.expect(bin).to.eql([0xE9, 0x96, 0, 0, 0, 0, 0, 0]);
            });
            it('jmp rax', function () {
                var _ = code64();
                _._('jmp', operand_1.rax);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0xE0]);
            });
            it('jmp rbx', function () {
                var _ = code64();
                _._('jmp', operand_1.rbx);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0xE3]);
            });
            it('jmpq [rcx + rbx]', function () {
                var _ = code64();
                _._('jmp', operand_1.rcx.ref().ind(operand_1.rbx), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0x24, 0x19]);
            });
            it('jmpq 0x11223344', function () {
                var _ = code64();
                _._('jmp', _.mem(0x11223344), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0x24, 0x25, 0x44, 0x33, 0x22, 0x11]);
            });
        });
        describe('ljmp', function () {
            it('ljmpq 0x11223344', function () {
                var _ = code64();
                _._('ljmp', _.mem(0x11223344), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0x2C, 0x25, 0x44, 0x33, 0x22, 0x11]);
            });
            it('ljmp [rip + 0x11]', function () {
                var _ = code64();
                _._('ljmp', operand_1.rip.disp(0x11), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0x2D, 0x11, 0, 0, 0]);
            });
            it('ljmp [rax + 0x11]', function () {
                var _ = code64();
                _._('ljmp', operand_1.rax.disp(0x11), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0x68, 0x11]);
            });
            it('ljmp [eax]', function () {
                var _ = code64();
                _._('ljmp', operand_1.eax.ref(), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x67, 0xFF, 0x28]);
            });
            it('ljmp [rax]', function () {
                var _ = code64();
                _._('ljmp', operand_1.rax.ref(), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0x28]);
            });
            it('ljmp [rax + rbx]', function () {
                var _ = code64();
                _._('ljmp', operand_1.rax.ref().ind(operand_1.rbx), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xFF, 0x2C, 0x18]);
            });
            it('ljmp [r15 + 0x11]', function () {
                var _ = code64();
                _._('ljmp', operand_1.r15.disp(0x11), 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x41, 0xFF, 0x6F, 0x11]);
            });
        });
        describe('jcc', function () {
            describe('ja', function () {
                it('ja rel8', function () {
                    var _ = code64();
                    var lbl = _.label('test');
                    _._('ja', lbl);
                    var bin = compile(_);
                    chai_1.expect(bin).to.eql([0x77, 0xFE]);
                });
                it('ja rel32', function () {
                    var _ = code64();
                    var lbl = _.lbl('test');
                    _._('ja', lbl);
                    _.db(0, 150);
                    _.insert(lbl);
                    var bin = compile(_);
                    bin = bin.splice(0, 8);
                    chai_1.expect(bin).to.eql([0x0F, 0x87, 0x96, 0, 0, 0, 0, 0]);
                });
            });
            describe('jae', function () {
                it('jae rel8', function () {
                    var _ = code64();
                    var lbl = _.label('test');
                    _._('jae', lbl);
                    var bin = compile(_);
                    chai_1.expect(bin).to.eql([0x73, 0xFE]);
                });
                it('jae rel32', function () {
                    var _ = code64();
                    var lbl = _.lbl('test');
                    _._('jae', lbl);
                    _.db(0, 150);
                    _.insert(lbl);
                    var bin = compile(_);
                    bin = bin.splice(0, 8);
                    chai_1.expect(bin).to.eql([0x0F, 0x83, 0x96, 0, 0, 0, 0, 0]);
                });
            });
        });
        describe('int', function () {
            it('int 0x80', function () {
                var _ = code64();
                _._('int', 0x80);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xCD, 0x80]);
            });
            it('int 3', function () {
                var _ = code64();
                _._('int', 3);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xCC]);
            });
        });
        describe('loop', function () {
            it('loop rel8', function () {
                var _ = code64();
                var start = _.label('start');
                _._('loop', start);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xE2, 0xFE]);
            });
            it('loope rel8', function () {
                var _ = code64();
                var start = _.label('start');
                _._('loope', start);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xE1, 0xFE]);
            });
            it('loopne rel8', function () {
                var _ = code64();
                var start = _.label('start');
                _._('loopne', start);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xE0, 0xFE]);
            });
        });
    });
    describe('Enter and Leave', function () {
        describe('enter', function () {
            it('enter 1, 2', function () {
                var _ = code64();
                _._('enter', [1, 2]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xC8, 1, 0, 2]);
            });
            it('enter -1, -2', function () {
                var _ = code64();
                _._('enter', [-1, -2]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xC8, 0xFF, 0xFF, 0xFE]);
            });
        });
        describe('leave', function () {
            it('leaveq', function () {
                var _ = code64();
                _._('leave', [], 64);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xC9]);
            });
            it('leavew', function () {
                var _ = code64();
                _._('leave', [], 16);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0xC9]);
            });
        });
    });
    describe('I/O', function () {
        describe('in', function () {
            it('in al, 5', function () {
                var _ = code64();
                _._('in', [operand_1.al, 5]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xE4, 5]);
            });
            it('in ax, 5', function () {
                var _ = code64();
                _._('in', [operand_1.ax, 5]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0xE5, 5]);
            });
            it('in eax, 5', function () {
                var _ = code64();
                _._('in', [operand_1.eax, 5]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xE5, 5]);
            });
            it('in al, dx', function () {
                var _ = code64();
                _._('in', [operand_1.al, operand_1.dx]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xEC]);
            });
            it('in ax, dx', function () {
                var _ = code64();
                _._('in', [operand_1.ax, operand_1.dx]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0xED]);
            });
            it('in eax, dx', function () {
                var _ = code64();
                _._('in', [operand_1.eax, operand_1.dx]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xED]);
            });
        });
        describe('out', function () {
            it('out 5, al', function () {
                var _ = code64();
                _._('out', [5, operand_1.al]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xE6, 5]);
            });
            it('out 5, ax', function () {
                var _ = code64();
                _._('out', [5, operand_1.ax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0xE7, 5]);
            });
            it('out 5, eax', function () {
                var _ = code64();
                _._('out', [5, operand_1.eax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xE7, 5]);
            });
            it('out dx, al', function () {
                var _ = code64();
                _._('out', [operand_1.dx, operand_1.al], 8);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xEE]);
            });
            it('out dx, ax', function () {
                var _ = code64();
                _._('out', [operand_1.dx, operand_1.ax]);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0xEF]);
            });
            it('out dx, eax', function () {
                var _ = code64();
                _._('out', [operand_1.dx, operand_1.eax], 32);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0xEF]);
            });
        });
        describe('ins', function () {
            it('insb', function () {
                var _ = code64();
                _._('ins', [], 8);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x6C]);
            });
            it('insw', function () {
                var _ = code64();
                _._('ins', [], 16);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x6D]);
            });
            it('insd', function () {
                var _ = code64();
                _._('ins', [], 32);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x6D]);
            });
        });
        describe('outs', function () {
            it('outsb', function () {
                var _ = code64();
                _._('outs', [], 8);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x6E]);
            });
            it('outsw', function () {
                var _ = code64();
                _._('outs', [], 16);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x66, 0x6F]);
            });
            it('outsd', function () {
                var _ = code64();
                _._('outs', [], 32);
                var bin = compile(_);
                chai_1.expect(bin).to.eql([0x6F]);
            });
        });
    });
    describe('Flag Control', function () {
        it('stc', function () {
            var _ = code64();
            _._('stc');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xF9]);
        });
        it('clc', function () {
            var _ = code64();
            _._('clc');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xF8]);
        });
        it('cmc', function () {
            var _ = code64();
            _._('cmc');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xF5]);
        });
        it('cld', function () {
            var _ = code64();
            _._('cld');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xFC]);
        });
        it('std', function () {
            var _ = code64();
            _._('std');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xFD]);
        });
        it('pushf', function () {
            var _ = code64();
            _._('pushf');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x9C]);
        });
        it('popf', function () {
            var _ = code64();
            _._('popf');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x9D]);
        });
        it('sti', function () {
            var _ = code64();
            _._('sti');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xFB]);
        });
        it('cli', function () {
            var _ = code64();
            _._('cli');
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xFA]);
        });
    });
    describe('Random Number', function () {
        it('rdrand bx', function () {
            var _ = code64();
            _._('rdrand', operand_1.bx);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x66, 0x0F, 0xC7, 0xF3]);
        });
        it('rdrand ebx', function () {
            var _ = code64();
            _._('rdrand', operand_1.ebx);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0xC7, 0xF3]);
        });
        it('rdrand rbx', function () {
            var _ = code64();
            _._('rdrand', operand_1.rbx);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x0F, 0xC7, 0xF3]);
        });
        it('rdseed bx', function () {
            var _ = code64();
            _._('rdseed', operand_1.bx);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x66, 0x0F, 0xC7, 0xFB]);
        });
        it('rdseed ebx', function () {
            var _ = code64();
            _._('rdseed', operand_1.ebx);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0xC7, 0xFB]);
        });
        it('rdseed rbx', function () {
            var _ = code64();
            _._('rdseed', operand_1.rbx);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x0F, 0xC7, 0xFB]);
        });
    });
    describe('lea', function () {
        it('lea rax, [rax]', function () {
            var _ = code64();
            _._('lea', [operand_1.rax, operand_1.rax.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8D, 0x00]);
        });
        it('lea rbx, [rbx]', function () {
            var _ = code64();
            _._('lea', [operand_1.rbx, operand_1.rbx.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8D, 0x1B]);
        });
        it('lea eax, [rax]', function () {
            var _ = code64();
            _._('lea', [operand_1.eax, operand_1.rax.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x8D, 0x00]);
        });
        it('lea ax, [rax]', function () {
            var _ = code64();
            _._('lea', [operand_1.ax, operand_1.rax.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x66, 0x8D, 0x00]);
        });
        it('lea rax, [rip]', function () {
            var _ = code64();
            _._('lea', [operand_1.rax, operand_1.rip.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8D, 0x05, 0x00, 0x00, 0x00, 0x00]);
        });
        it('lea rax, [rbx]', function () {
            var _ = code64();
            _._('lea', [operand_1.rax, operand_1.rbx.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8D, 0x03]);
        });
        it('lea rax, [rsp]', function () {
            var _ = code64();
            _._('lea', [operand_1.rax, operand_1.rsp.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8D, 0x04, 0x24]);
        });
        it('lea rax, [rbp]', function () {
            var _ = code64();
            _._('lea', [operand_1.rax, operand_1.rbp.ref()]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8D, 0x45, 0x00]);
        });
        it('lea r8, [rip + 0x11]', function () {
            var _ = code64();
            _._('lea', [operand_1.r8, operand_1.rip.disp(0x11)]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4C, 0x8D, 0x05, 0x11, 0, 0, 0]);
        });
        it('lea r9, [rip + 0x11223344]', function () {
            var _ = code64();
            _._('lea', [operand_1.r9, operand_1.rip.disp(0x11223344)]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4C, 0x8D, 0x0D, 0x44, 0x33, 0x22, 0x11]);
        });
        it('lea r9, [rbx + rcx + 0x11]', function () {
            var _ = code64();
            _._('lea', [operand_1.r9, operand_1.rbx.disp(0x11).ind(operand_1.rcx)]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4C, 0x8D, 0x4C, 0x0B, 0x11]);
        });
        it('lea r9, [0x43]', function () {
            var _ = code64();
            _._('lea', [operand_1.r9, _.mem(0x43)]);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4C, 0x8D, 0x0C, 0x25, 0x43, 0, 0, 0]);
        });
    });
    describe('x87', function () {
        it('fadd [rax]', function () {
            var _ = code64();
            _._('fadd', o.rax.ref());
            var bin = compile(_);
            chai_1.expect([0xD8, 0x00]).to.eql(bin);
        });
        it('fadd %st(0), %st(0)', function () {
            var _ = code64();
            _._('fadd', [o.st(0), o.st(0)]);
            var bin = compile(_);
            chai_1.expect([0xD8, 0xC0]).to.eql(bin);
        });
        it('fadd %st(0), %st(1)', function () {
            var _ = code64();
            _._('fadd', [o.st(0), o.st(1)]);
            var bin = compile(_);
            chai_1.expect([0xD8, 0xC1]).to.eql(bin);
        });
    });
    describe('AVX', function () {
        it('divsd xmm1, xmm2', function () {
            var _ = code64();
            _._('divsd', [o.xmm(1), o.xmm(2)]);
            var bin = compile(_);
            chai_1.expect([0xF2, 0x0F, 0x5E, 0xCA]).to.eql(bin);
        });
        it('vdivsd xmm1, xmm2, xmm3', function () {
            var _ = code64();
            _._('vdivsd', [o.xmm(1), o.xmm(2), o.xmm(3)]);
            var bin = compile(_);
            chai_1.expect([0xC5, 0xEB, 0x5E, 0xCB]).to.eql(bin);
        });
        it('vdivsd xmm1 {k1} {z}, xmm2, xmm3', function () {
            var _ = code64();
            _._('vdivsd', [o.xmm(1), o.xmm(2), o.xmm(3)], { mask: o.k(1), z: 1 });
            var bin = compile(_);
            chai_1.expect([0x62, 0xF1, 0xEF, 0x89, 0x5E, 0xCB]).to.eql(bin);
        });
        it('vdivsd xmm13 {k7}, xmm14, xmm15', function () {
            var _ = code64();
            _._('vdivsd', [o.xmm(13), o.xmm(14), o.xmm(15)], { mask: o.k(7) });
            var bin = compile(_);
            chai_1.expect([0x62, 0x51, 0x8F, 0x0F, 0x5E, 0xEF]).to.eql(bin);
        });
    });
});
