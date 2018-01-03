import {Constant, SIZE, TOperand} from "./operand";
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
    static toStringOperandShort (operand) {
        const typeofOperand = typeof operand;

        if (typeofOperand === 'number')     return operand;
        if (typeofOperand === 'string')     return operand;

        if ((typeofOperand === 'object') || (typeofOperand === 'function')) {
            if (typeof operand.atomName === 'string')       return operand.atomName;
            if (typeof operand.name === 'string')           return operand.name;
            if (typeof operand.toString === 'function')     return operand.toString();
        }

        return String(operand);
    }

    mnemonic: string;
    operandSize: SIZE | number = SIZE.NONE;
    opcode: number;
    operandTemplates: TTableOperand[][];

    constructor (mnemonic: string = '', opcode: number = 0x00) {
        this.mnemonic = mnemonic;
        this.opcode = opcode;
    }

    getName (): string {
        const size = this.operandSize;
        if((size === SIZE.ANY) || (size === SIZE.NONE)) return this.mnemonic;
        return this.mnemonic + SIZE[size].toLowerCase();
    }

    toJsonOperands () {
        let ops = [];
        for(let operandTemplate of this.operandTemplates) {
            let arr = [];
            for(let op of operandTemplate) arr.push(Mnemonic.toStringOperand(op));
            if(arr.length > 1) ops.push(arr);
            else ops.push(arr[0]);
        }
        return ops;
    }

    toJson () {
        let json: any = {
            mnemonic: this.mnemonic,
            mnemonicPrecise: this.getName(),
            opcode: this.opcode,
            opcodeHex: this.opcode.toString(16).toUpperCase(),
            operands: this.toJsonOperands(),
        };

        if (this.operandSize) json.operandSize = this.operandSize;

        return json;
    }

    toString () {
        const opcode = ' ' + (new Constant(this.opcode, false)).toString();

        let operands = [];
        for(let ops of this.operandTemplates) {
            let opsarr = ops.map(op => Mnemonic.toStringOperandShort(op));
            operands.push(opsarr.join('/'));
        }

        let operandsstr = '';
        if(operands.length) operandsstr = ' ' + operands.join(', ');

        let size = '';
        if(this.operandSize > 0) size = ' ' + this.operandSize + '-bit';

        return this.mnemonic + size + opcode + operandsstr;
    }
}

export default Mnemonic;
