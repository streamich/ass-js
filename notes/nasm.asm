; nasm -f bin -o nasm.o nasm.asm
; objdump -D -b binary -mi386 -Maddr16,data16 -M intel nasm.o > nasm.dump
; nasm -f bin -o notes/nasm.o notes/nasm.asm && objdump -D -b binary -mi386 -Maddr16,data16 -M intel notes/nasm.o > notes/nasm.dump

    BITS 64

section     .text
global      _start                              ;must be declared for linker (ld)

_start:                                         ;tell linker entry point

    syscall
    int     0x80

    mov     rbx, rax

    mov     rsi, rax

    mov     rax, 1
