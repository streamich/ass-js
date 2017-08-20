"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var util = require("../util");
describe('util', function () {
    describe('UInt64', function () {
        it('toNumber()', function () {
            chai_1.expect([3, 0]).to.eql(util.UInt64.toNumber64(3));
            var nums = [1, 100000, -1, -1000000];
            for (var _i = 0, nums_1 = nums; _i < nums_1.length; _i++) {
                var num = nums_1[_i];
                chai_1.expect(num).to.eql(util.UInt64.toNumber(util.UInt64.toNumber64(num)));
            }
        });
    });
});
