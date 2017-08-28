"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operand_1 = require("./operand");
var instruction_1 = require("./instruction");
var i = require("./instruction");
var o = require("./operand");
var util_1 = require("./util");
var Code = (function () {
    function Code(start) {
        if (start === void 0) { start = 'start'; }
        this.expr = [];
        this.operandSize = operand_1.SIZE.D; // Default operand size.
        this.addressSize = operand_1.SIZE.D; // Default address size.
        this.ClassInstruction = i.Instruction;
        this.ClassInstructionSet = i.InstructionSet;
        this.ClassOperands = o.Operands;
        this.AlignExpression = i.Align;
        this.littleEndian = true; // Which way to encode constants by default.
        this.label(start);
    }
    Code.prototype.matchDefinitions = function (mnemonic, ops, opts) {
        var matches = this.table.matchDefinitions(mnemonic, ops, opts);
        if (!matches.list.length)
            throw Error("Could not match operands to instruction definition " + mnemonic + ".");
        return matches;
    };
    Code.prototype._ = function (mnemonic, operands, options) {
        if (operands === void 0) { operands = []; }
        if (options === void 0) { options = { size: o.SIZE.ANY }; }
        if (typeof mnemonic !== 'string')
            throw TypeError('`mnemonic` argument must be a string.');
        var opts;
        if (typeof options === 'number') {
            opts = { size: options };
        }
        else if (typeof options === 'object') {
            opts = options;
        }
        else
            throw TypeError("options must be a number or object.");
        if (typeof opts.size === 'undefined')
            opts.size = o.SIZE.ANY;
        if (!(operands instanceof Array))
            operands = [operands];
        var ops = new this.ClassOperands(operands, opts.size);
        ops.normalizeExpressionToRelative();
        var matches = this.matchDefinitions(mnemonic, ops, opts);
        var iset = new this.ClassInstructionSet(ops, matches, opts);
        this.insert(iset);
        var insn = iset.pickShortestInstruction();
        if (insn) {
            this.replace(insn, iset.index);
            return insn;
        }
        else
            return iset;
    };
    Code.prototype._8 = function (mnemonic) {
        var operands = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            operands[_i - 1] = arguments[_i];
        }
        return this._(mnemonic, operands, 8);
    };
    Code.prototype._16 = function (mnemonic) {
        var operands = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            operands[_i - 1] = arguments[_i];
        }
        return this._(mnemonic, operands, 16);
    };
    Code.prototype._32 = function (mnemonic) {
        var operands = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            operands[_i - 1] = arguments[_i];
        }
        return this._(mnemonic, operands, 32);
    };
    Code.prototype._64 = function (mnemonic) {
        var operands = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            operands[_i - 1] = arguments[_i];
        }
        return this._(mnemonic, operands, 64);
    };
    Code.prototype._128 = function (mnemonic) {
        var operands = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            operands[_i - 1] = arguments[_i];
        }
        return this._(mnemonic, operands, 128);
    };
    Code.prototype._256 = function (mnemonic) {
        var operands = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            operands[_i - 1] = arguments[_i];
        }
        return this._(mnemonic, operands, 256);
    };
    Code.prototype._512 = function (mnemonic) {
        var operands = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            operands[_i - 1] = arguments[_i];
        }
        return this._(mnemonic, operands, 512);
    };
    Code.prototype.exportMethods = function (useNumbers, sizes, obj) {
        var _this = this;
        if (useNumbers === void 0) { useNumbers = false; }
        if (sizes === void 0) { sizes = [o.SIZE.B, o.SIZE.W, o.SIZE.D, o.SIZE.Q]; }
        if (obj === void 0) { obj = {}; }
        var _loop_1 = function (mnemonic) {
            obj[mnemonic] = function () {
                var operands = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    operands[_i] = arguments[_i];
                }
                return _this._(mnemonic, operands);
            };
            var _loop_2 = function (size) {
                var method = useNumbers ? mnemonic + size : mnemonic + o.SIZE[size].toLowerCase();
                obj[method] = function () {
                    var operands = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        operands[_i] = arguments[_i];
                    }
                    return _this._(mnemonic, operands, size);
                };
            };
            for (var _i = 0, sizes_1 = sizes; _i < sizes_1.length; _i++) {
                var size = sizes_1[_i];
                _loop_2(size);
            }
        };
        for (var mnemonic in this.table.table) {
            _loop_1(mnemonic);
        }
        return obj;
    };
    Code.prototype.addMethods = function (useNumbers, sizes, obj) {
        if (useNumbers === void 0) { useNumbers = false; }
        if (sizes === void 0) { sizes = [o.SIZE.B, o.SIZE.W, o.SIZE.D, o.SIZE.Q]; }
        if (obj === void 0) { obj = this.exportMethods(useNumbers, sizes); }
        util_1.extend(this, obj);
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
        expr.calcOffsetMaxAndOffset(); // 1st pass
        return expr;
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
    Code.prototype.align = function (bytes, fill) {
        if (bytes === void 0) { bytes = 4; }
        if (fill === void 0) { fill = null; }
        var align = new this.AlignExpression(bytes);
        if (fill !== null) {
            if (typeof fill === 'number')
                align.templates = [[fill]];
            else
                align.templates = fill;
        }
        return this.insert(align);
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
            // var buf = Buffer.from(a, encoding);
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
            return this.dbv(a, b);
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
            return this.dd([doubles]);
        return this.db(instruction_1.Data.numbersToOctets(doubles, 4, littleEndian));
    };
    Code.prototype.dq = function (quads, littleEndian) {
        if (littleEndian === void 0) { littleEndian = this.littleEndian; }
        var tnums;
        if (typeof quads === 'number')
            tnums = [quads];
        else
            tnums = quads;
        for (var j = 0; j < tnums.length; j++) {
            var num = tnums[j];
            if (typeof num === 'number')
                tnums[j] = [util_1.UInt64.lo(num), util_1.UInt64.hi(num)];
        }
        return this.db(instruction_1.Data.quadsToOctets(tnums, littleEndian));
    };
    Code.prototype.tpl = function (Clazz, args) {
        return this.insert(new Clazz(args));
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
            total_len += bytes;
            while ((bytes > 0) && (total_len < bytes)) {
                buf = new Buffer(4096);
                bytes = fs.readSync(fd, buf, 0, CHUNK);
                if (bytes > 0) {
                    data.push(buf.slice(0, bytes));
                    total_len += bytes;
                }
            }
            buf = Buffer.concat(data);
            // if(total_len > len) buf = buf.slice(0, len);
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
    // Expressions are compiled in 3 passes:
    //
    //  - *1st pass* -- maximum offset `maxOffset` for each expression is computed, some expression might not know
    //  their size jet, not all expressions are known, future references. First pass is when user performs insertion of commands.
    //  - *2nd pass* -- all expressions known now, each expression should pick its right size, exact `offset` is computed for each expression.
    //  - *3rd pass* -- now we know exact `offset` of each expression, so in this pass we fill in the addresses.
    Code.prototype.compile = function () {
        // 1st pass is performed as instructions are `insert`ed, `.offsetMax` is calculated, and possibly `.offset`.
        // Instructions without size can now determine their size based on `.offsetMax` and
        // calculate their real `.offset`.
        this.do2ndPass();
        // Offsets are now know, here we evaluate references.
        return this.do3rdPass();
    };
    Code.prototype.do2ndPass = function () {
        // We probably cannot skip this 2nd pass, as instructions might change their sizes after inserted,
        // for example, when `.lock()` prefix is added.
        // var last = this.expr[this.expr.length - 1];
        // var all_offsets_known = last.offset >= 0;
        //
        // Edge case when only the last Expression has variable size.
        // var all_sizes_known = last.bytes() >= 0;
        //
        // if(all_offsets_known && all_sizes_known) return; // Skip 2nd pass.
        var prev = this.expr[0];
        prev.offset = 0;
        for (var j = 1; j < this.expr.length; j++) {
            var ins = this.expr[j];
            if (ins instanceof i.ExpressionVolatile) {
                var fixed = ins.getFixedSizeExpression();
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
    };
    Code.prototype.do3rdPass = function () {
        var code = [];
        for (var _i = 0, _a = this.expr; _i < _a.length; _i++) {
            var ins = _a[_i];
            if (ins instanceof i.ExpressionVariable)
                ins.evaluate();
            code = ins.write(code); // 3rd pass
        }
        return code;
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
