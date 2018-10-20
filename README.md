<div align="center">
<h1>(‿*‿) <br/> Assembler.js</h1>
</div>

[![][npm-badge]][npm-url] [![][travis-badge]][travis-url]

Assembler implemented in JavaScript:

  - Pluggable design
  - X64 and Ethereum assembler
  - See [supported X64 mnemonics](./mnemonics/x64/)
  - Standalone, use it in browser or Node.js

## Install

```shell
npm i ass-js
```

## Getting Started

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

Use templates

```js
const template = _ => {
    _('mov', ['rdx', 0xC001]);
    _('mov', ['rax', 0xBABE]);
};

asm.code(template);
```

## Docs

  - [Plugins](./docs/plugins.md)
    - X64
      - [Getting started](./docs/x64/getting-started.md)
      - [Operands](./docs/x64/operands.md)
      - [Expressions](./docs/x64/expressions.md)
    - [Ethereum](./docs/ethereum/ethereum.md)
    - Data
      - `d*` - [add binary data](./docs/data/db.md)
      - `res*` - [add uninitialized data](./docs/data/resb.md)
      - `incbin` - [include binary file](./docs/data/incbin.md)
    - Util
      - `label` - [insert a label using `label` and `lbl`](./docs/util/label.md)
      - `align` - [align code to some factor boundary](./docs/util/align.md)
  - Reference
    - `Asm`
    - `Expression`
    - `Compilation`
  - Examples
    - [Hello world](./docs/examples/hello_world.md)
    - [`cpuid`](./docs/examples/cpuid.md)

## License

[Unlicense](./LICENSE) &mdash; public domain.



[npm-url]: https://www.npmjs.com/package/ass-js
[npm-badge]: https://img.shields.io/npm/v/ass-js.svg
[travis-url]: https://travis-ci.org/streamich/ass-js
[travis-badge]: https://travis-ci.org/streamich/ass-js.svg?branch=master
