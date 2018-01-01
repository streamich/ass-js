import {rip} from "../../plugins/x86/operand/generator";
import {X64} from "../../index";

describe('X64', () => {
    describe('cpuid', () => {
        it('compiles correctly', () => {
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

            expect(asm.compile([])).toEqual([0x53, 0x51, 0x52, 0x89, 0xf8, 0x89, 0xf1, 0xf, 0xa2, 0x89, 0x5, 0x19, 0x0, 0x0, 0x0, 0x89, 0x1d, 0x17, 0x0, 0x0, 0x0, 0x89, 0x15, 0x15, 0x0, 0x0, 0x0, 0x89, 0xd, 0x13, 0x0, 0x0, 0x0, 0x5a, 0x59, 0x5b, 0xc3, 0xf, 0x1f, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
        });
    });
});