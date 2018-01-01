import {X64} from "../src/index";
import {k, rax, st, xmm, zmm} from "../src/plugins/x86/operand/generator";

const _ = X64();

// 62 a1 5c 40 58 e4
// _._('vaddps', [zmm(20), zmm(20), zmm(20)]);

// 62 f1 ef 89 5e cb
_._('vdivsd', [xmm(1), xmm(2), xmm(3)], {mask: k(1), z: 1});

console.log(_.toString());
console.log(_.compile());
console.log(_.toString());
