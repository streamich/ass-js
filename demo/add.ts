import {rax} from '../src/plugins/x86/operand';
import {Code} from '../src/plugins/x64/code';



const code = Code.create();
code._64('add', rax, 25);
console.log(String(code));
console.log(code.compile());
