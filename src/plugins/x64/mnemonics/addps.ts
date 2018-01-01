import {ext_sse} from "../atoms";
import {xmm_xmmm} from "../../x86/atoms";

// 0F 58 /r ADDPS xmm1, xmm2/m128 V/V SSE
export default [{o: 0x0F58, ops: xmm_xmmm, ext: ext_sse}];
