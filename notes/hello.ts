import {rax, rdx, rsi, rdi, rbx, rcx, rip} from '../x86/operand';
import {Code} from '../x64/code';
var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;

var _ = new Code;

var msg = 'Hello World!\n';
_.movq(rax, 1);
_.movq(rdi, 1);
_.lea(rsi, rip.disp(10));
_.movq(rdx, msg.length);
_.syscall();
_.ret();
_.db(msg);

console.log(_.toString());

var sbuf = StaticBuffer.from(_.compile(), 'rwe');
sbuf.call();
// sbuf.buffer.free();
