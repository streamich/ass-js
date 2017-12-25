import Asm from '../../Asm';
import Data from './Data';
import {Expression} from '../../expression';
import {Operands, Relative} from '../../operand';
import {SIZE, Tnumber, number64} from '../../operand';
import {UInt64} from '../../util';

class PluginData {
    asm: Asm;

    constructor (asm: Asm, opts?: object) {
        this.asm = asm;
        asm.hooks.command.tap('DataPlugin', (name, args) => {
            switch (name) {
                case 'db':
                    return this.db.apply(this, args);
            }
        });
    }

    db(num: number, times?: number): Data;
    db(str: string, encoding?: string): Data;
    db(octets: number[]): Data;
    db(buf: Buffer): Data;
    db(a: any, b?: any, c?: any): Data {
        let octets: number[];

        if(typeof a === 'number') {
            const arr = [a];
            const times = typeof b === 'number' ? b : 1;
            for(let j = 1; j < times; j++) arr.push(a);
            return this.db(arr);
        } else if(Array.isArray(a)) {
            octets = a as number[];
        } else if(typeof a === 'string') {
            const encoding = typeof b === 'string' ? b : 'ascii';
            const buf = new Buffer(a, encoding);
            octets = Array.prototype.slice.call(buf, 0);
        } else if(a instanceof Buffer) {
            octets = Array.prototype.slice.call(a, 0);
        } else
            throw TypeError('Data type not supported for DB.');

        const data = new Data(octets);
        this.asm.insert(data);
        return data;
    }

    /*

    dw(words: number|number[], littleEndian = this.littleEndian): Data {
        if(typeof words === 'number') return this.dw([words as number]);
        return this.db(Data.numbersToOctets(words as number[], 2, littleEndian));
    }

    dd(doubles: number|number[], littleEndian = this.littleEndian): Data {
        if(typeof doubles === 'number') return this.dd([doubles as number]);
        return this.db(Data.numbersToOctets(doubles as number[], 4, littleEndian));
    }

    dq(quads: Tnumber|Tnumber[], littleEndian = this.littleEndian): Data {
        var tnums: Tnumber[];
        if(typeof quads === 'number') tnums = [quads];
        else tnums = quads as Tnumber[];

        for(var j = 0; j < tnums.length; j++) {
            var num = tnums[j];
            if(typeof num === 'number') tnums[j] = [UInt64.lo(num), UInt64.hi(num)];
        }

        return this.db(Data.quadsToOctets(tnums, littleEndian));
    }
    */
}

export default PluginData;
