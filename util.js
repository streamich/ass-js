"use strict";
function noop() { }
exports.noop = noop;
function extend(obj1, obj2) {
    var objs = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        objs[_i - 2] = arguments[_i];
    }
    if (typeof obj2 === 'object')
        for (var i in obj2)
            obj1[i] = obj2[i];
    if (objs.length)
        return extend.apply(null, [obj1].concat(objs));
    else
        return obj1;
}
exports.extend = extend;
var UInt64 = (function () {
    function UInt64() {
    }
    UInt64.hi = function (a, lo) {
        if (lo === void 0) { lo = UInt64.lo(a); }
        var hi = a - lo;
        hi /= 4294967296;
        if ((hi < 0) || (hi >= 1048576))
            throw Error("Not an int52: " + a);
        return hi;
    };
    UInt64.lo = function (a) {
        var lo = a | 0;
        if (lo < 0)
            lo += 4294967296;
        return lo;
    };
    UInt64.joinToNumber = function (hi, lo) {
        // if ((lo !== lo|0) && (lo !== (lo|0) + 4294967296))  throw new Error ("lo out of range: "+lo);
        // if ((hi !== hi|0) && hi >= 1048576)                 throw new Error ("hi out of range: "+hi);
        if (lo < 0)
            lo += 4294967296;
        return hi * 4294967296 + lo;
    };
    return UInt64;
}());
exports.UInt64 = UInt64;
