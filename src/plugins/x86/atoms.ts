import {
    Register16, Register32, Register64, Register8, RegisterBounds, RegisterCr, RegisterDr, RegisterMm, RegisterSegment,
    RegisterSt, RegisterXmm, RegisterYmm, RegisterZmm
} from './operand/register';
import {MODE as M, EXT, INS} from './consts';
import {Memory} from "../../operand";
import {Memory128, Memory16, Memory256, Memory32, Memory512, Memory64, Memory8} from "./operand/memory";

export * from '../../atoms';

export {
    M,
    EXT,
    INS,
};

// Operands
export const r8       = Register8;
export const r16      = Register16;
export const r32      = Register32;
export const r64      = Register64;
export const sreg     = RegisterSegment;
export const mm       = RegisterMm;
export const st       = RegisterSt;
export const xmm      = RegisterXmm;
export const ymm      = RegisterYmm;
export const zmm      = RegisterZmm;
export const bnd      = RegisterBounds;
export const cr       = RegisterCr;
export const dr       = RegisterDr;
export const m        = Memory;
export const m8       = Memory8;
export const m16      = Memory16;
export const m32      = Memory32;
export const m64      = Memory64;
export const m128     = Memory128;
export const m256     = Memory256;
export const m512     = Memory512;
export const rm8      = [r8,  m];
export const rm16     = [r16, m];
export const rm32     = [r32, m];
export const rm64     = [r64, m];
export const xmmm             = [xmm, m];
export const xmm_xmmm         = [xmm, xmmm];
export const xmm_xmm_xmmm     = [xmm, xmm, xmmm];
export const ymmm             = [ymm, m];
export const ymm_ymmm         = [ymm, ymmm];
export const ymm_ymm_ymmm     = [ymm, ymm, ymmm];
export const zmmm             = [zmm, m];
export const zmm_zmmm         = [zmm, zmmm];
export const zmm_zmm_zmmm     = [zmm, zmm, zmmm];
