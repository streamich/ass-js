"use strict";
var code_1 = require('../x86/x64/code');
var _ = new code_1.Code;
var bin = _.compile();
console.log(_.toString());
