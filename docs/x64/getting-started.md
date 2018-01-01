# Getting Started

Create code container using `X64()` utility method

```js
import {X64} from 'ass-js';

const asm = X64();
```

Add instructions to your code

```js
asm._('mov', ['rax', 0xBABE]);
```

Print human-friendly representation to terminal

```js
console.log(asm.toString());
// or
console.log(String(asm));
```

Compile your code into a Node.js `Buffer`

```js
console.log(asm.compile());
```

Or compile into a plain JavaScript `Array`

```js
console.log(asm.compile([]));
```

Use code templates

```js
const template = _ => {
    _('mov', ['rax', 0xBABE]);
};

asm.code(template);
```
