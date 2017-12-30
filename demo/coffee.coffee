{X64} = require "../src/index";
{rax, rbx} = require '../src/plugins/x86/operand';
{Compiler} = require "../src/Compilation";

tpl = (_) ->
  _ 'db', 123
  _ 'dw', 123
  _ 'mov', [rax, rbx]
  _ 'lock'
  lbl = _ 'label', 'Hello there'
  _ 'align', 4
  _ 'resb', 5
  _ 'add', [rax, rbx]
  _ 'jmp', [lbl]

asm = X64()
asm.code tpl

console.log asm.toString()

buf = asm.compile();
console.log Array.prototype.slice.call buf
