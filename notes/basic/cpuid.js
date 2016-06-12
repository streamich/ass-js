"use strict";
var operand_1 = require('../../x86/operand');
var code_1 = require('../../x86/x64/code');
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;
function cpuid(eaxv, ecxv) {
    var _ = code_1.Code.create();
    var start = _.getStartLabel();
    _.push(operand_1.rbx);
    _.push(operand_1.rcx);
    _.push(operand_1.rdx);
    _.mov(operand_1.eax, operand_1.edi);
    _.mov(operand_1.ecx, operand_1.edi);
    _.cpuid();
    var lbl_eax = _.lbl('eax');
    _.mov(operand_1.rip.disp(lbl_eax), operand_1.eax);
    var lbl_ebx = _.lbl('ebx');
    _.mov(operand_1.rip.disp(lbl_ebx), operand_1.ebx);
    var lbl_edx = _.lbl('edx');
    _.mov(operand_1.rip.disp(lbl_edx), operand_1.edx);
    var lbl_ecx = _.lbl('ecx');
    _.mov(operand_1.rip.disp(lbl_ecx), operand_1.ecx);
    _.pop(operand_1.rdx);
    _.pop(operand_1.rcx);
    _.pop(operand_1.rbx);
    _.ret();
    _.align(4);
    _.insert(lbl_eax);
    _.dd(0);
    _.insert(lbl_ebx);
    _.dd(0);
    _.insert(lbl_edx);
    _.dd(0);
    _.insert(lbl_ecx);
    _.dd(0);
    var bin = _.compile();
    console.log(_.toString());
    var sbuf = StaticBuffer.from(bin, 'rwe');
    sbuf.call([eaxv, ecxv]);
    return [
        sbuf.readInt32LE(sbuf.length - 16),
        sbuf.readInt32LE(sbuf.length - 12),
        sbuf.readInt32LE(sbuf.length - 8),
        sbuf.readInt32LE(sbuf.length - 4),
    ];
}
var res = cpuid(0, 0);
var reax = res[0], rebx = res[1], redx = res[2], recx = res[3];
console.log(reax.toString(16), rebx.toString(16), redx.toString(16), recx.toString(16));
var temp = cpuid(0x40000000, 0);
var str = '';
for (var _i = 0, temp_1 = temp; _i < temp_1.length; _i++) {
    var reg = temp_1[_i];
    str += String.fromCharCode(reg & 0xFF);
    str += String.fromCharCode((reg >> 8) & 0xFF);
    str += String.fromCharCode((reg >> 16) & 0xFF);
    str += String.fromCharCode((reg >> 24) & 0xFF);
}
console.log(str);
