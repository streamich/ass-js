# `align` - Align Code

Aligns code to some specified byte boundary.

```
_('align'[, bytes = 4]);
```

Fills the gap with *no-op* instructions.

Example:

```js
asm.code(_ => {
    _('syscall');
    _('align', 8);
    _('mov', ['rax', 0xBABE]);
});
```

Result:

```
000 main:
001     syscall                                 ; 000000|000000 0x0F, 0x05 2 bytes
002     align 8                                 ; 000002|000002 6 bytes 0x66 0x0F 0x1F 0x44 0x00 0x00
003     movq    rax, 0x0000BABE                 ; 000008|000009 0x48, 0xC7, 0xC0, 0xBE, 0xBA, 0x00, 0x00 7 bytes
```
