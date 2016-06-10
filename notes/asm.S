# g++ -Wall -g -c notes/asm.S -nostdlib -o notes/asm.o && g++ -Wall -g notes/asm.o -o notes/asm && objdump -d notes/asm > notes/asm.dump

.global main
main:
        syscall
system:
        syscall
        sysret
        sysenter
        sysexit
        int $0x80

mul:
        mul %al
        mul %ax
        mul %eax
        mul %rax
        mulq (%rax)
        mulq (%eax)
        mull (%rax)
        mull (%eax)
        mulw (%rax)
        mulw (%eax)
        mulb (%rax)
        mulb (%eax)

div:
        div %bl
        div %bx
        div %ebx
        div %rbx

inc:
        incq %rbx
        incq (%rax)
        incq (%rbx)
        incq (%rbx, %rcx)
        incq (%rbx, %rcx, 8)
        incq (%rbx, %rcx, 8)
        incq 0x11(%rax, %rbx, 8)
        incq -0x11223344(%rax, %rbx, 8)
        incq -0x123(%rbx, %r15, 8)
        incq (%rbp, %rbp, 8)
        incq (%rbp)
        incq (%rsp)
        incq (%r12)
        incq (%r13)
        incq %r15
        incq 0x11
        incq 0x11223344
dec:
        decq %rax
        dec %r10b
        dec %ax
        dec %eax
        dec %rax

neg:
        neg %al
        neg %dil
        neg %bx
        neg %ecx
        neg %rdx

cmp:
        cmp $0x11, %al
        cmp $0x1122, %ax
        cmp $0x11223344, %eax
        cmp $0x11223344, %rax
        cmp $0x11, %bl
        cmp $0x1122, %bx
        cmp $0x11223344, %ebx
        cmp $0x11223344, %rbx
        cmp $0x11, %cx
        cmp $0x11, %ecx
        cmp $0x11, %rcx
        cmp %bl, %al
        cmp %bx, %ax
        cmp %eax, %ebx
        cmp %rax, %rbx

mov:
        movq %rax, %rax
        movq %rax, %rbx
        movq %rax, (%rax)
        movq %rbx, (%rcx)
        movq (%rbx), %rdx
        movq %r8, %r9
        movq %r10, (%r11)
        movq (%r12), %r13
        movq 0x11(%rbx), %rcx
        movq (%rcx, %rdx, 1), %rsi
        movq 0x1234(%rax, %rbx, 4), %rcx
        movq 0x01, %rbp
        movq 0x01, %rsp
        movq %rbx, (%rsp)
        movq %rbx, %rsp
        movq %rbx, (%rbp)
        movq %rbx, (%rsp, %rbp, 2)
        movq (%rbp, %rax, 8), %rbx
        movq (, %rdx, 2), %rbp
        movq %rsp, -0x123(, %rbp, 8)
        movq $1, %rax
        movq $-0x3333, %rbp
        movq $-0x333333, %rsp

add:
        add $25, %rax
        add %rax, %rax
        add %rsp, %rbx
        add (%rbx), %rcx
        add (%rcx, %rdx), %rcx
        add (%rcx, %rbp, 4), %rcx
        add 0x11(%rsp, %rbp, 4), %rcx
        add -0x11223344(%rsp, %rbp, 4), %rcx
        add %rax, -0x11223344(%rsp, %rbp, 4)
        add $1, %rbx
        add 1, %rbx
        add %rbx, 1
        add $0x11, %al
        add $0x1122, %ax
        add $0x11223344, %eax
        add $-0x11223344, %rax
        add $0x22, %bl
        add $0x22, %ah
        add $0x22, %ah
        add $0x1122, %bx
        add $0x11, %bx
        add $0x1122, %ebx
        add $0x22, %ch
        add $0x22, %dil
        add $0x22, %bpl
        add $0x22, %spl
        add $0x22, %r8b
        add $0x12, %esp
        add %cl, %dl
        add %ax, %bx
        add %eax, %ecx

adc:
        adc %rax, 0x11(%rbx, %rcx, 4)

