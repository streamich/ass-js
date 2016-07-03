import {expect} from 'chai';
import * as util from '../util';


describe('util', function() {

    describe('UInt64', function() {
        it('toNumber()', function() {
            expect([3, 0]).to.eql(util.UInt64.toNumber64(3));
            
            var nums = [1, 100000, -1, -1000000];
            for(var num of nums) {
                expect(num).to.eql(util.UInt64.toNumber(util.UInt64.toNumber64(num)));
            }
        });
    });
});