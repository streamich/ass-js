import {Expression, ExpressionVolatile, SIZE_UNKNOWN} from './expression';
import {Def, DefMatchList} from './def';
import * as o from './operand';
import * as t from './table';
import {Relative} from './operand';
import * as c from './code';

export class Instruction extends ExpressionVolatile {
    def: Def = null; // Definition on how to construct this instruction.
    opts: c.IInstructionOptions = null; // Instruction options provided by user.

    build(): this {
        super.build();
        return this;
    }

    write(arr: number[]): number[] {
        return arr;
    }

    protected toStringExpression() {
        var parts = [];
        parts.push(this.def.getMnemonic());
        if((parts.join(' ')).length < 8) parts.push((new Array(7 - (parts.join(' ')).length)).join(' '));
        if(this.ops.list.length) parts.push(this.ops.toString());
        return parts.join(' ');
    }

    toString(margin = '    ', comment = true) {
        var expression = margin + this.toStringExpression();
        var cmt = '';
        if(comment) {
            var octets = this.write([]).map(function(byte) {
                return byte <= 0xF ? '0' + byte.toString(16).toUpperCase() : byte.toString(16).toUpperCase();
            });
            cmt = `0x` + octets.join(', 0x') + ` ${this.bytes()} bytes`;// + ' / ' + this.def.toString();
        }

        return this.formatToString(margin, expression, cmt);
    }
}

// Wrapper around multiple instructions when different machine instructions can be used to perform the same task.
// For example, `jmp` with `rel8` or `rel32` immediate, or when multiple instruction definitions match provided operands.
export class InstructionSet extends ExpressionVolatile {
    matches: DefMatchList = null;
    insn: Instruction[] = [];
    picked: number = -1; // Index of instruction that was eventually chosen.
    opts: c.IInstructionOptions = null; // Instruction options provided by user.

    constructor(ops: o.Operands, matches: DefMatchList, opts: c.IInstructionOptions) {
        super(ops);
        this.matches = matches;
        this.opts = opts;
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

            var insn = new this.asm.ClassInstruction;
            insn.index = this.index;
            insn.def = match.def;
            insn.opts = this.opts;

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
