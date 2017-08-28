
export enum COND {
    EQ = 0b0000,    // Z set (equal)
    NE,             // Z clear (not equal)
    HS, // CS       // C set (unsigned higher or same)
    LO, // CC       // C clear (unsigned lower)
    MI,             // N set (negative)
    PL,             // N clear (positive or zero)
    VS,             // V set (overflow)
    VC,             // V clear (no overflow)
    HI,             // C set and Z clear (unsigned higher)
    LS,             // C clear or Z (set unsigned lower or same)
    GE,             // N set and V set, or N clear and V clear (>or =)
    LT,             // N set and V clear, or N clear and V set (>)
    GT,             // Z clear, and either N set and V set, or N clear and V set (>)
    LE,             // Z set, or N set and V clear,or N clear and V set (<, or =)
    AL,             // always
    NV,             // reserved
}


export class Instruction {

    //      3322222222221111111111
    //      10987654321098765432109876543210
    tpl = 0b00000000000000000000000000000000;
    //      ||||||||||||||||||||||||||||||||
    //      ||||||IPUBWS
    //      |||||| L UAL
    //      ||||||   N
    //      ||||00
    //      XXXX ---> Condition

    cond: COND = COND.AL;

    A = 0;
    I = 0;
    P = 0;
    U = 0;
    N = 0;
    B = 0;
    W = 0;
    S = 0;
    L = 0;
}

export class InstructionDataProcessing extends Instruction {

    tpl = 0b00000000000000000000000000000000;
}

export class InstructionDataMultiply extends Instruction {

    tpl = 0b00000000000000000000000000000000;
}

export class InstructionLongMultiply extends Instruction {

    //      3322222222221111111111
    //      10987654321098765432109876543210
    tpl = 0b00000000100000000000000000000000;
}


