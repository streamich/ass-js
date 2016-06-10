"use strict";
var operand_1 = require('./operand');
var instruction_1 = require('./instruction');
var i = require('./instruction');
var o = require('./operand');
var util_1 = require('./util');
var Symbol = (function () {
    function Symbol() {
    }
    return Symbol;
}());
exports.Symbol = Symbol;
var Block = (function () {
    function Block() {
    }
    return Block;
}());
exports.Block = Block;
var Section = (function () {
    function Section() {
    }
    return Section;
}());
exports.Section = Section;
var Assembler = (function () {
    function Assembler() {
    }
    return Assembler;
}());
exports.Assembler = Assembler;
var Code = (function () {
    function Code(start) {
        if (start === void 0) { start = 'start'; }
        this.expr = [];
        this.operandSize = operand_1.SIZE.D;
        this.addressSize = operand_1.SIZE.D;
        this.ClassInstruction = i.Instruction;
        this.ClassOperands = o.Operands;
        this.littleEndian = true;
        this.methods = {};
        this.label(start);
    }
    Code.prototype.addMethods = function () {
        util_1.extend(this, this.methods);
    };
    Code.prototype.getStartLabel = function () {
        return this.expr[0];
    };
    Code.prototype.insert = function (expr) {
        this.replace(expr, this.expr.length);
        expr.build();
        return expr;
    };
    Code.prototype.replace = function (expr, index) {
        if (index === void 0) { index = this.expr.length; }
        expr.index = index;
        expr.bind(this);
        this.expr[index] = expr;
        expr.calcOffsetMaxAndOffset();
        return expr;
    };
    Code.prototype.compile = function () {
        this.do2ndPass();
        return this.do3rdPass();
    };
    Code.prototype.do2ndPass = function () {
        var last = this.expr[this.expr.length - 1];
        var all_offsets_known = last.offset !== i.OFFSET_UNKNOWN;
        var all_sizes_known = last.bytes() !== i.SIZE_UNKNOWN;
        if (all_offsets_known && all_sizes_known)
            return;
        var prev = this.expr[0];
        prev.offset = 0;
        for (var j = 1; j < this.expr.length; j++) {
            var ins = this.expr[j];
            if (ins instanceof i.ExpressionVolatile) {
                var fixed = ins.getFixedSizeExpression();
                this.replace(fixed, ins.index);
                ins = fixed;
            }
            ins.calcOffset();
            prev = ins;
        }
    };
    Code.prototype.do3rdPass = function () {
        var code = [];
        for (var _i = 0, _a = this.expr; _i < _a.length; _i++) {
            var ins = _a[_i];
            if (ins instanceof i.ExpressionVariable)
                ins.evaluate();
            code = ins.write(code);
        }
        return code;
    };
    Code.prototype.lbl = function (name) {
        return new instruction_1.Label(name);
    };
    Code.prototype.label = function (name) {
        return this.insert(this.lbl(name));
    };
    Code.prototype.rel = function (expr, offset) {
        if (offset === void 0) { offset = 0; }
        return expr.rel(offset);
    };
    Code.prototype.ops = function (operands, size) {
        if (size === void 0) { size = this.operandSize; }
        return new o.Operands(operands, size);
    };
    Code.prototype.dbv = function (a, b, c) {
        var ops;
        var littleEndian = this.littleEndian;
        if (a instanceof i.Expression) {
            var expr = a;
            var size = b;
            if (typeof size !== 'number')
                size = this.operandSize;
            else
                size = size << 3;
            if (typeof c === 'boolean')
                littleEndian = c;
            ops = this.ops([expr.rel()], size);
        }
        else if (a instanceof o.Relative) {
            var rel = a;
            var size = b;
            if (typeof size !== 'number')
                size = this.operandSize;
            else
                size = size << 3;
            if (typeof c === 'boolean')
                littleEndian = c;
            ops = this.ops([rel], size);
        }
        else if (a instanceof o.Operands) {
            ops = a;
            if (typeof c === 'boolean')
                littleEndian = c;
        }
        else
            throw TypeError('Data type not supported for DBV.');
        var data = new i.DataVariable(ops, littleEndian);
        this.insert(data);
        return data;
    };
    Code.prototype.db = function (a, b, c) {
        var octets;
        if (typeof a === 'number') {
            var arr = [a];
            var times = typeof b === 'number' ? b : 1;
            for (var j = 1; j < times; j++)
                arr.push(a);
            return this.db(arr);
        }
        else if (a instanceof Array) {
            octets = a;
        }
        else if (typeof a === 'string') {
            var encoding = typeof b === 'string' ? b : 'ascii';
            var buf = new Buffer(a, encoding);
            octets = Array.prototype.slice.call(buf, 0);
        }
        else if (a instanceof Buffer) {
            octets = Array.prototype.slice.call(a, 0);
        }
        else if (a instanceof i.Expression)
            return this.dbv(a, b, c);
        else if (a instanceof o.Relative)
            return this.dbv(a, b, c);
        else if (a instanceof o.Operands)
            return this.dbv(a, b, c);
        else
            throw TypeError('Data type not supported for DB.');
        var data = new instruction_1.Data(octets);
        this.insert(data);
        return data;
    };
    Code.prototype.dw = function (words, littleEndian) {
        if (littleEndian === void 0) { littleEndian = this.littleEndian; }
        if (typeof words === 'number')
            return this.dw([words]);
        return this.db(instruction_1.Data.numbersToOctets(words, 2, littleEndian));
    };
    Code.prototype.dd = function (doubles, littleEndian) {
        if (littleEndian === void 0) { littleEndian = this.littleEndian; }
        if (typeof doubles === 'number')
            return this.dw([doubles]);
        return this.db(instruction_1.Data.numbersToOctets(doubles, 4, littleEndian));
    };
    Code.prototype.dq = function (quads, littleEndian) {
        if (littleEndian === void 0) { littleEndian = this.littleEndian; }
        return this.db(instruction_1.Data.quadsToOctets(quads, littleEndian));
    };
    Code.prototype.resb = function (length) {
        var data = new instruction_1.DataUninitialized(length);
        this.insert(data);
        return data;
    };
    Code.prototype.resw = function (length) {
        return this.resb(length * 2);
    };
    Code.prototype.resd = function (length) {
        return this.resb(length * 4);
    };
    Code.prototype.resq = function (length) {
        return this.resb(length * 8);
    };
    Code.prototype.rest = function (length) {
        return this.resb(length * 10);
    };
    Code.prototype.incbin = function (filepath, offset, len) {
        var fs = require('fs');
        if (typeof offset === 'undefined') {
            return this.db(fs.readFileSync(filepath));
        }
        else if (typeof len === 'undefined') {
            if (typeof offset !== 'number')
                throw TypeError('Offset must be a number.');
            var fd = fs.openSync(filepath, 'r');
            var total_len = 0;
            var data = [];
            var CHUNK = 4096;
            var buf = new Buffer(CHUNK);
            var bytes = fs.readSync(fd, buf, 0, CHUNK, offset);
            data.push(buf.slice(0, bytes));
            total_len += len;
            while ((bytes > 0) && (total_len < len)) {
                buf = new Buffer(4096);
                bytes = fs.readSync(fd, buf, 0, CHUNK);
                if (bytes > 0) {
                    data.push(buf.slice(0, bytes));
                    total_len += bytes;
                }
            }
            buf = Buffer.concat(data);
            if (total_len > len)
                buf = buf.slice(0, len);
            fs.closeSync(fd);
            return this.db(buf);
        }
        else {
            if (typeof offset !== 'number')
                throw TypeError('Offset must be a number.');
            if (typeof len !== 'number')
                throw TypeError('Length must be a number.');
            var buf = new Buffer(len);
            var fd = fs.openSync(filepath, 'r');
            var bytes = fs.readSync(fd, buf, 0, len, offset);
            buf = buf.slice(0, bytes);
            fs.closeSync(fd);
            return this.db(buf);
        }
    };
    Code.prototype.toString = function (lineNumbers, hex) {
        if (lineNumbers === void 0) { lineNumbers = true; }
        if (hex === void 0) { hex = true; }
        var lines = [];
        for (var i = 0; i < this.expr.length; i++) {
            var expr = this.expr[i];
            var line_num = '';
            if (lineNumbers) {
                var line_num = i + '';
                if (line_num.length < 3)
                    line_num = ((new Array(4 - line_num.length)).join('0')) + line_num;
                line_num += ' ';
            }
            lines.push(line_num + expr.toString('    ', hex));
        }
        return lines.join('\n');
    };
    return Code;
}());
exports.Code = Code;
