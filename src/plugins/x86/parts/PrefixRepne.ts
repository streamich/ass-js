import {PREFIX} from './Prefix';
import PrefixStatic from './PrefixStatic';

class PrefixRepne extends PrefixStatic {
    // static supported = ['cmps', 'cmpsb', 'cmpsd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];
    static supported = ['cmps', 'scas'];

    constructor() {
        super(PREFIX.REPNE);
    }
}

export default PrefixRepne;
