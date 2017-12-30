import {IPushable} from "./expression";
import {TOctets} from "./plugins/data/Data";

class CodeBuffer implements IPushable {
    buf: Buffer;
    cursor: number = 0;

    constructor (length: number) {
        this.buf = Buffer.alloc(length);
    }

    push(uint8: number) {
        this.buf[this.cursor] = uint8;
        this.cursor++;
    }

    pushArray(octets: TOctets) {
        for (const octet of octets) this.push(octet);
    }

    skip(length: number) {
        this.cursor += length;
    }

    truncate (): Buffer {
        return this.buf.slice(0, this.cursor);
    }
}

export default CodeBuffer;
