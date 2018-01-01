# Expressions

Every instruction you add in Assembler.js returns an `Expression` instance.

```js
const movExpression = asm._('mov', [rax, 0xBABE]);
```

Expressions X64 expressions implement `IInstructionX86` interface

```ts
export interface IInstructionX86 {
    lock(): this;
    bt(): this;
    bnt(): this;
    rep(): this;
    repe(): this;
    repz(): this;
    repnz(): this;
    repne(): this;
    cs(): this;
    ss(): this;
    ds(): this;
    es(): this;
    fs(): this;
    gs(): this;
}
```

For example, if you want to add a `LOCK` to an instruction, you can do the following:

```js
_('add', [rax, 0xBABE]).lock();
```
