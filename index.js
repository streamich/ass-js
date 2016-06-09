"use strict";
var x86_x64 = require('./x86/x64/code');
var x86;
(function (x86) {
    var x64;
    (function (x64) {
        x64.Code = x86_x64.Code;
    })(x64 = x86.x64 || (x86.x64 = {}));
})(x86 = exports.x86 || (exports.x86 = {}));
