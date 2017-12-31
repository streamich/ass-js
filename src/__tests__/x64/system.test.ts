import {X64} from "../../index";

describe('X64', function() {
    describe('system', function() {
        it('syscall', function() {
            const _ = X64();

            _._('syscall');

            expect(_.compile([])).toEqual([0x0F, 0x05]);
        });

        it('sysenter', function() {
            const _ = X64();

            _._('sysenter');

            expect(_.compile([])).toEqual([0x0F, 0x34]);
        });

        it('sysexit', function() {
            const _ = X64();

            _._('sysexit');

            expect(_.compile([])).toEqual([0x0F, 0x35]);
        });
    });
});
