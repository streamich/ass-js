import {X64} from "../src/index";
import {rax, st} from "../src/plugins/x86/operand/generator";

const _ = X64();

// _._('fadd', rax.ref(), 64);
_._('fadd', [st(0), st(0)]);

console.log(_.toString());
console.log(_.compile());
console.log(_.toString());
