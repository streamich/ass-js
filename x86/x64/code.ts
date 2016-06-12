import {SIZE, TUiOperand} from '../../operand';
import * as code from '../code';
import * as d from '../def';
import {Instruction} from './instruction';
import * as t from './table';
import {extend} from '../../util';


export const table = (new d.DefTable).create(t.table, t.defaults);
const methods = code.Code.attachMethods({} as any, table);


export class Code extends code.Code {

    static table = table;

    private static _methodsAdded = false;

    static create(name: string = 'start') {
        if(!Code._methodsAdded) {
            extend(Code.prototype, methods);
            Code._methodsAdded = true;
        }

        var newcode = new Code(name);
        // newcode.addMethods();
        return newcode;
    }

    methods = methods;

    ClassInstruction = Instruction;

    operandSize = SIZE.D;
    addressSize = SIZE.Q;
}


export interface Code {
    jmp(dst: TUiOperand): Instruction;
    jmpq(dst: TUiOperand): Instruction;
    ljmp(dst: TUiOperand): Instruction;
    ljmpq(dst: TUiOperand): Instruction;
    jecxz(rel: TUiOperand): Instruction;
    jrcxz(rel: TUiOperand): Instruction;
    ja(rel: TUiOperand): Instruction;
    jae(rel: TUiOperand): Instruction;
    jb(rel: TUiOperand): Instruction;
    jbe(rel: TUiOperand): Instruction;
    jc(rel: TUiOperand): Instruction;
    je(rel: TUiOperand): Instruction;
    jg(rel: TUiOperand): Instruction;
    jge(rel: TUiOperand): Instruction;
    jl(rel: TUiOperand): Instruction;
    jle(rel: TUiOperand): Instruction;
    jna(rel: TUiOperand): Instruction;
    jnae(rel: TUiOperand): Instruction;
    jnb(rel: TUiOperand): Instruction;
    jnbe(rel: TUiOperand): Instruction;
    jnc(rel: TUiOperand): Instruction;
    jne(rel: TUiOperand): Instruction;
    jng(rel: TUiOperand): Instruction;
    jnge(rel: TUiOperand): Instruction;
    jnl(rel: TUiOperand): Instruction;
    jnle(rel: TUiOperand): Instruction;
    jno(rel: TUiOperand): Instruction;
    jnp(rel: TUiOperand): Instruction;
    jns(rel: TUiOperand): Instruction;
    jnz(rel: TUiOperand): Instruction;
    jo(rel: TUiOperand): Instruction;
    jp(rel: TUiOperand): Instruction;
    jpe(rel: TUiOperand): Instruction;
    jpo(rel: TUiOperand): Instruction;
    js(rel: TUiOperand): Instruction;
    jz(rel: TUiOperand): Instruction;
    loop(rel: TUiOperand): Instruction;
    loope(rel: TUiOperand): Instruction;
    loopz(rel: TUiOperand): Instruction;
    loopne(rel: TUiOperand): Instruction;
    loopnz(rel: TUiOperand): Instruction;
    enter(imm16: number, imm8: number): Instruction;

    'in'(dst: TUiOperand, src: TUiOperand): Instruction;
    inb(dst: TUiOperand, src: TUiOperand): Instruction;
    inw(dst: TUiOperand, src: TUiOperand): Instruction;
    ind(dst: TUiOperand, src: TUiOperand): Instruction;
    out(dst: TUiOperand, src: TUiOperand): Instruction;
    outb(dst: TUiOperand, src: TUiOperand): Instruction;
    outw(dst: TUiOperand, src: TUiOperand): Instruction;
    outd(dst: TUiOperand, src: TUiOperand): Instruction;
    insb(): Instruction;
    insw(): Instruction;
    insd(): Instruction;
    outsb(): Instruction;
    outsw(): Instruction;
    outsd(): Instruction;

    // Flag Control
    stc(): Instruction;
    clc(): Instruction;
    cmc(): Instruction;
    cld(): Instruction;
    std(): Instruction;
    pushf(): Instruction;
    popf(): Instruction;
    sti(): Instruction;
    cli(): Instruction;

    // Random Number
    rdrand(dst: TUiOperand): Instruction;
    rdseed(src: TUiOperand): Instruction;

    adcx(dst: TUiOperand, src: TUiOperand): Instruction;
    adox(dst: TUiOperand, src: TUiOperand): Instruction;
    add(dst: TUiOperand, src: TUiOperand): Instruction;
    adc(dst: TUiOperand, src: TUiOperand): Instruction;
    adcb(dst: TUiOperand, src: TUiOperand): Instruction;
    adcw(dst: TUiOperand, src: TUiOperand): Instruction;
    adcd(dst: TUiOperand, src: TUiOperand): Instruction;
    adcq(dst: TUiOperand, src: TUiOperand): Instruction;
    sub(dst: TUiOperand, src: TUiOperand): Instruction;
    subb(dst: TUiOperand, src: TUiOperand): Instruction;
    subw(dst: TUiOperand, src: TUiOperand): Instruction;
    subd(dst: TUiOperand, src: TUiOperand): Instruction;
    subq(dst: TUiOperand, src: TUiOperand): Instruction;
    sbb(dst: TUiOperand, src: TUiOperand): Instruction;
    sbbb(dst: TUiOperand, src: TUiOperand): Instruction;
    sbbw(dst: TUiOperand, src: TUiOperand): Instruction;
    sbbd(dst: TUiOperand, src: TUiOperand): Instruction;
    sbbq(dst: TUiOperand, src: TUiOperand): Instruction;
    mul(src: TUiOperand): Instruction;
    mulb(src: TUiOperand): Instruction;
    mulw(src: TUiOperand): Instruction;
    muld(src: TUiOperand): Instruction;
    mulq(src: TUiOperand): Instruction;
    div(src: TUiOperand): Instruction;
    divb(src: TUiOperand): Instruction;
    divw(src: TUiOperand): Instruction;
    divd(src: TUiOperand): Instruction;
    divq(src: TUiOperand): Instruction;
    neg(dst: TUiOperand): Instruction;
    cmp(dst: TUiOperand, src: TUiOperand): Instruction;
    addq(dst: TUiOperand, src: TUiOperand): Instruction;
    mov(dst: TUiOperand, src: TUiOperand): Instruction;
    movq(dst: TUiOperand, src: TUiOperand): Instruction;
    movd(dst: TUiOperand, src: TUiOperand): Instruction;
    push(): Instruction;
    pushq(): Instruction;
    pushd(): Instruction;
    pushw(): Instruction;
    inc(dst: TUiOperand): Instruction;
    incq(dst: TUiOperand): Instruction;
    dec(dst: TUiOperand): Instruction;
    decq(dst: TUiOperand): Instruction;
    lea(dst: TUiOperand, src: TUiOperand): Instruction;

    ret(): Instruction;

    syscall(): Instruction;
    sysenter(): Instruction;
    sysexit(): Instruction;
    int(value: number): Instruction;
}