adcx:
        adcx %rbx, %rcx
        adcx %rax, %rax

adox:
        adox %r9, %r12

jmp:
        jmp jmp
        jmp ret
        jmp *0x11
        jmp *0x1122
        jmp *0x11223344
        ljmp *0x11223344
        ljmp *0x11(%rip)
        ljmp *0x11(%rax)
        ljmp *(%eax)
        ljmp *(%rax)
        ljmp *(%rax, %rbx)
        ljmp *0x11(%r15)
        jmp *%rax
        jmp *%rbx
        jmp *(%rcx, %rbx)
        jmp 0x11
        jmp 0x22
        jmp 0x40040e
        jmp jmp
        jmp adox
        jmp add
        jmp 1
        jmp *0x11(%rax)

jcc:
        ja jcc
        jae jcc
        jb jcc
        jbe jcc
        jc jcc
        jecxz jcc
        jrcxz jcc
        je jcc
        jg jcc
        jge jcc
        jl jcc
        jle jcc
        jna jcc
        jnae jcc
        jnb jcc
        jnbe jcc
        jnc jcc
        jne jcc
        jng jcc
        jnge jcc
        jnl jcc
        jnle jcc
        jno jcc
        jnp jcc
        jns jcc
        jnz jcc
        jo jcc
        jp jcc
        jpe jcc
        jpo jcc
        js jcc
        jz jcc
        jz jcc

        ja main
        jae main
        jb main
        jbe main
        jc main
        je main
        jg main
        jge main
        jl main
        jle main
        jna main
        jnae main
        jnb main
        jnbe main
        jnc main
        jne main
        jng main
        jnge main
        jnl main
        jnle main
        jno main
        jnp main
        jns main
        jnz main
        jo main
        jp main
        jpe main
        jpo main
        js main
        jz main
        jz main

ret:
        ret
        retq
        ret $4
        retq $16

loop:
        loop loop
        loope loop
        loopz loop
        loopne loop
        loopnz loop

int:
        int $0x80
        int $3
        int $2

enter:
        enter $1, $2
        enter $-1, $-2
        leave
        leaveq
        leavew

lea:

        lea (%rax), %rax
        lea (%rbx), %rbx
        lea (%rax), %eax
        lea (%rax), %ax
        lea (%rip), %rax
        lea (%rbx), %rax
        lea (%rsp), %rax
        lea (%rbp), %rax
        lea 0x11(%rip), %r8
        lea 0x11223344(%rip), %r9
        lea 0x11(%rbx, %rcx), %r9
        lea 0x43, %r9

in:
        in $5, %al
        in $5, %ax
        in $5, %eax
        in %dx, %al
        in %dx, %ax
        in %dx, %eax
out:
        out %al, $5
        out %ax, $5
        out %eax, $5
        out %al, %dx
        out %ax, %dx
        out %eax, %dx

ins:
        insb %dx, (%rdi)
        insw %dx, (%rdi)
        insl %dx, (%rdi)
        insb
        insw
        insl
        outsb
        outsw
        outsl

nop:
        nop
        nopq (%eax)

flags:
        stc
        clc
        cmc
        cld
        std
        pushf
        popf
        sti
        cli

random:
        rdrand %bx
        rdrand %ebx
        rdrand %rbx
        rdseed %bx
        rdseed %ebx
        rdseed %rbx


_push:
        push %rax
        push %r12
        push %ax
        push (%eax)
        push (%rax)
        pushw (%eax)
        pushw (%rax)
        push (%ebx,%eax)
        push (%r12)
        push (%r12, %r13)
        push 0x11(%r12, %r13, 4)
        push 0x11223344(%r12, %r13, 8)
        push $0x11
        push $0x1122
        push $0x11223344


test2:
        dec %r10d
        mov %eax, %ebx
        movq %rax, %rax
        movq %rax, (%rax)
        movq (%rbx), %rax
        movq %r12, %r12
        movq (%r12), %r12
        movq %r12, (%r12)

push:
        push %rax
        push %rbx
        push %rcx
        push %rdx
        push %rsp
        push %rbp
        push %rdi
        push %rsi
        push %r8
        push %r9

        pop %rax
        pop %rbx
        pop %r8
        pop %r9
        pop %r10

