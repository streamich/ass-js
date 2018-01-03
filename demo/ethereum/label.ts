import {Ethereum} from "../../src/index";

const asm = Ethereum();

asm.code(_ => {
    _('PUSH', 3);

    const label = _('label', 'multiply');
    _('MUL', 3);

    _('JUMP', label);
});

console.log(String(asm));
