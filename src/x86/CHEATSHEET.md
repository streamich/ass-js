

    RAX = 0000
    RCX = 0001
    RDX = 0010
    RBX = 0011
    RSP = 0100
    RBP = 0101
    RSI = 0110
    RDI = 0111
    R8  = 1000
    R9  = 1001
    R10 = 1010
    R11 = 1011
    R12 = 1100
    R13 = 1101
    R14 = 1110
    R15 = 1111
    
REX:
    
    0100WRXB
    .......B <--- R/M field in Mod-R/M byte, or BASE field in SIB byte addresses one of the extended registers.
    ......X <---- INDEX field in SIB byte addresses one of the extended registers.
    .....R <----- REG field in Mod-R/M byte addresses one of the extended registers.
    ....W <------ Used instruction needs REX prefix.
    .1 <--------- 0x40 identifies the REX prefix.

Opcode:

    ......ds
    .......s <--- Size: 1 byte or 4/8 bytes
    ......d <--- Direction: 1 - register is destination

Mod-REG-R/M:

    .....XXX <--- R/M field: Register or Memory
    ..XXX <------ REG field: Register or op-code extension
    XX <--------- MOD field: mode of operation