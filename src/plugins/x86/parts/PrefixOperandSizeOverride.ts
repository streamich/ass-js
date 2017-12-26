import {PREFIX} from './Prefix';
import PrefixStatic from './PrefixStatic';

class PrefixOperandSizeOverride extends PrefixStatic {
    constructor() {
        super(PREFIX.OS);
    }
}

export default PrefixOperandSizeOverride;
