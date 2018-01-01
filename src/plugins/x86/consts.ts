export enum MODE {
    REAL = 0b1,
    PROT = 0b10,
    COMP = 0b100,
    LEG = 0b1000,
    OLD = MODE.COMP | MODE.LEG,
    X32 = 0b10000,
    X64 = 0b100000,
    X32_64 = MODE.X32 | MODE.X64,
    ALL = MODE.REAL | MODE.PROT | MODE.COMP | MODE.LEG | MODE.X32 | MODE.X64,
}

export const MODES = ['REAL', 'PROT', 'COMP', 'LEG', 'X32', 'X64'];

// Instructions
export enum INS {
    NONE = 0b0,
    MMX = 0b1,
    AES_NI = 0b10,
    CLMUL = 0b100,
    FMA3 = 0b1000,
}

// Extensions
export enum EXT {
    NONE,
    x86_64,
    Intel_64,
    MPX,
    TXT,
    TSX,
    SGX,
    VT_x,
    VT_d,
    BMI1,
    BMI2,
    SHA,
    AES,
    INVPCID,
    LZCNT,
    MMX,
    SSE,
    SSE2,
    SSE3,
    SSSE3,
    SSE4,
    SSE4_1,
    SSE4_2,
    ADX,
    AVX,
    AVX2,
    AVX3, // AVX-512
    AVX512F = EXT.AVX3, // Foundation
    AVX512CDI,
    AVX512PFI,
    AVX512ERI,
    AVX512VL,
    AVX512VLI,
    AVX512BW,
    AVX512DQ,
    AVX512IFMA52,
    AVX512VBMI,
    FMA3,
    FMA4,
    CDI,
}
