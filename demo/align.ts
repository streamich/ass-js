import {X64} from "../src/index";

const asm = X64();

asm.code(_ => {
    _('syscall');
    _('align', 8);
    _('mov', ['rax', 0xBABE]);
});

console.log(String(asm));
asm.compile();
console.log(String(asm));
