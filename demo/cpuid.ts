import {X64} from "../src/index";
import {rip} from "../src/plugins/x86/operand/generator";

const cpuid = _ => {
    _('push', 'rbx');
    _('push', 'rcx');
    _('push', 'rdx');

    _('mov', ['eax', 'edi']);
    _('mov', ['ecx', 'esi']);

    _('cpuid');

    const resultEax = _.lbl('result_eax');
    const resultEbx = _.lbl('result_ebx');
    const resultEdx = _.lbl('result_edx');
    const resultEcx = _.lbl('result_ecx');

    _('mov', [rip.disp(resultEax), 'eax']);
    _('mov', [rip.disp(resultEbx), 'ebx']);
    _('mov', [rip.disp(resultEdx), 'edx']);
    _('mov', [rip.disp(resultEcx), 'ecx']);

    _('pop', 'rdx');
    _('pop', 'rcx');
    _('pop', 'rbx');

    _('ret');
    _('align', 4);

    _.insert(resultEax);
    _('dd', 0);
    _.insert(resultEbx);
    _('dd', 0);
    _.insert(resultEdx);
    _('dd', 0);
    _.insert(resultEcx);
    _('dd', 0);
};

const asm = X64();
asm.code(cpuid);

console.log(asm.toString());
console.log(asm.compile());
