import Mnemonic from "../../Mnemonic";
import {SIZE_ETHEREUM} from "./operand";

class MnemonicEthereum extends Mnemonic {
    operandSize: SIZE_ETHEREUM = SIZE_ETHEREUM.S0;

    getName () {
        return this.mnemonic;
    }
}

export default MnemonicEthereum;
