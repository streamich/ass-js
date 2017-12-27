import {Constant, Memory, Operand, Register, Relative, Relative16, Relative32, Relative8, SIZE} from "./operand";
import {TTableOperand} from "./table";

export class Mnemonic {
    static toStringOperand (operand) {
        const typeofOperand = typeof operand;

        if (typeofOperand === 'number')     return operand;
        if (typeofOperand === 'string')     return operand;

        if ((typeofOperand === 'object') || (typeofOperand === 'function')) {
            if (typeof operand.name === 'string')           return operand.name;
            if (typeof operand.atomName === 'string')       return operand.atomName;
            if (typeof operand.toString === 'function')     return operand.toString();
        }

        return String(operand);
    }

    mnemonic: string = '';
    operandSize: SIZE = SIZE.NONE;
    opcode: number = 0x00;
    operands: TTableOperand[][];
/*
    protected matchOperandTemplate(tpl: t.TTableOperand, operand: o.TOperand): t.TTableOperand|any {
        if(typeof tpl === 'number') {
            if((tpl as any) === operand) return tpl;
            else return null;
        } else if(typeof tpl === 'object') { // Object: rax, rbx, r8, etc...
            if((tpl as any) === operand) return tpl;
            else return null;
        } else if(typeof tpl === 'function') { // Class: o.Register, o.Memory, o.Immediate, etc...
            var OperandClass = tpl as any; // as typeof o.Operand;
            if(OperandClass.name.indexOf('Relative') === 0) { // as typeof o.Relative
                // Here we cannot yet check any sizes even cannot check if number
                // fits the immediate size because we will have to rebase the o.Relative
                // to the currenct instruction Expression.
                if(o.isTnumber(operand)) return OperandClass;
                else if(operand instanceof o.Relative) return OperandClass;
                else return null;
            } else { // o.Register, o.Memory
                if(operand instanceof OperandClass) return OperandClass;
                else return null;
            }
        } else
            throw TypeError('Invalid operand definition.'); // Should never happen.
    }

    protected matchOperandTemplates(templates: t.TTableOperand[], operand: o.TOperand): t.TTableOperand|any {
        for(let tpl of templates) {
            var match = this.matchOperandTemplate(tpl, operand);
            if(match) return match;
        }
        return null;
    }

    matchOperands(ops: o.Operands): (any|t.TTableOperand)[] {
        if(!this.operands) return null;
        if(this.operands.length !== ops.list.length) return null;
        if(!ops.list.length) return [];
        var matches: t.TTableOperand[] = [];
        for(let i = 0; i < ops.list.length; i++) {
            let templates = this.operands[i];
            let operand = ops.list[i];
            var match = this.matchOperandTemplates(templates, operand);

            if(!match) return null;
            matches.push(match);
        }
        return matches;
    }
*/

    getMnemonic (): string {
        const size = this.operandSize;
        if((size === SIZE.ANY) || (size === SIZE.NONE)) return this.mnemonic;
        return this.mnemonic + SIZE[size].toLowerCase();
    }

    toJsonOperands() {
        let ops = [];
        for(let operandTemplate of this.operands) {
            let arr = [];
            for(let op of operandTemplate) arr.push(Mnemonic.toStringOperand(op));
            if(arr.length > 1) ops.push(arr);
            else ops.push(arr[0]);
        }
        return ops;
    }

    toJson() {
        let json: any = {
            mnemonic: this.mnemonic,
            mnemonicPrecise: this.getMnemonic(),
            opcode: this.opcode,
            opcodeHex: this.opcode.toString(16).toUpperCase(),
            operands: this.toJsonOperands(),
        };

        if (this.operandSize) json.operandSize = this.operandSize;

        return json;
    }

    toString() {
        const opcode = ' ' + (new Constant(this.opcode, false)).toString();

        let operands = [];
        for(let ops of this.operands) {
            let opsarr = [];
            for(let op of ops) {
                opsarr.push(Mnemonic.toStringOperand(op));
            }
            operands.push(opsarr.join('/'));
        }

        let operandsstr = '';
        if(operands.length) operandsstr = ' ' + operands.join(',');

        let size = '';
        if(this.operandSize > 0) size = ' ' + this.operandSize + '-bit';

        return this.mnemonic + size + opcode + operandsstr;
    }
}

export default Mnemonic;
