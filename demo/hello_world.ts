import {X64} from '../src/index';

const asm = X64();

asm.code(_ => {
    _('db', 'Hello World!\n');
    _('mov', ['rax', 1]); // 0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00
    _('mov', ['rdi', 1]);
    _('lea', ['rsi', _('rip').disp(-34)]);
    _('mov', ['rdx', 13]);
    _('syscall');
    _('ret');
});

console.log(asm.toString());
