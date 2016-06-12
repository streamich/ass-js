import {eax, r8} from '../../x86/operand';
import {Code} from '../../x86/x64/code';


var _ = Code.create();


_.mov(r8, 1);
_.syscall();
_.align(20, [[1], [1, 2]]);


console.log(_.toString());
var bin = _.compile();
console.log(_.toString());
console.log(new Buffer(bin));