mov_r_r:
        movq %rbx, %rax
        mov %eax, %ebx

mov_imm_r:

        movq %rax, %rax
        movq $0x11, %rax
        movl $0x11223344, %eax
        movl $0x11223344, %ebx
        movl $0x11223344, %esp
        movl $0x11223344, %r12d
        movq $0x11223344, %rax
        movq $0x1122334455667788, %rax
        movq $0x1122334455667788, %r15

mov_m_r:

        movq (%rbx), %rax
        movq (%r9), %rax
        movq (%rbx), %r8
        movq (%r9), %r8
        movq 0x11(%r9), %r8
        movq 0x11(%r11, %r12, 8), %rbx

mov_r_m:

        movq %rax, (%rax)
        movq %rbx, (%rax)
        movq %rcx, (%rax)
        movq %rdx, (%rax)
        movq %rsi, (%rax)
        movq %rdi, (%rax)
        movq %rbp, (%rax)
        movq %rsp, (%rax)
        movq %r8, (%rax)
        movq %r9, (%rax)
        movq %rax, (%r8)
        movq %rbx, (%r8)
        movq %rcx, (%r8)
        movq %rdx, (%r8)
        movq %rsi, (%r8)
        movq %rdi, (%r8)
        movq %rbp, (%r8)
        movq %rsp, (%r8)
        movq %r8, (%r8)
        movq %r9, (%r8)
        movq %r10, (%r8)
        movq %r11, (%r8)
        movq %r12, (%r8)
        movq %r13, (%r8)
        movq %r14, (%r8)
        movq %r15, (%r8)
        movq %rbx, (%r11)
        movq %rbx, (%r12)
        movq %rbx, (%r13)
        movq %rbx, (%r14)
        movq %rbx, (%r15)

test:
        movq %rax, %rax
        movq %rbx, %rax
        movq (%rax), %rax
        movq %rax, (%rax)
        movq $11, (%rax)
        movq 0x11(%rax), %rax
        movq %rax, 0x11(%rax)
        movq (%rbx, %rcx), %rax
        movq %rax, (%rbx, %rcx)
        movq (%rbx, %rcx, 2), %rax
        movq %rax, (%rbx, %rcx, 2)
        movq 0x11(%rbx, %rcx), %rax
        movq %rax, 0x11(%rbx, %rcx)
        movq 0x11(%rbx, %rcx, 4), %rax
        movq %rax, 0x11(%rbx, %rcx, 4)

mov_i32_r:
        movq $0x11223344, %rax
        movq $0x11223344, %rbx
        movq $0x11223344, %rcx
        movq $0x11223344, %rdx
        movq $0x11223344, %rsi
        movq $0x11223344, %rdi
        movq $0x11223344, %rbp
        movq $0x11223344, %rsp
        movq $0x11223344, %r8
        movq $0x11223344, %r9
        movq $0x11223344, %r10
        movq $0x11223344, %r11
        movq $0x11223344, %r12
        movq $0x11223344, %r13
        movq $0x11223344, %r14
        movq $0x11223344, %r15

mov_i64_r:
        movq $0x1122334455667788, %rax
        movq $0x1122334455667788, %rbx
        movq $0x1122334455667788, %rcx
        movq $0x1122334455667788, %rdx
        movq $0x1122334455667788, %rsi
        movq $0x1122334455667788, %rdi
        movq $0x1122334455667788, %rbp
        movq $0x1122334455667788, %rsp
        movq $0x1122334455667788, %r8
        movq $0x1122334455667788, %r9
        movq $0x1122334455667788, %r10
        movq $0x1122334455667788, %r11
        movq $0x1122334455667788, %r12
        movq $0x1122334455667788, %r13
        movq $0x1122334455667788, %r14
        movq $0x1122334455667788, %r15

