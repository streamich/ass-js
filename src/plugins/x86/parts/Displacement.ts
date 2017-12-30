import InstructionPart from './InstructionPart';
import {DisplacementValue} from '../operand/displacement';
import {IPushable} from "../../../expression";

class Displacement extends InstructionPart {
    value: DisplacementValue;

    constructor(value: DisplacementValue) {
        super();
        this.value = value;
    }

    write(arr: IPushable = []): IPushable {
        this.value.octets.forEach((octet) => { arr.push(octet); });
        return arr;
    }
}

export default Displacement;
