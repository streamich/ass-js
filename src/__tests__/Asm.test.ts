import {X64} from "../index";

describe('Asm', () => {
    describe('.code()', () => {
        it('code templates work', () => {
            const asm = X64();
            const template = _ => {
                _('db', 'Hello world!\n');
                _('mov', ['rax', 1]);
                _('mov', ['rdi', 1]);
                _('lea', ['rsi', _('rip').disp(-34)]);
                _('mov', ['rdx', 13]);
                _('syscall');
                _('ret');
            };

            asm.code(template);

            expect(asm.compile([])).toMatchSnapshot();
        });
    });
});
