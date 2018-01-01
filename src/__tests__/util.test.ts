import {UInt64} from "../util";

describe('util', function() {
    describe('UInt64', function() {
        it('toNumber()', function() {
            expect([3, 0]).toEqual(UInt64.toNumber64(3));

            const nums = [1, 100000, -1, -1000000];
            for (const num of nums) {
                expect(num).toBe(UInt64.toNumber(UInt64.toNumber64(num)));
            }
        });
    });
});
