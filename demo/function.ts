import {rax} from '../src/plugins/x86/operand';
import {Code} from '../src/plugins/x64/code';



const code = new Code();
code.build(_ => {
    _('add', [rax, 25]);
});
console.log(String(code));
console.log(code.compile());
