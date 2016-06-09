import {SIZE, number64, Tnumber, Operands} from './operand';
import {Expression, Label, Data, DataUninitialized, DataVolatile} from './instruction';
import * as i from './instruction';
import * as o from './operand';
import * as d from './def';
import {UInt64, extend} from './util';


export class Symbol {}
export class Block {}
export class Section {}
export class Assembler {}


// Expressions are compiled in 3 passes:
//
//  - *1st pass* -- maximum offset `maxOffset` for each expression is computed, some expression might not know
//  their size jet, not all expressions are known, future references. First pass is when user performs insertion of commands.
//  - *2nd pass* -- all expressions known now, each expression should pick its right size, exact `offset` is computed for each expression.
//  - *3rd pass* -- now we know exact `offset` of each expression, so in this pass we fill in the addresses.
export class Code {
    expr: Expression[] = [];

    operandSize = SIZE.D;    // Default operand size.
    addressSize = SIZE.D;    // Default address size.

    ClassInstruction = i.Instruction;
    ClassOperands = o.Operands;

    littleEndian = true; // Which way to encode constants by default.

    // Collection of all assembly instructions: mov, push, ret, retq, etc...
    // When needed `addMethods()` adds these funcitons to the `Code` object,
    // some segments, for example, data segment may not need these methods.
    methods: any = {};

    constructor(start: string = 'start') {
        this.label(start);
    }

    addMethods() {
        extend(this, this.methods);
    }

    getStartLabel(): Label {
        return this.expr[0] as Label;
    }

    insert(expr: Expression, index = this.expr.length): Expression {
        expr.index = index;
        expr.bind(this);
        this.expr[index] = expr;
        expr.calcOffsetMaxAndOffset(); // 1st pass
        expr.build();
        return expr;
    }

    compile(): number[] {
        // 1st pass is performed as instructions are `insert`ed, `.offsetMax` is calculated, and possibly `.offset`.

        // Instructions without size can now determine their size based on `.offsetMax` and
        // calculate their real `.offset`.
        this.do2ndPass();

        // Offsets are now know, here we evaluate references.
        return this.do3rdPass();
    }

    do2ndPass() {
        var all_offsets_known = this.expr[this.expr.length - 1].offset !== i.OFFSET_UNKNOWN;
        if(!all_offsets_known) {
            for(var ins of this.expr) {
                ins.determineSize();
                ins.calcOffset();
            }
        }
    }

    do3rdPass() {
        var code: number[] = [];
        for(var ins of this.expr) {
            ins.evaluate();
            code = ins.write(code); // 2nd pass
        }
        return code;
    }

    lbl(name: string): Label {
        return new Label(name);
    }

    label(name: string): Label {
        return this.insert(this.lbl(name)) as Label;
    }

    rel(expr: Expression, offset = 0) {
        return expr.rel(offset);
    }

    ops(operands: any[], size: o.SIZE = this.operandSize) {
        return new o.Operands(operands, size);
    }

    // DB volatile
    dbv(ops: o.Operands, littleEndian: boolean): DataVolatile;
    dbv(expr: i.Expression, size: number, littleEndian: boolean): DataVolatile;
    dbv(rel: o.Relative, size: number, littleEndian: boolean): DataVolatile;
    dbv(a: any, b?: any, c?: any): i.DataVolatile {
        var ops: o.Operands;
        var littleEndian = this.littleEndian;

        if(a instanceof i.Expression) {
            var expr = a as i.Expression;
            var size = b as number;
            if(typeof size !== 'number') size = this.operandSize;
            else size = size << 3;
            if(typeof c === 'boolean') littleEndian = c;
            ops = this.ops([expr.rel()], size);
        } else if(a instanceof o.Relative) {
            var rel = a as o.Relative;
            var size = b as number;
            if(typeof size !== 'number') size = this.operandSize;
            else size = size << 3;
            if(typeof c === 'boolean') littleEndian = c;
            ops = this.ops([rel], size);
        } else if(a instanceof o.Operands) {
            ops = a as o.Operands;
            if(typeof c === 'boolean') littleEndian = c;
        } else
            throw TypeError('Data type not supported for DBV.');

        var data = new i.DataVolatile(ops, littleEndian);
        this.insert(data);
        return data;
    }

    db(num: number): Data;
    db(str: string, encoding?: string): Data;
    db(octets: number[]): Data;
    db(buf: Buffer): Data;
    db(expr: i.Expression, size: number, littleEndian: boolean): DataVolatile;
    db(rel: o.Relative, size: number, littleEndian: boolean): DataVolatile;
    db(ops: o.Operands, littleEndian: boolean): DataVolatile;
    db(a: any, b?: any, c?: any): i.IData {
        var octets: number[];

        if(typeof a === 'number') {
            return this.db([a]);
        } else if(a instanceof Array) {
            octets = a as number[];
        } else if(typeof a === 'string') {
            var encoding = typeof b === 'string' ? b : 'ascii';
            // var buf = Buffer.from(a, encoding);
            var buf = new Buffer(a, encoding);
            octets = Array.prototype.slice.call(buf, 0);
        } else if(a instanceof Buffer) {
            octets = Array.prototype.slice.call(a, 0);
        } else if(a instanceof i.Expression)    return this.dbv(a, b, c);
        else if(a instanceof o.Relative)        return this.dbv(a, b, c);
        else if(a instanceof o.Operands)        return this.dbv(a, b, c);
        else
            throw TypeError('Data type not supported for DB.');

        var data = new Data(octets);
        this.insert(data);
        return data;
    }

    dw(words: number|number[], littleEndian = this.littleEndian): Data {
        if(typeof words === 'number') return this.dw([words as number]);
        return this.db(Data.numbersToOctets(words as number[], 2, littleEndian));
    }

    dd(doubles: number|number[], littleEndian = this.littleEndian): Data {
        if(typeof doubles === 'number') return this.dw([doubles as number]);
        return this.db(Data.numbersToOctets(doubles as number[], 4, littleEndian));
    }

    dq(quads: Tnumber[], littleEndian = this.littleEndian): Data {
        return this.db(Data.quadsToOctets(quads, littleEndian));
    }

    resb(length: number): DataUninitialized {
        var data = new DataUninitialized(length);
        data.index = this.expr.length;
        this.expr.push(data);
        data.bind(this);
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
            total_len += len;

            while((bytes > 0) && (total_len < len)) {
                buf = new Buffer(4096);
                bytes = fs.readSync(fd, buf, 0, CHUNK);
                if(bytes > 0) {
                    data.push(buf.slice(0, bytes));
                    total_len += bytes;
                }
            }

            buf = Buffer.concat(data);
            if(total_len > len) buf = buf.slice(0, len);

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

    toString(lineNumbers = true, hex = true) {
        var lines = [];
        for(var i = 0; i < this.expr.length; i++) {
            var expr = this.expr[i];

            var line_num = '';
            if(lineNumbers) {
                var line_num = i + '';
                if (line_num.length < 3) line_num = ((new Array(4 - line_num.length)).join('0')) + line_num;
                line_num += ' ';
            }
            lines.push(line_num + expr.toString('    ', hex));
        }
        return lines.join('\n');
    }
}
