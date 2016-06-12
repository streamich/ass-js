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
    SIZE[SIZE["H"] = 256] = "H";
    SIZE[SIZE["I"] = 512] = "I";
    SIZE[SIZE["X"] = 128] = "X";
    SIZE[SIZE["Y"] = 256] = "Y";
    SIZE[SIZE["Z"] = 256] = "Z";
    SIZE[SIZE["A"] = 1024] = "A";
})(exports.SIZE || (exports.SIZE = {}));
var SIZE = exports.SIZE;
(function (SIZEB) {
    SIZEB[SIZEB["B1"] = 8] = "B1";
    SIZEB[SIZEB["B2"] = 16] = "B2";
    SIZEB[SIZEB["B4"] = 32] = "B4";
    SIZEB[SIZEB["B8"] = 64] = "B8";
    SIZEB[SIZEB["B16"] = 128] = "B16";
    SIZEB[SIZEB["B32"] = 256] = "B32";
    SIZEB[SIZEB["B64"] = 512] = "B64";
})(exports.SIZEB || (exports.SIZEB = {}));
var SIZEB = exports.SIZEB;
function isNumber64(num) {
    if ((num instanceof Array) && (num.length === 2) && (typeof num[0] === 'number') && (typeof num[1] === 'number'))
        return true;
    else
        return false;
}
exports.isNumber64 = isNumber64;
function isNumber128(num) {
    if ((num instanceof Array) && (num.length === 4) &&
        (typeof num[0] === 'number') && (typeof num[1] === 'number') &&
        (typeof num[1] === 'number') && (typeof num[2] === 'number'))
        return true;
    else
        return false;
}
exports.isNumber128 = isNumber128;
function isNumberOfDoubles(doubles, num) {
    if (!(num instanceof Array) || (num.length !== doubles))
        return false;
    for (var j = 0; j < doubles; j++)
        if (typeof num[j] !== 'number')
            return false;
    return true;
}
function isNumber256(num) { return isNumberOfDoubles(8, num); }
exports.isNumber256 = isNumber256;
function isNumber512(num) { return isNumberOfDoubles(16, num); }
exports.isNumber512 = isNumber512;
function isNumber1024(num) { return isNumberOfDoubles(32, num); }
exports.isNumber1024 = isNumber1024;
function isNumber2048(num) { return isNumberOfDoubles(64, num); }
exports.isNumber2048 = isNumber2048;
function isTnumber(num) {
    if (typeof num === 'number')
        return true;
    else if (isNumber64(num))
        return true;
    else if (isNumber128(num))
        return true;
    else if (isNumber256(num))
        return true;
    else if (isNumber512(num))
        return true;
    else if (isNumber1024(num))
        return true;
    else
        return isNumber2048(num);
}
exports.isTnumber = isTnumber;
var Operand = (function () {
    function Operand() {
        this.size = SIZE.ANY;
    }
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
var Constant = (function (_super) {
    __extends(Constant, _super);
    function Constant(value, signed) {
        if (value === void 0) { value = 0; }
        if (signed === void 0) { signed = true; }
        _super.call(this);
        this.value = 0;
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
        if (isNumber64(value)) {
            this.setValue64(value);
        }
        else if (typeof value === 'number') {
            var clazz = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
            if (clazz === SIZE.Q)
                this.setValue64([util_1.UInt64.lo(value), util_1.UInt64.hi(value)]);
            else
                this.setValue32(value);
        }
        else
            throw TypeError('Constant value must be of type Tnumber.');
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
        this.size = SIZE.Q;
        this.value = value;
        var lo = value[0], hi = value[1];
        this.octets = [
            (lo) & 0xFF,
            (lo >> 8) & 0xFF,
            (lo >> 16) & 0xFF,
            (lo >> 24) & 0xFF,
            (hi) & 0xFF,
            (hi >> 8) & 0xFF,
            (hi >> 16) & 0xFF,
            (hi >> 24) & 0xFF,
        ];
    };
    Constant.prototype.setValue128 = function (value) {
        this.size = SIZE.O;
        this.value = value;
        var b0 = value[0], b1 = value[1], b2 = value[2], b3 = value[3];
        this.octets = [
            (b0) & 0xFF,
            (b0 >> 8) & 0xFF,
            (b0 >> 16) & 0xFF,
            (b0 >> 24) & 0xFF,
            (b1) & 0xFF,
            (b1 >> 8) & 0xFF,
            (b1 >> 16) & 0xFF,
            (b1 >> 24) & 0xFF,
            (b2) & 0xFF,
            (b2 >> 8) & 0xFF,
            (b2 >> 16) & 0xFF,
            (b2 >> 24) & 0xFF,
            (b3) & 0xFF,
            (b3 >> 8) & 0xFF,
            (b3 >> 16) & 0xFF,
            (b3 >> 24) & 0xFF,
        ];
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
    Constant.prototype.fitsSize = function (num) {
        var size = this.signed ? Constant.sizeClass(num) : Constant.sizeClassUnsigned(num);
        return size <= this.size;
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
var Immediate = (function (_super) {
    __extends(Immediate, _super);
    function Immediate() {
        _super.apply(this, arguments);
        this.variable = null;
    }
    Immediate.factory = function (size, value, signed) {
        if (value === void 0) { value = 0; }
        if (signed === void 0) { signed = true; }
        switch (size) {
            case SIZE.B: return new Immediate8(value, signed);
            case SIZE.W: return new Immediate16(value, signed);
            case SIZE.D: return new Immediate32(value, signed);
            case SIZE.Q: return new Immediate64(value, signed);
            default: return new Immediate(value, signed);
        }
    };
    Immediate.isImmediateClass = function (Clazz) {
        return Clazz.name.indexOf('Immediate') === 0;
    };
    Immediate.throwIfLarger = function (value, size, signed) {
        var val_size = signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        if (val_size > size)
            throw TypeError("Value " + value + " too big for imm8.");
    };
    Immediate.prototype.setVariable = function (variable) {
        this.variable = variable;
    };
    Immediate.prototype.cast = function (ImmediateClass) {
        return new ImmediateClass(this.value);
    };
    Immediate.prototype.toString = function () {
        if (this.variable)
            return this.variable.toString();
        else
            return _super.prototype.toString.call(this);
    };
    return Immediate;
}(Constant));
exports.Immediate = Immediate;
var ImmediateUnsigned = (function (_super) {
    __extends(ImmediateUnsigned, _super);
    function ImmediateUnsigned(value) {
        if (value === void 0) { value = 0; }
        _super.call(this, value, false);
    }
    return ImmediateUnsigned;
}(Immediate));
exports.ImmediateUnsigned = ImmediateUnsigned;
var Immediate8 = (function (_super) {
    __extends(Immediate8, _super);
    function Immediate8() {
        _super.apply(this, arguments);
    }
    Immediate8.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.B, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.B);
    };
    return Immediate8;
}(Immediate));
exports.Immediate8 = Immediate8;
var ImmediateUnsigned8 = (function (_super) {
    __extends(ImmediateUnsigned8, _super);
    function ImmediateUnsigned8(value) {
        if (value === void 0) { value = 0; }
        _super.call(this, value, false);
    }
    return ImmediateUnsigned8;
}(Immediate8));
exports.ImmediateUnsigned8 = ImmediateUnsigned8;
var Immediate16 = (function (_super) {
    __extends(Immediate16, _super);
    function Immediate16() {
        _super.apply(this, arguments);
    }
    Immediate16.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.W, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.W);
    };
    return Immediate16;
}(Immediate));
exports.Immediate16 = Immediate16;
var ImmediateUnsigned16 = (function (_super) {
    __extends(ImmediateUnsigned16, _super);
    function ImmediateUnsigned16(value) {
        if (value === void 0) { value = 0; }
        _super.call(this, value, false);
    }
    return ImmediateUnsigned16;
}(Immediate16));
exports.ImmediateUnsigned16 = ImmediateUnsigned16;
var Immediate32 = (function (_super) {
    __extends(Immediate32, _super);
    function Immediate32() {
        _super.apply(this, arguments);
    }
    Immediate32.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.D, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.D);
    };
    return Immediate32;
}(Immediate));
exports.Immediate32 = Immediate32;
var ImmediateUnsigned32 = (function (_super) {
    __extends(ImmediateUnsigned32, _super);
    function ImmediateUnsigned32(value) {
        if (value === void 0) { value = 0; }
        _super.call(this, value, false);
    }
    return ImmediateUnsigned32;
}(Immediate32));
exports.ImmediateUnsigned32 = ImmediateUnsigned32;
var Immediate64 = (function (_super) {
    __extends(Immediate64, _super);
    function Immediate64() {
        _super.apply(this, arguments);
    }
    Immediate64.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.Q, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.Q);
    };
    return Immediate64;
}(Immediate));
exports.Immediate64 = Immediate64;
var ImmediateUnsigned64 = (function (_super) {
    __extends(ImmediateUnsigned64, _super);
    function ImmediateUnsigned64(value) {
        if (value === void 0) { value = 0; }
        _super.call(this, value, false);
    }
    return ImmediateUnsigned64;
}(Immediate64));
exports.ImmediateUnsigned64 = ImmediateUnsigned64;
var Register = (function (_super) {
    __extends(Register, _super);
    function Register(id, size) {
        _super.call(this);
        this.id = 0;
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
    Register.prototype.idSize = function () {
        if (this.id < 8)
            return 3;
        if (this.id < 16)
            return 4;
        if (this.id < 32)
            return 5;
        throw Error('Register ID too big.');
    };
    Register.prototype.get3bitId = function () {
        return this.id & 7;
    };
    Register.prototype.get4bitId = function () {
        return this.id & 15;
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
var Variable = (function (_super) {
    __extends(Variable, _super);
    function Variable() {
        _super.apply(this, arguments);
        this.result = null;
    }
    Variable.prototype.canEvaluate = function (owner) {
        return true;
    };
    Variable.prototype.evaluate = function (owner) {
        return 0;
    };
    Variable.prototype.evaluatePreliminary = function (owner) {
        return 0;
    };
    return Variable;
}(Operand));
exports.Variable = Variable;
function isTvariable(val) {
    if (val instanceof Variable)
        return true;
    else
        return isTnumber(val);
}
exports.isTvariable = isTvariable;
var Relative = (function (_super) {
    __extends(Relative, _super);
    function Relative(target, offset) {
        if (offset === void 0) { offset = 0; }
        _super.call(this);
        this.signed = true;
        this.target = target;
        this.offset = offset;
    }
    Relative.fromExpression = function (expr) {
        return new Relative(expr);
    };
    Relative.prototype.canEvaluate = function (owner) {
        if (!owner || (owner.offset === -1))
            return false;
        if (this.target.offset === -1)
            return false;
        return true;
    };
    Relative.prototype.evaluate = function (owner) {
        return this.result = this.rebaseOffset(owner) - owner.bytes();
    };
    Relative.prototype.evaluatePreliminary = function (owner) {
        return this.offset + this.target.offsetMax - owner.offsetMax;
    };
    Relative.prototype.canHoldMaxOffset = function (owner) {
        var value = this.evaluatePreliminary(owner);
        var size = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        return size <= this.size;
    };
    Relative.prototype.clone = function () {
        return new Relative(this.target, this.offset);
    };
    Relative.prototype.cast = function (RelativeClass) {
        this.size = RelativeClass.size;
        return this;
    };
    Relative.prototype.rebaseOffset = function (new_target) {
        if (new_target.offset === -1)
            throw Error('Expression has no offset, cannot rebase.');
        return this.offset + this.target.offset - new_target.offset;
    };
    Relative.prototype.rebase = function (target) {
        this.offset = this.rebaseOffset(target);
        this.target = target;
    };
    Relative.prototype.toNumber = function () {
        return this.offset;
    };
    Relative.prototype.toString = function () {
        var result = '';
        if (this.result !== null) {
            result = ' = ' + this.result;
        }
        if (this.target instanceof instruction_1.Label) {
            var lbl = this.target;
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return "<" + lbl.getName() + off + result + ">";
        }
        else if (this.target.code) {
            var lbl = this.target.code.getStartLabel();
            var expr = "+[" + this.target.index + "]";
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return "<" + lbl.getName() + expr + off + result + ">";
        }
        else {
            var expr = "+[" + this.target.index + "]";
            var off = this.offset ? '+' + (new Constant(this.offset)).toString() : '';
            return "<" + expr + off + result + ">";
        }
    };
    Relative.size = SIZE.ANY;
    return Relative;
}(Variable));
exports.Relative = Relative;
var Relative8 = (function (_super) {
    __extends(Relative8, _super);
    function Relative8() {
        _super.apply(this, arguments);
    }
    Relative8.size = SIZE.B;
    return Relative8;
}(Relative));
exports.Relative8 = Relative8;
var Relative16 = (function (_super) {
    __extends(Relative16, _super);
    function Relative16() {
        _super.apply(this, arguments);
    }
    Relative16.size = SIZE.W;
    return Relative16;
}(Relative));
exports.Relative16 = Relative16;
var Relative32 = (function (_super) {
    __extends(Relative32, _super);
    function Relative32() {
        _super.apply(this, arguments);
    }
    Relative32.size = SIZE.D;
    return Relative32;
}(Relative));
exports.Relative32 = Relative32;
var Symbol = (function (_super) {
    __extends(Symbol, _super);
    function Symbol(target, offset, name) {
        if (offset === void 0) { offset = 0; }
        _super.call(this, target, offset);
        this.name = name ? name : 'symbol_' + (Symbol.cnt++);
    }
    Symbol.cnt = 0;
    return Symbol;
}(Relative));
exports.Symbol = Symbol;
var Operands = (function () {
    function Operands(list, size) {
        if (list === void 0) { list = []; }
        if (size === void 0) { size = SIZE.ANY; }
        this.list = [];
        this.size = SIZE.ANY;
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
        for (var j = 0; j < ops.length; j++) {
            if (ops[j] instanceof instruction_1.Expression) {
                ops[j] = ops[j].rel();
            }
        }
        return ops;
    };
    Operands.prototype.clone = function (Clazz) {
        if (Clazz === void 0) { Clazz = Operands; }
        var list = [];
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            list.push(op);
        }
        return new Clazz(list, this.size);
    };
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
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof Register) {
                if (this.size !== SIZE.ANY) {
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
    Operands.prototype.getFirstOfClass = function (Clazz, skip) {
        if (skip === void 0) { skip = 0; }
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof Clazz) {
                if (!skip)
                    return op;
                else
                    skip--;
            }
        }
        return null;
    };
    Operands.prototype.getRegisterOperand = function (skip) {
        if (skip === void 0) { skip = 0; }
        return this.getFirstOfClass(Register, skip);
    };
    Operands.prototype.getMemoryOperand = function (skip) {
        if (skip === void 0) { skip = 0; }
        return this.getFirstOfClass(Memory, skip);
    };
    Operands.prototype.getVariable = function (skip) {
        if (skip === void 0) { skip = 0; }
        return this.getFirstOfClass(Variable, skip);
    };
    Operands.prototype.getRelative = function (skip) {
        if (skip === void 0) { skip = 0; }
        return this.getFirstOfClass(Relative, skip);
    };
    Operands.prototype.getImmediate = function (skip) {
        if (skip === void 0) { skip = 0; }
        return this.getFirstOfClass(Immediate, skip);
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
    Operands.prototype.hasVariable = function () {
        return !!this.getMemoryOperand();
    };
    Operands.prototype.hasRelative = function () {
        return !!this.getRelative();
    };
    Operands.prototype.hasRegisterOrMemory = function () {
        return this.hasRegister() || this.hasMemory();
    };
    Operands.prototype.canEvaluate = function (owner) {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof Variable)
                if (!op.canEvaluate(owner))
                    return false;
        }
        return true;
    };
    Operands.prototype.evaluate = function (owner) {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof Variable)
                op.evaluate(owner);
        }
    };
    Operands.prototype.toString = function () {
        return this.list.map(function (op) { return op.toString(); }).join(', ');
    };
    return Operands;
}());
exports.Operands = Operands;
