import * as oo from '../../operand';
import * as o from './operand';
import {SIZE} from '../../operand';
import * as c from '../../code';
import {Code as CodeBase} from '../../code';
import * as t from './table';
import * as d from './def';
import * as i from './instruction';


export interface IInstructionOptions extends c.IInstructionOptions {
    mask?: o.RegisterK;
    z: number|boolean;
}


export class Code extends CodeBase {

    static attachMethods(ctx: Code, table: d.DefTable) {
        for(let groupname in table.groups) {
            let group = table.groups[groupname];
            let mnemonic = group.mnemonic;
            let bySize = group.groupBySize();

            // Create methods with size postfix, like: pushq, pushd, pushw, etc..
            for(let s in bySize) {
                let size = parseInt(s) as oo.SIZE;
                if(bySize[s] && (size > oo.SIZE.NONE)) {// B, W, D, Q, ...
                    ctx[mnemonic + oo.SIZE[size].toLowerCase()] = function(...ui_ops: oo.TUiOperand[]) {
                        return this.createInstructionFromGroupSize(bySize, size, ui_ops);
                    };
                }
            }

            // Create general method where we determine operand size from profided operands.
            ctx[mnemonic] = function(...ui_ops: oo.TUiOperand[]) {
                if(ui_ops.length) {
                    var size = o.Operands.findSize(ui_ops);
                    if(size < oo.SIZE.B) {
                        if(bySize[oo.SIZE.NONE]) { // Operation does not require operand size.
                            return this.createInstructionFromGroupSize(bySize, oo.SIZE.NONE, ui_ops);
                        } else
                            throw TypeError('Could not determine operand size.');
                    }
                    if(!bySize[size])
                        throw Error(`Instruction ${mnemonic} has no ${size}-bit definition.`);
                    return this[mnemonic + oo.SIZE[size].toLowerCase()].apply(this, ui_ops);
                } else {
                    return this.createInstructionFromGroupSize(bySize, oo.SIZE.NONE, ui_ops);
                }
            };
        }

        return ctx;
    }

    mode: t.MODE = t.MODE.X64;

    ClassInstruction: any = i.InstructionX86;
    ClassInstructionSet = i.InstructionSetX86;
    AlignExpression = i.Align;
    ClassOperands = o.Operands;

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

    protected matchDefinitions(mnemonic: string, ops: o.Operands, opts: IInstructionOptions): d.DefMatchList {
        var matches = super.matchDefinitions(mnemonic, ops, opts);

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
