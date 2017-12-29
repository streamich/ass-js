import {EXT} from '../x86/atoms';
import {cr0, cr1, cr2, cr3, cr4, cr5, cr6, cr7, dr0, dr1, dr2, dr3, dr4, dr5, dr6, dr7} from "../x86/operand/generator";

export * from '../x86/atoms';

export const cr0_7 = [cr0, cr1, cr2, cr3, cr4, cr5, cr6, cr7];
export const dr0_7 = [dr0, dr1, dr2, dr3, dr4, dr5, dr6, dr7];

export const ext_mmx      = [EXT.MMX];
export const ext_sse      = [EXT.SSE];
export const ext_sse2     = [EXT.SSE2];
export const ext_avx      = [EXT.AVX];
export const ext_avx2     = [EXT.AVX2];

export const rvm = 'rvm';
export const mr = 'mr';
