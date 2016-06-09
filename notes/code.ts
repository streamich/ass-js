import * as d from '../x86/def';
import * as t from '../x86/x64/table';
import * as o from '../x86/operand';
import {Code} from '../x86/x64/code';


// type TplMnemonic = string;
// type TplOperands = Operand[];
// type TplInstruction = [TplMnemonic, TplOperands];
// type TplBlock = TplInstruction[];
// var tpl: TplBlock = [
//     ['mov', [], ['lock']]
// ];

var code = Code.create();
// code.mov(o.rax.ref(), o.rbx);
// code.movq(o.rax, o.rbx);
// code.int(0x80);
// code.movq(o.rdx, o.rbx.ref());
// code.incq(o.rax.ref());
var last = code.lbl('last');
code.add(o.al, 0x11);
code.adox(o.rax, o.rax);
code.insert(last);
code.mulw(o.rax.ref());
// code.add(o.ax, 0x11);
// code.add(o.eax, 0x11);
// code.add(o.rax, 0x11);
// code.add(o.rax, 25);
// code.add(o.rax, o.rax);
// code.add(o.rbx, o.rsp);
// code.add(o.rcx, o.rbx.ref());
// code.add(o.rcx, o.rcx.ref().ind(o.rdx, 1)); // (%rcx,%rdx,1),%rcx

// console.log(code);
console.log(code.toString());


