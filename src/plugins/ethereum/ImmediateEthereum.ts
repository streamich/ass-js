import {ConstantEthereum} from "./operand";
import {IPushable} from "../../expression";

class ImmediateEthereum {
    constant: ConstantEthereum;

    constructor (constant: ConstantEthereum) {
        this.constant = constant;
    }

    write (bin: IPushable) {
        const {octets} = this.constant;

        for (let i = 0; i < octets.length; i++)
            bin.push(octets[i]);
    }
}

export default ImmediateEthereum;
