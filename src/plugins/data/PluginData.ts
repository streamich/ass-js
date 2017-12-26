import Plugin from '../Plugin';
import Asm from '../../Asm';
import Data from './Data';
import DataVariable from './DataVariable';
import DataUninitialized from './DataUninitialized';
import {Expression} from '../../expression';
import {Tnumber, Operands, Relative} from '../../operand';
import {UInt64} from '../../util';

class PluginData extends Plugin {
    onAsm (asm: Asm) {
        asm.hooks.command.tap('PluginData', (name, args) => {
            switch (name) {
                case 'dbv': return this.dbv.apply(this, args);
                case 'db': return this.db.apply(this, args);
                case 'dw': return this.dw.apply(this, args);
                case 'dd': return this.dd.apply(this, args);
                case 'dq': return this.dq.apply(this, args);
                case 'resb': return this.resb(args[0]);
                case 'resw': return this.resw(args[0]);
                case 'resd': return this.resd(args[0]);
                case 'resq': return this.resq(args[0]);
                case 'rest': return this.rest(args[0]);
            }
        });
    }

    // DB variable
    dbv(ops: Operands, littleEndian: boolean): DataVariable;
    dbv(expr: Expression, size: number, littleEndian: boolean): DataVariable;
    dbv(rel: Relative, size: number, littleEndian: boolean): DataVariable;
    dbv(a: any, b?: any, c?: any): DataVariable {
        let ops: Operands;
        let littleEndian = this.asm.opts.littleEndian;

        if(a instanceof Expression) {
            const expr = a as Expression;

            let size = b as number;
            if(typeof size !== 'number') size = this.asm.opts.operandSize;
            else size = size << 3;

            if(typeof c === 'boolean') littleEndian = c;
            ops = this.asm.ops([expr.rel()], size);
        } else if(a instanceof Relative) {
            var rel = a as Relative;
            var size = b as number;
            if(typeof size !== 'number') size = this.asm.opts.operandSize;
            else size = size << 3;
            if(typeof c === 'boolean') littleEndian = c;
            ops = this.asm.ops([rel], size);
        } else if(a instanceof Operands) {
            ops = a as Operands;
            if(typeof c === 'boolean') littleEndian = c;
        } else
            throw TypeError('Data type not supported for DBV.');

        const data = new DataVariable(ops, littleEndian);
        this.asm.insert(data);
        return data;
    }

    db(num: number, times?: number): Data;
    db(str: string, encoding?: string): Data;
    db(octets: number[]): Data;
    db(buf: Buffer): Data;
    db(expr: Expression, size: number, littleEndian: boolean): DataVariable;
    db(rel: Relative, size: number, littleEndian: boolean): DataVariable;
    db(ops: Operands, littleEndian: boolean): DataVariable;
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
        } else if(a instanceof Expression)    return this.dbv(a, b, c);
        else if(a instanceof Relative)        return this.dbv(a, b, c);
        else if(a instanceof Operands)        return this.dbv(a, b); else
            throw TypeError('Data type not supported for DB.');

        const data = new Data(octets);
        this.asm.insert(data);
        return data;
    }

    dw(words: number|number[], littleEndian = this.asm.opts.littleEndian): Data {
        if(typeof words === 'number') return this.dw([words as number]);
        return this.db(Data.numbersToOctets(words as number[], 2, littleEndian));
    }

    dd(doubles: number|number[], littleEndian = this.asm.opts.littleEndian): Data {
        if(typeof doubles === 'number') return this.dd([doubles as number]);
        return this.db(Data.numbersToOctets(doubles as number[], 4, littleEndian));
    }

    dq(quads: Tnumber|Tnumber[], littleEndian = this.asm.opts.littleEndian): Data {
        let tnums: Tnumber[];
        if(typeof quads === 'number') tnums = [quads];
        else tnums = quads as Tnumber[];

        for(let j = 0; j < tnums.length; j++) {
            const num = tnums[j];
            if(typeof num === 'number') tnums[j] = [UInt64.lo(num), UInt64.hi(num)];
        }

        return this.db(Data.quadsToOctets(tnums, littleEndian));
    }

    resb(length: number): DataUninitialized {
        const data = new DataUninitialized(length);
        this.asm.insert(data);
        return data;
    }

    resw(length: number): DataUninitialized {
        return this.resb(length * 2);
    }

    resd(length: number): DataUninitialized {
        return this.resb(length * 4);
    }

    resq(length: number): DataUninitialized {
        return this.resb(length * 8);
    }

    rest(length: number): DataUninitialized {
        return this.resb(length * 10);
    }

    incbin(filepath: string, offset?: number, len?: number): Data {
        var fs = require('fs');

        if(typeof offset === 'undefined') { // incbin(filepath);
            return this.db(fs.readFileSync(filepath));

        } else if(typeof len === 'undefined') { // incbin(filepath, offset);
            if(typeof offset !== 'number')
                throw TypeError('Offset must be a number.');

            var fd = fs.openSync(filepath, 'r');

            var total_len = 0;
            var data: Buffer[] = [];
            const CHUNK = 4096;
            var buf = new Buffer(CHUNK);
            var bytes = fs.readSync(fd, buf, 0, CHUNK, offset);
            data.push(buf.slice(0, bytes));
            total_len += bytes;

            while((bytes > 0) && (total_len < bytes)) {
                buf = new Buffer(4096);
                bytes = fs.readSync(fd, buf, 0, CHUNK);
                if(bytes > 0) {
                    data.push(buf.slice(0, bytes));
                    total_len += bytes;
                }
            }

            buf = Buffer.concat(data);
            // if(total_len > len) buf = buf.slice(0, len);

            fs.closeSync(fd);
            return this.db(buf);
        } else { // incbin(filepath, offset, len);
            if(typeof offset !== 'number')
                throw TypeError('Offset must be a number.');
            if(typeof len !== 'number')
                throw TypeError('Length must be a number.');

            var buf = new Buffer(len);
            var fd = fs.openSync(filepath, 'r');
            var bytes = fs.readSync(fd, buf, 0, len, offset);
            buf = buf.slice(0, bytes);
            fs.closeSync(fd);
            return this.db(buf);
        }
    }
}

export default PluginData;
