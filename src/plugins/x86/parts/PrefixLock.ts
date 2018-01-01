import {PREFIX} from './Prefix';
import PrefixStatic from './PrefixStatic';

// Lock prefix for performing atomic memory operations.
class PrefixLock extends PrefixStatic {
    static supported = ['adc', 'add', 'and', 'btc', 'btr', 'bts', 'cmpxchg', 'cmpxchg8b', 'cmpxchg16b',
        'dec', 'inc', 'neg', 'not', 'or', 'sbb', 'sub', 'xadd', 'xchg', 'xor'];

    constructor() {
        super(PREFIX.LOCK);
    }
}

export default PrefixLock;
