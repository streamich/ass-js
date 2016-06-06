"use strict";
var o = require('./operand');
var i = require('./instruction');
var util_1 = require('../util');
var Code = (function () {
    function Code() {
        this.operandSize = o.SIZE.D; // Default operand size.
        this.addressSize = o.SIZE.D; // Default address size.
        this.mode = o.MODE.X64;
        this.expr = [];
        this.ClassInstruction = i.Instruction;
    }
    Code.prototype.ins = function (definition, operands) {
        var instruction = new this.ClassInstruction(definition, operands, this);
        instruction.create();
        instruction.index = this.expr.length;
        this.expr.push(instruction);
        return instruction;
    };
    Code.prototype.createInstructionFromGroupSize = function (bySize, size, ui_ops) {
        var matches;
        var definition;
        for (var _i = 0, _a = bySize[size]; _i < _a.length; _i++) {
            var xdef = _a[_i];
            definition = xdef;
            matches = definition.matchOperands(ui_ops);
            if (matches)
                break;
        }
        if (!matches)
            throw Error('Given operands could not find instruction definition.');
        var ops = o.Operands.fromUiOpsAndTpl(ui_ops, matches);
        return this.ins(definition, ops);
    };
    Code.prototype.attachGroupMethods = function (group) {
        var _this = this;
        var mnemonic = group.mnemonic;
        var bySize = group.groupBySize();
        // Create methods with size postfix, like: pushq, pushd, pushw, etc..
        var _loop_1 = function(s) {
            var size = parseInt(s);
            if (size > o.SIZE.NONE) {
                this_1[mnemonic + o.SIZE[size].toLowerCase()] = function () {
                    var ui_ops = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        ui_ops[_i - 0] = arguments[_i];
                    }
                    return _this.createInstructionFromGroupSize(bySize, size, ui_ops);
                };
            }
        };
        var this_1 = this;
        for (var s in bySize) {
            _loop_1(s);
        }
        // Create general method where we determine operand size from profided operands.
        this[mnemonic] = function () {
            var ui_ops = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ui_ops[_i - 0] = arguments[_i];
            }
            if (ui_ops.length) {
                var size = o.Operands.findSize(ui_ops);
                if (size < o.SIZE.B) {
                    if (bySize[o.SIZE.NONE]) {
                        return _this.createInstructionFromGroupSize(bySize, o.SIZE.NONE, ui_ops);
                    }
                    else
                        throw TypeError('Could not determine operand size.');
                }
                if (!bySize[size])
                    throw Error("Instruction " + mnemonic + " has no " + size + "-bit definition.");
                return _this[mnemonic + o.SIZE[size].toLowerCase()].apply(_this, ui_ops);
            }
            else {
                return _this.createInstructionFromGroupSize(bySize, o.SIZE.NONE, ui_ops);
            }
        };
    };
    Code.prototype.attachMethods = function (table) {
        for (var groupname in table.groups) {
            var group = table.groups[groupname];
            this.attachGroupMethods(group);
        }
    };
    // instructionFromTable(group: string, ops: o.TUserInterfaceOperand[] = [], size: o.SIZE = o.SIZE.ANY): i.Instruction {
    //     var operands = o.Operands.fromUiOps(ops, size, );
    //
    //     var definition = this.table.find(group, operands);
    //     if(!definition)
    //         throw Error(`Definition for "${group}${operands.list.length ? ' ' + operands.toString() : ''}" not found.`);
    //     return this.ins(definition, operands, size);
    // }
    // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
    //
    // > The size of a displacement is 1, 2, or 4 bytes.
    //
    // > Also, in 64-bit mode, support is provided for some 64-bit displacement
    // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
    // > information on this.
    Code.prototype.mem = function (disp) {
        if (typeof disp === 'number')
            return o.Memory.factory(this.addressSize).disp(disp);
        else if ((disp instanceof Array) && (disp.length == 2))
            return o.Memory.factory(this.addressSize).disp(disp);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    };
    Code.prototype.disp = function (disp) {
        return this.mem(disp);
    };
    Code.prototype.imm = function (value, signed) {
        if (signed === void 0) { signed = true; }
        return signed ? new o.Immediate(value) : new o.ImmediateUnsigned(value);
    };
    Code.prototype.label = function (name) {
        var label = new i.Label(name);
        this.expr.push(label);
        return label;
    };
    Code.prototype.db = function (a, b) {
        var octets;
        if (a instanceof Array) {
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
        else
            throw TypeError('Data must be an array of octets, a Buffer or a string.');
        var data = new i.Data;
        data.index = this.expr.length;
        data.octets = octets;
        this.expr.push(data);
        return data;
    };
    Code.prototype.dw = function (words, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        var size = 4;
        var octets = new Array(words.length * size);
        for (var i = 0; i < words.length; i++) {
            if (littleEndian) {
                octets[i * size + 0] = (words[i] >> 0x00) & 0xFF;
                octets[i * size + 1] = (words[i] >> 0x08) & 0xFF;
            }
            else {
                octets[i * size + 0] = (words[i] >> 0x08) & 0xFF;
                octets[i * size + 1] = (words[i] >> 0x00) & 0xFF;
            }
        }
        return this.db(octets);
    };
    Code.prototype.dd = function (doubles, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        var size = 4;
        var octets = new Array(doubles.length * size);
        for (var i = 0; i < doubles.length; i++) {
            if (littleEndian) {
                octets[i * size + 0] = (doubles[i] >> 0x00) & 0xFF;
                octets[i * size + 1] = (doubles[i] >> 0x08) & 0xFF;
                octets[i * size + 2] = (doubles[i] >> 0x10) & 0xFF;
                octets[i * size + 3] = (doubles[i] >> 0x18) & 0xFF;
            }
            else {
                octets[i * size + 0] = (doubles[i] >> 0x18) & 0xFF;
                octets[i * size + 1] = (doubles[i] >> 0x10) & 0xFF;
                octets[i * size + 2] = (doubles[i] >> 0x08) & 0xFF;
                octets[i * size + 3] = (doubles[i] >> 0x00) & 0xFF;
            }
        }
        return this.db(octets);
    };
    Code.prototype.dq = function (quads, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        if (!(quads instanceof Array))
            throw TypeError('Quads must be and array of number[] or [number, number][].');
        if (!quads.length)
            return this.dd([]);
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
        return this.dd(doubles);
    };
    Code.prototype.resb = function (length) {
        var data = new i.DataUninitialized(length);
        data.index = this.expr.length;
        this.expr.push(data);
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
    Code.prototype.compile = function () {
        var code = [];
        for (var _i = 0, _a = this.expr; _i < _a.length; _i++) {
            var ins = _a[_i];
            code = ins.write(code);
        }
        return code;
    };
    Code.prototype.toString = function (hex) {
        if (hex === void 0) { hex = true; }
        return this.expr.map(function (ins) { return ins.toString('    ', hex); }).join('\n');
    };
    return Code;
}());
exports.Code = Code;
