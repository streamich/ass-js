import * as code from '../x86/code';
import * as o from '../x86/operand';
import * as d from '../x86/def';
import {Instruction} from './instruction';
import * as t from './table';


export const table = new d.DefTable(t.table, t.defaults);
export type TOperand = o.TUserInterfaceOperand;


export class Code extends code.Code {

    static create() {
        var code = new Code;
        code.attachMethods(table);
        return code;
    }

    protected ClassInstruction = Instruction;


    operandSize = o.SIZE.D;
    addressSize = o.SIZE.Q;
}

export interface Code {
    jmp(dst: TOperand): Instruction;

    adcx(dst: TOperand, src: TOperand): Instruction;
    adox(dst: TOperand, src: TOperand): Instruction;
    add(dst: TOperand, src: TOperand): Instruction;
    adc(dst: TOperand, src: TOperand): Instruction;
    adcb(dst: TOperand, src: TOperand): Instruction;
    adcw(dst: TOperand, src: TOperand): Instruction;
    adcd(dst: TOperand, src: TOperand): Instruction;
    adcq(dst: TOperand, src: TOperand): Instruction;
    sub(dst: TOperand, src: TOperand): Instruction;
    subb(dst: TOperand, src: TOperand): Instruction;
    subw(dst: TOperand, src: TOperand): Instruction;
    subd(dst: TOperand, src: TOperand): Instruction;
    subq(dst: TOperand, src: TOperand): Instruction;
    sbb(dst: TOperand, src: TOperand): Instruction;
    sbbb(dst: TOperand, src: TOperand): Instruction;
    sbbw(dst: TOperand, src: TOperand): Instruction;
    sbbd(dst: TOperand, src: TOperand): Instruction;
    sbbq(dst: TOperand, src: TOperand): Instruction;
    mul(src: TOperand): Instruction;
    mulb(src: TOperand): Instruction;
    mulw(src: TOperand): Instruction;
    muld(src: TOperand): Instruction;
    mulq(src: TOperand): Instruction;
    div(src: TOperand): Instruction;
    divb(src: TOperand): Instruction;
    divw(src: TOperand): Instruction;
    divd(src: TOperand): Instruction;
    divq(src: TOperand): Instruction;
    neg(dst: TOperand): Instruction;
    cmp(dst: TOperand, src: TOperand): Instruction;
    addq(dst: TOperand, src: TOperand): Instruction;
    mov(dst: TOperand, src: TOperand): Instruction;
    movq(dst: TOperand, src: TOperand): Instruction;
    movd(dst: TOperand, src: TOperand): Instruction;
    push(): Instruction;
    pushq(): Instruction;
    pushd(): Instruction;
    pushw(): Instruction;
    inc(dst: TOperand): Instruction;
    incq(dst: TOperand): Instruction;
    dec(dst: TOperand): Instruction;
    decq(dst: TOperand): Instruction;
    lea(dst: TOperand, src: TOperand): Instruction;

    ret(): Instruction;

    syscall(): Instruction;
    sysenter(): Instruction;
    sysexit(): Instruction;
    int(value: number): Instruction;
}
