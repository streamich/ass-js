import * as o from '../../operand';
import {imm8, imm16, imm32} from '../../../table';
import {r8, r16, r32, r64, rm8, rm16, rm32, rm64} from '../../table';


function tpl_and(o_al = 0x24, o_imm = 0x80, or_imm = 4, o_reg = 0x20, lock = true) {
    return [{lock: lock},
        // 24 ib AND AL, imm8 I Valid Valid AL AND imm8.
        {o: o_al, ops: [o.al, imm8], mr: false},
        // 25 iw AND AX, imm16 I Valid Valid AX AND imm16.
        {o: o_al + 1, ops: [o.ax, imm16], mr: false},
        // 25 id AND EAX, imm32 I Valid Valid EAX AND imm32.
        {o: o_al + 1, ops: [o.eax, imm32], mr: false},
        // REX.W + 25 id AND RAX, imm32 I Valid N.E. RAX AND imm32 sign-extended to 64-bits.
        {o: o_al + 1, ops: [o.rax, imm32], mr: false},
        // 80 /4 ib AND r/m8, imm8 MI Valid Valid r/m8 AND imm8.
        // REX + 80 /4 ib AND r/m8*, imm8 MI Valid N.E. r/m8 AND imm8.
        {o: o_imm, or: or_imm, ops: [rm8, imm8]},
        // 81 /4 iw AND r/m16, imm16 MI Valid Valid r/m16 AND imm16.
        {o: o_imm + 1, or: or_imm, ops: [rm16, imm16]},
        // 81 /4 id AND r/m32, imm32 MI Valid Valid r/m32 AND imm32.
        {o: o_imm + 1, or: or_imm, ops: [rm32, imm32]},
        // REX.W + 81 /4 id AND r/m64, imm32 MI Valid N.E. r/m64 AND imm32 sign extended to 64-bits.
        {o: o_imm + 1, or: or_imm, ops: [rm64, imm32]},
        // 83 /4 ib AND r/m16, imm8 MI Valid Valid r/m16 AND imm8 (sign-extended).
        {o: o_imm + 3, or: or_imm, ops: [rm16, imm8]},
        // 83 /4 ib AND r/m32, imm8 MI Valid Valid r/m32 AND imm8 (sign-extended).
        {o: o_imm + 3, or: or_imm, ops: [rm32, imm8]},
        // REX.W + 83 /4 ib AND r/m64, imm8 MI Valid N.E. r/m64 AND imm8 (sign-extended).
        {o: o_imm + 3, or: or_imm, ops: [rm64, imm8]},
        // 20 /r AND r/m8, r8 MR Valid Valid r/m8 AND r8.
        // REX + 20 /r AND r/m8*, r8* MR Valid N.E. r/m64 AND r8 (sign-extended).
        {o: o_reg, ops: [rm8, r8], en: 'mr', dbit: true},
        // 22 /r AND r8, r/m8 RM Valid Valid r8 AND r/m8.
        // REX + 22 /r AND r8*, r/m8* RM Valid N.E. r/m64 AND r8 (sign-extended).
        {o: o_reg + 2, ops: [r8, rm8], dbit: true},
        // 21 /r AND r/m16, r16 MR Valid Valid r/m16 AND r16.
        {o: o_reg + 1, ops: [rm16, r16], en: 'mr', dbit: true},
        // 23 /r AND r16, r/m16 RM Valid Valid r16 AND r/m16.
        {o: o_reg + 3, ops: [r16, rm16], dbit: true},
        // 21 /r AND r/m32, r32 MR Valid Valid r/m32 AND r32.
        {o: o_reg + 1, ops: [rm32, r32], en: 'mr', dbit: true},
        // 23 /r AND r32, r/m32 RM Valid Valid r32 AND r/m32.
        {o: o_reg + 3, ops: [r32, rm32], dbit: true},
        // REX.W + 21 /r AND r/m64, r64 MR Valid N.E. r/m64 AND r32.
        {o: o_reg + 1, ops: [rm64, r64], en: 'mr', dbit: true},
        // REX.W + 23 /r AND r64, r/m64 RM Valid N.E. r64 AND r/m64.
        {o: o_reg + 3, ops: [r64, rm64], dbit: true},
    ];
}

export default {
    // ADD Integer add
    add: tpl_and(0x04, 0x80, 0, 0x00),
    // ADC Add with carry
    adc: tpl_and(0x14, 0x80, 2, 0x10),
    // SUB Subtract
    sub: tpl_and(0x2C, 0x80, 5, 0x28),
    // SBB Subtract with borrow
    sbb: tpl_and(0x1C, 0x80, 3, 0x18),
};
