import {X64} from "../src/index";
import {rax, rbx} from "../src/plugins/x86/operand/generator";

const asm = X64();
// asm._('mov', [rax, rax.disp(10)]);

// asm._('mov', [rax, rbx.ref()]);
// const label = asm._('label', 'test');
// asm._('mov', [rax, asm._('mem', 0xBABE)]);

// Immediates
// asm._('mov', [rax, 0xBABE]);
// asm._('mov', [rax, -0xBABE]);
// asm._('mov', [rax, [0xC001, 0xBABE]]);
// asm._('add', [rax, 0xBABE]).lock();

// asm._('mov', [rax, asm._('mem', 0xBABE)]);
// asm._('mov', [rax, asm._('mem', [0, 0xBABE])]);


console.log(asm.toString());
asm.compile();
console.log(asm.toString());