mov_r_rax:
        movq %rax, %rax
        movq %rbx, %rax
        movq %rcx, %rax
        movq %rdx, %rax
        movq %rsi, %rax
        movq %rdi, %rax
        movq %rbp, %rax
        movq %rsp, %rax
        movq %r8, %rax
        movq %r9, %rax
        movq %r10, %rax
        movq %r11, %rax
        movq %r12, %rax
        movq %r13, %rax
        movq %r14, %rax
        movq %r15, %rax

mov_r_rbx:
        movq %rax, %rbx
        movq %rbx, %rbx
        movq %rcx, %rbx
        movq %rdx, %rbx
        movq %rsi, %rbx
        movq %rdi, %rbx
        movq %rbp, %rbx
        movq %rsp, %rbx
        movq %r8, %rbx
        movq %r9, %rbx
        movq %r10, %rbx
        movq %r11, %rbx
        movq %r12, %rbx
        movq %r13, %rbx
        movq %r14, %rbx
        movq %r15, %rbx

mov_r_rcx:
        movq %rax, %rcx
        movq %rbx, %rcx
        movq %rcx, %rcx
        movq %rdx, %rcx
        movq %rsi, %rcx
        movq %rdi, %rcx
        movq %rbp, %rcx
        movq %rsp, %rcx
        movq %r8, %rcx
        movq %r9, %rcx
        movq %r10, %rcx
        movq %r11, %rcx
        movq %r12, %rcx
        movq %r13, %rcx
        movq %r14, %rcx
        movq %r15, %rcx

mov_r_rdx:
        movq %rax, %rdx
        movq %rbx, %rdx
        movq %rcx, %rdx
        movq %rdx, %rdx
        movq %rsi, %rdx
        movq %rdi, %rdx
        movq %rbp, %rdx
        movq %rsp, %rdx
        movq %r8, %rdx
        movq %r9, %rdx
        movq %r10, %rdx
        movq %r11, %rdx
        movq %r12, %rdx
        movq %r13, %rdx
        movq %r14, %rdx
        movq %r15, %rdx

mov_r_rsi:
        movq %rax, %rsi
        movq %rbx, %rsi
        movq %rcx, %rsi
        movq %rdx, %rsi
        movq %rsi, %rsi
        movq %rdi, %rsi
        movq %rbp, %rsi
        movq %rsp, %rsi
        movq %r8, %rsi
        movq %r9, %rsi
        movq %r10, %rsi
        movq %r11, %rsi
        movq %r12, %rsi
        movq %r13, %rsi
        movq %r14, %rsi
        movq %r15, %rsi

mov_r_rdi:
        movq %rax, %rdi
        movq %rbx, %rdi
        movq %rcx, %rdi
        movq %rdx, %rdi
        movq %rsi, %rdi
        movq %rdi, %rdi
        movq %rbp, %rdi
        movq %rsp, %rdi
        movq %r8, %rdi
        movq %r9, %rdi
        movq %r10, %rdi
        movq %r11, %rdi
        movq %r12, %rdi
        movq %r13, %rdi
        movq %r14, %rdi
        movq %r15, %rdi

mov_r_rbp:
        movq %rax, %rbp
        movq %rbx, %rbp
        movq %rcx, %rbp
        movq %rdx, %rbp
        movq %rsi, %rbp
        movq %rdi, %rbp
        movq %rbp, %rbp
        movq %rsp, %rbp
        movq %r8, %rbp
        movq %r9, %rbp
        movq %r10, %rbp
        movq %r11, %rbp
        movq %r12, %rbp
        movq %r13, %rbp
        movq %r14, %rbp
        movq %r15, %rbp

mov_r_rsp:
        movq %rax, %rsp
        movq %rbx, %rsp
        movq %rcx, %rsp
        movq %rdx, %rsp
        movq %rsi, %rsp
        movq %rdi, %rsp
        movq %rbp, %rsp
        movq %rsp, %rsp
        movq %r8, %rsp
        movq %r9, %rsp
        movq %r10, %rsp
        movq %r11, %rsp
        movq %r12, %rsp
        movq %r13, %rsp
        movq %r14, %rsp
        movq %r15, %rsp

