import * as oo from '../../operand';
import {SIZE} from '../../operand';
import * as o from './operand/operand';
import * as c from '../../code';
import {Code as CodeBase} from '../../code';
import * as d from './def';
import * as i from './instruction';
import {MODE} from "./consts";
import {RegisterK} from "./operand/register";



export class Code extends CodeBase {

    mode: MODE = MODE.X64;

    ClassInstruction: any = i.InstructionX86;
    ClassInstructionSet = i.InstructionSetX86;
    ClassOperands = o.OperandsX86;

    /*
    protected createInstructionFromGroupSize(bySize: {[s: number]: d.Def[]}, size: oo.SIZE, ui_ops: oo.TOperand[]): any {
        var ops = new this.ClassOperands(ui_ops, size);
        ops.normalizeExpressionToRelative();

        var matches: d.DefMatchList = new d.DefMatchList;
        matches.matchAll(bySize[size], ops, {size: SIZE.ANY});

        if(!matches.list.length) {
            throw Error('Could not match operands to instruction definition.');
        }

        var iset = new i.InstructionSetX86(ops, matches, {size: SIZE.ANY});
        this.insert(iset);

        var insn = iset.pickShortestInstruction();
        if(insn) {
            this.replace(insn, iset.index);
            return insn;
        } else
            return iset;
    }
    */


}
