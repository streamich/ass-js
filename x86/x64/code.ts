import {SIZE, TUiOperand} from '../../operand';
import * as code from '../code';
import * as d from '../def';
import {Instruction} from './instruction';
import * as t from './table';
import {extend} from '../../util';


export const table = (new d.DefTable).create(t.table, t.defaults);
const methods = code.Code.attachMethods({} as any, table);


export class Code extends code.Code {

    private static _methodsAdded = false;

    static create() {
        if(!Code._methodsAdded) {
            extend(Code.prototype, methods);
            Code._methodsAdded = true;
        }

        var newcode = new Code;
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
