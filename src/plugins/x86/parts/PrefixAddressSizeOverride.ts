import {PREFIX} from './Prefix';
import PrefixStatic from './PrefixStatic';

class PrefixAddressSizeOverride extends PrefixStatic {
    constructor() {
        super(PREFIX.AS);
    }
}

export default PrefixAddressSizeOverride;