mov_r_r8:
        movq %rax, %rsp
        movq %rbx, %r8
        movq %rcx, %r8
        movq %rdx, %r8
        movq %rsi, %r8
        movq %rdi, %r8
        movq %rbp, %r8
        movq %rsp, %r8
        movq %r8, %r8
        movq %r9, %r8
        movq %r10, %r8
        movq %r11, %r8
        movq %r12, %r8
        movq %r13, %r8
        movq %r14, %r8
        movq %r15, %r8

mov_r_r9:
        movq %rax, %rsp
        movq %rbx, %r9
        movq %rcx, %r9
        movq %rdx, %r9
        movq %rsi, %r9
        movq %rdi, %r9
        movq %rbp, %r9
        movq %rsp, %r9
        movq %r8, %r9
        movq %r9, %r9
        movq %r10, %r9
        movq %r11, %r9
        movq %r12, %r9
        movq %r13, %r9
        movq %r14, %r9
        movq %r15, %r9

mov_r_r10:
        movq %rax, %rsp
        movq %rbx, %r10
        movq %rcx, %r10
        movq %rdx, %r10
        movq %rsi, %r10
        movq %rdi, %r10
        movq %rbp, %r10
        movq %rsp, %r10
        movq %r8, %r10
        movq %r9, %r10
        movq %r10, %r10
        movq %r11, %r10
        movq %r12, %r10
        movq %r13, %r10
        movq %r14, %r10
        movq %r15, %r10

mov_r_r11:
        movq %rax, %rsp
        movq %rbx, %r11
        movq %rcx, %r11
        movq %rdx, %r11
        movq %rsi, %r11
        movq %rdi, %r11
        movq %rbp, %r11
        movq %rsp, %r11
        movq %r8, %r11
        movq %r9, %r11
        movq %r10, %r11
        movq %r11, %r11
        movq %r12, %r11
        movq %r13, %r11
        movq %r14, %r11
        movq %r15, %r11

mov_r_r12:
        movq %rax, %rsp
        movq %rbx, %r12
        movq %rcx, %r12
        movq %rdx, %r12
        movq %rsi, %r12
        movq %rdi, %r12
        movq %rbp, %r12
        movq %rsp, %r12
        movq %r8, %r12
        movq %r9, %r12
        movq %r10, %r12
        movq %r11, %r12
        movq %r12, %r12
        movq %r13, %r12
        movq %r14, %r12
        movq %r15, %r12

mov_r_r13:
        movq %rax, %rsp
        movq %rbx, %r13
        movq %rcx, %r13
        movq %rdx, %r13
        movq %rsi, %r13
        movq %rdi, %r13
        movq %rbp, %r13
        movq %rsp, %r13
        movq %r8, %r13
        movq %r9, %r13
        movq %r10, %r13
        movq %r11, %r13
        movq %r12, %r13
        movq %r13, %r13
        movq %r14, %r13
        movq %r15, %r13

mov_r_r14:
        movq %rax, %rsp
        movq %rbx, %r14
        movq %rcx, %r14
        movq %rdx, %r14
        movq %rsi, %r14
        movq %rdi, %r14
        movq %rbp, %r14
        movq %rsp, %r14
        movq %r8, %r14
        movq %r9, %r14
        movq %r10, %r14
        movq %r11, %r14
        movq %r12, %r14
        movq %r13, %r14
        movq %r14, %r14
        movq %r15, %r14

mov_r_r15:
        movq %rax, %rsp
        movq %rbx, %r15
        movq %rcx, %r15
        movq %rdx, %r15
        movq %rsi, %r15
        movq %rdi, %r15
        movq %rbp, %r15
        movq %rsp, %r15
        movq %r8, %r15
        movq %r9, %r15
        movq %r10, %r15
        movq %r11, %r15
        movq %r12, %r15
        movq %r13, %r15
        movq %r14, %r15
        movq %r15, %r15

