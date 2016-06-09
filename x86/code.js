"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var oo = require('../operand');
var o = require('./operand');
var code_1 = require('../code');
var t = require('./table');
var d = require('./def');
var i = require('./instruction');
var Code = (function (_super) {
    __extends(Code, _super);
    function Code() {
        _super.apply(this, arguments);
        this.mode = t.MODE.X64;
        this.ClassInstruction = i.Instruction;
        this.ClassOperands = o.Operands;
    }
    Code.attachMethods = function (ctx, table) {
        var _loop_1 = function(groupname) {
            var group = table.groups[groupname];
            var mnemonic = group.mnemonic;
            var bySize = group.groupBySize();
            // Create methods with size postfix, like: pushq, pushd, pushw, etc..
            var _loop_2 = function(s) {
                var size = parseInt(s);
                if (size > oo.SIZE.NONE) {
                    ctx[mnemonic + oo.SIZE[size].toLowerCase()] = function () {
                        var ui_ops = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            ui_ops[_i - 0] = arguments[_i];
                        }
                        return this.createInstructionFromGroupSize(bySize, size, ui_ops);
                    };
                }
            };
            for (var s in bySize) {
                _loop_2(s);
            }
            // Create general method where we determine operand size from profided operands.
            ctx[mnemonic] = function () {
                var ui_ops = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    ui_ops[_i - 0] = arguments[_i];
                }
                if (ui_ops.length) {
                    var size = o.Operands.findSize(ui_ops);
                    if (size < oo.SIZE.B) {
                        if (bySize[oo.SIZE.NONE]) {
                            return this.createInstructionFromGroupSize(bySize, oo.SIZE.NONE, ui_ops);
                        }
                        else
                            throw TypeError('Could not determine operand size.');
                    }
                    if (!bySize[size])
                        throw Error("Instruction " + mnemonic + " has no " + size + "-bit definition.");
                    return this[mnemonic + oo.SIZE[size].toLowerCase()].apply(this, ui_ops);
                }
                else {
                    return this.createInstructionFromGroupSize(bySize, oo.SIZE.NONE, ui_ops);
                }
            };
        };
        for (var groupname in table.groups) {
            _loop_1(groupname);
        }
        return ctx;
    };
    Code.prototype.createInstructionFromGroupSize = function (bySize, size, ui_ops) {
        var ops = new this.ClassOperands(ui_ops, size);
        ops.normalizeExpressionToRelative();
        var matches = new d.DefMatchList;
        matches.matchAll(bySize[size], ops);
        if (!matches.list.length)
            throw Error('Could not match operands to instruction definition.');
        var iset = new i.InstructionSet(ops, matches);
        this.insert(iset);
        var insn = iset.pickShortestInstruction();
        if (insn) {
            this.insert(insn, iset.index);
            return insn;
        }
        else
            return iset;
    };
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
    return Code;
}(code_1.Code));
exports.Code = Code;
