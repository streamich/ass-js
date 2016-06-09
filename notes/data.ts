import * as d from '../x86/def';
import * as t from '../x86/x64/table';
import * as o from '../x86/operand';
import {Code} from '../x86/x64/code';



var code = Code.create();
var lbl = code.lbl('some_label');
code.dw(1);
code.db(2);
code.db(3);
code.db(4);
code.db(5);
code.db(6);
var data7 = code.db(7);
code.db(data7 as any);
code.db(lbl as any);
code.db(data7 as any);
code.db(data7 as any);
code.insert(lbl);
code.dw([1, 2, 3], false);

console.log(code.toString() + '\n\n');
var bin = code.compile();
console.log(code.toString() + '\n\n');
console.log(new Buffer(bin));

// code.compile();
// console.log('\n\n');
// console.log(code.toString());
