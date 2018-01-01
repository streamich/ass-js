import {X64} from "../../index";


const compile = _ => _.compile([]);

describe('X64', function() {
    describe('data', function() {
        describe('db', function() {
            it('octets', function() {
                const _ = X64();
                const data = [1, 2, 3];
                _._('db', data);
                expect(compile(_)).toEqual(data);
            });

            it('buffer', function() {
                const _ = X64();
                const data = [1, 2, 3];
                _._('db', new Buffer(data));
                expect(compile(_)).toEqual(data);
            });

            it('string', function() {
                const _ = X64();
                const str = 'Hello World!\n';
                _._('db', str);
                const bin = compile(_);
                expect(bin.length).toBe(str.length);
                expect(bin).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 10]);
            });
        });

        describe('incbin', function() {
            it('.incbin(filepath)', function() {
                const _ = X64();
                const ins = _._('incbin', __dirname + '/data.txt');
                expect(ins.octets).toEqual([49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });

            it('.incbin(filepath, offset)', function() {
                const _ = X64();
                const ins = _._('incbin', __dirname + '/data.txt', 3);
                expect(ins.octets).toEqual([52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });

            it('.incbin(filepath, offset, length)', function() {
                const _ = X64();
                const ins = _._('incbin', __dirname + '/data.txt', 3, 3);
                expect(ins.octets).toEqual([52, 53, 54]);
            });
        });
    });
});
