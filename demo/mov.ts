import {X64} from "../src/index";
import {rax} from "../src/plugins/x86/operand/generator";


const asm = X64();
asm._('mov', [rax, 25]);

console.log(String(asm));
console.log(asm.compile());
