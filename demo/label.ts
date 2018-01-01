import {X64} from "../src/index";
import {rip} from "../src/plugins/x86/operand/generator";

const asm = X64();

// asm.code(_ => {
//     const myLabel = _('label', 'label_name');
//     _('db', [1, 2, 3, 4]);
//
//     _('mov', ['rax', _('rip').disp(myLabel)]);
// });

asm.code(_ => {
    const myLabel = _.lbl('label_name');

    _('mov', ['rax', _('rip').disp(myLabel)]);

    _.insert(myLabel);
    _('db', [1, 2, 3, 4]);
});

console.log(String(asm));
asm.compile();
console.log(String(asm));
