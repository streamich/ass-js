# `label` - Insert Label

`label` command inserts a `Label` expression into the code.

```js
const myLabel = _('label', 'label_name');
```

Store data from memory to `RAX` register

```js
const asm = X64();

asm.code(_ => {
    const myLabel = _('label', 'label_name');
    _('db', [1, 2, 3, 4]);

    _('mov', ['rax', _('rip').disp(myLabel)]);
});

console.log(String(asm));
asm.compile();
console.log(String(asm));
```

## Custom label `lbl`

Create a label manually using `_.lbl()` method and insert it into the code
manualy using `_.insert()` method.

```js
const asm = X64();

asm.code(_ => {
    const myLabel = _.lbl('label_name');

    _('mov', ['rax', _('rip').disp(myLabel)]);

    _.insert(myLabel);
    _('db', [1, 2, 3, 4]);
});

console.log(String(asm));
asm.compile();
console.log(String(asm));
```
