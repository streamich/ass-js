import * as o from '../x86/operand';
import {Code} from '../x86/x64/code';



const code = Code.create();

code.table.createAll();
// console.log(code.table.toString());
// console.log(code.table.toJson());

code.db(123);
code._('add', [o.rax, 25]);
code.db(123);
code._('add', [o.rbx, 0x1232]);
// console.log(code.expr);
console.log(code.toString());