mov_m64_rax:
        movq (%rax), %rax
        movq (%rbx), %rax
        movq (%rcx), %rax
        movq (%rdx), %rax
        movq (%rsi), %rax
        movq (%rdi), %rax
        movq (%rbp), %rax
        movq (%rsp), %rax
        movq (%r8), %rax
        movq (%r9), %rax
        movq (%r10), %rax
        movq (%r11), %rax
        movq (%r12), %rax
        movq (%r13), %rax
        movq (%r14), %rax
        movq (%r15), %rax

mov_rax_m64:
        movq %rax, (%rax)
        movq %rax, (%rbx)
        movq %rax, (%rcx)
        movq %rax, (%rdx)
        movq %rax, (%rsi)
        movq %rax, (%rdi)
        movq %rax, (%rbp)
        movq %rax, (%rsp)
        movq %rax, (%r8)
        movq %rax, (%r9)
        movq %rax, (%r10)
        movq %rax, (%r11)
        movq %rax, (%r12)
        movq %rax, (%r13)
        movq %rax, (%r14)
        movq %rax, (%r15)

mov_m64_rax_disp8:
        movq 0x11(%rax), %rax
        movq 0x11(%rbx), %rax
        movq 0x11(%rcx), %rax
        movq 0x11(%rdx), %rax
        movq 0x11(%rsi), %rax
        movq 0x11(%rdi), %rax
        movq 0x11(%rbp), %rax
        movq 0x11(%rsp), %rax
        movq 0x11(%r8), %rax
        movq 0x11(%r9), %rax
        movq 0x11(%r10), %rax
        movq 0x11(%r11), %rax
        movq 0x11(%r12), %rax
        movq 0x11(%r13), %rax
        movq 0x11(%r14), %rax
        movq 0x11(%r15), %rax

mov_rax_m64_disp8:
        movq %rax, 0x11(%rax)
        movq %rax, 0x11(%rbx)
        movq %rax, 0x11(%rcx)
        movq %rax, 0x11(%rdx)
        movq %rax, 0x11(%rsi)
        movq %rax, 0x11(%rdi)
        movq %rax, 0x11(%rbp)
        movq %rax, 0x11(%rsp)
        movq %rax, 0x11(%r8)
        movq %rax, 0x11(%r9)
        movq %rax, 0x11(%r10)
        movq %rax, 0x11(%r11)
        movq %rax, 0x11(%r12)
        movq %rax, 0x11(%r13)
        movq %rax, 0x11(%r14)
        movq %rax, 0x11(%r15)

mov_m64_rax_disp32:
        movq 0x11223344(%rax), %rax
        movq 0x11223344(%rbx), %rax
        movq 0x11223344(%rcx), %rax
        movq 0x11223344(%rdx), %rax
        movq 0x11223344(%rsi), %rax
        movq 0x11223344(%rdi), %rax
        movq 0x11223344(%rbp), %rax
        movq 0x11223344(%rsp), %rax
        movq 0x11223344(%r8), %rax
        movq 0x11223344(%r9), %rax
        movq 0x11223344(%r10), %rax
        movq 0x11223344(%r11), %rax
        movq 0x11223344(%r12), %rax
        movq 0x11223344(%r13), %rax
        movq 0x11223344(%r14), %rax
        movq 0x11223344(%r15), %rax

mov_m64_rax_sib8:
        movq 0x11(%rax, %rax, 1), %rax
        movq 0x11(%rax, %rax, 2), %rax
        movq 0x11(%rax, %rax, 4), %rax
        movq 0x11(%rax, %rax, 8), %rax
        movq 0x11(%rbx, %rax, 1), %rax
        movq 0x11(%rbx, %rax, 2), %rax
        movq 0x11(%rbx, %rax, 4), %rax
        movq 0x11(%rbx, %rax, 8), %rax
        movq 0x11(%rax, %rbx, 1), %rax
        movq 0x11(%rax, %rbx, 2), %rax
        movq 0x11(%rax, %rbx, 4), %rax
        movq 0x11(%rax, %rbx, 8), %rax

