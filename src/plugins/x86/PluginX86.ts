import Plugin from "../Plugin";
import {number64, Tnumber, Immediate, ImmediateUnsigned, TUiOperand, Constant, isTnumber} from '../../operand';
import {TemplateX86Lock, TemplateX86Rex} from './template';
import {MemoryX86} from './operand/memory';
import {InstructionX86} from './instruction';
import {OperandsX86} from "./operand";
import operandParser from './operand/parser';
import * as operandMap from './operand/generator';
import {Expression} from "../../expression";

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
                default: {
                    const operand = operandMap[name];
                    if (operand) return operand;
                }
            }
        });
        asm.hooks.op.tap('PluginX86', operandParser);
        asm.hooks.ops.tap('PluginX86', (operands, size) => this.ops(operands, size));
        asm.hooks.instruction.tap('PluginX86', () => new InstructionX86());
    }

    // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
    //
    // > The size of a displacement is 1, 2, or 4 bytes.
    //
    // > Also, in 64-bit mode, support is provided for some 64-bit displacement
    // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
    // > information on this.
    mem (disp: number | number64): MemoryX86 {
        if(typeof disp === 'number')
            return MemoryX86.factory(this.asm.opts.addressSize).disp(disp as number);
        else if((disp instanceof Array) && (disp.length == 2))
            return MemoryX86.factory(this.asm.opts.addressSize).disp(disp as number64);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    }

    imm (value: Tnumber, signed = true) {
        return signed ? new Immediate(value) : new ImmediateUnsigned(value);
    }

    ops (operands: TUiOperand[], size?: number) {
        if (Array.isArray(operands)) {
            operands = operands.map(op => {
                if (typeof op === 'string') {
                    op = operandMap[op as string];
                    if (!op) throw new Error(`Unknown operand ${JSON.stringify(op)}.`);
                } else if (op instanceof Expression) {
                    op = op.rel();
                }

                return op;
            });
        }

        return new OperandsX86(operands, size)
    }
}

export default PluginX86;
