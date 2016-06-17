import * as o from '../../x86/operand';
import {Code} from '../../x86/x64/code';
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;


const SYS_write         = 1;
const SYS_mmap          = 9;
const SYS_clone         = 56;
const SYS_exit          = 60;
const SYS_sched_yield   = 24;

const STDOUT        = 1;

const CLONE_VM      = 0x00000100;
const CLONE_FS      = 0x00000200;
const CLONE_FILES   = 0x00000400;
const CLONE_SIGHAND = 0x00000800;
const CLONE_PARENT  = 0x00008000;
const CLONE_THREAD  = 0x00010000;
const CLONE_IO      = 0x80000000;

const MAP_GROWSDOWN = 0x0100;
const MAP_ANONYMOUS = 0x0020;
const MAP_PRIVATE   = 0x0002;

const PROT_READ     = 0x1;
const PROT_WRITE    = 0x2;
const PROT_EXEC     = 0x4;

const THREAD_FLAGS = CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND | CLONE_PARENT | CLONE_THREAD | CLONE_IO;

const STACK_SIZE = 4096 * 1024;

const MAX_LINES = 10000;

function syscall(code: Code) { code._('syscall'); }


var _ = new Code;

var digits = '0123456789\n';

var write           = _.lbl('write');
var stack_create    = _.lbl('stack_create');
var thread_create   = _.lbl('thread_create');
var thread_code     = _.lbl('thread_code');
var exit            = _.lbl('exit');

_._('call', write);
_._('call', write);
_._('call', stack_create);
_._('ret');

var buffer = _.lbl('buffer');
_.insert(write);
_._('mov', [o.rdi, STDOUT]);
_._('lea', [o.rsi, o.rip.disp(buffer)]);
_._('mov', [o.rdx, digits.length]);
_._('mov', [o.rax, SYS_write]);
syscall(_);
_._('ret');

_.insert(stack_create);
_._('mov', [o.rdi, 0]);
_._('mov', [o.rsi, STACK_SIZE]);
_._('mov', [o.rdx, PROT_WRITE | PROT_READ]);
_._('mov', [o.r10, MAP_ANONYMOUS | MAP_PRIVATE | MAP_GROWSDOWN]);
_._('mov', [o.rax, SYS_mmap]);
syscall(_);
_._('ret');

_.insert(thread_create);
_._('push', o.rdi);
_._('call', stack_create);
_._('lea', [o.rsi, o.rax.disp(STACK_SIZE - 8)]);
_._64('pop', o.rsi.ref());
_._('mov', [o.rdi, THREAD_FLAGS]);
_._('mov', [o.rax, SYS_clone]);
syscall(_);
_._('ret');

_.insert(thread_code);
_._('mov', [o.rax, SYS_sched_yield]);
syscall(_);
_._('jmp', thread_code);

_.insert(exit);
_._('ret');


_.insert(buffer);
_.db(digits);
_.resb(16);


var bin = _.compile();
console.log(bin.length + ' bytes');
console.log(_.toString());
var sbuf = StaticBuffer.from(bin, 'rwe');
console.log(sbuf.call([]));

