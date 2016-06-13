import {SIZE, number64, Tnumber, Operands} from './operand';
import {Expression, Label, Data, DataUninitialized, DataVariable} from './instruction';
import * as i from './instruction';
import * as o from './operand';
import * as d from './def';
import {UInt64, extend} from './util';


export class Code {
    expr: Expression[] = [];

    operandSize = SIZE.D;    // Default operand size.
    addressSize = SIZE.D;    // Default address size.

    ClassInstruction = i.Instruction;
    ClassInstructionSet = i.InstructionSet;
    ClassOperands = o.Operands;
    AlignExpression = i.Align;

    littleEndian = true; // Which way to encode constants by default.

    table: d.DefTable;

    constructor(start: string = 'start') {
        this.label(start);
    }

    _(mnemonic: string, operands: o.TUiOperand|o.TUiOperand[] = [], size: o.SIZE = o.SIZE.ANY): i.Instruction|i.InstructionSet {
        if(typeof mnemonic !== 'string') throw TypeError('`mnemonic` argument must be a string.');

        if(!(operands instanceof Array)) operands = [operands] as o.TUiOperand[];
        var ops = new this.ClassOperands(operands as o.TUiOperand[], size);
        ops.normalizeExpressionToRelative();

        var matches = this.table.matchDefinitions(mnemonic, ops, size);
        if(!matches.list.length)
            throw Error('Could not match operands to instruction definition.');

        var iset = new this.ClassInstructionSet(ops, matches);
        this.insert(iset);

        var insn = iset.pickShortestInstruction();
        if(insn) {
            this.replace(insn, iset.index);
            return insn;
        } else
            return iset;
    }

    _8(mnemonic: string, ...operands: o.TUiOperand[]) {
        return this._(mnemonic, operands, 8);
    }

    _16(mnemonic: string, ...operands: o.TUiOperand[]) {
        return this._(mnemonic, operands, 16);
    }

    _32(mnemonic: string, ...operands: o.TUiOperand[]) {
        return this._(mnemonic, operands, 32);
    }

    _64(mnemonic: string, ...operands: o.TUiOperand[]) {
        return this._(mnemonic, operands, 64);
    }

    _128(mnemonic: string, ...operands: o.TUiOperand[]) {
        return this._(mnemonic, operands, 128);
    }

    _256(mnemonic: string, ...operands: o.TUiOperand[]) {
        return this._(mnemonic, operands, 256);
    }

    _512(mnemonic: string, ...operands: o.TUiOperand[]) {
        return this._(mnemonic, operands, 512);
    }

    exportMethods(useNumbers = false, sizes = [o.SIZE.B, o.SIZE.W, o.SIZE.D, o.SIZE.Q], obj: any = {}) {
        for(let mnemonic in this.table.table) {
            obj[mnemonic] = (...operands: o.TUiOperand[]) => {
                return this._(mnemonic, operands);
            };
            for(let size of sizes) {
                let method = useNumbers ? mnemonic + size : mnemonic + o.SIZE[size].toLowerCase();
                obj[method] = (...operands: o.TUiOperand[]) => {
                    return this._(mnemonic, operands, size);
                };
            }
        }
        return obj;
    }

    addMethods(useNumbers = false, sizes = [o.SIZE.B, o.SIZE.W, o.SIZE.D, o.SIZE.Q], obj = this.exportMethods(useNumbers, sizes)) {
        extend(this, obj);
    }

    getStartLabel(): Label {
        return this.expr[0] as Label;
    }

    insert(expr: Expression): Expression {
        this.replace(expr, this.expr.length);
        expr.build();
        return expr;
    }

