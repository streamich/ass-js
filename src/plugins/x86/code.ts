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

    _(mnemonic: string, operands: o.TUiOperand|o.TUiOperand[] = [], options: o.SIZE|IInstructionOptions|any = {size: o.SIZE.ANY}): i.Instruction|i.InstructionSet {
        if(typeof mnemonic !== 'string') throw TypeError('`mnemonic` argument must be a string.');

        let opts: IInstructionOptions;
        if(typeof options === 'number') {
            opts = {size: options as number};
        } else if(typeof options === 'object') {
            opts = options;
        } else
            throw TypeError(`options must be a number or object.`);
        if(typeof opts.size === 'undefined') opts.size = o.SIZE.ANY;

        if(!(operands instanceof Array)) operands = [operands] as o.TUiOperand[];
        const ops = new this.ClassOperands(operands as o.TUiOperand[], opts.size);
        ops.normalizeExpressionToRelative();

        const matches = this.matchDefinitions(mnemonic, ops, opts);

        const iset = new this.ClassInstructionSet(ops, matches, opts);
        this.insert(iset);

        const insn = iset.pickShortestInstruction();
        if(insn) {
            this.replace(insn, iset.index);
            return insn;
        } else
            return iset;
    }

    protected matchDefinitions(mnemonic: string, ops: o.OperandsX86, opts: IInstructionOptions): d.DefMatchList {
        var matches = this.table.matchDefinitions(mnemonic, ops, opts);
        if(!matches.list.length)
            throw Error(`Could not match operands to instruction definition ${mnemonic}.`);

        for(var j = matches.list.length - 1; j >= 0; j--) {
            var def = matches.list[j].def as d.Def;

            // Check mode of CPU.
            if(!(this.mode & def.mode)) {
                matches.list.splice(j, 1);
                continue;
            }

            // If EVEX-specific options provided by user,
            // remove instruction definition matches that don't have EVEX prefix.
            var needs_evex = opts.mask || (typeof opts.z !== 'undefined');
            if(needs_evex) {
                if(!def.evex) matches.list.splice(j, 1);
                continue;
            }
        }

        return matches;
    }
}
