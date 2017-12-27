import Mnemonic from "./Mnemonic";

class MnemonicVariations <TMnemonic extends Mnemonic> {
    mnemonic: string = '';
    mnemonics: TMnemonic[] = [];

    constructor(mnemonics: TMnemonic[]) {
        this.mnemonic = mnemonics[0].mnemonic;
        this.mnemonics = mnemonics;
    }

    groupBySize (): {[size: number]: TMnemonic[]} {
        const sizes: {[size: number]: TMnemonic[]} = {};
        for(const mnemonic of this.mnemonics) {
            const size = mnemonic.operandSize;
            if(!sizes[size]) sizes[size] = [];
            sizes[size].push(mnemonic);
        }
        return sizes;
    }

    toJson (): any {
        return {
            mnemonic: this.mnemonic,
            definitions: this.mnemonics.map(mnemonic => mnemonic.toJson()),
        };
    }

    toString () {
        return `${this.mnemonic.toUpperCase()}:\n    ${this.mnemonics.map(mnemonic => mnemonic.toString()).join('\n    ')}`;
    }
}

export default MnemonicVariations;
