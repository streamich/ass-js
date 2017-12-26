import InstructionPart from './InstructionPart';
import {Immediate as ImmediateOperand} from '../../../operand';

// Immediate constant value that follows other instruction bytes.
class Immediate extends InstructionPart {
    value: ImmediateOperand;

    constructor(value: ImmediateOperand) {
        super();
        this.value = value;
    }

    write(arr: number[] = []): number[] {
        this.value.octets.forEach((octet) => { arr.push(octet); });
        return arr;
    }
}

export default Immediate;
