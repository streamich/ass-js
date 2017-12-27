import {m, xmm} from "../../x86/atoms";
import {EXT} from "../../x86/consts";

export default [{o: 0xF20F58, ops: [xmm, [xmm, m]], ext: [EXT.SSE2]}];
