import {rax, rdx, rsi, rdi, rip} from '../../x86/operand';
import {Code} from '../../x86/x64/code';
// var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;

var _ = new Code('hello_world_app');


_.db('Hello World!\n');
_._('mov', [rax, 1]);
_._('mov', [rdi, 1]);
_._('lea', [rsi, rip.disp(-34)]);
_._('mov', [rdx, 13]);
_._('syscall');
_._('ret');

// console.log(_.toString());
var bin = _.compile();
// console.log(bin);
console.log(_.toString());
// StaticBuffer.from(bin, 'rwe').call([], 13);
