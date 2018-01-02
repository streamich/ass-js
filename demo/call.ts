import {X64} from "../src/index";
import {rbp} from "../src/plugins/x86/operand/generator";

const asm = X64();

asm.code(_ => {
    _('mov', [rbp.disp(-16), 0xBABE], 64);
    _('call', [rbp.disp(-16)], 64);
});

console.log(String(asm));
asm.compile();
console.log(String(asm));
