import * as d from '../x86/def';
import * as t from '../x86/x64/table';
import * as o from '../x86/operand';
import {Code, table} from '../x86/x64/code';


var code = Code.create();
var start = code.getStartLabel();
code.db([1, 2, 3, 4, 5]);
// code.mov(o.rax, o.rax);
var insn = code.jmp(start);
console.log(code.toString() + '\n\n');
code.do2ndPass();
// console.log(code.expr);
console.log(code.toString() + '\n\n');
var bin = code.do3rdPass();
console.log(code.toString() + '\n\n');
console.log(new Buffer(bin));

// console.log(insn);
// var insn = code.jmp(0);
// code.mov(o.rbx, o.rbx);


// console.log(code.toString());
// code.compile();
// console.log(code.toString());

// console.log(insn);



