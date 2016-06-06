"use strict";
var util_1 = require('../util');
var o = require('../x86/operand');
var t = require('../x86/table');
var table_1 = require('../x86/table');
exports.defaults = util_1.extend({}, t.defaults, { rex: false });
exports.table = {
    // ## Data Transfer
    // MOV Move data between general-purpose registers
    mov: [{ mn: 'mov' },
        { o: 0x8B, ops: [[table_1.r64, table_1.m], [table_1.r64, table_1.m]], dbit: true },
        { o: 0xC7, or: 0, ops: [table_1.r64, table_1.imm32] },
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
    push: [{ ds: table_1.S.Q, o: 0x50, r: true },
        { ops: [table_1.r64] },
        { ops: [table_1.r32] },
        { ops: [table_1.r16] },
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
    // ADOX Unsigned integer add with overflow
    // ADD Integer add
    add: [{},
        // REX.W + 83 /0 ib ADD r/m64, imm8 MI Valid N.E. Add sign-extended imm8 to r/m64.
        { o: 0x83, or: 0, ops: [table_1.rm64, table_1.imm8] },
        // 04 ib ADD AL, imm8 I Valid Valid Add imm8 to AL.
        { o: 0x04, ops: [o.al, table_1.imm8], mr: false },
        // 05 iw ADD AX, imm16 I Valid Valid Add imm16 to AX.
        { o: 0x05, ops: [o.ax, table_1.imm16], mr: false },
        // 05 id ADD EAX, imm32 I Valid Valid Add imm32 to EAX.
        { o: 0x05, ops: [o.eax, table_1.imm32], mr: false },
        // REX.W + 05 id ADD RAX, imm32 I Valid N.E. Add imm32 sign-extended to 64-bits to RAX.
        { o: 0x05, ops: [o.rax, table_1.imm32], mr: false },
        // 80 /0 ib ADD r/m8, imm8 MI Valid Valid Add imm8 to r/m8.
        { o: 0x80, or: 0, ops: [table_1.rm8, table_1.imm8] },
        // REX + 80 /0 ib ADD r/m8*, imm8 MI Valid N.E. Add sign-extended imm8 to r/m64.
        // TODO: implement this.
        // 81 /0 iw ADD r/m16, imm16 MI Valid Valid Add imm16 to r/m16.
        { o: 0x81, or: 0, ops: [table_1.rm16, table_1.imm16] },
        // 81 /0 id ADD r/m32, imm32 MI Valid Valid Add imm32 to r/m32.
        { o: 0x81, or: 0, ops: [table_1.rm32, table_1.imm32] },
        // REX.W + 81 /0 id ADD r/m64, imm32 MI Valid N.E. Add imm32 sign-extended to 64-bits to r/m64.
        { o: 0x81, or: 0, ops: [table_1.rm64, table_1.imm32] },
        // 83 /0 ib ADD r/m16, imm8 MI Valid Valid Add sign-extended imm8 to r/m16.
        { o: 0x83, or: 0, ops: [table_1.rm16, table_1.imm8] },
        { o: 0x81, or: 0, ops: [table_1.rm64, table_1.imm32] },
        { o: 0x01, ops: [table_1.rm64, table_1.r64] },
        { o: 0x03, ops: [table_1.r64, table_1.rm64] },
        { o: 0x03, ops: [table_1.rm32, table_1.r32] },
    ],
    // ADC Add with carry
    // SUB Subtract
    // SBB Subtract with borrow
    // IMUL Signed multiply
    // MUL Unsigned multiply
    // IDIV Signed divide
    // DIV Unsigned divide
    // INC Increment
    inc: [{ o: 0xFF, or: 0, ops: [table_1.rm64], lock: true }],
    // DEC Decrement
    dec: [{ o: 0xFF, or: 1, ops: [table_1.rm64], lock: true }],
    // NEG Negate
    // CMP Compare
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
        { o: 0xC3 },
        { o: 0xC2, ops: [table_1.imm16] }
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
    lea: [{ o: 0x8D },
        { ops: [table_1.r64, table_1.m] },
        { ops: [table_1.r32, table_1.m] },
        { ops: [table_1.r16, table_1.m] },
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
    syscall: [{ o: 0x0F05 }],
    sysenter: [{ o: 0x0F34 }],
    sysexit: [{ o: 0x0F35 }],
    int: [{ o: 0xCD, ops: [table_1.immu8], imms: false }],
};
