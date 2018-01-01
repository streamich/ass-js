import MnemonicVariations from "../../MnemonicVariations";
import MnemonicX86, {Match} from "./MnemonicX86";
import {OperandsX86} from "./operand/index";
import {IInstructionOptionsX86} from "./instruction";

class MnemonicVariationsX86 extends MnemonicVariations<MnemonicX86> {
    defaultOperandSize: number;

    matches (ops: OperandsX86, opts: IInstructionOptionsX86, filter: (match: Match) => boolean = Boolean): Match[] {
        const matches = [];

        for (const mnemonic of this.mnemonics) {
            const match = mnemonic.match(ops, opts);
            if (match && filter(match)) matches.push(match);
        }

        return matches;
    }

    toJson() {
        return {
            ...super.toJson(),
            defaultOperandSize: this.defaultOperandSize,
        };
    }
}

export default MnemonicVariationsX86;
