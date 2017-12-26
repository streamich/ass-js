import {R16, R32, R64, R8, R8H, SEG} from "../regfile";
import {
    Register16,
    Register32,
    Register64,
    Register8,
    Register8High,
    RegisterBounds,
    RegisterRip,
    RegisterCr,
    RegisterDr,
    RegisterK,
    RegisterMm,
    RegisterSegment,
    RegisterSt,
    RegisterXmm,
    RegisterYmm,
    RegisterZmm
} from "./register";

function validateRegId(id: number, min, max, Clazz) {
    if (typeof id !== 'number') throw TypeError(Clazz.name + ' register ID must be a number.');
    if (id < min) throw TypeError(`${Clazz.name} register ID must be at least ${min}.`);
    if (id > max) throw TypeError(`${Clazz.name} register ID must be at most ${max}.`);
}

function createRegisterGenerator<T>(Klass, min_id = 0, max_id = 15) {
    let cache: T[];
    return function (id: number): T {
        validateRegId(id, min_id, max_id, Klass);
        if (!cache) cache = new Array(max_id + 1);
        if (!cache[id]) cache[id] = new Klass(id);
        return cache[id];
    };
}

export const rb = createRegisterGenerator<Register8>(Register8, 0, 15);
export const rw = createRegisterGenerator<Register16>(Register16, 0, 15);
export const rd = createRegisterGenerator<Register32>(Register32, 0, 15);
export const rq = createRegisterGenerator<Register64>(Register64, 0, 15);
export const r = rq;
export const seg = createRegisterGenerator<RegisterSegment>(RegisterSegment, 0, 15);
export const mm = createRegisterGenerator<RegisterMm>(RegisterMm, 0, 15);
export const st = createRegisterGenerator<RegisterSt>(RegisterSt, 0, 7);
export const xmm = createRegisterGenerator<RegisterXmm>(RegisterXmm, 0, 31);
export const ymm = createRegisterGenerator<RegisterYmm>(RegisterYmm, 0, 31);
export const zmm = createRegisterGenerator<RegisterZmm>(RegisterZmm, 0, 31);
export const k = createRegisterGenerator<RegisterK>(RegisterK, 0, 7);
export const bnd = createRegisterGenerator<RegisterBounds>(RegisterBounds, 0, 3);
export const cr = createRegisterGenerator<RegisterCr>(RegisterCr, 0, 15);
export const dr = createRegisterGenerator<RegisterDr>(RegisterDr, 0, 15);

export const al = rb(R8.AL);
export const bl = rb(R8.BL);
export const cl = rb(R8.CL);
export const dl = rb(R8.DL);

export const sil = rb(R8.SIL);
export const dil = rb(R8.DIL);
export const bpl = rb(R8.BPL);
export const spl = rb(R8.SPL);
export const r8b = rb(R8.R8B);
export const r9b = rb(R8.R9B);
export const r10b = rb(R8.R10B);
export const r11b = rb(R8.R11B);
export const r12b = rb(R8.R12B);
export const r13b = rb(R8.R13B);
export const r14b = rb(R8.R14B);
export const r15b = rb(R8.R15B);

export const ah = new Register8High(R8H.AH);
export const bh = new Register8High(R8H.BH);
export const ch = new Register8High(R8H.CH);
export const dh = new Register8High(R8H.DH);

export const ax = rw(R16.AX);
export const bx = rw(R16.BX);
export const cx = rw(R16.CX);
export const dx = rw(R16.DX);
export const si = rw(R16.SI);
export const di = rw(R16.DI);
export const bp = rw(R16.BP);
export const sp = rw(R16.SP);
export const r8w = rw(R16.R8W);
export const r9w = rw(R16.R9W);
export const r10w = rw(R16.R10W);
export const r11w = rw(R16.R11W);
export const r12w = rw(R16.R12W);
export const r13w = rw(R16.R13W);
export const r14w = rw(R16.R14W);
export const r15w = rw(R16.R15W);

export const eax = rd(R32.EAX);
export const ebx = rd(R32.EBX);
export const ecx = rd(R32.ECX);
export const edx = rd(R32.EDX);
export const esi = rd(R32.ESI);
export const edi = rd(R32.EDI);
export const ebp = rd(R32.EBP);
export const esp = rd(R32.ESP);
export const r8d = rd(R32.R8D);
export const r9d = rd(R32.R9D);
export const r10d = rd(R32.R10D);
export const r11d = rd(R32.R11D);
export const r12d = rd(R32.R12D);
export const r13d = rd(R32.R13D);
export const r14d = rd(R32.R14D);
export const r15d = rd(R32.R15D);

export const rax = rq(R64.RAX);
export const rcx = rq(R64.RCX);
export const rdx = rq(R64.RDX);
export const rbx = rq(R64.RBX);
export const rsp = rq(R64.RSP);
export const rbp = rq(R64.RBP);
export const rsi = rq(R64.RSI);
export const rdi = rq(R64.RDI);
export const r8 = rq(R64.R8);
export const r9 = rq(R64.R9);
export const r10 = rq(R64.R10);
export const r11 = rq(R64.R11);
export const r12 = rq(R64.R12);
export const r13 = rq(R64.R13);
export const r14 = rq(R64.R14);
export const r15 = rq(R64.R15);

export const rip = new RegisterRip;

export const es = seg(SEG.ES);
export const cs = seg(SEG.CS);
export const ss = seg(SEG.SS);
export const ds = seg(SEG.DS);
export const fs = seg(SEG.FS);
export const gs = seg(SEG.GS);
