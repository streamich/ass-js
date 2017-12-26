import InstructionPart from './InstructionPart';
import {DisplacementValue} from '../operand';

class Displacement extends InstructionPart {
    value: DisplacementValue;

    constructor(value: DisplacementValue) {
        super();
        this.value = value;
    }

    write(arr: number[] = []): number[] {
        this.value.octets.forEach((octet) => { arr.push(octet); });
        return arr;
    }
}

export default Displacement;
