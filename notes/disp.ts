import * as d from '../x86/def';
import * as t from '../x86/x64/table';
import * as o from '../x86/operand';
import {Code, table} from '../x86/x64/code';

// Variable displacement that evaluates during compilation.


var code = Code.create();
var start = code.getStartLabel();
var db = code.db([1, 2, 3, 4, 5]);
code.lea(o.rax, o.rax.disp(db));
var db = code.db([1, 2, 3]);



console.log(code.toString() + '\n\n');

code.do2ndPass();
console.log(code.toString() + '\n\n');

var bin = code.do3rdPass();
console.log(code.toString() + '\n\n');
console.log(new Buffer(bin));