    replace(expr: Expression, index = this.expr.length): Expression {
        expr.index = index;
        expr.bind(this);
        this.expr[index] = expr;
        expr.calcOffsetMaxAndOffset(); // 1st pass
        return expr;
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

    align(bytes = 4, fill: number|number[][] = null) {
        var align = new this.AlignExpression(bytes);
        if(fill !== null) {
            if(typeof fill === 'number') align.templates = [[fill]] as number[][];
            else align.templates = fill;
        }
        return this.insert(align);
    }

    // DB variable
    dbv(ops: o.Operands, littleEndian: boolean): i.DataVariable;
    dbv(expr: i.Expression, size: number, littleEndian: boolean): i.DataVariable;
    dbv(rel: o.Relative, size: number, littleEndian: boolean): i.DataVariable;
    dbv(a: any, b?: any, c?: any): i.DataVariable {
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

        var data = new i.DataVariable(ops, littleEndian);
        this.insert(data);
        return data;
    }

    db(num: number, times?: number): Data;
    db(str: string, encoding?: string): Data;
    db(octets: number[]): Data;
    db(buf: Buffer): Data;
    db(expr: i.Expression, size: number, littleEndian: boolean): i.DataVariable;
    db(rel: o.Relative, size: number, littleEndian: boolean): i.DataVariable;
    db(ops: o.Operands, littleEndian: boolean): i.DataVariable;
    db(a: any, b?: any, c?: any): i.IData {
        var octets: number[];

        if(typeof a === 'number') {
            var arr = [a];
            var times = typeof b === 'number' ? b : 1;
            for(var j = 1; j < times; j++) arr.push(a);
            return this.db(arr);
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
        if(typeof doubles === 'number') return this.dd([doubles as number]);
        return this.db(Data.numbersToOctets(doubles as number[], 4, littleEndian));
    }

    dq(quads: Tnumber[], littleEndian = this.littleEndian): Data {
        return this.db(Data.quadsToOctets(quads, littleEndian));
    }

    tpl(Clazz: typeof i.Template, args?: any[]): i.Expression {
        return this.insert(new Clazz(args));
    }

    resb(length: number): DataUninitialized {
        var data = new DataUninitialized(length);
        this.insert(data);
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

    // Expressions are compiled in 3 passes:
    //
    //  - *1st pass* -- maximum offset `maxOffset` for each expression is computed, some expression might not know
    //  their size jet, not all expressions are known, future references. First pass is when user performs insertion of commands.
    //  - *2nd pass* -- all expressions known now, each expression should pick its right size, exact `offset` is computed for each expression.
    //  - *3rd pass* -- now we know exact `offset` of each expression, so in this pass we fill in the addresses.
    compile(): number[] {
        // 1st pass is performed as instructions are `insert`ed, `.offsetMax` is calculated, and possibly `.offset`.

        // Instructions without size can now determine their size based on `.offsetMax` and
        // calculate their real `.offset`.
        this.do2ndPass();

        // Offsets are now know, here we evaluate references.
        return this.do3rdPass();
    }

    do2ndPass() {
        var last = this.expr[this.expr.length - 1];
        var all_offsets_known = last.offset >= 0;

        // Edge case when only the last Expression has variable size.
        var all_sizes_known = last.bytes() >= 0;

        if(all_offsets_known && all_sizes_known) return; // Skip 2nd pass.

        var prev = this.expr[0];
        prev.offset = 0;
        for(var j = 1; j < this.expr.length; j++) {
            var ins = this.expr[j];

            if(ins instanceof i.ExpressionVolatile) {
                var fixed = (ins as i.ExpressionVolatile).getFixedSizeExpression();
                this.replace(fixed, ins.index);
                ins = fixed;
                // (ins as i.ExpressionVolatile).determineSize();
            }

            // var bytes = prev.bytes();
            // if(bytes === i.SIZE_UNKNOWN)
            //     throw Error(`Instruction [${j}] does not have size.`);
            // ins.offset = prev.offset + bytes;

            // Need to call method, as `InstructionSet` contains multiple `Instruction`s,
            // that all need offset updated of picked instruction.
            ins.calcOffset();

            prev = ins;
        }
    }

    do3rdPass() {
        var code: number[] = [];
        for(var ins of this.expr) {
            if(ins instanceof i.ExpressionVariable)
                (ins as i.ExpressionVariable).evaluate();
            code = ins.write(code); // 3rd pass
        }
        return code;
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
