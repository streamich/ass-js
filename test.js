"use strict";
var ass = require('./index');
var _a = ass.x86, rax = _a.rax, rbx = _a.rbx;
var _ = ass.x86.x64.Code.create();
_.mov(rax, rbx);
var bin = _.compile();
console.log(_.toString());
console.log(bin);
