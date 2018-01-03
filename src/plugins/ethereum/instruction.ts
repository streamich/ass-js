import {Instruction} from "../../instruction";
import {IPushable} from "../../expression";
import {Operands} from "../../operand";
import MnemonicEthereum from "./MnemonicEthereum";
import ImmediateEthereum from "./ImmediateEthereum";
import {ConstantEthereum} from "./operand";

export class InstructionEthereum extends Instruction {
    mnemonic: MnemonicEthereum;
    length = 1;
    lengthMax = 1;

    immediate: ImmediateEthereum = null;

    constructor (mnemonic: MnemonicEthereum, ops: Operands = null, opts?: object) {
        super(ops, opts);

        this.mnemonic = mnemonic;
    }

    write (bin: IPushable) {
        bin.push(this.mnemonic.opcode);

        if (this.immediate)
            this.immediate.write(bin);
    }

    build (): this {
        super.build();


        if (this.ops && this.ops.list.length) {
            const constant = this.ops.getFirstOfClass(ConstantEthereum) as ConstantEthereum;

            this.length += constant.octets.length;
            this.lengthMax += constant.octets.length;

            if (constant)
                this.immediate = new ImmediateEthereum(constant);
        }

        return this;
    }
}
