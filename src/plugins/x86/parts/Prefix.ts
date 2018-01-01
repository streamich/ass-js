import InstructionPart from './InstructionPart';

export enum PREFIX {
    LOCK    = 0xF0,
    REP     = 0xF3,         // REP prefix.
    REPE    = 0xF3,         // REPE/REPZ prefix.
    REPNE   = 0xF2,         // REPNE/REPNZ prefix
    CS      = 0x2E,
    SS      = 0x36,
    DS      = 0x3E,
    ES      = 0x26,
    FS      = 0x64,
    GS      = 0x65,
    REX     = 0b01000000,   // 0x40
    BNT     = 0x2E,         // Branch not taken, same as CS.
    BT      = 0x3E,         // Branch taken, same as DS.
    OS      = 0x66,         // Operand size override.
    AS      = 0x67,         // Address size override.
}

abstract class Prefix extends InstructionPart {}

export default Prefix;
