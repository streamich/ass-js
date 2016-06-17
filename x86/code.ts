import * as oo from '../operand';
import * as o from './operand';
import * as c from '../code';
import {Code as CodeBase} from '../code';
import * as t from './table';
import * as d from './def';
import * as i from './instruction';
import {number64, Tnumber} from '../operand';
import {UInt64, extend} from '../util';


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

    ClassInstruction: any = i.Instruction;
    ClassInstructionSet = i.InstructionSet;
    AlignExpression = i.Align;
    ClassOperands = o.Operands;

    protected createInstructionFromGroupSize(bySize: {[s: number]: d.Def[]}, size: oo.SIZE, ui_ops: oo.TOperand[]): any {
        var ops = new this.ClassOperands(ui_ops, size);
        ops.normalizeExpressionToRelative();

        var matches: d.DefMatchList = new d.DefMatchList;
        matches.matchAll(bySize[size], ops);

        if(!matches.list.length) {
            throw Error('Could not match operands to instruction definition.');
        }

        var iset = new i.InstructionSet(ops, matches);
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

    // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
    //
    // > The size of a displacement is 1, 2, or 4 bytes.
    //
    // > Also, in 64-bit mode, support is provided for some 64-bit displacement
    // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
    // > information on this.
    mem(disp: number|number64): o.Memory {
        if(typeof disp === 'number')
            return o.Memory.factory(this.addressSize).disp(disp as number);
        else if((disp instanceof Array) && (disp.length == 2))
            return o.Memory.factory(this.addressSize).disp(disp as number64);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    }

    disp(disp: number|number64): o.Memory {
        return this.mem(disp);
    }
    
    imm(value: Tnumber, signed = true) {
        return signed ? new oo.Immediate(value) : new oo.ImmediateUnsigned(value);
    }

    lock() {
        return this.tpl(i.TemplateLock);
    }

    rex(args: number[]) {
        return this.tpl(i.TemplateRex, args);
    }
}
