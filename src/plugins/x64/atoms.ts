import {cr, dr} from '../x86/operand';
import {EXT} from '../x86/atoms';


export * from '../x86/atoms';

export const cr0_7 = [cr(0), cr(1), cr(2), cr(3), cr(4), cr(5), cr(6), cr(7)];
export const dr0_7 = [dr(0), dr(1), dr(2), dr(3), dr(4), dr(5), dr(6), dr(7)];

export const ext_mmx      = [EXT.MMX];
export const ext_sse      = [EXT.SSE];
export const ext_sse2     = [EXT.SSE2];
export const ext_avx      = [EXT.AVX];
export const ext_avx2     = [EXT.AVX2];

export const rvm = 'rvm';
export const mr = 'mr';
