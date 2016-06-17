import * as o from '../x86/operand';
import {Code} from '../x86/x64/code';
import * as elf from '../../elf/elf';
import * as econsts from '../../elf/const';
var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;


var _ = new Code;
var msg = 'Hello World!\n';
_.label('hello_world');
_._('mov', [o.rax, 1]);
_._('mov', [o.rdi, 1]);
var db = _.lbl('db');
_._('lea', [o.rsi, o.rip.disp(db)]);
_._('mov', [o.rdx, msg.length]);
_._('syscall');
_.label('exit');
_._('mov', [o.rax, 60]);
_._('mov', [o.rdi, 0]);
_._('syscall');
// _._('ret');
_.insert(db);
_.db(msg);


console.log(_.toString());
var bin = _.compile();
var sbuf = StaticBuffer.from(bin, 'rwe');
console.log(_.toString());
// sbuf.call();
console.log(sbuf);


var file = elf.File.createExecutable();
var ph = file.addProgramHeader(sbuf as Buffer);
ph.data.type = econsts.PT.PHDR;
ph.data.flags = econsts.PF.R | econsts.PF.X;
ph.data.vaddr = 4194368;
ph.data.paddr = 4194368;
ph.data.size = bin.length;
ph.data.memsz = bin.length;
ph.data.align = 8;



console.log(file.calculateSize());
console.log(file.calculateOffsets());
console.log(file);
console.log(file.fh.data);
console.log(file.ph[0].data);

