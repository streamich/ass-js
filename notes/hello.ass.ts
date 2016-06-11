import {rax, rdx, rsi, rdi, rbx, rcx, rip} from '../x86/operand';
import {Code} from '../x86/x64/code';
var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;

var _ = Code.create();

var msg = 'Hello World!\n';
_.movq(rax, 1);
_.movq(rdi, 1);
var db = _.lbl('db');
_.lea(rsi, rip.disp(10));
_.movq(rdx, msg.length);
_.syscall();
_.ret();
_.insert(db);
_.db(msg);

console.log(_.toString());
var bin = _.compile();
var sbuf = StaticBuffer.from(bin, 'rwe');
console.log(_.toString());
sbuf.call();
console.log(sbuf);
// sbuf.buffer.free();
