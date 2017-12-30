import Prefix, {PREFIX} from './Prefix';
import {IPushable} from "../../../expression";

// Prefixes that consist of a single static byte.
class PrefixStatic extends Prefix {
    value: PREFIX;

    constructor(value: number) {
        super();
        this.value = value;
    }

    write (arr: IPushable) {
        arr.push(this.value);
    }

    toString () {
        return PREFIX[this.value].toLowerCase();
    }
}

export default PrefixStatic;
