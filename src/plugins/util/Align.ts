import {ExpressionVolatile, SIZE_UNKNOWN} from '../../expression';
import CodeBuffer from "../../CodeBuffer";

// Aligns data to some byte boundary.
class Align extends ExpressionVolatile {

    length = SIZE_UNKNOWN;

    // Align by 1 byte means "don't do any aligning", aligning by 2 bytes will insert at most 1 bytes.
    by: number;

    // Different size templates we use to fill in the empty bytes, templates grow sequentially by one byte in size.
    templates = [
        [0x00],
    ];

    octets: number[] = [];

    constructor(by: number) {
        super();
        this.by = by;
    }

    bytesMax() {
        return this.by - 1;
    }

    write(bin: CodeBuffer) {
        bin.pushArray(this.octets);
    }

    protected generateOctets() {
        if(!this.length) return;

        var bytes_left = this.bytes();
        var max_tpl = this.templates.length;
        while(bytes_left > 0) {
            if(bytes_left > max_tpl) {
                this.octets = this.octets.concat(this.templates[max_tpl - 1]);
                bytes_left -= max_tpl;
            } else {
                this.octets = this.octets.concat(this.templates[bytes_left - 1]);
                bytes_left = 0;
            }
        }
    }

    calcOffset() {
        super.calcOffset();
        var mod = (this.offset % this.by);
        this.length = mod ? this.by - mod : 0;
        this.generateOctets();
    }

    toString(margin = '    ', comment = true) {
        let cmt = '';
        if(comment) {
            if(this.length >= 0) {
                let octets = '';
                if(this.length) {
                    octets = '0x' + this.octets.map(function (byte) {
                        const str = byte.toString(16).toUpperCase();
                        return byte <= 0xF ? '0' + str : str;
                    }).join(' 0x');
                }
                cmt = this.length + ' bytes ' + octets;
            } else cmt = `max ${this.bytesMax()} bytes`;
        }
        return this.formatToString(margin, 'align ' + this.by, cmt);
    }
}

export default Align;
