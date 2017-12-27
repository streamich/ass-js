import {m, xmm} from "../../x86/atoms";
import {EXT} from "../../x86/consts";

export default [{o: 0x58, vex: 'NDS.LIG.F3.0F.WIG', en: 'rvm', ops: [xmm, xmm, [xmm, m]], ext: [EXT.AVX]}];
