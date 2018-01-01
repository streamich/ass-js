import {X64} from "../src/index";

const asm = X64();
asm._('mov', ['rax', 0xBABE]);

console.log(asm.toString());
console.log(asm.compile());
