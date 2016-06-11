import {rax, rdx, rsi, rdi, rip} from '../../x86/operand';
import {Code} from '../../x86/x64/code';
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;

var _ = Code.create('hello_world_app');

const SYS_write = 1;
const STDOUT = 1;

var str = 'Hello World!\n';
var str_lbl = _.lbl('my_string');

_.movq(rax, SYS_write);
_.movq(rdi, STDOUT);
_.lea(rsi, rip.disp(str_lbl));
_.movq(rdx, str.length);
_.syscall();
_.ret();

_.insert(str_lbl);
_.db(str);


var bin = _.compile();
console.log(_.toString());
StaticBuffer.from(bin, 'rwe').call([]);
