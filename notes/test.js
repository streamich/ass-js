"use strict";
var code_1 = require('../x64/code');
var _ = new code_1.Code;
// console.log(_.table.groups.mov.defs[0].operands);
// process.exit(0);
// var ins = _.addq(rsi, 31);
// console.log(ins);
// 40068f:	50                   	push   %rax
// 400690:	41 54                	push   %r12
// 400692:	66 50                	push   %ax
// 400694:	67 ff 30             	pushq  (%eax)
// 400697:	ff 30                	pushq  (%rax)
// 400699:	67 66 ff 30          	pushw  (%eax)
// 40069d:	66 ff 30             	pushw  (%rax)
// 4006a0:	67 ff 34 03          	pushq  (%ebx,%eax,1)
// 4006a4:	41 ff 34 24          	pushq  (%r12)
// 4006a8:	43 ff 34 2c          	pushq  (%r12,%r13,1)
// 4006ac:	43 ff 74 ac 11       	pushq  0x11(%r12,%r13,4)
// 4006b1:	43 ff b4 ec 44 33 22 	pushq  0x11223344(%r12,%r13,8)
// 4006b8:	11
// 4006b9:	6a 11                	pushq  $0x11
// 4006bb:	68 22 11 00 00       	pushq  $0x1122
// 4006c0:	68 44 33 22 11       	pushq  $0x11223344
_.int(0x80);
// _.push(rax);
// _.push(r12);
// _.push(ax);
// _.pushq(eax.ref());
// _.push(rax.ref());
// _.pushw(eax.ref());
// _.pushw(rax.ref());
// _.push(ebx.ref().ind(eax));
// _.push(r12.ref());
// _.push(r12.ref().ind(r13, 1));
// _.push(r12.ref().ind(r13, 4).disp(0x11));
// _.push(r12.ref().ind(r13, 8).disp(0x11223344));
// _.push(0x11);
// _.push(0x1122);
// _.push(0x11223344);
// _.lea(rax, rax.ref());
// _.lea(rbx, rbx.ref());
// _.lea(eax, rax.ref());
// _.lea(ax, rax.ref());
// _.lea(rax, rip.ref());
// _.lea(rax, rip.ref().disp(123));
// _.movq(rax, 1);
// _.movq(rdi, 1);
// _.addq(rsi, 31);
// _.movq(rdx, 13);
// _.syscall();
// _.ret();
// _.db('Hello World!\n\0');
// var ins = _.movq(rax.ref(), rax);
// var ins = _.movq(rax, 0x01);
// var ins = _.ret(5);
// console.log(ins);
// _.incq(rax).lock();
// var ins = _.int(0x80);
// _.syscall();
var bin = _.compile();
console.log(_.toString());
