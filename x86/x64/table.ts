import {extend} from '../../util';
import * as o from '../operand';
import * as t from '../table';
import {S, rel, rel8, rel16, rel32, imm, imm8, imm16, imm32, imm64, immu, immu8, immu16, immu32, immu64} from '../../table';
import {M, r, r8, r16, r32, r64, sreg, mmx, xmm, ymm, zmm, m, m8, m16, m32, m64, rm8, rm16, rm32, rm64} from '../table';


export var defaults = extend<any>({}, t.defaults,
    {rex: false, ds: S.D});


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
        // 22 /r AND r8, r/m8 RM Valid Valid r8 AND r/m8.
        // REX + 22 /r AND r8*, r/m8* RM Valid N.E. r/m64 AND r8 (sign-extended).
        {o: o_reg, ops: [rm8, rm8], dbit: true},
        // 21 /r AND r/m16, r16 MR Valid Valid r/m16 AND r16.
        // 23 /r AND r16, r/m16 RM Valid Valid r16 AND r/m16.
        {o: o_reg + 1, ops: [rm16, rm16], dbit: true},
        // 21 /r AND r/m32, r32 MR Valid Valid r/m32 AND r32.
        // 23 /r AND r32, r/m32 RM Valid Valid r32 AND r/m32.
        {o: o_reg + 1, ops: [rm32, rm32], dbit: true},
        // REX.W + 21 /r AND r/m64, r64 MR Valid N.E. r/m64 AND r32.
        // REX.W + 23 /r AND r64, r/m64 RM Valid N.E. r64 AND r/m64.
        {o: o_reg + 1, ops: [rm64, rm64], dbit: true},
    ];
}

function tpl_not(o = 0xF6, or = 2, lock = true) {
    return [{o: o + 1, or: or, lock: lock},
        // F6 /2 NOT r/m8 M Valid Valid Reverse each bit of r/m8.
        // REX + F6 /2 NOT r/m8* M Valid N.E. Reverse each bit of r/m8.
        {o: o, ops: [rm8]},
        // F7 /2 NOT r/m16 M Valid Valid Reverse each bit of r/m16.
        {ops: [rm16]},
        // F7 /2 NOT r/m32 M Valid Valid Reverse each bit of r/m32.
        {ops: [rm32]},
        // REX.W + F7 /2 NOT r/m64 M Valid N.E. Reverse each bit of r/m64.
        {ops: [rm64]},
    ];
}

function tpl_sar(or = 7, o_r = 0xD0, o_imm = 0xC0, mns = null) {
    return [{or: or, mns: mns},
        // D0 /7 SAR r/m8, 1 M1 Valid Valid Signed divide* r/m8 by 2, once.
        // REX + D0 /7 SAR r/m8**, 1 M1 Valid N.E. Signed divide* r/m8 by 2, once.
        {o: o_r, ops: [rm8, 1]},
        // D2 /7 SAR r/m8, CL MC Valid Valid Signed divide* r/m8 by 2, CL times.
        // REX + D2 /7 SAR r/m8**, CL MC Valid N.E. Signed divide* r/m8 by 2, CL times.
        {o: o_r + 2, ops: [rm8, o.cl], s: S.B},
        // C0 /7 ib SAR r/m8, imm8 MI Valid Valid Signed divide* r/m8 by 2, imm8 time.
        // REX + C0 /7 ib SAR r/m8**, imm8 MI Valid N.E. Signed divide* r/m8 by 2, imm8 times.
        {o: o_imm, ops: [rm8, imm8]},
        // D1 /7 SAR r/m16,1 M1 Valid Valid Signed divide* r/m16 by 2, once.
        {o: o_r + 1, ops: [rm16, 1]},
        // D3 /7 SAR r/m16, CL MC Valid Valid Signed divide* r/m16 by 2, CL times.
        {o: o_r + 3, ops: [rm16, o.cl], s: S.W},
        // C1 /7 ib SAR r/m16, imm8 MI Valid Valid Signed divide* r/m16 by 2, imm8 times.
        {o: o_imm + 1, ops: [rm16, imm8]},
        // D1 /7 SAR r/m32, 1 M1 Valid Valid Signed divide* r/m32 by 2, once.
        {o: o_r + 1, ops: [rm32, 1]},
        // REX.W + D1 /7 SAR r/m64, 1 M1 Valid N.E. Signed divide* r/m64 by 2, once.
        {o: o_r + 1, ops: [rm64, 1]},
        // D3 /7 SAR r/m32, CL MC Valid Valid Signed divide* r/m32 by 2, CL times.
        {o: o_r + 3, ops: [rm32, o.cl], s: S.D},
        // REX.W + D3 /7 SAR r/m64, CL MC Valid N.E. Signed divide* r/m64 by 2, CL times.
        {o: o_r + 3, ops: [rm64, o.cl], s: S.Q},
        // C1 /7 ib SAR r/m32, imm8 MI Valid Valid Signed divide* r/m32 by 2, imm8 times.
        {o: o_imm + 1, ops: [rm32, imm8]},
        // REX.W + C1 /7 ib SAR r/m64, imm8 MI Valid N.E. Signed divide* r/m64 by 2, imm8 times
        {o: o_imm + 1, ops: [rm64, imm8]},
    ];
}

function tpl_shrd(op = 0x0FAC) {
    return [{},
        // 0F AC /r ib SHRD r/m16, r16, imm8 MRI Valid Valid Shift r/m16 to right imm8 places while shifting bits from r16 in from the left.
        {o: op, ops: [rm16, r16, imm8]},
        // 0F AD /r SHRD r/m16, r16, CL MRC Valid Valid Shift r/m16 to right CL places while shifting bits from r16 in from the left.
        {o: op + 1, ops: [rm16, r16, o.cl], s: S.W},
        // 0F AC /r ib SHRD r/m32, r32, imm8 MRI Valid Valid Shift r/m32 to right imm8 places while shifting bits from r32 in from the left.
        {o: op, ops: [rm32, r32, imm8]},
        // REX.W + 0F AC /r ib SHRD r/m64, r64, imm8 MRI Valid N.E. Shift r/m64 to right imm8 places while shifting bits from r64 in from the left.
        {o: op, ops: [rm64, r64, imm8]},
        // 0F AD /r SHRD r/m32, r32, CL MRC Valid Valid Shift r/m32 to right CL places while shifting bits from r32 in from the left.
        {o: op + 1, ops: [rm32, r32, o.cl], s: S.D},
        // REX.W + 0F AD /r SHRD r/m64, r64, CL MRC Valid N.E. Shift r/m64 to right CL places while
        {o: op + 1, ops: [rm64, r64, o.cl], s: S.Q},
    ];
}

