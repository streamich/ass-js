import {Ethereum} from "../../src/index";

const asm = Ethereum();

asm.code(_ => {
    _('PUSH', 3);
    _('MUL', 3);
});

console.log(String(asm));
