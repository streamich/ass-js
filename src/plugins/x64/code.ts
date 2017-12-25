import {SIZE, TUiOperand} from '../../operand';
import * as code from '../x86/code';
import * as d from '../x86/def';
import {Instruction} from './instruction';
import * as t from './table';
import {extend} from '../../util';


export class Code extends code.Code {

    static table = (new d.DefTable(t.table as any, t.defaults as any)) as any;

    private static _methodsAdded = false;

    static create(name: string = 'start') {
        var newcode = new Code(name);
        newcode.addMethods();
        return newcode;
    }

    table = Code.table;

    ClassInstruction = Instruction;

    operandSize = SIZE.D;
    addressSize = SIZE.Q;
}
