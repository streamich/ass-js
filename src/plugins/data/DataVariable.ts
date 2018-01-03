import Data from './Data';
import {Expression, ExpressionVariable} from '../../expression';
import {TOctets} from './Data';
import {Operands, SIZE, Tnumber, isTnumber, Relative} from '../../operand';
import CodeBuffer from "../../CodeBuffer";
import formatOctet from "./formatOctet";
import formatOctets from "./formatOctets";

export class DataVariable extends ExpressionVariable {

    octets: TOctets;

    littleEndian;

    constructor(ops: Operands, littleEndian = true) {
        super(ops);
        this.littleEndian = littleEndian;
        this.octets = new Array(this.bytes());
    }

    build() {

    }

    bytes() {
        if(this.ops.size <= SIZE.NONE)
            throw Error('Unknown operand size in Data.');
        else return this.ops.list.length * (this.ops.size >> 3);
    }

    evaluate() {
        var isize = this.ops.size >> 3;
        var list = this.ops.list;
        for(var j = 0; j < list.length; j++) {
            var op = list[j];
            var num: Tnumber;
            if(op instanceof Relative) {
                var rel = op as Relative;
                // num = list[j] = rel.rebaseOffset(this);
                // num = rel.rebaseOffset(this);
                num = rel.evaluate(this);
            } else if(isTnumber(op)) {
                num = op as Tnumber;
            } else
                throw Error('Unknow Data operand.');

            var slice = Data.numbersToOctets([num], isize, this.littleEndian);
            for(var m = 0; m < isize; m++) this.octets[j + m] = slice[m];
        }
        return super.evaluate();
    }

    write(buf: CodeBuffer) {
        buf.pushArray(this.octets);
    }

    toString(margin = '    ', comment = true) {
        const datastr = formatOctets(this.octets);
        const expression = margin + 'dbv ' + datastr;
        let cmt = '';

        if(comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            cmt = `${spaces}; ${this.formatOffset()} ${this.bytes()} bytes`;
            if(this.isEvaluated) {
                cmt += ' ' + this.octets.map(function(octet) {
                    return formatOctet(octet);
                }).join(', ');
            }
        }

        return expression + cmt;
    }
}

export default DataVariable;
