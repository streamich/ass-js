import {EXT} from "../../x86/consts";

export default [{},
    // VEX.L1.0F.W0 41 /r KANDW k1, k2, k3 V/V AVX512F
    {o: 0x41, vex: 'L1.0F.W0', ops: [], ext: [EXT.AVX512F]},
];
