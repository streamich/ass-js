import {Expression, IPushable} from '../../expression';
import CodeBuffer from "../../CodeBuffer";

export class DataUninitialized extends Expression {
    length: number;

    constructor(length: number) {
        super();
        this.length = length;
    }

    write(buf: CodeBuffer) {
        buf.skip(this.length);
    }

    bytes(): number {
        return this.length;
    }

    toString(margin = '    ', comment = true) {
        const bytes = this.bytes();
        const expression = margin + 'resb ' + bytes;
        let cmt = '';
        if(comment) {
            const spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            cmt = `${spaces}; ${this.formatOffset()} ${bytes} bytes`;
        }
        return expression + cmt;
    }
}

export default DataUninitialized;
