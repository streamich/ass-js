import {rax, rdx, rsi, rdi, rip} from '../../x86/operand';
import {Code} from '../../x86/x64/code';
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;

var _ = Code.create('hello_world_app');


_.db('Hello World!\n');
_.movq(rax, 1);
_.movq(rdi, 1);
_.lea(rsi, rip.disp(-34));
_.movq(rdx, 13);
_.syscall();
_.ret();

// console.log(_.toString());
var bin = _.compile();
// console.log(bin);
console.log(_.toString());
StaticBuffer.from(bin, 'rwe').call([], 13);
