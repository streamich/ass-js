import {rax} from '../src/x86/operand';
import {Code} from '../src/x86/x64/code';



const code = new Code();
code.build(_ => {
    _('add', [rax, 25]);
});
console.log(String(code));
console.log(code.compile());
