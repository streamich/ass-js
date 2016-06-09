"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('./operand');
var operand_1 = require('./operand');
var util_1 = require('./util');
exports.SIZE_UNKNOWN = -1;
exports.OFFSET_UNKNOWN = -1;
var Expression = (function () {
    function Expression() {
        // Index where instruction was inserted in `Code`s buffer.
        this.index = 0;
        this.length = exports.SIZE_UNKNOWN;
        // Byte offset of the instruction in compiled machine code.
        this.offset = exports.OFFSET_UNKNOWN;
        // Same as `offset` but for instructions that we don't know byte size yet we assume `MAX_SIZE`.
        this.offsetMax = exports.OFFSET_UNKNOWN;
        this.code = null;
    }
    Expression.prototype.bind = function (code) {
        this.code = code;
    };
    // Size in bytes of the instruction.
    Expression.prototype.bytes = function () {
        return this.length;
    };
    Expression.prototype.bytesMax = function () {
        return this.bytes();
    };
    // Whether the size of this `Expression` is determined.
    Expression.prototype.hasSize = function () {
        return this.bytes() !== exports.SIZE_UNKNOWN;
    };
    // Called after new expression is inserted into `Code`.
    Expression.prototype.build = function () {
    };
    // If `Expression` can generate different size machine code this method forces it to pick one.
    Expression.prototype.determineSize = function () {
    };
    // Whether this Expression is ready to be written to binary buffer.
    Expression.prototype.canEvaluate = function () {
        return true;
    };
    // Evaluate addressing references in 3rd pass.
    Expression.prototype.evaluate = function () {
    };
    // Calculated during the first pass, when expressions are inserted into `Code` block.
    Expression.prototype.calcOffsetMaxAndOffset = function () {
        if (this.index === 0) {
            this.offsetMax = 0;
            this.offset = 0;
        }
        else {
            var prev = this.code.expr[this.index - 1];
            if (prev.offsetMax === exports.OFFSET_UNKNOWN)
                this.offsetMax = exports.OFFSET_UNKNOWN;
            else {
                var bytes_max = prev.bytesMax();
                if (bytes_max === exports.SIZE_UNKNOWN)
                    this.offsetMax = exports.OFFSET_UNKNOWN;
                else
                    this.offsetMax = prev.offsetMax + bytes_max;
            }
            if (prev.offset === exports.OFFSET_UNKNOWN)
                this.offset = exports.OFFSET_UNKNOWN;
            else {
                var bytes = prev.bytes();
                if (bytes === exports.SIZE_UNKNOWN)
                    this.offset = exports.OFFSET_UNKNOWN;
                else
                    this.offset = prev.offset + bytes;
            }
        }
    };
    // Calculated during the second pass, when all expressions determine their final size.
    Expression.prototype.calcOffset = function () {
        if (this.offset !== exports.OFFSET_UNKNOWN)
            return;
        if (this.index === 0)
            this.offset = 0;
        else {
            var prev = this.code.expr[this.index - 1];
            var offset = prev.offset;
            if (offset === exports.OFFSET_UNKNOWN)
                this.offset = exports.OFFSET_UNKNOWN;
            else {
                var bytes = prev.bytes();
                if (bytes === exports.SIZE_UNKNOWN)
                    this.offset = exports.OFFSET_UNKNOWN;
                else
                    this.offset = offset + bytes;
            }
        }
    };
    Expression.prototype.rel = function (offset) {
        if (offset === void 0) { offset = 0; }
        var rel = new operand_1.Relative(this, offset);
        return rel;
    };
    Expression.prototype.write = function (arr) {
        return arr;
    };
    Expression.prototype.toNumber = function () {
        return this.offset;
    };
    Expression.prototype.formatOffset = function () {
        var offset = '______';
        if (this.offset !== -1) {
            offset = this.offset.toString(16).toUpperCase();
            offset = (new Array(7 - offset.length)).join('0') + offset;
        }
        var max_offset = '______';
        if (this.offsetMax !== -1) {
            max_offset = this.offsetMax.toString(16).toUpperCase();
            max_offset = (new Array(7 - max_offset.length)).join('0') + max_offset;
        }
        return offset + '|' + max_offset;
    };
    Expression.prototype.toString = function (margin, comment) {
        if (margin === void 0) { margin = ''; }
        if (comment === void 0) { comment = true; }
        var cmt = '';
        if (comment) {
            cmt = " ; " + this.formatOffset();
        }
        return margin + '[expression]' + cmt;
    };
    Expression.commentColls = 44;
    return Expression;
}());
exports.Expression = Expression;
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(name) {
        _super.call(this);
        this.length = 0;
        if ((typeof name !== 'string') || !name)
            throw TypeError('Label name must be a non-empty string.');
        this.name = name;
    }
    Label.prototype.toString = function () {
        return this.name + ':';
    };
    return Label;
}(Expression));
exports.Label = Label;
var DataUninitialized = (function (_super) {
    __extends(DataUninitialized, _super);
    function DataUninitialized(length) {
        _super.call(this);
        this.length = length;
    }
    DataUninitialized.prototype.write = function (arr) {
        arr = arr.concat(new Array(this.length));
        return arr;
    };
    DataUninitialized.prototype.bytes = function () {
        return this.length;
    };
    DataUninitialized.prototype.toString = function (margin) {
        if (margin === void 0) { margin = '    '; }
        return margin + 'resb ' + this.length;
    };
    return DataUninitialized;
}(Expression));
exports.DataUninitialized = DataUninitialized;
var Data = (function (_super) {
    __extends(Data, _super);
    function Data(octets) {
        if (octets === void 0) { octets = []; }
        _super.call(this);
        this.octets = octets;
        this.length = octets.length;
    }
    Data.formatOctet = function (octet) {
        var neg = octet < 0 ? '-' : '';
        octet = Math.abs(octet);
        return octet <= 0xF ? neg + '0x0' + octet.toString(16).toUpperCase() : neg + '0x' + octet.toString(16).toUpperCase();
    };
    Data.numbersToOctets = function (numbers, size, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        if (size === operand_1.SIZE.Q)
            return Data.quadsToOctets(numbers, littleEndian);
        var num = numbers;
        var octets = new Array(numbers.length * size);
        if (littleEndian)
            for (var i = 0; i < numbers.length; i++)
                for (var j = 0; j < size; j++)
                    octets[i * size + j] = (num[i] >> (j * 8)) & 0xFF;
        else
            for (var i = 0; i < numbers.length; i++)
                for (var j = 0; j < size; j++)
                    octets[i * size + j] = (num[i] >> ((size - j - 1) * 8)) & 0xFF;
        return octets;
    };
    Data.wordsToOctets = function (words, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        return Data.numbersToOctets(words, 2, littleEndian);
    };
    Data.doublesToOctets = function (doubles, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        return Data.numbersToOctets(doubles, 4, littleEndian);
    };
    Data.quadsToOctets = function (quads, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        if (!(quads instanceof Array))
            throw TypeError('Quads must be and array of number or [number, number].');
        if (!quads.length)
            return [];
        var doubles = new Array(quads.length * 2);
        if (typeof quads[0] === 'number') {
            var qnumbers = quads;
            for (var i = 0; i < qnumbers.length; i++) {
                var hi = util_1.UInt64.hi(qnumbers[i]);
                var lo = util_1.UInt64.lo(qnumbers[i]);
                if (littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                }
                else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        }
        else if (quads[0] instanceof Array) {
            var numbers64 = quads;
            for (var i = 0; i < numbers64.length; i++) {
                var _a = numbers64[i], lo = _a[0], hi = _a[1];
                if (littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                }
                else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        }
        else
            throw TypeError('Quads must be and array of number[] or [number, number][].');
        return Data.doublesToOctets(doubles, littleEndian);
    };
    Data.prototype.write = function (arr) {
        arr = arr.concat(this.octets);
        return arr;
    };
    Data.prototype.bytes = function () {
        return this.octets.length;
    };
    Data.prototype.toString = function (margin, comment) {
        if (margin === void 0) { margin = '    '; }
        if (comment === void 0) { comment = true; }
        var datastr = '';
        var bytes = this.bytes();
        if (bytes < 200) {
            datastr = this.octets.map(function (octet) {
                return Data.formatOctet(octet);
            }).join(', ');
        }
        else {
            datastr = "[" + this.bytes() + " bytes]";
        }
        var expression = margin + 'db ' + datastr;
        var cmt = '';
        if (comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            cmt = spaces + "; " + this.formatOffset() + " " + bytes + " bytes";
        }
        return expression + cmt;
    };
    return Data;
}(Expression));
exports.Data = Data;
// Expressions that have operands, operands might reference (in case of `Relative`) other expressions, which
// have not been insert into code yet, so we might not know the how those operands evaluate on first two passes.
var ExpressionVariable = (function (_super) {
    __extends(ExpressionVariable, _super);
    function ExpressionVariable(ops) {
        if (ops === void 0) { ops = null; }
        _super.call(this);
        this.ops = null; // Operands provided by user.
        this.isEvaluated = false;
        this.ops = ops;
    }
    ExpressionVariable.prototype.canEvaluate = function () {
        for (var _i = 0, _a = this.ops.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof operand_1.Relative) {
                var rel = op;
                if (rel.expr.offset === exports.OFFSET_UNKNOWN)
                    return false;
            }
        }
        return true;
    };
    ExpressionVariable.prototype.evaluate = function () {
        this.isEvaluated = true;
    };
    return ExpressionVariable;
}(Expression));
exports.ExpressionVariable = ExpressionVariable;
var DataVolatile = (function (_super) {
    __extends(DataVolatile, _super);
    function DataVolatile(ops, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        _super.call(this, ops);
        this.littleEndian = littleEndian;
        this.octets = new Array(this.bytes());
    }
    DataVolatile.prototype.build = function () {
    };
    DataVolatile.prototype.bytes = function () {
        if (this.ops.size <= operand_1.SIZE.NONE)
            throw Error('Unknown operand size in Data.');
        else
            return this.ops.list.length * (this.ops.size >> 3);
    };
    DataVolatile.prototype.evaluate = function () {
        var isize = this.ops.size >> 3;
        var list = this.ops.list;
        for (var j = 0; j < list.length; j++) {
            var op = list[j];
            var num;
            if (op instanceof operand_1.Relative) {
                var rel = op;
                // num = list[j] = rel.rebaseOffset(this);
                num = rel.rebaseOffset(this);
            }
            else if (operand_1.isTnumber(op)) {
                num = op;
            }
            else
                throw Error('Unknow Data operand.');
            var slice = Data.numbersToOctets([num], isize, this.littleEndian);
            for (var m = 0; m < isize; m++)
                this.octets[j + m] = slice[m];
        }
        _super.prototype.evaluate.call(this);
    };
    DataVolatile.prototype.write = function (arr) {
        arr = arr.concat(this.octets);
        return arr;
    };
    DataVolatile.prototype.toString = function (margin, comment) {
        if (margin === void 0) { margin = '    '; }
        if (comment === void 0) { comment = true; }
        var datastr = '';
        var bytes = this.bytes();
        if (bytes < 200) {
            if (this.isEvaluated) {
                datastr = this.octets.map(function (octet) {
                    return Data.formatOctet(octet);
                }).join(', ');
            }
            else {
                datastr = this.ops.list.map(function (op) {
                    return typeof op === 'number' ? Data.formatOctet(op) : op.toString();
                }).join(', ');
            }
        }
        else {
            datastr = "[" + bytes + " bytes]";
        }
        var expression = margin + 'dbv ' + datastr;
        var cmt = '';
        if (comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            cmt = spaces + "; " + this.formatOffset() + " " + bytes + " bytes";
        }
        return expression + cmt;
    };
    return DataVolatile;
}(ExpressionVariable));
exports.DataVolatile = DataVolatile;
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        _super.apply(this, arguments);
        this.def = null; // Definition on how to construct this instruction.
    }
    Instruction.prototype.build = function () {
        _super.prototype.build.call(this);
        return this;
    };
    Instruction.prototype.write = function (arr) {
        return arr;
    };
    Instruction.prototype.toString = function (margin, comment) {
        if (margin === void 0) { margin = '    '; }
        if (comment === void 0) { comment = true; }
        var parts = [];
        parts.push(this.def.getMnemonic());
        if ((parts.join(' ')).length < 8)
            parts.push((new Array(7 - (parts.join(' ')).length)).join(' '));
        if (this.ops.list.length)
            parts.push(this.ops.toString());
        var expression = margin + parts.join(' ');
        var cmt = '';
        if (comment) {
            var spaces = (new Array(1 + Math.max(0, Expression.commentColls - expression.length))).join(' ');
            var octets = this.write([]).map(function (byte) {
                return byte <= 0xF ? '0' + byte.toString(16).toUpperCase() : byte.toString(16).toUpperCase();
            });
            cmt = spaces + ("; " + this.formatOffset() + " 0x") + octets.join(', 0x'); // + ' / ' + this.def.toString();
        }
        return expression + cmt;
    };
    return Instruction;
}(ExpressionVariable));
exports.Instruction = Instruction;
// Expression which, not only has operands, but which may evaluate to different sizes.
var ExpressionVolatile = (function (_super) {
    __extends(ExpressionVolatile, _super);
    function ExpressionVolatile() {
        _super.apply(this, arguments);
    }
    return ExpressionVolatile;
}(ExpressionVariable));
exports.ExpressionVolatile = ExpressionVolatile;
// Wrapper around multiple instructions when different machine instructions can be used to perform the same task.
// For example, `jmp` with `rel8` or `rel32` immediate, or when multiple instruction definitions match provided operands.
var InstructionSet = (function (_super) {
    __extends(InstructionSet, _super);
    function InstructionSet(ops, matches) {
        _super.call(this, ops);
        this.matches = null;
        this.insn = [];
        this.picked = -1; // Index of instruction that was eventually chosen.
        this.matches = matches;
    }
    InstructionSet.prototype.write = function (arr) {
        if (this.picked === -1)
            throw Error('Instruction candidates not reduced.');
        return this.getPicked().write(arr);
    };
    InstructionSet.prototype.toString = function (margin, hex) {
        if (margin === void 0) { margin = '    '; }
        if (hex === void 0) { hex = true; }
        if (this.picked === -1) {
            var str = '(one of:)\n';
            var lines = [];
            for (var j = 0; j < this.insn.length; j++) {
                if (this.insn[j].ops)
                    lines.push(this.insn[j].toString(margin, hex));
                else
                    lines.push('    ' + this.matches.list[j].def.toString());
            }
            // for(var match of this.matches.list) {
            //     lines.push('    ' + match.def.toString());
            // }
            return str + lines.join('\n');
        }
        else
            return this.getPicked().toString(margin, hex);
    };
    InstructionSet.prototype.getPicked = function () {
        return this.insn[this.picked];
    };
    InstructionSet.prototype.bytes = function () {
        return this.picked === -1 ? exports.SIZE_UNKNOWN : this.getPicked().bytes();
    };
    InstructionSet.prototype.bytesMax = function () {
        var max = 0;
        for (var _i = 0, _a = this.insn; _i < _a.length; _i++) {
            var ins = _a[_i];
            if (ins) {
                var bytes = ins.bytes();
                if (bytes > max)
                    max = bytes;
            }
        }
        return bytes;
    };
    InstructionSet.prototype.pickShortestInstruction = function () {
        // Pick the shortest instruction if we know all instruction sizes, otherwise don't pick any.
        var size = exports.SIZE_UNKNOWN;
        var isize = 0;
        for (var j = 0; j < this.insn.length; j++) {
            var insn = this.insn[j];
            isize = insn.bytes();
            if (isize === exports.SIZE_UNKNOWN) {
                this.picked = -1;
                return null;
            }
            if ((size === exports.SIZE_UNKNOWN) || (isize < size)) {
                size = isize;
                this.picked = j;
            }
        }
        return this.getPicked();
    };
    InstructionSet.prototype.normalizeOperands = function (insn, tpls) {
        var list = [];
        for (var j = 0; j < this.ops.list.length; j++) {
            var op = this.ops.list[j];
            if (op instanceof o.Operand) {
                list.push(op);
            }
            else if (o.isTnumber(op)) {
                var Clazz = tpls[j];
                var num = op;
                if (Clazz.name.indexOf('Relative') === 0) {
                    var RelativeClass = Clazz;
                    var rel = new RelativeClass(insn, num);
                    list.push(rel);
                }
                else
                    list.push(num);
            }
            else
                throw TypeError('Invalid operand expected Register, Memory, Relative, number or number64.');
        }
        return list;
    };
    InstructionSet.prototype.createInstructionOperands = function (insn, tpls) {
        var list = this.normalizeOperands(insn, tpls);
        return new o.OperandsNormalized(list, this.ops.size);
    };
    InstructionSet.prototype.build = function () {
        _super.prototype.build.call(this);
        var matches = this.matches.list;
        var len = matches.length;
        this.insn = new Array(len);
        for (var j = 0; j < len; j++) {
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
    };
    return InstructionSet;
}(ExpressionVolatile));
exports.InstructionSet = InstructionSet;