function tpl_bt(o_r = 0x0FA3, or_imm = 4, o_imm = 0x0FBA) {
    return [{},
        // 0F A3 /r BT r/m16, r16 MR Valid Valid Store selected bit in CF flag.
        {o: o_r, ops: [rm16, r16]},
        // 0F A3 /r BT r/m32, r32 MR Valid Valid Store selected bit in CF flag.
        {o: o_r, ops: [rm32, r32]},
        // REX.W + 0F A3 /r BT r/m64, r64 MR Valid N.E. Store selected bit in CF flag.
        {o: o_r, ops: [rm64, r64]},
        // 0F BA /4 ib BT r/m16, imm8 MI Valid Valid Store selected bit in CF flag.
        {o: o_imm, or: or_imm, ops: [rm16, imm8]},
        // 0F BA /4 ib BT r/m32, imm8 MI Valid Valid Store selected bit in CF flag.
        {o: o_imm, or: or_imm, ops: [rm32, imm8]},
        // REX.W + 0F BA /4 ib BT r/m64, imm8 MI Valid N.E. Store selected bit in CF flag.
        {o: o_imm, or: or_imm, ops: [rm64, imm8]},
    ];
}

function tpl_bsf(op = 0x0FBC) {
    return [{},
        // 0F BC /r BSF r16, r/m16 RM Valid Valid Bit scan forward on r/m16.
        {o: op, ops: [r16, rm16]},
        // 0F BC /r BSF r32, r/m32 RM Valid Valid Bit scan forward on r/m32.
        {o: op, ops: [r32, rm32]},
        // REX.W + 0F BC /r BSF r64, r/m64 RM Valid N.E. Bit scan forward on r/m64.
        {o: op, ops: [r64, rm64]},
    ];
}

function tpl_ja(op = 0x77, op2 = 0x0F87) {
    return [{},
        // 77 cb JA rel8 D Valid Valid Jump short if above (CF=0 and ZF=0).
        {o: op, ops: [rel8]},
        // 0F 87 cd JA rel32 D Valid Valid Jump near if above (CF=0 and ZF=0).
        {o: op2, ops: [rel32]},
    ];
}

function tpl_cmovc(op = 0x0F42, mns = null) {
    return [{o: op, mns: mns},
        // 0F 42 /r CMOVC r16, r/m16 RM Valid Valid Move if carry (CF=1).
        {ops: [r16, rm16]},
        // 0F 42 /r CMOVC r32, r/m32 RM Valid Valid Move if carry (CF=1).
        {ops: [r32, rm32]},
        // REX.W + 0F 42 /r CMOVC r64, r/m64 RM Valid N.E. Move if carry (CF=1).
        {ops: [r64, rm64]},
    ];
}

function tpl_xadd(op = 0, lock = true) {
    return [{o: op + 1, lock: lock},
        // 0F C0 /r XADD r/m8, r8 MR Valid Valid Exchange r8 and r/m8; load sum into r/m8.
        // REX + 0F C0 /r XADD r/m8*, r8* MR Valid N.E. Exchange r8 and r/m8; load sum into r/m8.
        {o: op, ops: [rm8, r8]},
        // 0F C1 /r XADD r/m16, r16 MR Valid Valid Exchange r16 and r/m16; load sum into r/m16.
        {ops: [rm16, r16]},
        // 0F C1 /r XADD r/m32, r32 MR Valid Valid Exchange r32 and r/m32; load sum into r/m32.
        {ops: [rm32, r32]},
        // REX.W + 0F C1 /r XADD r/m64, r64 MR Valid N.E. Exchange r64 and r/m64; load sum into r/m64.
        {ops: [rm64, r64]},
    ];
}

function tpl_movs(op = 0xA4) {
    return [{o: op + 1},
        // A4 MOVS m8, m8 NP Valid Valid
        {o: op, s: S.B},
        // A5 MOVS m16, m16 NP Valid Valid
        {s: S.W},
        // A5 MOVS m32, m32 NP Valid Valid
        {s: S.D},
        // REX.W + A5 MOVS m64, m64 NP Valid N.E. Move qword from address (R|E)SI to (R|E)DI.
        {s: S.Q},
    ];
}

function tpl_lss(op = 0x0FB2) {
    return [{o: op},
        // 0F B2 /r LSS r16,m16:16 RM Valid Valid Load SS:r16 with far pointer from memory.
        {ops: [rm16, m]},
        // 0F B2 /r LSS r32,m16:32 RM Valid Valid Load SS:r32 with far pointer from memory.
        {ops: [rm32, m]},
        // REX + 0F B2 /r LSS r64,m16:64 RM Valid N.E. Load SS:r64 with far pointer from memory.
        {ops: [rm64, m]},
    ];
}


