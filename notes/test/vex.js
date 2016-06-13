"use strict";
var o = require('../../x86/operand');
var code_1 = require('../../x86/x64/code');
var _ = new code_1.Code;
_._('divsd', [o.xmm(1), o.xmm(2)]);
_._('vdivsd', [o.xmm(1), o.xmm(2), o.xmm(3)]);
console.log(_.toString());
var bin = _.compile();
console.log(new Buffer(bin));
