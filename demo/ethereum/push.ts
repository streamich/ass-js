import {Ethereum} from "../../src/index";

const asm = Ethereum();

asm.code(_ => {
    _('push1', 1);
    _('push1', [1]);
    _('push2', 1, 2);
    _('push3', [1, 2, 0xff]);

    _('push', 1);
    _('push', 1, 2, 3);
    _('push', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
});

console.log(String(asm));
console.log(asm.compile());