export var table: t.TableDefinition = extend<t.TableDefinition>({}, t.table, {

    // ## Data Transfer
    // MOV Move data between general-purpose registers
    mov:[{},
        // 88 /r MOV r/m8,r8 MR Valid Valid Move r8 to r/m8.
        // REX + 88 /r MOV r/m8***,r8*** MR Valid N.E. Move r8 to r/m8.
        // 8A /r MOV r8,r/m8 RM Valid Valid Move r/m8 to r8.
        // REX + 8A /r MOV r8***,r/m8*** RM Valid N.E. Move r/m8 to r8.
        {o: 0x88, ops: [rm8, rm8], dbit: true},
        // 89 /r MOV r/m16,r16 MR Valid Valid Move r16 to r/m16.
        // 8B /r MOV r16,r/m16 RM Valid Valid Move r/m16 to r16.
        {o: 0x89, ops: [rm16, rm16], dbit: true},
        // 89 /r MOV r/m32,r32 MR Valid Valid Move r32 to r/m32.
        // 8B /r MOV r32,r/m32 RM Valid Valid Move r/m32 to r32.
        {o: 0x89, ops: [rm32, rm32], dbit: true},
        // REX.W + 89 /r MOV r/m64,r64 MR Valid N.E. Move r64 to r/m64.
        // REX.W + 8B /r MOV r64,r/m64 RM Valid N.E. Move r/m64 to r64.
        {o: 0x89, ops: [rm64, rm64], dbit: true},

        // 8C /r MOV r/m16,Sreg** MR Valid Valid Move segment register to r/m16.
        {o: 0x8C, ops: [rm16, sreg], s: S.W},
        // 8E /r MOV Sreg,r/m16** RM Valid Valid Move r/m16 to segment register.
        {o: 0x8E, ops: [sreg, rm16], s: S.W},
        // REX.W + 8C /r MOV r/m64,Sreg** MR Valid Valid Move zero extended 16-bit segment register to r/m64.
        {o: 0x8C, ops: [rm64, sreg], s: S.W},
        // REX.W + 8E /r MOV Sreg,r/m64** RM Valid Valid Move lower 16 bits of r/m64 to segment register.
        {o: 0x8E, ops: [sreg, rm64], s: S.W},

        // B0+ rb ib MOV r8, imm8 OI Valid Valid Move imm8 to r8.
        // REX + B0+ rb ib MOV r8***, imm8 OI Valid N.E. Move imm8 to r8.
        {o: 0xB0, r: true, ops: [r8, imm8]},
        // B8+ rw iw MOV r16, imm16 OI Valid Valid Move imm16 to r16.
        {o: 0xB8, r: true, ops: [r16, imm16]},
        // B8+ rd id MOV r32, imm32 OI Valid Valid Move imm32 to r32.
        {o: 0xB8, r: true, ops: [r32, imm32]},
        // REX.W + B8+ rd io MOV r64, imm64 OI Valid N.E. Move imm64 to r64.
        {o: 0xB8, r: true, ops: [r64, imm64]},
        // C6 /0 ib MOV r/m8, imm8 MI Valid Valid Move imm8 to r/m8.
        // REX + C6 /0 ib MOV r/m8***, imm8 MI Valid N.E. Move imm8 to r/m8.
        {o: 0xC6, or: 0, ops: [rm8, imm8]},
        // C7 /0 iw MOV r/m16, imm16 MI Valid Valid Move imm16 to r/m16.
        {o: 0xC7, or: 0, ops: [rm16, imm16]},
        // C7 /0 id MOV r/m32, imm32 MI Valid Valid Move imm32 to r/m32.
        {o: 0xC7, or: 0, ops: [rm32, imm32]},
        // REX.W + C7 /0 io MOV r/m64, imm32 MI Valid N.E. Move imm32 sign extended to 64-bits to r/m64.
        {o: 0xC7, or: 0, ops: [rm64, imm32]},
    ],
    movabs: [{},
        // A0 MOV AL,moffs8* FD Valid Valid Move byte at (seg:offset) to AL.
        // REX.W + A0 MOV AL,moffs8* FD Valid N.E. Move byte at (offset) to AL.
        {o: 0xA0, ops: [o.al, imm8]},
        // A1 MOV AX,moffs16* FD Valid Valid Move word at (seg:offset) to AX.
        {o: 0xA1, ops: [o.ax, imm16]},
        // A1 MOV EAX,moffs32* FD Valid Valid Move doubleword at (seg:offset) to EAX.
        {o: 0xA1, ops: [o.eax, imm32]},
        // REX.W + A1 MOV RAX,moffs64* FD Valid N.E. Move quadword at (offset) to RAX.
        {o: 0xA1, ops: [o.rax, imm64]},
        // A2 MOV moffs8,AL TD Valid Valid Move AL to (seg:offset).
        // REX.W + A2 MOV moffs8***,AL TD Valid N.E. Move AL to (offset).
        {o: 0xA2, ops: [imm8, o.al]},
        // A3 MOV moffs16*,AX TD Valid Valid Move AX to (seg:offset).
        {o: 0xA3, ops: [imm16, o.ax]},
        // A3 MOV moffs32*,EAX TD Valid Valid Move EAX to (seg:offset).
        {o: 0xA3, ops: [imm32, o.eax]},
        // REX.W + A3 MOV moffs64*,RAX TD Valid N.E. Move RAX to (offset).
        {o: 0xA3, ops: [imm64, o.rax]},
    ],
    // CMOVE/CMOVZ Conditional move if equal/Conditional move if zero
    cmove: tpl_cmovc(0x0F44, ['cmovz']),
    // CMOVNE/CMOVNZ Conditional move if not equal/Conditional move if not zero
    cmovne: tpl_cmovc(0x0F45, ['cmovnz']),
    // CMOVA/CMOVNBE Conditional move if above/Conditional move if not below or equal
    cmova: tpl_cmovc(0x0F47, ['cmovnbe']),
    // CMOVAE/CMOVNB Conditional move if above or equal/Conditional move if not below
    cmovae: tpl_cmovc(0x0F43, ['cmovnb']),
    // CMOVB/CMOVNAE Conditional move if below/Conditional move if not above or equal
    cmovb: tpl_cmovc(0x0F42, ['cmovnae']),
    // CMOVBE/CMOVNA Conditional move if below or equal/Conditional move if not above
    cmovbe: tpl_cmovc(0x0F46, ['cmovna']),
    // CMOVG/CMOVNLE Conditional move if greater/Conditional move if not less or equal
    cmovg: tpl_cmovc(0x0F4F, ['cmovnle']),
    // CMOVGE/CMOVNL Conditional move if greater or equal/Conditional move if not less
    cmovge: tpl_cmovc(0x0F4D, ['cmovnl']),
    // CMOVL/CMOVNGE Conditional move if less/Conditional move if not greater or equal
    cmovl: tpl_cmovc(0x0F4C, ['cmovnge']),
    // CMOVLE/CMOVNG Conditional move if less or equal/Conditional move if not greater
    cmovle: tpl_cmovc(0x0F4E, ['cmovng']),
    // CMOVC Conditional move if carry
    cmovc: tpl_cmovc(),
    // CMOVNC Conditional move if not carry
    cmovnc: tpl_cmovc(0x0F43),
    // CMOVO Conditional move if overflow
    cmovo: tpl_cmovc(0x0F40),
    // CMOVNO Conditional move if not overflow
    cmovno: tpl_cmovc(0x0F41),
    // CMOVS Conditional move if sign (negative)
    cmovs: tpl_cmovc(0x0F48),
    // CMOVNS Conditional move if not sign (non-negative)
    cmovns: tpl_cmovc(0x0F4B),
    // CMOVP/CMOVPE Conditional move if parity/Conditional move if parity even
    cmovp: tpl_cmovc(0x0F4A, ['cmovpe']),
    // CMOVNP/CMOVPO Conditional move if not parity/Conditional move if parity odd
    cmovnp: tpl_cmovc(0x0F4B, ['cmovpo']),
    // XCHG Exchange
    xchg: [{},
        // 90+rw XCHG AX, r16 O Valid Valid Exchange r16 with AX.
        {o: 0x90, r: true, ops: [o.ax, r16]},
        // 90+rw XCHG r16, AX O Valid Valid Exchange AX with r16.
        {o: 0x90, r: true, ops: [r16, o.ax]},
        // 90+rd XCHG EAX, r32 O Valid Valid Exchange r32 with EAX.
        {o: 0x90, r: true, ops: [o.eax, r32]},
        // REX.W + 90+rd XCHG RAX, r64 O Valid N.E. Exchange r64 with RAX.
        {o: 0x90, r: true, ops: [o.rax, r64]},
        // 90+rd XCHG r32, EAX O Valid Valid Exchange EAX with r32.
        {o: 0x90, r: true, ops: [r32, o.eax]},
        // REX.W + 90+rd XCHG r64, RAX O Valid N.E. Exchange RAX with r64.
        {o: 0x90, r: true, ops: [r64, o.rax]},
        // 86 /r XCHG r/m8, r8 MR Valid Valid Exchange r8 (byte register) with byte from r/m8.
        // REX + 86 /r XCHG r/m8*, r8* MR Valid N.E. Exchange r8 (byte register) with byte from r/m8.
        // 86 /r XCHG r8, r/m8 RM Valid Valid Exchange byte from r/m8 with r8 (byte register).
        // REX + 86 /r XCHG r8*, r/m8* RM Valid N.E. Exchange byte from r/m8 with r8 (byte register).
        {o: 0x86, ops: [rm8, rm8]},
        // 87 /r XCHG r/m16, r16 MR Valid Valid Exchange r16 with word from r/m16.
        // 87 /r XCHG r16, r/m16 RM Valid Valid Exchange word from r/m16 with r16.
        {o: 0x87, ops: [rm16, rm16]},
        // 87 /r XCHG r/m32, r32 MR Valid Valid Exchange r32 with doubleword from r/m32.
        // 87 /r XCHG r32, r/m32 RM Valid Valid Exchange doubleword from r/m32 with r32.
        {o: 0x87, ops: [rm32, rm32]},
        // REX.W + 87 /r XCHG r/m64, r64 MR Valid N.E. Exchange r64 with quadword from r/m64.
        // REX.W + 87 /r XCHG r64, r/m64 RM Valid N.E. Exchange quadword from r/m64 with r64.
        {o: 0x87, ops: [rm64, rm64]},
    ],
    // BSWAP Byte swap
    bswap: [{},
        // 0F C8+rd BSWAP r32 O Valid* Valid Reverses the byte order of a 32-bit register.
        {o: 0x0FC8, r: true, ops: [r32]},
        // REX.W + 0F C8+rd BSWAP r64 O Valid N.E. Reverses the byte order of a 64-bit register.
        {o: 0x0FC8, r: true, ops: [r64]},
    ],
    // XADD Exchange and add
    xadd: tpl_xadd(0x0FC0),
    // CMPXCHG Compare and exchange
    cmpxchg: tpl_xadd(0x0FB0),
    // CMPXCHG8B Compare and exchange 8 bytes
    cmpxchg8b: [{o: 0x0FC7, or: 1, ops: [m], s: S.Q}],
    cmpxchg16b: [{o: 0x0FC7, or: 1, ops: [m], s: S.O}],
    // PUSH Push onto stack
    push: [{ds: S.Q},
        // FF /6 PUSH r/m16 M Valid Valid Push r/m16.
        {o: 0xFF, or: 6, ops: [rm16]},
        // FF /6 PUSH r/m64 M Valid N.E. Push r/m64.
        {o: 0xFF, or: 6, ops: [rm64]},
        // 50+rw PUSH r16 O Valid Valid Push r16.
        {o: 0x50, r: true, ops: [r16]},
        // 50+rd PUSH r64 O Valid N.E. Push r64.
        {o: 0x50, r: true, ops: [r64]},
        // 6A ib PUSH imm8 I Valid Valid Push imm8.
        {o: 0x6A, ops: [imm8]},
        // 68 iw PUSH imm16 I Valid Valid Push imm16.
        {o: 0x68, ops: [imm16]},
        // 68 id PUSH imm32 I Valid Valid Push imm32.
        {o: 0x68, ops: [imm32]},
        // 0F A0 PUSH FS NP Valid Valid Push FS.
        {o: 0x0FA0, ops: [o.fs]},
        // 0F A8 PUSH GS NP Valid Valid Push GS.
        {o: 0x0FA8, ops: [o.gs]},
    ],
    // POP Pop off of stack
    pop: [{ds: S.Q},
        // 8F /0 POP r/m16 M Valid Valid
        {o: 0x8F, or: 0, ops: [rm16]},
        // 8F /0 POP r/m64 M Valid N.E.
        {o: 0x8F, or: 0, ops: [rm64]},
        // 58+ rw POP r16 O Valid Valid
        {o: 0x58, r: true, ops: [rm16]},
        // 58+ rd POP r64 O Valid N.E.
        {o: 0x58, r: true, ops: [rm64]},
        // 0F A1 POP FS NP Valid Valid 16-bits
        {o: 0x0FA1, ops: [o.fs], s: S.W},
        // 0F A1 POP FS NP Valid N.E. 64-bits
        {o: 0x0FA1, ops: [o.fs], s: S.Q},
        // 0F A9 POP GS NP Valid Valid 16-bits
        {o: 0x0FA9, ops: [o.gs], s: S.W},
        // 0F A9 POP GS NP Valid N.E. 64-bits
        {o: 0x0FA9, ops: [o.gs], s: S.W},
    ],
    // CWD/CDQ/CQO Convert word to doubleword/Convert doubleword to quadword
    // 99 CWD NP Valid Valid DX:AX ← sign-extend of AX.
    cwd: [{o: 0x99, s: S.W}],
    // 99 CDQ NP Valid Valid EDX:EAX ← sign-extend of EAX.
    cdq: [{o: 0x99, s: S.D}],
    // REX.W + 99 CQO NP Valid N.E. RDX:RAX← sign-extend of RAX.
    cqo: [{o: 0x99, s: S.Q}],
    // CBW/CWDE/CDQE Convert byte to word/Convert word to doubleword in EAX register
    // 98 CBW NP Valid Valid AX ← sign-extend of AL.
    cbw: [{o: 0x98, s: S.W}],
    // 98 CWDE NP Valid Valid EAX ← sign-extend of AX.
    cwde: [{o: 0x98, s: S.D}],
    // REX.W + 98 CDQE NP Valid N.E. RAX ← sign-extend of EAX.
    cdqe: [{o: 0x98, s: S.Q}],
    // MOVSX Move and sign extend
    movsx: [{},
        // 0F BE /r MOVSX r16, r/m8 RM Valid Valid Move byte to word with sign-extension.
        {o: 0x0FBE, ops: [r16, rm8], s: S.W},
        // 0F BE /r MOVSX r32, r/m8 RM Valid Valid Move byte to doubleword with signextension.
        {o: 0x0FBE, ops: [r32, rm8], s: S.D},
        // REX + 0F BE /r MOVSX r64, r/m8* RM Valid N.E. Move byte to quadword with sign-extension.
        {o: 0x0FBE, ops: [r64, rm8], s: S.Q},
        // 0F BF /r MOVSX r32, r/m16 RM Valid Valid Move word to doubleword, with signextension.
        {o: 0x0FBF, ops: [r32, rm16], s: S.D},
        // REX.W + 0F BF /r MOVSX r64, r/m16 RM Valid N.E. Move word to quadword with sign-extension.
        {o: 0x0FBF, ops: [r64, rm16], s: S.Q},
        // REX.W** + 63 /r MOVSXD r64, r/m32 RM Valid N.E. Move doubleword to quadword with signextension.
        {o: 0x0FBF, ops: [r64, rm32], s: S.Q},
    ],
    // MOVZX Move and zero extend
    movzx: [{},
        // 0F B6 /r MOVZX r16, r/m8 RM Valid Valid Move byte to word with zero-extension.
        {o: 0x0FB6, ops: [r16, rm8], s: S.W},
        // 0F B6 /r MOVZX r32, r/m8 RM Valid Valid Move byte to doubleword, zero-extension.
        {o: 0x0FB6, ops: [r32, rm8], s: S.D},
        // REX.W + 0F B6 /r MOVZX r64, r/m8* RM Valid N.E. Move byte to quadword, zero-extension.
        {o: 0x0FB6, ops: [r64, rm8], s: S.Q},
        // 0F B7 /r MOVZX r32, r/m16 RM Valid Valid Move word to doubleword, zero-extension.
        {o: 0x0FB7, ops: [r32, rm16], s: S.D},
        // REX.W + 0F B7 /r MOVZX r64, r/m16 RM Valid N.E. Move word to quadword, zero-extension.
        {o: 0x0FB7, ops: [r64, rm16], s: S.Q},
    ],


    // ## Binary Arithmetic
    // ADCX Unsigned integer add with carry
    adcx: [{o: 0x0F38F6, pfx: [0x66], ops: [r64, rm64]}],
    // ADOX Unsigned integer add with overflow
    adox: [{o: 0x0F38F6, pfx: [0xF3], ops: [r64, rm64]}],
    // ADD Integer add
    add: tpl_and(0x04, 0x80, 0, 0x00),
    // ADC Add with carry
    adc: tpl_and(0x14, 0x80, 2, 0x10),
    // SUB Subtract
    sub: tpl_and(0x2C, 0x80, 5, 0x28),
    // SBB Subtract with borrow
    sbb: tpl_and(0x1C, 0x80, 3, 0x18),
    // IMUL Signed multiply
    imul: [{},
        // F6 /5 IMUL r/m8* M Valid Valid AX← AL ∗ r/m byte.
        {o: 0xF6, or: 5, ops: [rm8]},
        // F7 /5 IMUL r/m16 M Valid Valid DX:AX ← AX ∗ r/m word.
        {o: 0xF7, or: 5, ops: [rm16]},
        // F7 /5 IMUL r/m32 M Valid Valid EDX:EAX ← EAX ∗ r/m32.
        {o: 0xF7, or: 5, ops: [rm32]},
        // REX.W + F7 /5 IMUL r/m64 M Valid N.E. RDX:RAX ← RAX ∗ r/m64.
        {o: 0xF7, or: 5, ops: [rm64]},
        // 0F AF /r IMUL r16, r/m16 RM Valid Valid word register ← word register ∗ r/m16.
        {o: 0x0FAF, ops: [r16, rm16]},
        // 0F AF /r IMUL r32, r/m32 RM Valid Valid doubleword register ← doubleword register ∗ r/m32.
        {o: 0x0FAF, ops: [r32, rm32]},
        // REX.W + 0F AF /r IMUL r64, r/m64 RM Valid N.E. Quadword register ← Quadword register ∗ r/m64.
        {o: 0x0FAF, ops: [r64, rm64]},
        // 6B /r ib IMUL r16, r/m16, imm8 RMI Valid Valid word register ← r/m16 ∗ sign-extended immediate byte.
        {o: 0x6B, ops: [r16, rm16, imm8]},
        // 6B /r ib IMUL r32, r/m32, imm8 RMI Valid Valid doubleword register ← r/m32 ∗ signextended immediate byte.
        {o: 0x6B, ops: [r32, rm32, imm8]},
        // REX.W + 6B /r ib IMUL r64, r/m64, imm8 RMI Valid N.E. Quadword register ← r/m64 ∗ sign-extended immediate byte.
        {o: 0x6B, ops: [r64, rm64, imm8]},
        // 69 /r iw IMUL r16, r/m16, imm16 RMI Valid Valid word register ← r/m16 ∗ immediate word.
        {o: 0x69, ops: [r16, rm16, imm16]},
        // 69 /r id IMUL r32, r/m32, imm32 RMI Valid Valid doubleword register ← r/m32 ∗ immediate doubleword.
        {o: 0x69, ops: [r32, rm32, imm32]},
        // REX.W + 69 /r id IMUL r64, r/m64, imm32 RMI Valid N.E. Quadword register
        {o: 0x69, ops: [r64, rm64, imm32]},
    ],
    // MUL Unsigned multiply
    mul: tpl_not(0xF6, 4, false),
    // IDIV Signed divide
    idiv: tpl_not(0xF6, 7, false),
    // DIV Unsigned divide
    div: tpl_not(0xF6, 6, false),
    // INC Increment
    inc: tpl_not(0xFE, 0),
    // DEC Decrement
    dec: tpl_not(0xFE, 1),
    // NEG Negate
    neg: tpl_not(0xF6, 3),
    // CMP Compare
    cmp: tpl_and(0x3C, 0x80, 7, 0x38, false),


    // ## Logical
    // AND Perform bitwise logical AND
    and: tpl_and(),
    // OR Perform bitwise logical OR
    or:  tpl_and(0x0C, 0x80, 1, 0x08),
    // XOR Perform bitwise logical exclusive OR
    xor: tpl_and(0x34, 0x80, 6, 0x30),
    // NOT Perform bitwise logical NOT
    not: tpl_not(),


    // ## Shift and Rotate
    // SAR Shift arithmetic right
    sar: tpl_sar(),
    // SHR Shift logical right
    shr: tpl_sar(5),
    // SAL/SHL Shift arithmetic left/Shift logical left
    shl: tpl_sar(4, 0xD0, 0xC0, ['sal']),
    // SHRD Shift right double
    shrd: tpl_shrd(),
    // SHLD Shift left double
    shld: tpl_shrd(0x0FA4),
    // ROR Rotate right
    ror: tpl_sar(1),
    // ROL Rotate left
    rol: tpl_sar(0),
    // RCR Rotate through carry right
    rcr: tpl_sar(3),
    // RCL Rotate through carry left
    rcl: tpl_sar(2),


    // ## Bit and Byte
    // BT Bit test
    bt: tpl_bt(),
    // BTS Bit test and set
    bts: tpl_bt(0x0FAB, 4),
    // BTR Bit test and reset
    btr: tpl_bt(0x0FB3, 6),
    // BTC Bit test and complement
    btc: tpl_bt(0x0FBB, 7),
    // BSF Bit scan forward
    bsf: tpl_bsf(),
    // BSR Bit scan reverse
    bsr: tpl_bsf(0x0FBD),
    // SETE/SETZ Set byte if equal/Set byte if zero
    sete: [{o: 0x0F94, ops: [rm8], mns: ['setz']}],
    // SETNE/SETNZ Set byte if not equal/Set byte if not zero
    setne: [{o: 0x0F95, ops: [rm8], mns: ['setnz']}],
    // SETA/SETNBE Set byte if above/Set byte if not below or equal
    seta: [{o: 0x0F97, ops: [rm8], mns: ['setnbe']}],
    // SETAE/SETNB/SETNC Set byte if above or equal/Set byte if not below/Set byte if not carry
    setae: [{o: 0x0F93, ops: [rm8], mns: ['setnb', 'setnc']}],
    // SETB/SETNAE/SETCSet byte if below/Set byte if not above or equal/Set byte if carry
    setb: [{o: 0x0F92, ops: [rm8], mns: ['setnae', 'setc']}],
    // SETBE/SETNA Set byte if below or equal/Set byte if not above
    setbe: [{o: 0x0F96, ops: [rm8], mns: ['setna']}],
    // SETG/SETNLE Set byte if greater/Set byte if not less or equal
    setg: [{o: 0x0F9F, ops: [rm8], mns: ['setnle']}],
    // SETGE/SETNL Set byte if greater or equal/Set byte if not less
    setge: [{o: 0x0F9D, ops: [rm8], mns: ['setnl']}],
    // SETL/SETNGE Set byte if less/Set byte if not greater or equal
    setl: [{o: 0x0F9C, ops: [rm8], mns: ['setnge']}],
    // SETLE/SETNG Set byte if less or equal/Set byte if not greater
    setle: [{o: 0x0F9E, ops: [rm8], mns: ['setng']}],
    // SETS Set byte if sign (negative)
    sets: [{o: 0x0F98, ops: [rm8]}],
    // SETNS Set byte if not sign (non-negative)
    setns: [{o: 0x0F99, ops: [rm8]}],
    // SETO Set byte if overflow
    seto: [{o: 0x0F90, ops: [rm8]}],
    // SETNO Set byte if not overflow
    setno: [{o: 0x0F91, ops: [rm8]}],
    // SETPE/SETP Set byte if parity even/Set byte if parity
    setp: [{o: 0x0F9A, ops: [rm8], mns: ['setpe']}],
    // SETPO/SETNP Set byte if parity odd/Set byte if not parity
    setnp: [{o: 0x0F9B, ops: [rm8], mns: ['setpo']}],
    // TEST Logical compare
    test: [{},
        // A8 ib TEST AL, imm8 I Valid Valid AND imm8 with AL; set SF, ZF, PF according to result.
        {o: 0xA8, ops: [o.al, imm8]},
        // A9 iw TEST AX, imm16 I Valid Valid AND imm16 with AX; set SF, ZF, PF according to result.
        {o: 0xA9, ops: [o.ax, imm16]},
        // A9 id TEST EAX, imm32 I Valid Valid AND imm32 with EAX; set SF, ZF, PF according to result.
        {o: 0xA9, ops: [o.eax, imm32]},
        // REX.W + A9 id TEST RAX, imm32 I Valid N.E. AND imm32 sign-extended to 64-bits with RAX; set SF, ZF, PF according to result.
        {o: 0xA9, ops: [o.rax, imm32]},
        // F6 /0 ib TEST r/m8, imm8 MI Valid Valid AND imm8 with r/m8; set SF, ZF, PF according to result.
        // REX + F6 /0 ib TEST r/m8*, imm8 MI Valid N.E. AND imm8 with r/m8; set SF, ZF, PF according to result.
        {o: 0xF6, or: 0, ops: [rm8, imm8]},
        // F7 /0 iw TEST r/m16, imm16 MI Valid Valid AND imm16 with r/m16; set SF, ZF, PF according to result.
        {o: 0xF7, or: 0, ops: [rm16, imm16]},
        // F7 /0 id TEST r/m32, imm32 MI Valid Valid AND imm32 with r/m32; set SF, ZF, PF according to result.
        {o: 0xF7, or: 0, ops: [rm32, imm32]},
        // REX.W + F7 /0 id TEST r/m64, imm32 MI Valid N.E. AND imm32 sign-extended to 64-bits with r/m64; set SF, ZF, PF according to result.
        {o: 0xF7, or: 0, ops: [rm64, imm32]},
        // 84 /r TEST r/m8, r8 MR Valid Valid AND r8 with r/m8; set SF, ZF, PF according to result.
        // REX + 84 /r TEST r/m8*, r8* MR Valid N.E. AND r8 with r/m8; set SF, ZF, PF according to result.
        {o: 0x84, ops: [rm8, r8]},
        // 85 /r TEST r/m16, r16 MR Valid Valid AND r16 with r/m16; set SF, ZF, PF according to result.
        {o: 0x85, ops: [rm16, r16]},
        // 85 /r TEST r/m32, r32 MR Valid Valid AND r32 with r/m32; set SF, ZF, PF according to result.
        {o: 0x85, ops: [rm32, r32]},
        // REX.W + 85 /r TEST r/m64, r64 MR Valid N.E. AND r64 with
        {o: 0x85, ops: [rm64, r64]},
    ],
    // CRC32 Provides hardware acceleration to calculate cyclic redundancy checks for fast and efficient implementation of data integrity protocols.
    crc32: [{pfx: [0xF2]},
        // F2 0F 38 F0 /r CRC32 r32, r/m8 RM Valid Valid Accumulate CRC32 on r/m8.
        // F2 REX 0F 38 F0 /r CRC32 r32, r/m8* RM Valid N.E. Accumulate CRC32 on r/m8.
        {o: 0x0F38F0, ops: [r32, rm8], s: S.D},
        // F2 0F 38 F1 /r CRC32 r32, r/m16 RM Valid Valid Accumulate CRC32 on r/m16.
        {o: 0x0F38F1, ops: [r32, rm16], s: S.D},
        // F2 0F 38 F1 /r CRC32 r32, r/m32 RM Valid Valid Accumulate CRC32 on r/m32.
        {o: 0x0F38F1, ops: [r32, rm32], s: S.D},
        // F2 REX.W 0F 38 F0 /r CRC32 r64, r/m8 RM Valid N.E. Accumulate CRC32 on r/m8.
        {o: 0x0F38F0, ops: [r64, rm8], s: S.Q},
        // F2 REX.W 0F 38 F1 /r CRC32 r64, r/m64
        {o: 0x0F38F1, ops: [r64, rm64]},
    ],
    // POPCNT This instruction calculates of number of bits set to 1 in the second
    popcnt: [{pfx: [0xF3]},
        // F3 0F B8 /r POPCNT r16, r/m16 RM Valid Valid POPCNT on r/m16
        {o: 0x0FB8, ops: [r16, rm16], s: S.W},
        // F3 0F B8 /r POPCNT r32, r/m32 RM Valid Valid POPCNT on r/m32
        {o: 0x0FB8, ops: [r32, rm32], s: S.D},
        // F3 REX.W 0F B8 /r POPCNT r64, r/m64 RM Valid N.E. POPCNT on r/m64
        {o: 0x0FB8, ops: [r64, rm64], s: S.Q},
    ],


    // ## Control Transfer
    // JMP Jump
    jmp: [{ds: S.Q},
        // relX is just immX
        // EB cb JMP rel8 D Valid Valid Jump short, RIP = RIP + 8-bit displacement sign extended to 64-bits
        {o: 0xEB, ops: [rel8]},
        // E9 cd JMP rel32 D Valid Valid Jump near, relative, RIP = RIP + 32-bit displacement sign extended to 64-bits
        {o: 0xE9, ops: [rel32]},
        // FF /4 JMP r/m64 M Valid N.E. Jump near, absolute indirect, RIP = 64-Bit offset from register or memory
        {o: 0xFF, or: 4, ops: [rm64]},
    ],
    ljmp: [{ds: S.Q},
        // FF /5 JMP m16:16 D Valid Valid Jump far, absolute indirect, address given in m16:16
        // FF /5 JMP m16:32 D Valid Valid Jump far, absolute indirect, address given in m16:32.
        // REX.W + FF /5 JMP m16:64 D Valid N.E. Jump far, absolute
        // TODO: Improve this.
        {o: 0xFF, or: 5, ops: [m], s: S.Q},
    ],
    // Jcc
    // E3 cb JECXZ rel8 D Valid Valid Jump short if ECX register is 0.
    jecxz: [{o: 0xE3, ops: [rel8], pfx: [0x67]}],
    // E3 cb JRCXZ rel8 D Valid N.E. Jump short if RCX register is 0.
    jrcxz: [{o: 0xE3, ops: [rel8]}],
    ja:     tpl_ja(),
    jae:    tpl_ja(0x73, 0x0F83),
    jb:     tpl_ja(0x72, 0x0F82),
    jbe:    tpl_ja(0x76, 0x0F86),
    jc:     tpl_ja(0x72, 0x0F82),
    je:     tpl_ja(0x74, 0x0F84),
    jg:     tpl_ja(0x7F, 0x0F8F),
    jge:    tpl_ja(0x7D, 0x0F8D),
    jl:     tpl_ja(0x7C, 0x0F8C),
    jle:    tpl_ja(0x7E, 0x0F8E),
    jna:    tpl_ja(0x76, 0x0F86),
    jnae:   tpl_ja(0x72, 0x0F82),
    jnb:    tpl_ja(0x73, 0x0F83),
    jnbe:   tpl_ja(0x77, 0x0F87),
    jnc:    tpl_ja(0x73, 0x0F83),
    jne:    tpl_ja(0x75, 0x0F85),
    jng:    tpl_ja(0x7E, 0x0F8E),
    jnge:   tpl_ja(0x7C, 0x0F8C),
    jnl:    tpl_ja(0x7D, 0x0F8D),
    jnle:   tpl_ja(0x7F, 0x0F8F),
    jno:    tpl_ja(0x71, 0x0F81),
    jnp:    tpl_ja(0x7B, 0x0F8B),
    jns:    tpl_ja(0x79, 0x0F89),
    jnz:    tpl_ja(0x75, 0x0F85),
    jo:     tpl_ja(0x70, 0x0F80),
    jp:     tpl_ja(0x7A, 0x0F8A),
    jpe:    tpl_ja(0x7A, 0x0F8A),
    jpo:    tpl_ja(0x7B, 0x0F8B),
    js:     tpl_ja(0x78, 0x0F88),
    jz:     tpl_ja(0x74, 0x0F84),
    // LOOP Loop with ECX counter
    // E2 cb LOOP rel8 D Valid Valid Decrement count; jump short if count ≠ 0.
    loop: [{o: 0xE2, ops: [rel8]}],
    // LOOPZ/LOOPE Loop with ECX and zero/Loop with ECX and equal
    // E1 cb LOOPE rel8 D Valid Valid Decrement count; jump short if count ≠ 0 and ZF = 1.
    loope: [{o: 0xE1, ops: [rel8], mns: ['loopz']}],
    // LOOPNZ/LOOPNE Loop with ECX and not zero/Loop with ECX and not equal
    // E0 cb LOOPNE rel8 D Valid Valid Decrement count; jump short if count ≠ 0 and ZF = 0.
    loopne: [{o: 0xE0, ops: [rel8], mns: ['loopnz']}],
    // CALL Call procedure
    call: [{ds: S.Q},
        // E8 cd CALL rel32 M Valid Valid Call near, relative, displacement relative to next instruction. 32-bit displacement sign extended to 64-bits in 64-bit mode.
        {o: 0xE8, ops: [rel32]},
        // FF /2 CALL r/m64 M Valid N.E. Call near, absolute indirect, address given in r/m64.
        {o: 0xFF, or: 2, ops: [rm64]},
    ],
    lcall: [{ds: S.Q},
        // FF /3 CALL m16:16 M Valid Valid Call far, absolute indirect address given in m16:16.
        // FF /3 CALL m16:32 M Valid Valid
        // REX.W + FF /3 CALL m16:64 M Valid N.E.
        // TODO: Test this.
        // {o: 0xFF, or: 3, ops: [m], s: S.Q},
        {o: 0xFF, or: 3, ops: [m], s: S.D},
    ],
    // RET Return
    ret: [{ds: S.Q},
        {o: 0xC3},
        {o: 0xC2, ops: [imm16]}
    ],
    lret: [{ds: S.Q},
        {o: 0xCB},
        {o: 0xCA, ops: [imm16]}
    ],
    // IRET Return from interrupt
    iret: [{o: 0xCF}
        // CF IRET NP Valid Valid Interrupt return (16-bit operand size).
        // CF IRETD NP Valid Valid Interrupt return (32-bit operand size).
        // REX.W + CF IRETQ NP Valid N.E. Interrupt return (64-bit operand size).
    ],


    // ## String
    // MOVS Move string/Move byte string
    movs: tpl_movs(),
    // CMPS Compare string/Compare byte string
    cmps: tpl_movs(0xA6),
    // SCAS Scan string/Scan byte string
    scas: tpl_movs(0xAE),
    // LODS/LODSB Load string/Load byte string
    lods: tpl_movs(0xAC),
    // STOS Store string/Store byte string
    stos: tpl_movs(0xAA),


    // ## I/O
    // IN Read from a port
    'in': [{mr: false},
        // E4 ib IN AL, imm8 I Valid Valid Input byte from imm8 I/O port address into AL.
        {o: 0xE4, ops: [o.al, imm8]},
        // E5 ib IN AX, imm8 I Valid Valid Input word from imm8 I/O port address into AX.
        {o: 0xE5, ops: [o.ax, imm8]},
        // E5 ib IN EAX, imm8 I Valid Valid Input dword from imm8 I/O port address into EAX.
        {o: 0xE5, ops: [o.eax, imm8]},
        // EC IN AL,DX NP Valid Valid Input byte from I/O port in DX into AL.
        {o: 0xEC, ops: [o.al, o.dx], s: S.B},
        // ED IN AX,DX NP Valid Valid Input word from I/O port in DX into AX.
        {o: 0xED, ops: [o.ax, o.dx], s: S.W},
        // ED IN EAX,DX NP Valid Valid Input doubleword
        {o: 0xED, ops: [o.eax, o.dx], s: S.D},
    ],
    // OUT Write to a port
    out: [{mr: false},
        // E6 ib OUT imm8, AL I Valid Valid Output byte in AL to I/O port address imm8.
        {o: 0xE6, ops: [imm8, o.al]},
        // E7 ib OUT imm8, AX I Valid Valid Output word in AX to I/O port address imm8.
        {o: 0xE7, ops: [imm8, o.ax]},
        // E7 ib OUT imm8, EAX I Valid Valid Output doubleword in EAX to I/O port address imm8.
        {o: 0xE7, ops: [imm8, o.eax]},
        // EE OUT DX, AL NP Valid Valid Output byte in AL to I/O port address in DX.
        {o: 0xEE, ops: [o.dx, o.al], s: S.B},
        // EF OUT DX, AX NP Valid Valid Output word in AX to I/O port address in DX.
        {o: 0xEF, ops: [o.dx, o.ax], s: S.W},
        // EF OUT DX, EAX NP Valid Valid Output
        {o: 0xEF, ops: [o.dx, o.eax], s: S.D},
    ],
    // INS
    ins: [{o: 0x6D},
        // INS/INSB Input string from port/Input byte string from port
        {o: 0x6C, s: S.B},
        // INS/INSW Input string from port/Input word string from port
        {s: S.W},
        // INS/INSD Input string from port/Input doubleword string from port
        {s: S.D},
    ],
    // OUTS
    outs: [{o: 0x6F},
        // OUTS/OUTSB Output string to port/Output byte string to port
        {o: 0x6E, s: S.B},
        // OUTS/OUTSW Output string to port/Output word string to port
        {s: S.W},
        // OUTS/OUTSD Output string to port/Output doubleword string to port
        {s: S.D},
    ],


    // ## Enter and Leave
    // ENTER High-level procedure entry
    enter: [{},
        // C8 iw 00 ENTER imm16, 0 II Valid Valid Create a stack frame for a procedure.
        // C8 iw 01 ENTER imm16,1 II Valid Valid Create a stack frame with a nested pointer for a procedure.
        // C8 iw ib ENTER imm16, imm8 II Valid Valid Create a stack frame
        {o: 0xC8, ops: [imm16, imm8]},
    ],
    // LEAVE High-level procedure exit
    leave: [{o: 0xC9},
        {s: S.W},
        {s: S.Q},
    ],


    // ## Flag Control
    // STC Set carry flag
    stc: [{o: 0xF9}],
    // CLC Clear the carry flag
    clc: [{o: 0xF8}],
    // CMC Complement the carry flag
    cmc: [{o: 0xF5}],
    // CLD Clear the direction flag
    cld: [{o: 0xFC}],
    // STD Set direction flag
    std: [{o: 0xFD}],
    // PUSHF/PUSHFD Push EFLAGS onto stack
    pushf: [{o: 0x9C}],
    // POPF/POPFD Pop EFLAGS from stack
    popf: [{o: 0x9D}],
    // STI Set interrupt flag
    sti: [{o: 0xFB}],
    // CLI Clear the interrupt flag
    cli: [{o: 0xFA}],


    // ## Segment Register
    // LFS Load far pointer using FS
    lfs: tpl_lss(0x0FB4),
    // LGS Load far pointer using GS
    lgs: tpl_lss(0x0FB5),
    // LSS Load far pointer using SS
    lss: tpl_lss(),


    // ## Miscellaneous
    // LEA Load effective address
    lea: [{o: 0x8D},
        {ops: [r64, m]},
        {ops: [r32, m]},
        {ops: [r16, m]},
    ],
    // NOP No operation
    // TODO: Come back, review this.
    nop: [{},
        // 90 NOP NP Valid Valid One byte no-operation instruction.
        {o: 0x90},
        // 0F 1F /0 NOP r/m16 M Valid Valid Multi-byte no-operation instruction.
        {o: 0x0F1F, or: 0, ops: [rm16]},
        // 0F 1F /0 NOP r/m32 M Valid Valid Multi-byte no-operation instruction.
        {o: 0x0F1F, or: 0, ops: [rm32]},
    ],
    // UD2 Undefined instruction
    ud2: [{o: 0x0F0B}],
    // XLAT/XLATB Table lookup translation
    xlat: [{o: 0xD7}], // TODO: Review this.
    // CPUID Processor identification
    cpuid: [{o: 0x0FA2}],
    // MOVBE Move data after swapping data bytes
    movbe: [{},
        // 0F 38 F0 /r MOVBE r16, m16 RM Valid Valid Reverse byte order in m16 and move to r16.
        {o: 0x0F38F0, ops: [r16, m16]},
        // 0F 38 F0 /r MOVBE r32, m32 RM Valid Valid Reverse byte order in m32 and move to r32.
        {o: 0x0F38F0, ops: [r32, m32]},
        // REX.W + 0F 38 F0 /r MOVBE r64, m64 RM Valid N.E. Reverse byte order in m64 and move to r64.
        {o: 0x0F38F0, ops: [r64, m64]},
        // 0F 38 F1 /r MOVBE m16, r16 MR Valid Valid Reverse byte order in r16 and move to m16.
        {o: 0x0F38F1, ops: [m16, r16]},
        // 0F 38 F1 /r MOVBE m32, r32 MR Valid Valid Reverse byte order in r32 and move to m32.
        {o: 0x0F38F1, ops: [m32, r32]},
        // REX.W + 0F 38 F1 /r MOVBE m64, r64 MR Valid N.E. Reverse byte order in r64 and move to m64.
        {o: 0x0F38F1, ops: [m64, r64]},
    ],
    // PREFETCHW Prefetch data into cache in anticipation of write
    prefetchw: [{o: 0x0F0D, or: 1, ops: [m]}],
    // PREFETCHWT1 Prefetch hint T1 with intent to write
    prefetchwt1: [{o: 0x0F0D, or: 2, ops: [m]}],
    // CLFLUSH Flushes and invalidates a memory operand and its associated cache line from all levels of the processor’s cache hierarchy
    cflush: [{o: 0x0FAE, or: 7, ops: [m]}],
    // CLFLUSHOPT Flushes and invalidates a memory operand and its associated cache line from all levels of the processor’s cache hierarchy with optimized memory system throughput.
    cflushopt: [{o: 0x0FAE, or: 7, pfx: [0x66], ops: [m]}],


    // ## User Mode Extended Sate Save/Restore
    // XSAVE Save processor extended states to memory
    xsave: [{o: 0x0FAE, or: 4, ops: [m]}],
    // XSAVEC Save processor extended states with compaction to memory
    xsavec: [{o: 0x0FC7, or: 4, ops: [m]}],
    // XSAVEOPT Save processor extended states to memory, optimized
    xsaveopt: [{o: 0x0FAE, or: 6, ops: [m]}],
    // XRSTOR Restore processor extended states from memory
    xrstor: [{o: 0x0FAE, or: 5, ops: [m]}],
    // XGETBV Reads the state of an extended control register
    xgetbv: [{o: 0x0F01D0}],


    // ## Random Number
    // RDRAND Retrieves a random number generated from hardware
    rdrand: [{o: 0x0FC7, or: 6},
        // 0F C7 /6 RDRAND r16 M
        {ops: [r16]},
        // 0F C7 /6 RDRAND r32 M
        {ops: [r32]},
        // REX.W + 0F C7 /6 RDRAND r64 M
        {ops: [r64]},
    ],
    // RDSEED Retrieves a random number generated from hardware
    rdseed: [{o: 0x0FC7, or: 7},
        {ops: [r16]},
        {ops: [r32]},
        {ops: [r64]},
    ],


    // ## BMI1, BMI2
    // ANDN Bitwise AND of first source with inverted 2nd source operands.
    // BEXTR Contiguous bitwise extract
    // BLSI Extract lowest set bit
    // BLSMSK Set all lower bits below first set bit to 1
    // BLSR Reset lowest set bit
    // BZHI Zero high bits starting from specified bit position
    // LZCNT Count the number leading zero bits
    // MULX Unsigned multiply without affecting arithmetic flags
    // PDEP Parallel deposit of bits using a mask
    // PEXT Parallel extraction of bits using a mask
    // RORX Rotate right without affecting arithmetic flags
    // SARX Shift arithmetic right
    // SHLX Shift logic left
    // SHRX Shift logic right
    // TZCNT Count the number trailing zero bits

    // System
    syscall:    [{o: 0x0F05}],
    sysret:     [{o: 0x0F07}],
    sysenter:   [{o: 0x0F34}],
    sysexit:    [{o: 0x0F35}],


    // VEX
    vextractf128: [{o: 0x19, vex: '256.66.0F3A.W0', ops: [[xmm, m], ymm, imm8], s: S.X}],
    vcvtph2ps: [{o: 0x13, vex: '256.66.0F38.W0', ops: [ymm, [xmm, m]], s: 256}],

    vfmadd132pd: [{o: 0x98, vex: 'DDS.128.66.0F38.W1', en: 'rvm', ops: [xmm, xmm, [xmm, m]]}],
});
