import {Ethereum} from "../../src/index";

const asm = Ethereum();

asm.code(_ => {
    _('ADD');
    _('MUL');
    _('PUSH1', [1]);
    _('add');
});

console.log(String(asm));
console.log(asm.compile());
console.log(String(asm));
