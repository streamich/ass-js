import {Expression} from '../../expression';
import {SIZE, Tnumber, number64} from '../../operand';
import {UInt64} from '../../util';

export type Toctets = number[];

export class Data extends Expression {

    static formatOctet(octet) {
        var neg = octet < 0 ? '-' : '';
        octet = Math.abs(octet);
        return octet <= 0xF ? neg + '0x0' + octet.toString(16).toUpperCase() : neg + '0x' + octet.toString(16).toUpperCase();
    }

    static numbersToOctets(numbers: Tnumber[], size: SIZE, littleEndian = true): Toctets {
        if(size === SIZE.Q) return Data.quadsToOctets(numbers, littleEndian);

        var num = numbers as number[];
        var octets = new Array(numbers.length * size);
        if(littleEndian)
            for(var i = 0; i < numbers.length; i++)
                for(var j = 0; j < size; j++)
                    octets[i * size + j] = (num[i] >> (j * 8)) & 0xFF;
        else
            for(var i = 0; i < numbers.length; i++)
                for(var j = 0; j < size; j++)
                    octets[i * size + j] = (num[i] >> ((size - j - 1) * 8)) & 0xFF;
        return octets;
    }

    static wordsToOctets(words: number[], littleEndian = true): Toctets {
        return Data.numbersToOctets(words, 2, littleEndian);
    }

    static doublesToOctets(doubles: number[], littleEndian = true): Toctets {
        return Data.numbersToOctets(doubles, 4, littleEndian);
    }

    static quadsToOctets(quads: Tnumber[], littleEndian = true): Toctets {
        if(!(quads instanceof Array))
            throw TypeError('Quads must be and array of number or [number, number].');
        if(!quads.length) return [];

        var doubles = new Array(quads.length * 2);

        if(typeof quads[0] === 'number') { // number[]
            var qnumbers = quads as number[];
            for(var i = 0; i < qnumbers.length; i++) {
                var hi = UInt64.hi(qnumbers[i]);
                var lo = UInt64.lo(qnumbers[i]);
                if(littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                } else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        } else if(quads[0] instanceof Array) { // number64[]
            var numbers64 = quads as number64[];
            for(var i = 0; i < numbers64.length; i++) {
                var [lo, hi] = numbers64[i];
                if(littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                } else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        } else
            throw TypeError('Quads must be and array of number[] or [number, number][].');

        return Data.doublesToOctets(doubles, littleEndian);
    }

    octets: Toctets;

    constructor(octets: Toctets = []) {
        super();
        this.octets = octets;
        this.length = octets.length;
    }

    write(arr: number[]): number[] {
        arr = arr.concat(this.octets);
        return arr;
    }

    bytes(): number {
        return this.octets.length;
    }

    toString(margin = '    ', comment = true) {
        var datastr = '';
        var bytes = this.bytes();
        if(bytes < 200) {
            datastr = this.octets.map(function(octet) {
                return Data.formatOctet(octet);
            }).join(', ');
        } else {
            datastr = `[${this.bytes()} bytes]`;
        }

        var expression = margin + 'db ' + datastr;
        var cmt = '';
        if(comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            cmt = `${spaces}; ${this.formatOffset()} ${bytes} bytes`;
        }

        return expression + cmt;
    }
}

export default Data;
