"use strict";
var code_1 = require('../../x86/x64/code');
var _ = code_1.Code.create();
_.syscall();
_.align(20, [[1], [1, 2]]);
console.log(_.toString());
var bin = _.compile();
console.log(_.toString());
console.log(new Buffer(bin));