mov_m64_rax_sib32:
        movq 0x11223344(%rax, %rax, 1), %rax
        movq 0x11223344(%rax, %rax, 2), %rax
        movq 0x11223344(%rax, %rax, 4), %rax
        movq 0x11223344(%rax, %rax, 8), %rax
        movq 0x11223344(%rbx, %rax, 1), %rax
        movq 0x11223344(%rbx, %rax, 2), %rax
        movq 0x11223344(%rbx, %rax, 4), %rax
        movq 0x11223344(%rbx, %rax, 8), %rax
        movq 0x11223344(%rax, %rbx, 1), %rax
        movq 0x11223344(%rax, %rbx, 2), %rax
        movq 0x11223344(%rax, %rbx, 4), %rax
        movq 0x11223344(%rax, %rbx, 8), %rax

add_r64_rax:
        add %rax, %rax
        add %rbx, %rax
        add %rcx, %rax
        add %rdx, %rax
        add %rsi, %rax
        add %rdi, %rax
        add %rbp, %rax
        add %rsp, %rax
        add %r8, %rax
        add %r9, %rax
        add %r10, %rax
        add %r11, %rax
        add %r12, %rax
        add %r13, %rax
        add %r14, %rax
        add %r15, %rax

add_rax_r64:
        add %rax, %rax
        add %rax, %rbx
        add %rax, %rcx
        add %rax, %rdx
        add %rax, %rsi
        add %rax, %rdi
        add %rax, %rbp
        add %rax, %rsp
        add %rax, %r8
        add %rax, %r9
        add %rax, %r10
        add %rax, %r11
        add %rax, %r12
        add %rax, %r13
        add %rax, %r14
        add %rax, %r15

add_rax:
        add (%rax), %rax
        add 0x11(%rax), %rax
        add 0x11223344(%rax), %rax
        add 0x11(%rax, %rax, 1), %rax
        add 0x11223344(%rax, %rax, 1), %rax

add_m64_rax:
        add (%rax), %rax
        add (%rbx), %rax
        add (%rcx), %rax
        add (%rdx), %rax
        add (%rsi), %rax
        add (%rdi), %rax
        add (%rbp), %rax
        add (%rsp), %rax
        add (%r8), %rax
        add (%r9), %rax
        add (%r10), %rax
        add (%r11), %rax
        add (%r12), %rax
        add (%r13), %rax
        add (%r14), %rax
        add (%r15), %rax

inc_r64:
        incq %rax
        incq %rbx
        incq %rcx
        incq %rdx
        incq %rsi
        incq %rdi
        incq %rbp
        incq %rsp
        incq %r8
        incq %r9
        incq %r10
        incq %r11
        incq %r12
        incq %r13
        incq %r14
        incq %r15

inc_r32:
        incl %eax
        incl %ebx
        incl %ecx
        incl %edx
        incl %esi
        incl %edi
        incl %ebp
        incl %esp
        incl %r8d
        incl %r9d
        incl %r10d
        incl %r11d
        incl %r12d
        incl %r13d
        incl %r14d
        incl %r15d

inc_r8:
        incb %al
        incb %bl
        incb %cl
        incb %dl
        incb %sil
        incb %dil
        incb %bpl
        incb %spl
        incb %r8b
        incb %r9b
        incb %r10b
        incb %r11b
        incb %r12b
        incb %r13b
        incb %r14b
        incb %r15b

dec_r64:
        decq %rax
        decq %rbx
        decq %rcx
        decq %rdx
        decq %rsi
        decq %rdi
        decq %rbp
        decq %rsp
        decq %r8
        decq %r9
        decq %r10
        decq %r11
        decq %r12
        decq %r13
        decq %r14
        decq %r15

dec_r32:
        decl %eax
        decl %ebx
        decl %ecx
        decl %edx
        decl %esi
        decl %edi
        decl %ebp
        decl %esp
        decl %r8d
        decl %r9d
        decl %r10d
        decl %r11d
        decl %r12d
        decl %r13d
        decl %r14d
        decl %r15d

dec_r8:
        decb %al
        decb %bl
        decb %cl
        decb %dl
        decb %sil
        decb %dil
        decb %bpl
        decb %spl
        decb %r8b
        decb %r9b
        decb %r10b
        decb %r11b
        decb %r12b
        decb %r13b
        decb %r14b
        decb %r15b
