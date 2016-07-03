import {rax, rdx, rsi, rdi, rip} from '../../x86/operand';
import {Code} from '../../x86/x64/code';
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;

var _ = Code.create('hello_world_app');

const SYS_write = 1;
const STDOUT = 1;

var str = 'Hello World!\n';
var db = _.db(str);
_._('mov', [rax, SYS_write]);
_._('mov', [rdi, STDOUT]);
_._('lea', [rsi, rip.disp(db)]);
_._('mov', [rdx, str.length]);
_._('syscall');
_._('ret');


var bin = _.compile();
console.log(_.toString());
StaticBuffer.from(bin, 'rwe').call([], 13);
