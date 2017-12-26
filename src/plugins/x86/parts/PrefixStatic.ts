import Prefix, {PREFIX} from './Prefix';

// Prefixes that consist of a single static byte.
class PrefixStatic extends Prefix {
    value: PREFIX;

    constructor(value: number) {
        super();
        this.value = value;
    }

    write(arr: number[]): number[] {
        arr.push(this.value);
        return arr;
    }

    toString() {
        return PREFIX[this.value].toLowerCase();
    }
}

export default PrefixStatic;
