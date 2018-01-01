# Assembler.js

Assembler implemented in JavaScript:

  - Pluggable design, X64 architecture implemented
  - See [supported mnemonics](./mnemonics/x64/)
  - Standalone, use it in browser or Node.js

## Installation

```shell
npm i ass-js
```

## Getting started

Store `0xBABE` in `RAX` register

```js
import {X64} from 'ass-js';

const asm = X64();
asm._('mov', ['rax', 0xBABE]);
```

Compile to machine code

```js
console.log(code.compile()); // <Buffer 48 c7 c0 be ba 00 00>
```

Show text representation

```js
console.log(String(code));
// 000 main:
// 001   movq rax, 0x0000BABE ; 000000|000000 0x48, 0xC7, 0xC0, 0xBE, 0xBA, 0x00, 0x00 7 bytes
```

## Docs

  - [Plugins](./docs/plugins.md)
    - [X64](./docs/x64.md)
    - [Data](./docs/data.md)

## Examples

  - [Hello world](./docs/examples/hello_world.md)

## License

[Unlicense](./LICENSE) - public domain.
