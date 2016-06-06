{rax, rdx, rsi, rdi, rip} = require '../x86/operand'
{Code} = require '../x64/code'
StaticBuffer = require('../../static-buffer/buffer').StaticBuffer

_ = new Code

msg = 'Hello World!\n'
_.movq rax, 1
_.movq rdi, 1
_.lea rsi, rip.disp 10
_.movq rdx, msg.length
_.syscall()
_.ret()
_.db msg

console.log _.toString()
StaticBuffer.from(_.compile(), 'rwe').call()
