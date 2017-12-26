import Asm from './Asm';
import {Relative} from './operand';
import {Operands} from './operand';

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

    asm: Asm = null;

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
            var prev = this.asm.expressions[this.index - 1];
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
            var prev = this.asm.expressions[this.index - 1];
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

    formatToString(margin, expression, comment = '') {
        expression = margin + expression;
        var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
        return expression + spaces + `; ${this.formatOffset()} ` + comment;
    }

    toString(margin = '', comment = true): string {
        return this.formatToString(margin, '[expression]');
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

    evaluate(): boolean {
        this.isEvaluated = true;
        return true;
    }
}

// Expression which, not only has variable operands, but which may evaluate to different sizes.
export abstract class ExpressionVolatile extends ExpressionVariable {

    lengthMax = 0;

    bytesMax(): number {
        return this.lengthMax;
    }

    // If `Expression` can generate different size machine code this method forces it to pick one.
    getFixedSizeExpression(): Expression {
        return this;
    }
}
