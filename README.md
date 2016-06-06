# GASM

**IN DEVELOPMENT**

```js
var gasm = require('gasm');
var {rax, rbx} = gasm.x86;

var _ = new gasm.x64.Code;
_.mov(rax, rbx);
var bin = _.compile();
console.log(bin);
```

`x86` assembler in for Node.js.

## Examples

### Hello World

Below example in CoffeeScript writes "Hello World!" to console using `write` system call.

```coffeescript
{rax, rdx, rsi, rdi, rip} = require 'rgasm/x86/operand'
{Code} = require 'rgasm/x64/code'
{StaticBuffer} = require 'static-buffer/buffer'

_ = new Code

msg = 'Hello World!\n'
_.movq rax, 1
_.movq rdi, 1
_.lea rsi, rip.disp 10
_.movq rdx, msg.length
_.syscall()
_.ret()
_.db msg

StaticBuffer.from(_.compile(), 'rwe').call()
```