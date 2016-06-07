import {extend} from '../util';
import * as o from '../x86/operand';
import * as t from '../x86/table';
import {S, M, r, r8, r16, r32, r64, m, m8, m16, m32, m64, rm8, rm16, rm32, rm64,
    imm, imm8, imm16, imm32, imm64, immu, immu8, immu16, immu32, immu64,
    rel, rel8, rel16, rel32} from '../x86/table';


export var defaults = extend<any>({}, t.defaults,
    {rex: false});


export var table: t.TableDefinition = {

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

        // TODO: Implement Sreg MOVs.
        // 8C /r MOV r/m16,Sreg** MR Valid Valid Move segment register to r/m16.
        // REX.W + 8C /r MOV r/m64,Sreg** MR Valid Valid Move zero extended 16-bit segment register to r/m64.
        // 8E /r MOV Sreg,r/m16** RM Valid Valid Move r/m16 to segment register.
        // REX.W + 8E /r MOV Sreg,r/m64** RM Valid Valid Move lower 16 bits of r/m64 to segment register.

        // A0 MOV AL,moffs8* FD Valid Valid Move byte at (seg:offset) to AL.
        // REX.W + A0 MOV AL,moffs8* FD Valid N.E. Move byte at (offset) to AL.
        // A1 MOV AX,moffs16* FD Valid Valid Move word at (seg:offset) to AX.
        // A1 MOV EAX,moffs32* FD Valid Valid Move doubleword at (seg:offset) to EAX.
        // REX.W + A1 MOV RAX,moffs64* FD Valid N.E. Move quadword at (offset) to RAX.
        // A2 MOV moffs8,AL TD Valid Valid Move AL to (seg:offset).
        // REX.W + A2 MOV moffs8***,AL TD Valid N.E. Move AL to (offset).
        // A3 MOV moffs16*,AX TD Valid Valid Move AX to (seg:offset).
        // A3 MOV moffs32*,EAX TD Valid Valid Move EAX to (seg:offset).
        // REX.W + A3 MOV moffs64*,RAX TD Valid N.E. Move RAX to (offset).

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
    // CMOVE/CMOVZ Conditional move if equal/Conditional move if zero
    // CMOVNE/CMOVNZ Conditional move if not equal/Conditional move if not zero
    // CMOVA/CMOVNBE Conditional move if above/Conditional move if not below or equal
    // CMOVAE/CMOVNB Conditional move if above or equal/Conditional move if not below
    // CMOVB/CMOVNAE Conditional move if below/Conditional move if not above or equal
    // CMOVBE/CMOVNA Conditional move if below or equal/Conditional move if not above
    // CMOVG/CMOVNLE Conditional move if greater/Conditional move if not less or equal
    // CMOVGE/CMOVNL Conditional move if greater or equal/Conditional move if not less
    // CMOVL/CMOVNGE Conditional move if less/Conditional move if not greater or equal
    // CMOVLE/CMOVNG Conditional move if less or equal/Conditional move if not greater
    // CMOVC Conditional move if carry
    // CMOVNC Conditional move if not carry
    // CMOVO Conditional move if overflow
    // CMOVNO Conditional move if not overflow
    // CMOVS Conditional move if sign (negative)
    // CMOVNS Conditional move if not sign (non-negative)
    // CMOVP/CMOVPE Conditional move if parity/Conditional move if parity even
    // CMOVNP/CMOVPO Conditional move if not parity/Conditional move if parity odd
    // XCHG Exchange
    // BSWAP Byte swap
    // XADD Exchange and add
    // CMPXCHG Compare and exchange
    // CMPXCHG8B Compare and exchange 8 bytes
    // PUSH Push onto stack
    push: [{ds: S.Q, o: 0x50, r: true},
        {ops: [r64]},
        {ops: [r32]},
        {ops: [r16]},
        // {o: 0xFF, or: 6, ops: [m32], mn: 'pushw', s: S.DOUBLE},
        // {o: 0xFF, or: 6, ops: [m64], mn: 'pushq', s: S.DOUBLE},
        // {o: 0x68, ops: [imm32]},
        // {o: 0x6A, ops: [imm8]},
    ],
    // POP Pop off of stack
    // PUSHA/PUSHAD Push general-purpose registers onto stack
    // POPA/POPAD Pop general-purpose registers from stack
    // CWD/CDQ Convert word to doubleword/Convert doubleword to quadword
    // CBW/CWDE Convert byte to word/Convert word to doubleword in EAX register
    // MOVSX Move and sign extend
    // MOVZX Move and zero extend


    // ## Binary Arithmetic
    // ADCX Unsigned integer add with carry
    adcx: [{o: 0x0F38F6, pfx: [0x66], ops: [r64, rm64]}],
    // ADOX Unsigned integer add with overflow
    adox: [{o: 0x0F38F6, pfx: [0xF3], ops: [r64, rm64]}],
    // ADD Integer add
    add: [{lock: true},
        // REX.W + 83 /0 ib ADD r/m64, imm8 MI Valid N.E. Add sign-extended imm8 to r/m64.
        {o: 0x83, or: 0, ops: [rm64, imm8]},
        // 04 ib ADD AL, imm8 I Valid Valid Add imm8 to AL.
        {o: 0x04, ops: [o.al, imm8], mr: false},
        // 05 iw ADD AX, imm16 I Valid Valid Add imm16 to AX.
        {o: 0x05, ops: [o.ax, imm16], mr: false},
        // 05 id ADD EAX, imm32 I Valid Valid Add imm32 to EAX.
        {o: 0x05, ops: [o.eax, imm32], mr: false},
        // REX.W + 05 id ADD RAX, imm32 I Valid N.E. Add imm32 sign-extended to 64-bits to RAX.
        {o: 0x05, ops: [o.rax, imm32], mr: false},
        // 80 /0 ib ADD r/m8, imm8 MI Valid Valid Add imm8 to r/m8.
        // REX + 80 /0 ib ADD r/m8*, imm8 MI Valid N.E. Add sign-extended imm8 to r/m64.
        {o: 0x80, or: 0, ops: [rm8, imm8]},
        // 83 /0 ib ADD r/m16, imm8 MI Valid Valid Add sign-extended imm8 to r/m16.
        {o: 0x83, or: 0, ops: [rm16, imm8]},
        // 81 /0 iw ADD r/m16, imm16 MI Valid Valid Add imm16 to r/m16.
        {o: 0x81, or: 0, ops: [rm16, imm16]},
        // 83 /0 ib ADD r/m32, imm8 MI Valid Valid Add sign-extended imm8 to r/m32.
        {o: 0x83, or: 0, ops: [rm32, imm8]},
        // 81 /0 id ADD r/m32, imm32 MI Valid Valid Add imm32 to r/m32.
        {o: 0x81, or: 0, ops: [rm32, imm32]},
        // REX.W + 81 /0 id ADD r/m64, imm32 MI Valid N.E. Add imm32 sign-extended to 64-bits to r/m64.
        {o: 0x81, or: 0, ops: [rm64, imm32]},
        // 00 /r ADD r/m8, r8 MR Valid Valid Add r8 to r/m8.
        // REX + 00 /r ADD r/m8*, r8* MR Valid N.E. Add r8 to r/m8.
        // 02 /r ADD r8, r/m8 RM Valid Valid Add r/m8 to r8.
        // REX + 02 /r ADD r8*, r/m8* RM Valid N.E. Add r/m8 to r8.
        {o: 0x00, ops: [rm8, rm8], dbit: true},
        // 01 /r ADD r/m16, r16 MR Valid Valid Add r16 to r/m16.
        // 03 /r ADD r16, r/m16 RM Valid Valid Add r/m16 to r16.
        {o: 0x01, ops: [rm16, rm16], dbit: true},
        // 01 /r ADD r/m32, r32 MR Valid Valid Add r32 to r/m32.
        // 03 /r ADD r32, r/m32 RM Valid Valid Add r/m32 to r32.
        {o: 0x01, ops: [rm32, rm32], dbit: true},
        // REX.W + 01 /r ADD r/m64, r64 MR Valid N.E. Add r64 to r/m64.
        // REX.W + 03 /r ADD r64, r/m64 RM Valid N.E. Add r/m64 to r64.
        {o: 0x01, ops: [rm64, rm64], dbit: true},
    ],
    // ADC Add with carry
    adc: [{lock: true},
        // 14 ib ADC AL, imm8 I Valid Valid Add with carry imm8 to AL.
        {o: 0x14, ops: [o.al, imm8]},
        // 15 iw ADC AX, imm16 I Valid Valid Add with carry imm16 to AX.
        {o: 0x15, ops: [o.ax, imm16]},
        // 15 id ADC EAX, imm32 I Valid Valid Add with carry imm32 to EAX.
        {o: 0x15, ops: [o.eax, imm32]},
        // REX.W + 15 id ADC RAX, imm32 I Valid N.E. Add with carry imm32 sign extended to 64-bits to RAX.
        {o: 0x15, ops: [o.rax, imm32]},
        // 80 /2 ib ADC r/m8, imm8 MI Valid Valid Add with carry imm8 to r/m8.
        // REX + 80 /2 ib ADC r/m8*, imm8 MI Valid N.E. Add with carry imm8 to r/m8.
        {o: 0x80, or: 2, ops: [rm8, imm8]},
        // 81 /2 iw ADC r/m16, imm16 MI Valid Valid Add with carry imm16 to r/m16.
        {o: 0x81, or: 2, ops: [rm16, imm16]},
        // 81 /2 id ADC r/m32, imm32 MI Valid Valid Add with CF imm32 to r/m32.
        {o: 0x81, or: 2, ops: [rm32, imm32]},
        // REX.W + 81 /2 id ADC r/m64, imm32 MI Valid N.E. Add with CF imm32 sign extended to 64-bits to r/m64.
        {o: 0x81, or: 2, ops: [rm64, imm32]},
        // 83 /2 ib ADC r/m16, imm8 MI Valid Valid Add with CF sign-extended imm8 to r/m16.
        {o: 0x83, or: 2, ops: [rm16, imm8]},
        // 83 /2 ib ADC r/m32, imm8 MI Valid Valid Add with CF sign-extended imm8 into r/m32.
        {o: 0x83, or: 2, ops: [rm32, imm8]},
        // REX.W + 83 /2 ib ADC r/m64, imm8 MI Valid N.E. Add with CF sign-extended imm8 into r/m64.
        {o: 0x83, or: 2, ops: [rm64, imm8]},
        // 10 /r ADC r/m8, r8 MR Valid Valid Add with carry byte register to r/m8.
        // REX + 10 /r ADC r/m8*, r8* MR Valid N.E. Add with carry byte register to r/m64.
        // 12 /r ADC r8, r/m8 RM Valid Valid Add with carry r/m8 to byte register.
        // REX + 12 /r ADC r8*, r/m8* RM Valid N.E. Add with carry r/m64 to byte register.
        {o: 0x10, ops: [rm8, rm8], dbit: true},
        // 11 /r ADC r/m16, r16 MR Valid Valid Add with carry r16 to r/m16.
        // 13 /r ADC r16, r/m16 RM Valid Valid Add with carry r/m16 to r16.
        {o: 0x11, ops: [rm16, rm16], dbit: true},
        // 11 /r ADC r/m32, r32 MR Valid Valid Add with CF r32 to r/m32.
        // 13 /r ADC r32, r/m32 RM Valid Valid Add with CF r/m32 to r32.
        {o: 0x11, ops: [rm32, rm32], dbit: true},
        // REX.W + 11 /r ADC r/m64, r64 MR Valid N.E. Add with CF r64 to r/m64.
        // REX.W + 13 /r ADC r64, r/m64 RM Valid N.E. Add with CF r/m64 to r64.
        {o: 0x11, ops: [rm64, rm64], dbit: true},
    ],
    // SUB Subtract
    sub: [{lock: true},
        // 2C ib SUB AL, imm8 I Valid Valid Subtract imm8 from AL.
        {o: 0x2C, ops: [o.al, imm8]},
        // 2D iw SUB AX, imm16 I Valid Valid Subtract imm16 from AX.
        {o: 0x2D, ops: [o.ax, imm16]},
        // 2D id SUB EAX, imm32 I Valid Valid Subtract imm32 from EAX.
        {o: 0x2D, ops: [o.eax, imm32]},
        // REX.W + 2D id SUB RAX, imm32 I Valid N.E. Subtract imm32 sign-extended to 64-bits from RAX.
        {o: 0x2D, ops: [o.rax, imm32]},
        // 80 /5 ib SUB r/m8, imm8 MI Valid Valid Subtract imm8 from r/m8.
        // REX + 80 /5 ib SUB r/m8*, imm8 MI Valid N.E. Subtract imm8 from r/m8.
        {o: 0x80, or: 5, ops: [rm8, imm8]},
        // 83 /5 ib SUB r/m16, imm8 MI Valid Valid Subtract sign-extended imm8 from r/m16.
        {o: 0x83, or: 5, ops: [rm16, imm8]},
        // 81 /5 iw SUB r/m16, imm16 MI Valid Valid Subtract imm16 from r/m16.
        {o: 0x81, or: 5, ops: [rm16, imm16]},
        // 83 /5 ib SUB r/m32, imm8 MI Valid Valid Subtract sign-extended imm8 from r/m32.
        {o: 0x83, or: 5, ops: [rm32, imm8]},
        // 81 /5 id SUB r/m32, imm32 MI Valid Valid Subtract imm32 from r/m32.
        {o: 0x81, or: 5, ops: [rm32, imm32]},
        // REX.W + 83 /5 ib SUB r/m64, imm8 MI Valid N.E. Subtract sign-extended imm8 from r/m64.
        {o: 0x83, or: 5, ops: [rm64, imm8]},
        // REX.W + 81 /5 id SUB r/m64, imm32 MI Valid N.E. Subtract imm32 sign-extended to 64-bits from r/m64.
        {o: 0x81, or: 5, ops: [rm64, imm32]},
        // 28 /r SUB r/m8, r8 MR Valid Valid Subtract r8 from r/m8.
        // REX + 28 /r SUB r/m8*, r8* MR Valid N.E. Subtract r8 from r/m8.
        // 2A /r SUB r8, r/m8 RM Valid Valid Subtract r/m8 from r8.
        // REX + 2A /r SUB r8*, r/m8* RM Valid N.E. Subtract r/m8 from r8.
        {o: 0x28, ops: [rm8, rm8], dbit: true},
        // 29 /r SUB r/m16, r16 MR Valid Valid Subtract r16 from r/m16.
        // 2B /r SUB r16, r/m16 RM Valid Valid Subtract r/m16 from r16.
        {o: 0x29, ops: [rm16, rm16], dbit: true},
        // 29 /r SUB r/m32, r32 MR Valid Valid Subtract r32 from r/m32.
        // 2B /r SUB r32, r/m32 RM Valid Valid Subtract r/m32 from r32.
        {o: 0x29, ops: [rm32, rm32], dbit: true},
        // REX.W + 29 /r SUB r/m64, r64 MR Valid N.E. Subtract r64 from r/m64.
        // REX.W + 2B /r SUB r64, r/m64 RM Valid N.E. Subtract r/m64 from r64.
        {o: 0x29, ops: [rm64, rm64], dbit: true},
    ],
    // SBB Subtract with borrow
    sbb: [{lock: true},
        // 1C ib SBB AL, imm8 I Valid Valid Subtract with borrow imm8 from AL.
        {o: 0x1C, ops: [o.al, imm8]},
        // 1D iw SBB AX, imm16 I Valid Valid Subtract with borrow imm16 from AX.
        {o: 0x1D, ops: [o.ax, imm16]},
        // 1D id SBB EAX, imm32 I Valid Valid Subtract with borrow imm32 from EAX.
        {o: 0x1D, ops: [o.eax, imm32]},
        // REX.W + 1D id SBB RAX, imm32 I Valid N.E. Subtract with borrow sign-extended imm.32 to 64-bits from RAX.
        {o: 0x1D, ops: [o.rax, imm32]},
        // 80 /3 ib SBB r/m8, imm8 MI Valid Valid Subtract with borrow imm8 from r/m8.
        // REX + 80 /3 ib SBB r/m8*, imm8 MI Valid N.E. Subtract with borrow imm8 from r/m8.
        {o: 0x80, or: 3, ops: [rm8, imm8]},
        // 83 /3 ib SBB r/m16, imm8 MI Valid Valid Subtract with borrow sign-extended imm8 from r/m16.
        {o: 0x83, or: 3, ops: [rm16, imm8]},
        // 81 /3 iw SBB r/m16, imm16 MI Valid Valid Subtract with borrow imm16 from r/m16.
        {o: 0x81, or: 3, ops: [rm16, imm16]},
        // 83 /3 ib SBB r/m32, imm8 MI Valid Valid Subtract with borrow sign-extended imm8 from r/m32.
        {o: 0x83, or: 3, ops: [rm32, imm8]},
        // 81 /3 id SBB r/m32, imm32 MI Valid Valid Subtract with borrow imm32 from r/m32.
        {o: 0x81, or: 3, ops: [rm32, imm32]},
        // REX.W + 83 /3 ib SBB r/m64, imm8 MI Valid N.E. Subtract with borrow sign-extended imm8 from r/m64.
        {o: 0x83, or: 3, ops: [rm64, imm8]},
        // REX.W + 81 /3 id SBB r/m64, imm32 MI Valid N.E. Subtract with borrow sign-extended imm32 to 64-bits from r/m64.
        {o: 0x81, or: 3, ops: [rm64, imm64]},
        // 18 /r SBB r/m8, r8 MR Valid Valid Subtract with borrow r8 from r/m8.
        // REX + 18 /r SBB r/m8*, r8 MR Valid N.E. Subtract with borrow r8 from r/m8.
        // 1A /r SBB r8, r/m8 RM Valid Valid Subtract with borrow r/m8 from r8.
        // REX + 1A /r SBB r8*, r/m8* RM Valid N.E. Subtract with borrow r/m8 from r8.
        {o: 0x18, ops: [rm8, r8], dbit: true},
        // 19 /r SBB r/m16, r16 MR Valid Valid Subtract with borrow r16 from r/m16.
        // 1B /r SBB r16, r/m16 RM Valid Valid Subtract with borrow r/m16 from r16.
        {o: 0x19, ops: [rm16, r16], dbit: true},
        // 19 /r SBB r/m32, r32 MR Valid Valid Subtract with borrow r32 from r/m32.
        // 1B /r SBB r32, r/m32 RM Valid Valid Subtract with borrow r/m32 from r32.
        {o: 0x19, ops: [rm32, r32], dbit: true},
        // REX.W + 19 /r SBB r/m64, r64 MR Valid N.E. Subtract with borrow r64 from r/m64.
        // REX.W + 1B /r SBB r64, r/m64 RM Valid N.E. Subtract with borrow r/m64 from r64.
        {o: 0x19, ops: [rm64, r64], dbit: true},
    ],
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
    mul: [{o: 0xF7, or: 4},
        // F6 /4 MUL r/m8 M Valid Valid Unsigned multiply (AX ← AL ∗ r/m8).
        // REX + F6 /4 MUL r/m8* M Valid N.E. Unsigned multiply (AX ← AL ∗ r/m8).
        {o: 0xF6, ops: [rm8]},
        // F7 /4 MUL r/m16 M Valid Valid Unsigned multiply (DX:AX ← AX ∗ r/m16).
        // F7 /4 MUL r/m32 M Valid Valid Unsigned multiply (EDX:EAX ← EAX ∗ r/m32).
        // REX.W + F7 /4 MUL r/m64 M Valid N.E. Unsigned multiply (RDX:RAX ← RAX ∗ r/m64).
        {ops: [rm16]},
        {ops: [rm32]},
        {ops: [rm64]},
    ],
    // IDIV Signed divide
    idiv: [{},
        // F6 /7 IDIV r/m8 M Valid Valid Signed divide AX by r/m8, with result stored in: AL← Quotient, AH ←Remainder.
        // REX + F6 /7 IDIV r/m8* M Valid N.E. Signed divide AX by r/m8, with result stored in AL← Quotient, AH ←Remainder.
        {o: 0xF6, or: 7, ops: [rm8]},
        // F7 /7 IDIV r/m16 M Valid Valid Signed divide DX:AX by r/m16, with result stored in AX ←Quotient, DX ←Remainder.
        {o: 0xF7, or: 7, ops: [rm16]},
        // F7 /7 IDIV r/m32 M Valid Valid Signed divide EDX:EAX by r/m32, with result stored in EAX ←Quotient, EDX ←Remainder.
        {o: 0xF7, or: 7, ops: [rm32]},
        // REX.W + F7 /7 IDIV r/m64 M Valid N.E. Signed divide RDX:RAX by r/m64, with result stored in RAX ←Quotient, RDX ←Remainder.
        {o: 0xF7, or: 7, ops: [rm64]},
    ],
    // DIV Unsigned divide
    div: [{o: 0xF7, or: 6},
        // F6 /6 DIV r/m8 M Valid Valid Unsigned divide AX by r/m8, with result stored in AL ←Quotient, AH ←Remainder.
        // REX + F6 /6 DIV r/m8* M Valid N.E. Unsigned divide AX by r/m8, with result stored in AL ←Quotient, AH ←Remainder.
        {o: 0xF6, ops: [rm8]},
        // F7 /6 DIV r/m16 M Valid Valid Unsigned divide DX:AX by r/m16, with result stored in AX ←Quotient, DX ←Remainder.
        // F7 /6 DIV r/m32 M Valid Valid Unsigned divide EDX:EAX by r/m32, with result stored in EAX ←Quotient, EDX ← Remainder.
        // REX.W + F7 /6 DIV r/m64 M Valid N.E. Unsigned divide RDX:RAX by r/m64, with result stored in
        {ops: [rm16]},
        {ops: [rm32]},
        {ops: [rm64]},
    ],
    // INC Increment
    inc: [{or: 0, lock: true},
        // FE /0 INC r/m8 M Valid Valid Increment r/m byte by 1.
        // REX + FE /0 INC r/m8* M Valid N.E. Increment r/m byte by 1.
        {o: 0xFE, ops: [rm8]},
        // FF /0 INC r/m16 M Valid Valid Increment r/m word by 1.
        {o: 0xFF, ops: [rm16]},
        // FF /0 INC r/m32 M Valid Valid Increment r/m doubleword by 1.
        {o: 0xFF, ops: [rm32]},
        // REX.W + FF /0 INC r/m64 M Valid N.E. Increment r/m quadword by 1.
        {o: 0xFF, ops: [rm64]},
    ],
    // DEC Decrement
    dec: [{or: 1, lock: true},
        // FE /1 DEC r/m8 M Valid Valid Decrement r/m8 by 1.
        // REX + FE /1 DEC r/m8* M Valid N.E. Decrement r/m8 by 1.
        {o: 0xFE, ops: [rm8]},
        // FF /1 DEC r/m16 M Valid Valid Decrement r/m16 by 1.
        {o: 0xFF, ops: [rm16]},
        // FF /1 DEC r/m32 M Valid Valid Decrement r/m32 by 1.
        {o: 0xFF, ops: [rm32]},
        // REX.W + FF /1 DEC r/m64 M Valid N.E. Decrement r/m64 by 1.
        {o: 0xFF, ops: [rm64]},
    ],
    // NEG Negate
    neg: [{or: 3, lock: true},
        // F6 /3 NEG r/m8 M Valid Valid Two's complement negate r/m8.
        // REX + F6 /3 NEG r/m8* M Valid N.E. Two's complement negate r/m8.
        {o: 0xF6, ops: [rm8]},
        // F7 /3 NEG r/m16 M Valid Valid Two's complement negate r/m16.
        // F7 /3 NEG r/m32 M Valid Valid Two's complement negate r/m32.
        // REX.W + F7 /3 NEG r/m64 M Valid N.E. Two's complement negate r/m64.
        {o: 0xF7, ops: [rm16]},
        {o: 0xF7, ops: [rm32]},
        {o: 0xF7, ops: [rm64]},
    ],
    // CMP Compare
    cmp: [{},
        // 3C ib CMP AL, imm8 I Valid Valid Compare imm8 with AL.
        {o: 0x3C, ops: [o.al, imm8], mr: false},
        // 3D iw CMP AX, imm16 I Valid Valid Compare imm16 with AX.
        {o: 0x3D, ops: [o.ax, imm16], mr: false},
        // 3D id CMP EAX, imm32 I Valid Valid Compare imm32 with EAX.
        {o: 0x3D, ops: [o.eax, imm32], mr: false},
        // REX.W + 3D id CMP RAX, imm32 I Valid N.E. Compare imm32 sign-extended to 64-bits with RAX.
        {o: 0x3D, ops: [o.rax, imm32], mr: false},
        // 80 /7 ib CMP r/m8, imm8 MI Valid Valid Compare imm8 with r/m8.
        // REX + 80 /7 ib CMP r/m8*, imm8 MI Valid N.E. Compare imm8 with r/m8.
        {o: 0x80, or: 7, ops: [rm8, imm8]},
        // 83 /7 ib CMP r/m16, imm8 MI Valid Valid Compare imm8 with r/m16.
        {o: 0x83, or: 7, ops: [rm16, imm8]},
        // 81 /7 iw CMP r/m16, imm16 MI Valid Valid Compare imm16 with r/m16.
        {o: 0x81, or: 7, ops: [rm16, imm16]},
        // 83 /7 ib CMP r/m32, imm8 MI Valid Valid Compare imm8 with r/m32.
        {o: 0x83, or: 7, ops: [rm32, imm8]},
        // 81 /7 id CMP r/m32, imm32 MI Valid Valid Compare imm32 with r/m32.
        {o: 0x81, or: 7, ops: [rm32, imm32]},
        // REX.W + 83 /7 ib CMP r/m64, imm8 MI Valid N.E. Compare imm8 with r/m64.
        {o: 0x83, or: 7, ops: [rm64, imm8]},
        // REX.W + 81 /7 id CMP r/m64, imm32 MI Valid N.E. Compare imm32 sign-extended to 64-bits with r/m64.
        {o: 0x81, or: 7, ops: [rm64, imm32]},
        // 38 /r CMP r/m8, r8 MR Valid Valid Compare r8 with r/m8.
        // REX + 38 /r CMP r/m8*, r8* MR Valid N.E. Compare r8 with r/m8.
        // 3A /r CMP r8, r/m8 RM Valid Valid Compare r/m8 with r8.
        // REX + 3A /r CMP r8*, r/m8* RM Valid N.E. Compare r/m8 with r8.
        {o: 0x38, ops: [rm8, rm8]},
        // 39 /r CMP r/m16, r16 MR Valid Valid Compare r16 with r/m16.
        // 3B /r CMP r16, r/m16 RM Valid Valid Compare r/m16 with r16.
        {o: 0x39, ops: [rm16, rm16]},
        // 39 /r CMP r/m32, r32 MR Valid Valid Compare r32 with r/m32.
        // 3B /r CMP r32, r/m32 RM Valid Valid Compare r/m32 with r32.
        {o: 0x39, ops: [rm32, rm32]},
        // REX.W + 39 /r CMP r/m64,r64 MR Valid N.E. Compare r64 with r/m64.
        // REX.W + 3B /r CMP r64, r/m64 RM Valid N.E. Compare r/m64 with r64.
        {o: 0x39, ops: [rm64, rm64]},
    ],


    // ## Decimal Arithmetic
    // DAA Decimal adjust after addition
    // DAS Decimal adjust after subtraction
    // AAA ASCII adjust after addition
    // AAS ASCII adjust after subtraction
    // AAM ASCII adjust after multiplication
    // AAD ASCII adjust before division


    // ## Logical
    // AND Perform bitwise logical AND
    // OR Perform bitwise logical OR
    // XOR Perform bitwise logical exclusive OR
    // NOT Perform bitwise logical NOT


    // ## Shift and Rotate
    // SAR Shift arithmetic right
    // SHR Shift logical right
    // SAL/SHL Shift arithmetic left/Shift logical left
    // SHRD Shift right double
    // SHLD Shift left double
    // ROR Rotate right
    // ROL Rotate left
    // RCR Rotate through carry right
    // RCL Rotate through carry left


    // ## Bit and Byte
    // BT Bit test
    // BTS Bit test and set
    // BTR Bit test and reset
    // BTC Bit test and complement
    // BSF Bit scan forward
    // BSR Bit scan reverse
    // SETE/SETZ Set byte if equal/Set byte if zero
    // SETNE/SETNZ Set byte if not equal/Set byte if not zero
    // SETA/SETNBE Set byte if above/Set byte if not below or equal
    // SETAE/SETNB/SETNC Set byte if above or equal/Set byte if not below/Set byte if not carry
    // SETB/SETNAE/SETCSet byte if below/Set byte if not above or equal/Set byte if carry
    // SETBE/SETNA Set byte if below or equal/Set byte if not above
    // SETG/SETNLE Set byte if greater/Set byte if not less or equal
    // SETGE/SETNL Set byte if greater or equal/Set byte if not less
    // SETL/SETNGE Set byte if less/Set byte if not greater or equal
    // SETLE/SETNG Set byte if less or equal/Set byte if not greater
    // SETS Set byte if sign (negative)
    // SETNS Set byte if not sign (non-negative)
    // SETO Set byte if overflow
    // SETNO Set byte if not overflow
    // SETPE/SETP Set byte if parity even/Set byte if parity
    // SETPO/SETNP Set byte if parity odd/Set byte if not parity
    // TEST Logical compare
    // CRC321 Provides hardware acceleration to calculate cyclic redundancy checks for fast and efficient implementation of data integrity protocols.
    // POPCNT2 This instruction calculates of number of bits set to 1 in the second


    // ## Control Transfer
    // JMP Jump
    jmp: [{},
        // relX is just immX
        // EB cb JMP rel8 D Valid Valid Jump short, RIP = RIP + 8-bit displacement sign extended to 64-bits
        {o: 0xEB, ops: [rel8]},
        // E9 cd JMP rel32 D Valid Valid Jump near, relative, RIP = RIP + 32-bit displacement sign extended to 64-bits
        {o: 0xE9, ops: [rel32]},
        // FF /4 JMP r/m64 M Valid N.E. Jump near, absolute indirect, RIP = 64-Bit offset from register or memory
        {o: 0xFF, or: 4, ops: [rm64]},
        // FF /5 JMP m16:16 D Valid Valid Jump far, absolute indirect, address given in m16:16
        // {o: 0xFF, or: 5, ops: [rm64]},
        // FF /5 JMP m16:32 D Valid Valid Jump far, absolute indirect, address given in m16:32.
        // REX.W + FF /5 JMP m16:64 D Valid N.E. Jump far, absolute
    ],
    // JE/JZ Jump if equal/Jump if zero
    // JNE/JNZ Jump if not equal/Jump if not zero
    // JA/JNBE Jump if above/Jump if not below or equal
    // JAE/JNB Jump if above or equal/Jump if not below
    // JB/JNAE Jump if below/Jump if not above or equal
    // JBE/JNA Jump if below or equal/Jump if not above
    // JG/JNLE Jump if greater/Jump if not less or equal
    // JGE/JNL Jump if greater or equal/Jump if not less
    // JL/JNGE Jump if less/Jump if not greater or equal
    // JLE/JNG Jump if less or equal/Jump if not greater
    // JC Jump if carry
    // JNC Jump if not carry
    // JO Jump if overflow
    // JNO Jump if not overflow
    // JS Jump if sign (negative)
    // JNS Jump if not sign (non-negative)
    // JPO/JNP Jump if parity odd/Jump if not parity
    // JPE/JP Jump if parity even/Jump if parity
    // JCXZ/JECXZ Jump register CX zero/Jump register ECX zero
    // LOOP Loop with ECX counter
    // LOOPZ/LOOPE Loop with ECX and zero/Loop with ECX and equal
    // LOOPNZ/LOOPNE Loop with ECX and not zero/Loop with ECX and not equal
    // CALL Call procedure
    // RET Return
    ret: [{},
        {o: 0xC3},
        {o: 0xC2, ops: [imm16]}
    ],
    // IRET Return from interrupt
    // INT Software interrupt
    // INTO Interrupt on overflow
    // BOUND Detect value out of range
    // ENTER High-level procedure entry


    // ## String
    // MOVS/MOVSB Move string/Move byte string
    // MOVS/MOVSW Move string/Move word string
    // MOVS/MOVSD Move string/Move doubleword string
    // CMPS/CMPSB Compare string/Compare byte string
    // CMPS/CMPSW Compare string/Compare word string
    // CMPS/CMPSD Compare string/Compare doubleword string
    // SCAS/SCASB Scan string/Scan byte string
    // SCAS/SCASW Scan string/Scan word string
    // SCAS/SCASD Scan string/Scan doubleword string
    // LODS/LODSB Load string/Load byte string
    // LODS/LODSW Load string/Load word string
    // LODS/LODSD Load string/Load doubleword string
    // STOS/STOSB Store string/Store byte string
    // STOS/STOSW Store string/Store word string
    // STOS/STOSD Store string/Store doubleword string
    // REP Repeat while ECX not zero
    // REPE/REPZ Repeat while equal/Repeat while zero
    // REPNE/REPNZ Repeat while not equal/Repeat while not zero


    // ## I/O
    // IN Read from a port
    // OUT Write to a port
    // INS/INSB Input string from port/Input byte string from port
    // INS/INSW Input string from port/Input word string from port
    // INS/INSD Input string from port/Input doubleword string from port
    // OUTS/OUTSB Output string to port/Output byte string to port
    // OUTS/OUTSW Output string to port/Output word string to port
    // OUTS/OUTSD Output string to port/Output doubleword string to port


    // ## Enter and Leave
    // ENTER High-level procedure entry
    // LEAVE High-level procedure exit


    // ## Flag Control
    // STC Set carry flag
    // CLC Clear the carry flag
    // CMC Complement the carry flag
    // CLD Clear the direction flag
    // STD Set direction flag
    // LAHF Load flags into AH register
    // SAHF Store AH register into flags
    // PUSHF/PUSHFD Push EFLAGS onto stack
    // POPF/POPFD Pop EFLAGS from stack
    // STI Set interrupt flag
    // CLI Clear the interrupt flag


    // ## Segment Register
    // LDS Load far pointer using DS
    // LES Load far pointer using ES
    // LFS Load far pointer using FS
    // LGS Load far pointer using GS
    // LSS Load far pointer using SS


    // ## Miscellaneous
    // LEA Load effective address
    lea: [{o: 0x8D},
        {ops: [r64, m]},
        {ops: [r32, m]},
        {ops: [r16, m]},
    ],
    // NOP No operation
    // UD2 Undefined instruction
    // XLAT/XLATB Table lookup translation
    // CPUID Processor identification
    // MOVBE1 Move data after swapping data bytes
    // PREFETCHW Prefetch data into cache in anticipation of write
    // PREFETCHWT1 Prefetch hint T1 with intent to write
    // CLFLUSH Flushes and invalidates a memory operand and its associated cache line from all levels of the processor’s cache hierarchy
    // CLFLUSHOPT Flushes and invalidates a memory operand and its associated cache line from all levels of the processor’s cache hierarchy with optimized memory system throughput.


    // ## User Mode Extended Sate Save/Restore
    // XSAVE Save processor extended states to memory
    // XSAVEC Save processor extended states with compaction to memory
    // XSAVEOPT Save processor extended states to memory, optimized
    // XRSTOR Restore processor extended states from memory
    // XGETBV Reads the state of an extended control register


    // ## Random Number
    // RDRAND Retrieves a random number generated from hardware
    // RDSEED Retrieves a random number generated from hardware


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
    sysenter:   [{o: 0x0F34}],
    sysexit:    [{o: 0x0F35}],
    int:        [{o: 0xCD, ops: [immu8]}],

};
