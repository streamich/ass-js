import * as ass from './index';
var {rax, rbx} = ass.x86;

var _ = ass.x86.x64.Code.create();
_.mov(rax, rbx);
var bin = _.compile();
console.log(_.toString());
console.log(bin);

// console.log(ass.x86.x64.Code.table.toString());
