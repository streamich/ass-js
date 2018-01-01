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
```

Compile your code into `Buffer`

```js
const buf = asm.compile();
console.log(buf);
```

Or compile into a plain JavaScript array

```js
const bin = asm.compile([]);
console.log(bin);
```
