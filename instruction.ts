import {Def, DefMatchList} from './def';
import * as o from './operand';
import * as t from './table';
import {SIZE, Relative, Operands, TUiOperandNormalized, Tnumber, number64, isNumber64, isTnumber} from './operand';
import * as c from './code';
import {UInt64} from './util';


export const SIZE_UNKNOWN = -Infinity;
export const OFFSET_UNKNOWN = -Infinity;


export class Expression {
    static commentColls = 44;

    // Index where instruction was inserted in `Code`s buffer.
    index: number = 0;

    length: number = SIZE_UNKNOWN;

    // Byte offset of the instruction in compiled machine code.
    offset: number = OFFSET_UNKNOWN;
    // Same as `offset` but for instructions that we don't know byte size yet we assume `MAX_SIZE`.
    offsetMax: number = OFFSET_UNKNOWN;

    code: c.Code = null;

    bind(code: c.Code) {
        this.code = code;
    }

    // Size in bytes of the instruction.
    bytes(): number {
        return this.length;
    }

    bytesMax(): number {
        return this.bytes();
    }

    isFixedSize(): boolean {
        if(this.length === SIZE_UNKNOWN) return false;
        return this.bytes() === this.bytesMax();
    }

    // Whether the size of this `Expression` is determined.
    hasSize() {
        return this.bytes() !== SIZE_UNKNOWN;
    }

    // Called after new expression is inserted into `Code`.
    build() {

    }

    // Calculated during the first pass, when expressions are inserted into `Code` block.
    calcOffsetMaxAndOffset() {
        if(this.index === 0) {
            this.offsetMax = 0;
            this.offset = 0;
        } else {
            var prev = this.code.expr[this.index - 1];
            if(prev.offsetMax === OFFSET_UNKNOWN) this.offsetMax = OFFSET_UNKNOWN;
            else {
                var bytes_max = prev.bytesMax();
                if(bytes_max === SIZE_UNKNOWN) this.offsetMax = OFFSET_UNKNOWN;
                else this.offsetMax = prev.offsetMax + bytes_max;
            }
            if(prev.offset === OFFSET_UNKNOWN) this.offset = OFFSET_UNKNOWN;
            else {
                if(!prev.isFixedSize()) this.offset = OFFSET_UNKNOWN;
                else this.offset = prev.offset + prev.bytes();
            }
        }
    }

    // Calculated during the second pass, when all expressions determine their final size.
    calcOffset() {
        if(this.offset !== OFFSET_UNKNOWN) return;
        if(this.index === 0) this.offset = 0;
        else {
            var prev = this.code.expr[this.index - 1];
            var offset = prev.offset;
            if (offset === OFFSET_UNKNOWN)
                // this.offset = OFFSET_UNKNOWN;
                throw Error(`Instruction [${this.index  - 1}] does not have offset.`);
            else {
                var bytes = prev.bytes();
                if (bytes === SIZE_UNKNOWN)
                    // this.offset = OFFSET_UNKNOWN;
                    throw Error(`Instruction [${this.index  - 1}] does not have size.`);
                else this.offset = offset + bytes;
            }
        }
    }

    rel(offset = 0): Relative {
        var rel = new Relative(this, offset);
        return rel;
    }

    write(arr: number[]): number[] {
        return arr;
    }

    toNumber(): number {
        return this.offset;
    }

    formatOffset() {
        var offset = '______';
        if(this.offset >= 0) {
            offset = this.offset.toString(16).toUpperCase();
            offset = (new Array(7 - offset.length)).join('0') + offset;
        }

        var max_offset = '______';
        if(this.offsetMax >= 0) {
            max_offset = this.offsetMax.toString(16).toUpperCase();
            max_offset = (new Array(7 - max_offset.length)).join('0') + max_offset;
        }

        return offset + '|' + max_offset;
    }

    toString(margin = '', comment = true): string {
        var cmt = '';
        if(comment) {
            cmt = ` ; ${this.formatOffset()}`;
        }
        return margin + '[expression]' + cmt;
    }
}


export class Label extends Expression {

    symbol: o.Symbol = null;

    length = 0;

    constructor(name?: string) {
        super();
        // if((typeof name !== 'string') || !name)
        //     throw TypeError('Label name must be a non-empty string.');
        this.symbol = new o.Symbol(this, 0, name);
    }

    getName() {
        return this.symbol.name;
    }

    toString() {
        return this.getName() + ':';
    }
}


export interface IData {

}


export class DataUninitialized extends Expression implements IData {
    length: number;

    constructor(length: number) {
        super();
        this.length = length;
    }

    write(arr: number[]): number[] {
        arr = arr.concat(new Array(this.length));
        return arr;
    }

    bytes(): number {
        return this.length;
    }

