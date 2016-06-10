"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var regfile_1 = require('./regfile');
var o = require('./operand');
var InstructionPart = (function () {
    function InstructionPart() {
    }
    return InstructionPart;
}());
exports.InstructionPart = InstructionPart;
var Prefix = (function (_super) {
    __extends(Prefix, _super);
    function Prefix() {
        _super.apply(this, arguments);
    }
    return Prefix;
}(InstructionPart));
exports.Prefix = Prefix;
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
})(exports.PREFIX || (exports.PREFIX = {}));
var PREFIX = exports.PREFIX;
var PrefixStatic = (function (_super) {
    __extends(PrefixStatic, _super);
    function PrefixStatic(value) {
        _super.call(this);
        this.value = value;
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
        _super.call(this, PREFIX.OS);
    }
    return PrefixOperandSizeOverride;
}(PrefixStatic));
exports.PrefixOperandSizeOverride = PrefixOperandSizeOverride;
var PrefixAddressSizeOverride = (function (_super) {
    __extends(PrefixAddressSizeOverride, _super);
    function PrefixAddressSizeOverride() {
        _super.call(this, PREFIX.AS);
    }
    return PrefixAddressSizeOverride;
}(PrefixStatic));
exports.PrefixAddressSizeOverride = PrefixAddressSizeOverride;
var PrefixRep = (function (_super) {
    __extends(PrefixRep, _super);
    function PrefixRep() {
        _super.call(this, PREFIX.REP);
    }
    PrefixRep.supported = ['ins', 'lods', 'movs', 'outs', 'stos'];
    return PrefixRep;
}(PrefixStatic));
exports.PrefixRep = PrefixRep;
var PrefixRepe = (function (_super) {
    __extends(PrefixRepe, _super);
    function PrefixRepe() {
        _super.call(this, PREFIX.REPE);
    }
    PrefixRepe.supported = ['cmps', 'cmpsb', 'cmpbd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];
    return PrefixRepe;
}(PrefixStatic));
exports.PrefixRepe = PrefixRepe;
var PrefixRepne = (function (_super) {
    __extends(PrefixRepne, _super);
    function PrefixRepne() {
        _super.call(this, PREFIX.REPNE);
    }
    PrefixRepne.supported = ['cmps', 'cmpsb', 'cmpsd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];
    return PrefixRepne;
}(PrefixStatic));
exports.PrefixRepne = PrefixRepne;
var PrefixLock = (function (_super) {
    __extends(PrefixLock, _super);
    function PrefixLock() {
        _super.call(this, PREFIX.LOCK);
    }
    PrefixLock.supported = ['adc', 'add', 'and', 'btc', 'btr', 'bts', 'cmpxchg', 'cmpxchg8b', 'cmpxchg16b',
        'dec', 'inc', 'neg', 'not', 'or', 'sbb', 'sub', 'xadd', 'xchg', 'xor'];
    return PrefixLock;
}(PrefixStatic));
exports.PrefixLock = PrefixLock;
var PrefixRex = (function (_super) {
    __extends(PrefixRex, _super);
    function PrefixRex(W, R, X, B) {
        _super.call(this);
        this.W = W;
        this.R = R;
        this.X = X;
        this.B = B;
    }
    PrefixRex.prototype.write = function (arr) {
        arr.push(PREFIX.REX | (this.W << 3) | (this.R << 2) | (this.X << 1) | this.B);
        return arr;
    };
    return PrefixRex;
}(Prefix));
exports.PrefixRex = PrefixRex;
var Opcode = (function (_super) {
    __extends(Opcode, _super);
    function Opcode() {
        _super.apply(this, arguments);
        this.op = 0;
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
    return Opcode;
}(InstructionPart));
exports.Opcode = Opcode;
var Modrm = (function (_super) {
    __extends(Modrm, _super);
    function Modrm(mod, reg, rm) {
        _super.call(this);
        this.mod = 0;
        this.reg = 0;
        this.rm = 0;
        this.mod = mod;
        this.reg = reg;
        this.rm = rm;
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
    return Modrm;
}(InstructionPart));
exports.Modrm = Modrm;
var Sib = (function (_super) {
    __extends(Sib, _super);
    function Sib(scalefactor, I, B) {
        _super.call(this);
        this.S = 0;
        this.I = 0;
        this.B = 0;
        this.setScale(scalefactor);
        this.I = I;
        this.B = B;
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
    Sib.INDEX_NONE = regfile_1.R64.RSP & 7;
    Sib.BASE_NONE = regfile_1.R64.RBP & 7;
    return Sib;
}(InstructionPart));
exports.Sib = Sib;
var Displacement = (function (_super) {
    __extends(Displacement, _super);
    function Displacement(value) {
        _super.call(this);
        this.value = value;
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
        _super.call(this);
        this.value = value;
    }
    Immediate.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        this.value.octets.forEach(function (octet) { arr.push(octet); });
        return arr;
    };
    return Immediate;
}(InstructionPart));
exports.Immediate = Immediate;
