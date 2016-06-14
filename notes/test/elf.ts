import * as o from '../../x86/operand';
import {Code} from '../../x86/x64/code';


var _ = new Code;


var ehdr = _.label('ehdr');
_.db(0x7F);                                 // e_ident
_.db("ELF");
_.db([1, 1, 1, 0]);
_.db(0, 8);
_.dw(2);                                    // e_type
_.dw(3);                                    // e_machine
_.dd(1);                                    // e_version
// dd      1                               ;   e_version
// dd      _start                          ;   e_entry
// dd      phdr - $$                       ;   e_phoff
// dd      0                               ;   e_shoff
// dd      0                               ;   e_flags
// dw      ehdrsize                        ;   e_ehsize
// dw      phdrsize                        ;   e_phentsize
// dw      1                               ;   e_phnum
// dw      0                               ;   e_shentsize
// dw      0                               ;   e_shnum
// dw      0                               ;   e_shstrndx
//
// ehdrsize      equ     $ - ehdr
//
// phdr:                                                 ; Elf32_Phdr
// dd      1                               ;   p_type
// dd      0                               ;   p_offset
// dd      $$                              ;   p_vaddr
// dd      $$                              ;   p_paddr
// dd      filesize                        ;   p_filesz
// dd      filesize                        ;   p_memsz
// dd      5                               ;   p_flags
// dd      0x1000                          ;   p_align
//
// phdrsize      equ     $ - phdr
//
// _start:
//
//     ; your program here
//
// filesize      equ     $ - $$
