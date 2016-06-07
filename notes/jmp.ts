import * as d from '../x86/def';
import * as t from '../x64/table';
import * as o from '../x86/operand';
import {Code, table} from '../x64/code';


var code = Code.create();
var start = code.getStartLabel();
// code.mov(o.rax, o.rax);
var insn = code.jmp(start);
// var insn = code.jmp(0);
// code.mov(o.rbx, o.rbx);


console.log(code.toString());
// code.compile();
// console.log(code.toString());

// console.log(insn);