    toString(margin = '    ', comment = true) {
        var bytes = this.bytes();
        var expression = margin + 'resb ' + bytes;
        var cmt = '';
        if(comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            cmt = `${spaces}; ${this.formatOffset()} ${bytes} bytes`;
        }
        return expression + cmt;
    }
}


export type Toctets = number[];

export class Data extends Expression implements IData {

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

    constructor(octets: number[] = []) {
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


// Expressions that have operands, operands might reference (in case of `Relative`) other expressions, which
// have not been insert into code yet, so we might not know the how those operands evaluate on first two passes.
export class ExpressionVariable extends Expression {
    ops: Operands = null; // Operands provided by user.

    isEvaluated = false;

    constructor(ops: Operands = null) {
        super();
        this.ops = ops;
    }

    // canEvaluate() {
    //     for(var op of this.ops.list) {
    //         if(op instanceof Relative) {
    //             var rel = op as Relative;
    //             if(rel.target.offset === OFFSET_UNKNOWN) return false;
    //         }
    //     }
    //     return true;
    // }



    // Whether this Expression is ready to be written to binary buffer.
    // canEvaluate() {
    //     return true;
    // }

    evaluate(): boolean {
        this.isEvaluated = true;
        return true;
    }
}


export class DataVariable extends ExpressionVariable implements IData {

    octets: Toctets;

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

    write(arr: number[]): number[] {
        arr = arr.concat(this.octets);
        return arr;
    }

    toString(margin = '    ', comment = true) {
        var datastr = '';
        var bytes = this.bytes();
        if(bytes < 200) {
            datastr = this.ops.list.map(function(op) {
                return typeof op === 'number' ? Data.formatOctet(op) : op.toString();
            }).join(', ');
        } else {
            datastr = `[${bytes} bytes]`;
        }

        var expression = margin + 'dbv ' + datastr;

        var cmt = '';
        if(comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            cmt = `${spaces}; ${this.formatOffset()} ${bytes} bytes`;
            if(this.isEvaluated) {
                cmt += ' ' + this.octets.map(function(octet) {
                    return Data.formatOctet(octet);
                }).join(', ');
            }
        }
        return expression + cmt;
    }
}


// Expression which, not only has variable operands, but which may evaluate to different sizes.
export abstract class ExpressionVolatile extends ExpressionVariable {
    // If `Expression` can generate different size machine code this method forces it to pick one.
    abstract getFixedSizeExpression();

    lengthMax = 0;

    bytesMax(): number {
        return this.lengthMax;
    }
}


export class Instruction extends ExpressionVolatile {
    def: Def = null; // Definition on how to construct this instruction.

    build(): this {
        super.build();
        return this;
    }

    write(arr: number[]): number[] {
        return arr;
    }

    getFixedSizeExpression() {
        return this;
    }


    toString(margin = '    ', comment = true) {
        var parts = [];
        parts.push(this.def.getMnemonic());
        if((parts.join(' ')).length < 8) parts.push((new Array(7 - (parts.join(' ')).length)).join(' '));
        if(this.ops.list.length) parts.push(this.ops.toString());
        var expression = margin + parts.join(' ');

        var cmt = '';
        if(comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            var octets = this.write([]).map(function(byte) {
                return byte <= 0xF ? '0' + byte.toString(16).toUpperCase() : byte.toString(16).toUpperCase();
            });
            cmt = spaces + `; ${this.formatOffset()} 0x` + octets.join(', 0x');// + ' / ' + this.def.toString();
        }

        return expression + cmt;
    }
}


// Wrapper around multiple instructions when different machine instructions can be used to perform the same task.
// For example, `jmp` with `rel8` or `rel32` immediate, or when multiple instruction definitions match provided operands.
export class InstructionSet extends ExpressionVolatile {
    matches: DefMatchList = null;
    insn: Instruction[] = [];
    picked: number = -1; // Index of instruction that was eventually chosen.

    constructor(ops: o.Operands, matches: DefMatchList) {
        super(ops);
        this.matches = matches;
    }

    write(arr: number[]): number[] {
        if(this.picked === -1)
            throw Error('Instruction candidates not reduced.');
        return this.getPicked().write(arr);
    }

    getPicked() {
        return this.insn[this.picked];
    }

    getFixedSizeExpression(): Expression {
        var shortest_ind = -1;
        var shortest_len = Infinity;
        for(var m = 0; m < this.ops.list.length; m++) {
            var op = this.ops.list[m];
            if(op instanceof o.Relative) {
                for(var j = 0; j < this.insn.length; j++) {
                    var ins = this.insn[j] as Instruction;
                    var rel = ins.ops.list[m] as o.Relative; // Relative of instruction.
                    var success = rel.canHoldMaxOffset(this);

                    if(success) { // potential candidate.
                        if(shortest_ind === -1) {
                            [shortest_ind, shortest_len] = [j, ins.bytes()];
                        } else {
                            var bytes = ins.bytes();
                            if(bytes < shortest_len) {
                                [shortest_ind, shortest_len] = [j, bytes];
                            }
                        }
                    }
                }
            }
        }

        if(shortest_ind === -1)
            throw Error(`Could not fix size for [${this.index}] Expression.`);

        this.picked = shortest_ind;
        return this.getPicked();
    }

    evaluate() {
        var picked = this.getPicked();
        return picked.evaluate();
    }

    bytes() {
        return this.picked === -1 ? SIZE_UNKNOWN : this.getPicked().bytes();
    }

    bytesMax() {
        var max = 0;
        for(var ins of this.insn) {
            if(ins) {
                var bytes = ins.bytesMax();
                if (bytes > max) max = bytes;
            }
        }
        return bytes;
    }

    calcOffset() {
        super.calcOffset();
        var picked = this.getPicked();
        if(picked) {
            picked.offset = this.offset;
        }
    }

    pickShortestInstruction(): Instruction {
        if(this.insn.length === 1)
            return this.insn[0];

        if(this.ops.hasRelative()) return null;

        // Pick the shortest instruction if we know all instruction sizes, otherwise don't pick any.
        var size = SIZE_UNKNOWN;
        var isize = 0;
        for(var j = 0; j < this.insn.length; j++) {
            var insn = this.insn[j];
            isize = insn.bytes();
            if(isize === SIZE_UNKNOWN) {
                this.picked = -1;
                return null;
            }
            if((size === SIZE_UNKNOWN) || (isize < size)) {
                size = isize;
                this.picked = j;
            }
        }
        return this.getPicked();
    }

    protected cloneOperands() {
        return this.ops.clone(o.Operands);
    }

    protected createInstructionOperands(insn: Instruction, tpls: t.TOperandTemplate[]): o.Operands {
        var ops = this.cloneOperands();
        for(var j = 0; j < ops.list.length; j++) {
            var op = ops.list[j];
            if(op instanceof o.Operand) {
                if(op instanceof o.Relative) {
                    var Clazz = tpls[j] as any;
                    if(Clazz.name.indexOf('Relative') === 0) {
                        var RelativeClass = Clazz as typeof o.Relative;
                        var rel = op.clone();
                        rel.cast(RelativeClass);
                        ops.list[j] = rel;
                    }
                }
            } else if(o.isTnumber(op)) {
                var tpl = tpls[j] as any;
                var num = op as any as o.Tnumber;
                if(typeof tpl === 'number') {
                    // Skip number
                    // `int 3`, for example, is just `0xCC` instruction.
                    ops.list[j] = null;
                } else if(typeof tpl === 'function') {
                    var Clazz = tpl as any;
                    if(Clazz.name.indexOf('Relative') === 0) {
                        var RelativeClass = Clazz as typeof o.Relative;
                        var rel = new o.Relative(insn, num as number);
                        rel.cast(RelativeClass);
                        ops.list[j] = rel;
                    } else if (Clazz.name.indexOf('Immediate') === 0) {
                        var ImmediateClass = Clazz as typeof o.Immediate;
                        var imm = new ImmediateClass(num);
                        ops.list[j] = imm;
                    } else
                        throw TypeError('Invalid definition expected Immediate or Relative.');
                } else
                    throw TypeError('Invalid definition expected Immediate or Relative or number.');
            } else
                throw TypeError('Invalid operand expected Register, Memory, Relative, number or number64.');
        }
        return ops;
    }

    build() {
        super.build();
        var matches = this.matches.list;
        var len = matches.length;
        this.insn = new Array(len);
        for(var j = 0; j < len; j++) {
            var match = matches[j];

            var insn = new this.code.ClassInstruction;
            insn.index = this.index;
            insn.def = match.def;

            var ops = this.createInstructionOperands(insn, match.opTpl);
            ops.validateSize();
            insn.ops = ops;
            insn.bind(this.code);
            insn.build();
            this.insn[j] = insn;
        }
    }

    toString(margin = '    ', comment = true) {
        if(this.picked === -1) {
            var expression = '(one of:)';
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            expression += spaces + `; ${this.formatOffset()} max ${this.bytesMax()} bytes\n`;

            var lines = [];
            // for(var j = 0; j < this.insn.length; j++) {
            //     if(this.insn[j].ops) lines.push(this.insn[j].toString(margin, hex));
            //     else lines.push('    ' + this.matches.list[j].def.toString());
            // }
            for(var match of this.matches.list) {
                lines.push(margin + match.def.toString());
            }
            return expression + lines.join('\n');
        } else {
            var picked = this.getPicked();
            return picked.toString(margin, comment) + ' ' + picked.bytes() + ' bytes';
        }
    }

}
