import {eax, ecx, ebx, edx, esi, edi, rax, rbx, rcx, rdx, rip, rdi, rsi} from '../../x86/operand';
import {Code} from '../../x86/x64/code';
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;


function cpuid(eaxv, ecxv) {
    var _ = Code.create();
    var start = _.getStartLabel();

    _.push(rbx);
    _.push(rcx);
    _.push(rdx);

    _.mov(eax, edi);
    _.mov(ecx, edi);
    _.cpuid();

    var lbl_eax = _.lbl('eax');
    _.mov(rip.disp(lbl_eax), eax);
    var lbl_ebx = _.lbl('ebx');
    _.mov(rip.disp(lbl_ebx), ebx);
    var lbl_edx = _.lbl('edx');
    _.mov(rip.disp(lbl_edx), edx);
    var lbl_ecx = _.lbl('ecx');
    _.mov(rip.disp(lbl_ecx), ecx);

    _.pop(rdx);
    _.pop(rcx);
    _.pop(rbx);

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
var [reax, rebx, redx, recx] = res;
console.log(reax.toString(16),rebx.toString(16), redx.toString(16), recx.toString(16));


var temp = cpuid(0x40000000, 0);
var str = '';
for(var reg of temp) {
    str += String.fromCharCode(reg & 0xFF);
    str += String.fromCharCode((reg >> 8) & 0xFF);
    str += String.fromCharCode((reg >> 16) & 0xFF);
    str += String.fromCharCode((reg >> 24) & 0xFF);
}
console.log(str);
