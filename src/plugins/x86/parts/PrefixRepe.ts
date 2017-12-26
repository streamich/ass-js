import {PREFIX} from './Prefix';
import PrefixStatic from './PrefixStatic';

class PrefixRepe extends PrefixStatic {
    // static supported = ['cmps', 'cmpsb', 'cmpbd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];
    static supported = ['cmps', 'scas'];

    constructor() {
        super(PREFIX.REPE);
    }
}

export default PrefixRepe;
