"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('./util');
var instruction_1 = require('./instruction');
(function (SIZE) {
    SIZE[SIZE["ANY"] = -1] = "ANY";
    SIZE[SIZE["NONE"] = 0] = "NONE";
    SIZE[SIZE["B"] = 8] = "B";
    SIZE[SIZE["W"] = 16] = "W";
    SIZE[SIZE["D"] = 32] = "D";
    SIZE[SIZE["Q"] = 64] = "Q";
    SIZE[SIZE["T"] = 80] = "T";
    SIZE[SIZE["O"] = 128] = "O";
})(exports.SIZE || (exports.SIZE = {}));
var SIZE = exports.SIZE;
function isNumber64(num) {
    if ((num instanceof Array) && (num.length === 2) && (typeof num[0] === 'number') && (typeof num[1] === 'number'))
        return true;
    else
        return false;
}
exports.isNumber64 = isNumber64;
function isTnumber(num) {
    if (typeof num === 'number')
        return true;
    else
        return isNumber64(num);
}
exports.isTnumber = isTnumber;
// General operand used in our assembly "language".
var Operand = (function () {
    function Operand() {
        // Size in bits.
        this.size = SIZE.ANY;
    }
    // Convenience method to get `Register` associated with `Register` or `Memory`.
    Operand.prototype.reg = function () {
        return null;
    };
    Operand.prototype.isRegister = function () {
        return this instanceof Register;
    };
    Operand.prototype.isMemory = function () {
        return this instanceof Memory;
    };
    Operand.prototype.toNumber = function () {
        return 0;
    };
    Operand.prototype.toString = function () {
        return '[operand]';
    };
    return Operand;
}());
exports.Operand = Operand;
// ## Constant
//
// Constants are everything where we directly type in a `number` value.
var Constant = (function (_super) {
    __extends(Constant, _super);
    function Constant(value, signed) {
        if (value === void 0) { value = 0; }
        if (signed === void 0) { signed = true; }
        _super.call(this);
        this.value = 0;
        // Each byte as a `number` in reverse order.
        this.octets = [];
        this.signed = true;
        this.signed = signed;
        this.setValue(value);
    }
    Constant.sizeClass = function (value) {
        if ((value <= 0x7f) && (value >= -0x80))
            return SIZE.B;
        if ((value <= 0x7fff) && (value >= -0x8000))
            return SIZE.W;
        if ((value <= 0x7fffffff) && (value >= -0x80000000))
            return SIZE.D;
        return SIZE.Q;
    };
    Constant.sizeClassUnsigned = function (value) {
        if (value <= 0xff)
            return SIZE.B;
        if (value <= 0xffff)
            return SIZE.W;
        if (value <= 0xffffffff)
            return SIZE.D;
        return SIZE.Q;
    };
    Constant.prototype.setValue = function (value) {
        if (value instanceof Array) {
            if (value.length !== 2)
                throw TypeError('number64 must be a 2-tuple, given: ' + value);
            this.setValue64(value);
        }
        else if (typeof value === 'number') {
            var clazz = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
            /* JS integers are 53-bit, so split here `number`s over 32 bits into [number, number]. */
            if (clazz === SIZE.Q)
                this.setValue64([util_1.UInt64.lo(value), util_1.UInt64.hi(value)]);
            else
                this.setValue32(value);
        }
        else
            throw TypeError('Constant value must be of type number|number64.');
    };
    Constant.prototype.setValue32 = function (value) {
        var size = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        this.size = size;
        this.value = value;
        this.octets = [value & 0xFF];
        if (size > SIZE.B)
            this.octets[1] = (value >> 8) & 0xFF;
        if (size > SIZE.W) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    };
    Constant.prototype.setValue64 = function (value) {
        this.size = 64;
        this.value = value;
        this.octets = [];
        var lo = value[0], hi = value[1];
        this.octets[0] = (lo) & 0xFF;
        this.octets[1] = (lo >> 8) & 0xFF;
        this.octets[2] = (lo >> 16) & 0xFF;
        this.octets[3] = (lo >> 24) & 0xFF;
        this.octets[4] = (hi) & 0xFF;
        this.octets[5] = (hi >> 8) & 0xFF;
        this.octets[6] = (hi >> 16) & 0xFF;
        this.octets[7] = (hi >> 24) & 0xFF;
    };
    Constant.prototype.zeroExtend = function (size) {
        if (this.size === size)
            return;
        if (this.size > size)
            throw Error("Already larger than " + size + " bits, cannot zero-extend.");
        var missing_bytes = (size - this.size) / 8;
        this.size = size;
        for (var i = 0; i < missing_bytes; i++)
            this.octets.push(0);
    };
    Constant.prototype.signExtend = function (size) {
        if (this.size === size)
            return;
        if (this.size > size)
            throw Error("Already larger than " + size + " bits, cannot zero-extend.");
        // We know it is not number64, because we don't deal with number larger than 64-bit,
        // and if it was 64-bit already there would be nothing to extend.
        var value = this.value;
        if (size === SIZE.Q) {
            this.setValue64([util_1.UInt64.lo(value), util_1.UInt64.hi(value)]);
            return;
        }
        this.size = size;
        this.octets = [value & 0xFF];
        if (size > SIZE.B)
            this.octets[1] = (value >> 8) & 0xFF;
        if (size > SIZE.W) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    };
    Constant.prototype.extend = function (size) {
        if (this.signed)
            this.signExtend(size);
        else
            this.zeroExtend(size);
    };
    Constant.prototype.toString = function () {
        var str = '';
        for (var i = this.octets.length - 1; i >= 0; i--) {
            var oct = this.octets[i];
            str += oct > 0xF ? oct.toString(16).toUpperCase() : '0' + oct.toString(16).toUpperCase();
        }
        return '0x' + str;
    };
    return Constant;
}(Operand));
exports.Constant = Constant;
// Relative jump targets for jump instructions.
var Relative = (function (_super) {
    __extends(Relative, _super);
    function Relative(expr, offset) {
        _super.call(this);
        this.expr = expr;
        this.offset = offset;
    }
    Relative.prototype.cast = function (RelativeClass) {
        return new RelativeClass(this.expr, this.offset);
    };
    Relative.prototype.rebaseOffset = function (expr) {
        // if(expr.code !== this.expr.code)
        //     throw Error('Rebase from different code blocks not implemented yet.');
        if (expr.offset === -1)
            throw Error('Expression has no offset, cannot rebase.');
        return this.offset + this.expr.offset - expr.offset;
    };
    // Recalculate relative offset given a different Expression.
    Relative.prototype.rebase = function (expr) {
        return new Relative(expr, this.rebaseOffset(expr));
        // this.offset = this.rebaseOffset(expr);
        // this.expr = expr;
    };
    Relative.prototype.toNumber = function () {
        return this.offset;
    };
    Relative.prototype.toString = function () {
        if (this.expr instanceof instruction_1.Label) {
            var lbl = this.expr;
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return "<" + lbl.name + off + ">";
        }
        else if (this.expr.code) {
            var lbl = this.expr.code.getStartLabel();
            var expr = "+[" + this.expr.index + "]";
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return "<" + lbl.name + expr + off + ">";
        }
        else {
            var expr = "+[" + this.expr.index + "]";
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return "<" + expr + off + ">";
        }
    };
    return Relative;
}(Operand));
exports.Relative = Relative;
var Relative8 = (function (_super) {
    __extends(Relative8, _super);
    function Relative8() {
        _super.apply(this, arguments);
        this.size = SIZE.B;
    }
    return Relative8;
}(Relative));
exports.Relative8 = Relative8;
var Relative16 = (function (_super) {
    __extends(Relative16, _super);
    function Relative16() {
        _super.apply(this, arguments);
        this.size = SIZE.W;
    }
    return Relative16;
}(Relative));
exports.Relative16 = Relative16;
var Relative32 = (function (_super) {
    __extends(Relative32, _super);
    function Relative32() {
        _super.apply(this, arguments);
        this.size = SIZE.D;
    }
    return Relative32;
}(Relative));
exports.Relative32 = Relative32;
// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
var Register = (function (_super) {
    __extends(Register, _super);
    function Register(id, size) {
        _super.call(this);
        this.id = 0; // Number value of register.
        this.name = 'reg';
        this.id = id;
        this.size = size;
    }
    Register.prototype.reg = function () {
        return this;
    };
    Register.prototype.getName = function () {
        return this.name;
    };
    Register.prototype.toNumber = function () {
        return this.id;
    };
    Register.prototype.toString = function () {
        return this.name;
    };
    return Register;
}(Operand));
exports.Register = Register;
// ## Memory
//
// `Memory` is RAM addresses which `Register`s can *dereference*.
var Memory = (function (_super) {
    __extends(Memory, _super);
    function Memory() {
        _super.apply(this, arguments);
        this.base = null;
    }
    Memory.prototype.reg = function () {
        return this.base;
    };
    Memory.prototype.getAddressSize = function () {
        var reg = this.reg();
        if (reg)
            return reg.size;
        return SIZE.NONE;
    };
    Memory.prototype.getOperandSize = function () {
        return this.size;
    };
    Memory.prototype.ref = function (base) {
        this.base = base;
        return this;
    };
    Memory.prototype.toString = function () {
        return "[" + this.base.toString() + "]";
    };
    return Memory;
}(Operand));
exports.Memory = Memory;
// Collection of operands an `Expression` might have.
var Operands = (function () {
    function Operands(list, size) {
        if (list === void 0) { list = []; }
        if (size === void 0) { size = SIZE.ANY; }
        this.list = [];
        this.size = SIZE.ANY; // Size of each operand.
        this.size = size;
        this.list = list;
    }
    Operands.findSize = function (ops) {
        for (var _i = 0, ops_1 = ops; _i < ops_1.length; _i++) {
            var operand = ops_1[_i];
            if (operand instanceof Register)
                return operand.size;
        }
        return SIZE.NONE;
    };
    Operands.uiOpsNormalize = function (ops) {
        var i = require('./instruction');
        // Wrap `Expression` into `Relative`.
        for (var j = 0; j < ops.length; j++) {
            if (ops[j] instanceof instruction_1.Expression) {
                ops[j] = ops[j].rel();
            }
        }
        return ops;
    };
    Operands.prototype.clone = function () {
        return new Operands(this.list, this.size);
    };
    // Wrap `Expression` into `Relative`.
    Operands.prototype.normalizeExpressionToRelative = function () {
        var i = require('./instruction');
        var ops = this.list;
        for (var j = 0; j < ops.length; j++) {
            if (ops[j] instanceof i.Expression) {
                ops[j] = ops[j].rel();
            }
        }
    };
    Operands.prototype.validateSize = function () {
        // Verify operand sizes.
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            // We can determine operand size only by Register; Memory and Immediate and others don't tell us the right size.
            if (op instanceof Register) {
                if (this.size !== SIZE.ANY) {
                    if (this.size !== op.size)
                        throw TypeError('Operand size mismatch.');
                }
                else
                    this.setSize(op.size);
            }
        }
    };
    Operands.prototype.setSize = function (size) {
        if (this.size === SIZE.ANY)
            this.size = size;
        else
            throw TypeError('Operand size mismatch.');
    };
    Operands.prototype.getFirstOfClass = function (Clazz) {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof Clazz)
                return op;
        }
        return null;
    };
    Operands.prototype.getRegisterOperand = function () {
        return this.getFirstOfClass(Register);
    };
    Operands.prototype.getMemoryOperand = function () {
        return this.getFirstOfClass(Memory);
    };
    Operands.prototype.getRelative = function () {
        return this.getFirstOfClass(Relative);
    };
    Operands.prototype.getAddressSize = function () {
        var mem = this.getMemoryOperand();
        if (mem)
            return mem.size;
        else
            return SIZE.NONE;
    };
    Operands.prototype.hasRegister = function () {
        return !!this.getRegisterOperand();
    };
    Operands.prototype.hasMemory = function () {
        return !!this.getMemoryOperand();
    };
    Operands.prototype.hasRelative = function () {
        return !!this.getRelative();
    };
    Operands.prototype.hasRegisterOrMemory = function () {
        return this.hasRegister() || this.hasMemory();
    };
    Operands.prototype.toString = function () {
        return this.list.map(function (op) { return op.toString(); }).join(', ');
    };
    return Operands;
}());
exports.Operands = Operands;
var OperandsNormalized = (function (_super) {
    __extends(OperandsNormalized, _super);
    function OperandsNormalized() {
        _super.apply(this, arguments);
    }
    return OperandsNormalized;
}(Operands));
exports.OperandsNormalized = OperandsNormalized;
