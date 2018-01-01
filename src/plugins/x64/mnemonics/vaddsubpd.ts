import {m, xmm, ymm} from "../../x86/atoms";
import {EXT} from "../../x86/consts";

export default [{o: 0xD0, en: 'rvm', ext: [EXT.AVX]},
    {vex: 'NDS.128.66.0F.WIG', ops: [xmm, xmm, [xmm, m]]},
    {vex: 'NDS.256.66.0F.WIG', ops: [ymm, ymm, [ymm, m]]},
];
