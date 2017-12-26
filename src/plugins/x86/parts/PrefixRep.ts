import {PREFIX} from './Prefix';
import PrefixStatic from './PrefixStatic';

class PrefixRep extends PrefixStatic {
    static supported = ['ins', 'lods', 'movs', 'outs', 'stos'];

    constructor() {
        super(PREFIX.REP);
    }
}

export default PrefixRep;
