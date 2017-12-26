import {X64} from "../src/index";

const asm = X64();

asm.code(_ => {
    // asm._('mov', ['rax', 25]);
    _('db', 123);
    _('dw', 123);
    _('lock');
    _('label', 'Hello there');
    _('align', 4);
    _('resb', 5);
});

console.log(asm.toString());
