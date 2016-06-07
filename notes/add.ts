import * as d from '../x86/def';
import * as t from '../x64/table';
import * as o from '../x86/operand';
import {Code} from '../x64/code';



var code = Code.create();
code.add(o.rax, 25);
code.add(o.rbx, 0x1232);
console.log(code.toString());


