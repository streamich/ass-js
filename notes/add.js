"use strict";
var o = require('../x86/operand');
var code_1 = require('../x86/x64/code');
var code = code_1.Code.create();
code.db(123);
code.add(o.rax, 25);
code.db(123);
code.add(o.rbx, 0x1232);
console.log(code.toString());
