# Operands

  - [Registers](#registers)
  - [Memory](#memory)
  - [Immediate](#immediate)


## Registers

Use strings as register names

```js
_('mov', ['rax', 'rbx']);
_('mov', ['eax', 0xBABE]);
```

Use command method to resolve a register

```js
_('mov', [_('rax'), 0xBABE]);
```

Import register directly:

```js
import {rax} from 'ass-js/lib/plugins/x86/operand';

_('mov', [rax, 0xBABE]);
```


## Memory

Use register value as memory address

```js
_('mov', [rbx, rax.ref()]);
_('mov', [rbx, _('rax').ref()]);
```

Use displacement

```js
_('mov', [rax, rax.ref().disp(10)]);
_('mov', [rax, rax.disp(10)]);
```

Use absolute address value

```js
_('mov', [rax, _('mem', 0xBABE)]);
```

## Immediate

Put a 32-bit signed and unsigned integers into register

```js
_('mov', [rax, 0xBABE]);
_('mov', [rax, -0xBABE]);
```

Put a 64-bit unsigned integer into register:

```js
_('mov', [rax, [0xC001, 0xBABE]]);
```
