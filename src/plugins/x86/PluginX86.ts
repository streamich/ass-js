import Plugin from "../Plugin";
import {number64, Tnumber, Immediate, ImmediateUnsigned} from '../../operand';
import {TemplateX86Lock, TemplateX86Rex} from './template';
import {MemoryX86} from './operand/memory';
import {InstructionX86} from './instruction';
import {OperandsX86} from "./operand";
import operandParser from './operand/parser';

class PluginX86 extends Plugin {
    onAsm (asm) {
        asm.hooks.command.tap('PluginX86', (name, args) => {
            switch (name) {
                case 'lock': return asm._('tpl', TemplateX86Lock);
                case 'rex': return asm._('tpl', TemplateX86Rex, args);
                case 'mem':
                case 'disp':
                    return this.mem(args[0]);
                case 'imm': return this.imm.apply(this, args);
            }
        });
        asm.hooks.op.tap('PluginX86', operandParser);
        asm.hooks.ops.tap('PluginX86', (operands, size) => new OperandsX86(operands, size));
        asm.hooks.instruction.tap('PluginX86', () => new InstructionX86());
    }
/*
    protected matchDefinitions(mnemonic: string, ops: o.Operands, opts: IInstructionOptions): d.DefMatchList {
        var matches = this.table.matchDefinitions(mnemonic, ops, opts);
        if(!matches.list.length)
            throw Error(`Could not match operands to instruction definition ${mnemonic}.`);
        return matches;
    }

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
    */

    // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
    //
    // > The size of a displacement is 1, 2, or 4 bytes.
    //
    // > Also, in 64-bit mode, support is provided for some 64-bit displacement
    // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
    // > information on this.
    mem(disp: number | number64): MemoryX86 {
        if(typeof disp === 'number')
            return MemoryX86.factory(this.asm.opts.addressSize).disp(disp as number);
        else if((disp instanceof Array) && (disp.length == 2))
            return MemoryX86.factory(this.asm.opts.addressSize).disp(disp as number64);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    }

    imm(value: Tnumber, signed = true) {
        return signed ? new Immediate(value) : new ImmediateUnsigned(value);
    }
}

export default PluginX86;
