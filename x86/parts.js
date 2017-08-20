"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var regfile_1 = require("./regfile");
var o = require("./operand");
var InstructionPart = (function () {
    function InstructionPart() {
    }
    return InstructionPart;
}());
exports.InstructionPart = InstructionPart;
var Prefix = (function (_super) {
    __extends(Prefix, _super);
    function Prefix() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Prefix;
}(InstructionPart));
exports.Prefix = Prefix;
var PREFIX;
(function (PREFIX) {
    PREFIX[PREFIX["LOCK"] = 240] = "LOCK";
    PREFIX[PREFIX["REP"] = 243] = "REP";
    PREFIX[PREFIX["REPE"] = 243] = "REPE";
    PREFIX[PREFIX["REPNE"] = 242] = "REPNE";
    PREFIX[PREFIX["CS"] = 46] = "CS";
    PREFIX[PREFIX["SS"] = 54] = "SS";
    PREFIX[PREFIX["DS"] = 62] = "DS";
    PREFIX[PREFIX["ES"] = 38] = "ES";
    PREFIX[PREFIX["FS"] = 100] = "FS";
    PREFIX[PREFIX["GS"] = 101] = "GS";
    PREFIX[PREFIX["REX"] = 64] = "REX";
    PREFIX[PREFIX["BNT"] = 46] = "BNT";
    PREFIX[PREFIX["BT"] = 62] = "BT";
    PREFIX[PREFIX["OS"] = 102] = "OS";
    PREFIX[PREFIX["AS"] = 103] = "AS";
})(PREFIX = exports.PREFIX || (exports.PREFIX = {}));
var PrefixStatic = (function (_super) {
    __extends(PrefixStatic, _super);
    function PrefixStatic(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    PrefixStatic.prototype.write = function (arr) {
        arr.push(this.value);
        return arr;
    };
    PrefixStatic.prototype.toString = function () {
        return PREFIX[this.value].toLowerCase();
    };
    return PrefixStatic;
}(Prefix));
exports.PrefixStatic = PrefixStatic;
var PrefixOperandSizeOverride = (function (_super) {
    __extends(PrefixOperandSizeOverride, _super);
    function PrefixOperandSizeOverride() {
        return _super.call(this, PREFIX.OS) || this;
    }
    return PrefixOperandSizeOverride;
}(PrefixStatic));
exports.PrefixOperandSizeOverride = PrefixOperandSizeOverride;
var PrefixAddressSizeOverride = (function (_super) {
    __extends(PrefixAddressSizeOverride, _super);
    function PrefixAddressSizeOverride() {
        return _super.call(this, PREFIX.AS) || this;
    }
    return PrefixAddressSizeOverride;
}(PrefixStatic));
exports.PrefixAddressSizeOverride = PrefixAddressSizeOverride;
var PrefixRep = (function (_super) {
    __extends(PrefixRep, _super);
    function PrefixRep() {
        return _super.call(this, PREFIX.REP) || this;
    }
    return PrefixRep;
}(PrefixStatic));
PrefixRep.supported = ['ins', 'lods', 'movs', 'outs', 'stos'];
exports.PrefixRep = PrefixRep;
var PrefixRepe = (function (_super) {
    __extends(PrefixRepe, _super);
    function PrefixRepe() {
        return _super.call(this, PREFIX.REPE) || this;
    }
    return PrefixRepe;
}(PrefixStatic));
PrefixRepe.supported = ['cmps', 'scas'];
exports.PrefixRepe = PrefixRepe;
var PrefixRepne = (function (_super) {
    __extends(PrefixRepne, _super);
    function PrefixRepne() {
        return _super.call(this, PREFIX.REPNE) || this;
    }
    return PrefixRepne;
}(PrefixStatic));
PrefixRepne.supported = ['cmps', 'scas'];
exports.PrefixRepne = PrefixRepne;
var PrefixLock = (function (_super) {
    __extends(PrefixLock, _super);
    function PrefixLock() {
        return _super.call(this, PREFIX.LOCK) || this;
    }
    return PrefixLock;
}(PrefixStatic));
PrefixLock.supported = ['adc', 'add', 'and', 'btc', 'btr', 'bts', 'cmpxchg', 'cmpxchg8b', 'cmpxchg16b',
    'dec', 'inc', 'neg', 'not', 'or', 'sbb', 'sub', 'xadd', 'xchg', 'xor'];
exports.PrefixLock = PrefixLock;
var PrefixRex = (function (_super) {
    __extends(PrefixRex, _super);
    function PrefixRex(W, R, X, B) {
        var _this = _super.call(this) || this;
        _this.W = W;
        _this.R = R;
        _this.X = X;
        _this.B = B;
        return _this;
    }
    PrefixRex.prototype.write = function (arr) {
        arr.push(PREFIX.REX | (this.W << 3) | (this.R << 2) | (this.X << 1) | this.B);
        return arr;
    };
    return PrefixRex;
}(Prefix));
exports.PrefixRex = PrefixRex;
var PrefixVex = (function (_super) {
    __extends(PrefixVex, _super);
    function PrefixVex(vexdef, R, X, B, vvvv) {
        if (R === void 0) { R = 1; }
        if (X === void 0) { X = 1; }
        if (B === void 0) { B = 1; }
        if (vvvv === void 0) { vvvv = 15; }
        var _this = _super.call(this) || this;
        _this.bytes = 2;
        _this.R = 1;
        _this.X = 1;
        _this.B = 1;
        _this.W = 1;
        _this.vvvv = 15;
        _this.mmmmm = 0;
        _this.L = 0;
        _this.pp = 0;
        _this.L = vexdef.L;
        _this.mmmmm = vexdef.mmmmm;
        _this.pp = vexdef.pp;
        _this.W = vexdef.W;
        if (vexdef.WIG)
            _this.W = 0;
        _this.R = R;
        _this.X = X;
        _this.B = B;
        _this.vvvv = vvvv;
        if ((_this.X === 0) || (_this.B === 0) ||
            ((_this.W === 0) && !vexdef.WIG) ||
            (_this.mmmmm === PrefixVex.MMMMM.x0F3A) || (_this.mmmmm === PrefixVex.MMMMM.x0F38))
            _this.promoteTo3bytes();
        return _this;
    }
    PrefixVex.prototype.promoteTo3bytes = function () {
        this.bytes = 3;
    };
    PrefixVex.prototype.write = function (arr) {
        if (this.bytes === 2) {
            arr.push(197);
            arr.push((this.R << 7) | (this.vvvv << 3) | (this.L << 2) | this.pp);
        }
        else {
            arr.push(196);
            arr.push((this.R << 7) | (this.X << 6) | (this.B << 5) | this.mmmmm);
            arr.push((this.W << 7) | (this.vvvv << 3) | (this.L << 2) | this.pp);
        }
        return arr;
    };
    return PrefixVex;
}(Prefix));
PrefixVex.PP = {
    x66: 1,
    xF2: 3,
    xF3: 2,
};
PrefixVex.MMMMM = {
    x0F38: 2,
    x0F3A: 3,
    x0F: 1,
};
exports.PrefixVex = PrefixVex;
var PrefixEvex = (function (_super) {
    __extends(PrefixEvex, _super);
    function PrefixEvex(evexdef) {
        var _this = _super.call(this) || this;
        _this.R = 1;
        _this.X = 1;
        _this.B = 1;
        _this.W = 1;
        _this.vvvv = 15;
        _this.pp = 0;
        _this.mm = 0;
        _this.Rp = 1;
        _this.z = 0;
        _this.LL = 0;
        _this.b = 0;
        _this.Vp = 1;
        _this.aaa = 0;
        _this.LL = evexdef.L;
        _this.mm = evexdef.mmmmm & 3;
        _this.pp = evexdef.pp;
        _this.W = evexdef.W;
        return _this;
    }
    PrefixEvex.prototype.write = function (arr) {
        arr.push(0x62);
        arr.push((this.R << 7) | (this.X << 6) | (this.B << 5) | (this.Rp << 4) | this.mm);
        arr.push((this.W << 7) | (this.vvvv << 3) | 4 | this.pp);
        arr.push((this.z << 7) | (this.LL << 5) | (this.b << 4) | (this.Vp << 3) | this.aaa);
        return arr;
    };
    return PrefixEvex;
}(Prefix));
exports.PrefixEvex = PrefixEvex;
var Opcode = (function (_super) {
    __extends(Opcode, _super);
    function Opcode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.op = 0;
        return _this;
    }
    Opcode.prototype.bytes = function () {
        if (this.op > 0xFFFF)
            return 3;
        if (this.op > 0xFF)
            return 2;
        return 1;
    };
    Opcode.prototype.write = function (arr) {
        var op = this.op;
        if (op > 0xFFFF)
            arr.push((op & 0xFF0000) >> 16);
        if (op > 0xFF)
            arr.push((op & 0xFF00) >> 8);
        arr.push(op & 0xFF);
        return arr;
    };
    return Opcode;
}(InstructionPart));
Opcode.MASK_SIZE = 16777214;
Opcode.MASK_DIRECTION = 16777213;
Opcode.MASK_OP = 16777208;
Opcode.SIZE = {
    BYTE: 0,
    WORD_OR_DOUBLE: 1,
};
Opcode.DIRECTION = {
    REG_IS_SRC: 0,
    REG_IS_DST: 2,
};
exports.Opcode = Opcode;
var Modrm = (function (_super) {
    __extends(Modrm, _super);
    function Modrm(mod, reg, rm) {
        var _this = _super.call(this) || this;
        _this.mod = 0;
        _this.reg = 0;
        _this.rm = 0;
        _this.mod = mod;
        _this.reg = reg;
        _this.rm = rm;
        return _this;
    }
    Modrm.getModDispSize = function (mem) {
        if (!mem.displacement || !mem.base)
            return Modrm.MOD.INDIRECT;
        else if (mem.displacement.size === o.DisplacementValue.SIZE.DISP8)
            return Modrm.MOD.DISP8;
        else if (mem.displacement.size <= o.DisplacementValue.SIZE.DISP32)
            return Modrm.MOD.DISP32;
        else
            throw Error('64-bit displacement not supported yet.');
    };
    Modrm.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        arr.push((this.mod << 6) | (this.reg << 3) | this.rm);
        return arr;
    };
    return Modrm;
}(InstructionPart));
Modrm.MOD = {
    INDIRECT: 0,
    DISP8: 1,
    DISP32: 2,
    REG_TO_REG: 3,
};
Modrm.RM = {
    NEEDS_SIB: regfile_1.R64.RSP & 7,
    INDIRECT_DISP: regfile_1.R64.RBP & 7,
};
exports.Modrm = Modrm;
var Sib = (function (_super) {
    __extends(Sib, _super);
    function Sib(scalefactor, I, B) {
        var _this = _super.call(this) || this;
        _this.S = 0;
        _this.I = 0;
        _this.B = 0;
        _this.setScale(scalefactor);
        _this.I = I;
        _this.B = B;
        return _this;
    }
    Sib.prototype.setScale = function (scalefactor) {
        switch (scalefactor) {
            case 1:
                this.S = 0;
                break;
            case 2:
                this.S = 1;
                break;
            case 4:
                this.S = 2;
                break;
            case 8:
                this.S = 3;
                break;
            default: this.S = 0;
        }
    };
    Sib.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        arr.push((this.S << 6) | (this.I << 3) | this.B);
        return arr;
    };
    return Sib;
}(InstructionPart));
Sib.INDEX_NONE = regfile_1.R64.RSP & 7;
Sib.BASE_NONE = regfile_1.R64.RBP & 7;
exports.Sib = Sib;
var Displacement = (function (_super) {
    __extends(Displacement, _super);
    function Displacement(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    Displacement.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        this.value.octets.forEach(function (octet) { arr.push(octet); });
        return arr;
    };
    return Displacement;
}(InstructionPart));
exports.Displacement = Displacement;
var Immediate = (function (_super) {
    __extends(Immediate, _super);
    function Immediate(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    Immediate.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        this.value.octets.forEach(function (octet) { arr.push(octet); });
        return arr;
    };
    return Immediate;
}(InstructionPart));
exports.Immediate = Immediate;
