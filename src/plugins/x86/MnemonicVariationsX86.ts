import MnemonicVariations from "../../MnemonicVariations";
import MnemonicX86 from "./MnemonicX86";

class MnemonicVariationsX86 extends MnemonicVariations<MnemonicX86> {
    defaultOperandSize: number;

    toJson() {
        return {
            ...super.toJson(),
            defaultOperandSize: this.defaultOperandSize,
        };
    }
}

export default MnemonicVariationsX86;
