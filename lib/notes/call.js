"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var code_1 = require("../x86/x64/code");
var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;
var _ = code_1.Code.create();
// _.movq(rax, 26);
// _.ret();
// console.log(_.toString());
// var sbuf = StaticBuffer.from(_.compile(), 'rwe');
// var ret = sbuf.call();
// console.log(ret);
//
//
//
// _ = Code.create();
// _.add(rdi, rsi);
// _.mov(rax, rdi);
// _.ret();
// console.log(_.toString());
// sbuf = StaticBuffer.from(_.compile(), 'rwe');
// console.log(sbuf.call([-2, 3]));
//
//
// var txt = new Buffer('This is text');
// _ = Code.create();
// 
