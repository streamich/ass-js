import InstructionPart from './InstructionPart';
import {Immediate as ImmediateOperand} from '../../../operand';
import {IPushable} from "../../../expression";

// Immediate constant value that follows other instruction bytes.
class ImmediatePart extends InstructionPart {
    value: ImmediateOperand;

    constructor(value: ImmediateOperand) {
        super();
        this.value = value;
    }

    write(arr: IPushable = []) {
        this.value.octets.forEach((octet) => arr.push(octet));
    }
}

export default ImmediatePart;
