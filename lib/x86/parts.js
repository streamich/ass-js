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
// # x86_64 Instruction
//
// Each CPU instruction is encoded in the following form, where only
// *Op-code* byte is required:
//
//     |-------------------------------------------------|--------------------------------------------|
//     |                  Instruction                    |               Next instruction             |
//     |-------------------------------------------------|--------------------------------------------|
//     |byte 1   |byte 2   |byte 3   |byte 4   |byte 5   |
//     |---------|---------|---------|---------|---------|                     ...
//     |REX      |Op-code  |Mod-R/M  |SIB      |Immediat |                     ...
//     |---------|---------|---------|---------|---------|                     ...
//     |optional |required |optional |optional |optional |
//     |-------------------------------------------------|
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
// Prefixes that consist of a single static byte.
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
    PrefixRep.supported = ['ins', 'lods', 'movs', 'outs', 'stos'];
    return PrefixRep;
}(PrefixStatic));
exports.PrefixRep = PrefixRep;
var PrefixRepe = (function (_super) {
    __extends(PrefixRepe, _super);
    function PrefixRepe() {
        return _super.call(this, PREFIX.REPE) || this;
    }
    // static supported = ['cmps', 'cmpsb', 'cmpbd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];
    PrefixRepe.supported = ['cmps', 'scas'];
    return PrefixRepe;
}(PrefixStatic));
exports.PrefixRepe = PrefixRepe;
var PrefixRepne = (function (_super) {
    __extends(PrefixRepne, _super);
    function PrefixRepne() {
        return _super.call(this, PREFIX.REPNE) || this;
    }
    // static supported = ['cmps', 'cmpsb', 'cmpsd', 'cmpsw', 'scas', 'scasb', 'scasd', 'scasw'];
    PrefixRepne.supported = ['cmps', 'scas'];
    return PrefixRepne;
}(PrefixStatic));
exports.PrefixRepne = PrefixRepne;
// Lock prefix for performing atomic memory operations.
var PrefixLock = (function (_super) {
    __extends(PrefixLock, _super);
    function PrefixLock() {
        return _super.call(this, PREFIX.LOCK) || this;
    }
    PrefixLock.supported = ['adc', 'add', 'and', 'btc', 'btr', 'bts', 'cmpxchg', 'cmpxchg8b', 'cmpxchg16b',
        'dec', 'inc', 'neg', 'not', 'or', 'sbb', 'sub', 'xadd', 'xchg', 'xor'];
    return PrefixLock;
}(PrefixStatic));
exports.PrefixLock = PrefixLock;
// ## REX
//
// REX is an optional prefix used for two reasons:
//
//  1. For 64-bit instructions that require this prefix to be used.
//  2. When using extended registers: r8, r9, r10, etc..; r8d, r9d, r10d, etc...
//
// REX byte layout:
//
//     76543210
//     .1..WRXB
//     .......B <--- R/M field in Mod-R/M byte, or BASE field in SIB byte addresses one of the extended registers.
//     ......X <---- INDEX field in SIB byte addresses one of the extended registers.
//     .....R <----- REG field in Mod-R/M byte addresses one of the extended registers.
//     ....W <------ Used instruction needs REX prefix.
//     .1 <--------- 0x40 identifies the REX prefix.
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
// ### 2-byte VEX:
// 76543210
// 11000100
//
// 76543210
// ||||||pp ---> pp
// |||||L -----> L
// |vvvv ------> vvvv
// R ----------> R
//
// ### 3-byte VEX:
// 76543210
// 11000101
//
// 76543210
// |||mmmmm ---> mmmmm
// ||B --------> B
// |X ---------> X
// R ----------> R
//
// 76543210
// ||||||pp ---> pp
// |||||L -----> L
// |vvvv ------> vvvv
// W ----------> W
var PrefixVex = (function (_super) {
    __extends(PrefixVex, _super);
    function PrefixVex(vexdef, R, X, B, vvvv) {
        if (R === void 0) { R = 1; }
        if (X === void 0) { X = 1; }
        if (B === void 0) { B = 1; }
        if (vvvv === void 0) { vvvv = 15; }
        var _this = _super.call(this) || this;
        _this.bytes = 2; // VEX can be either 2 or 3 bytes.
        // R, X, B, W and vvvv are inverted.
        _this.R = 1; // Must be 1, if not used, otherwise wrong instruction.
        _this.X = 1; // Must be 1, if not used, otherwise wrong instruction.
        _this.B = 1;
        _this.W = 1;
        _this.vvvv = 15; // must be 0b1111, if not used, otherwise CPU will #UD
        _this.mmmmm = 0;
        _this.L = 0;
        _this.pp = 0;
        _this.L = vexdef.L;
        _this.mmmmm = vexdef.mmmmm;
        _this.pp = vexdef.pp;
        _this.W = vexdef.W;
        if (vexdef.WIG)
            _this.W = 0; // When WIG "W ignored", set to "0" to make compatible with GAS.
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
            arr.push(197); // 0xC5
            arr.push((this.R << 7) | (this.vvvv << 3) | (this.L << 2) | this.pp);
        }
        else {
            arr.push(196); // 0xC4
            arr.push((this.R << 7) | (this.X << 6) | (this.B << 5) | this.mmmmm);
            arr.push((this.W << 7) | (this.vvvv << 3) | (this.L << 2) | this.pp);
        }
        return arr;
    };
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
    return PrefixVex;
}(Prefix));
exports.PrefixVex = PrefixVex;
// EVEX is 4 bytes:
// 62H
//
// 76543210
// ||||||mm ---> mm
// ||||00 -----> always 00
// |||~ -------> R-prime = Rp
// ||B --------> B
// |X ---------> X
// R ----------> R
//
// 76543210
// ||||||pp ---> pp
// |||||1 -----> always 1
// |vvvv-------> vvvv
// W ----------> W
//
// 76543210
// |||||aaa ---> aaa
// ||||~ ------> V-prime = Vp
// |||b -------> b
// |LL --------> LL
// z ----------> z
var PrefixEvex = (function (_super) {
    __extends(PrefixEvex, _super);
    function PrefixEvex(evexdef) {
        var _this = _super.call(this) || this;
        // VEX includes
        _this.R = 1; // VEX.R - Inverted
        _this.X = 1; // VEX.X - Inverted
        _this.B = 1; // VEX.B - Inverted
        _this.W = 1; // VEX.W - Inverted
        _this.vvvv = 15; // VEX.vvvv - Inverted
        _this.pp = 0; // VEX.pp
        _this.mm = 0; // Low 2 bits of VEX.mmmmm
        // New in EVEX
        _this.Rp = 1; // REX.R extension - Inverted
        _this.z = 0; // Zeroing/merging
        _this.LL = 0; // Like VEX.L but extended to 2 bits.
        _this.b = 0; // Broadcast/RC/SAE context
        _this.Vp = 1; // VEX.vvvv exntension - Inverted
        _this.aaa = 0; // Opmask register ID
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
// ## Op-code
//
// Primary op-code of the instruction. Often the lower 2 or 3 bits of the
// instruction op-code may be set independently.
//
// `d` and `s` bits, specify: d - direction of the instruction, and s - size of the instruction.
//  - **s**
//      - 1 -- word size
//      - 0 -- byte size
//  - **d**
//      - 1 -- register is destination
//      - 0 -- register is source
//
//     76543210
//     ......ds
//
// Lower 3 bits may also be used to encode register for some instructions. We set
// `.regInOp = true` if that is the case.
//
//     76543210
//     .....000 = RAX
var Opcode = (function (_super) {
    __extends(Opcode, _super);
    function Opcode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Main op-code value.
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
        // Op-code can be up to 3 bytes long.
        var op = this.op;
        if (op > 0xFFFF)
            arr.push((op & 0xFF0000) >> 16);
        if (op > 0xFF)
            arr.push((op & 0xFF00) >> 8);
        arr.push(op & 0xFF);
        return arr;
    };
    /* Now we support up to 3 byte instructions */
    Opcode.MASK_SIZE = 16777214; // `s` bit
    Opcode.MASK_DIRECTION = 16777213; // `d` bit
    Opcode.MASK_OP = 16777208; // When register is encoded into op-code.
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
// ## Mod-R/M
//
// Mod-R/M is an optional byte after the op-code that specifies the direction
// of operation or extends the op-code.
//
//     76543210
//     .....XXX <--- R/M field: Register or Memory
//     ..XXX <------ REG field: Register or op-code extension
//     XX <--------- MOD field: mode of operation
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
    // Two bits of `MOD` field in `Mod-R/M` byte.
    Modrm.MOD = {
        INDIRECT: 0,
        DISP8: 1,
        DISP32: 2,
        REG_TO_REG: 3,
    };
    Modrm.RM = {
        // When this value is encoded in R/M field, SIB byte has to follow Mod-R/M byte.
        NEEDS_SIB: regfile_1.R64.RSP & 7,
        // When this value is encoded in R/M field, and MOD is 0b00 = INDIRECT,
        // disp32 bytes have to follow Mod-R/M byte. But not in long-mode,
        // in long-mode it is used for RIP-relative adressing.
        INDIRECT_DISP: regfile_1.R64.RBP & 7,
    };
    return Modrm;
}(InstructionPart));
exports.Modrm = Modrm;
// ## SIB
//
// SIB (scale-index-base) is optional byte used when dereferencing memory
// with complex offset, like when you do:
//
//     mov rax, [rbp + rdx * 8]
//
// The above operation in SIB byte is encoded as follows:
//
//     rbp + rdx * 8 = BASE + INDEX * USERSCALE
//
// Where `USERSCALE` can only be 1, 2, 4 or 8; and is encoded as follows:
//
//     USERSCALE (decimal) | SCALE (binary)
//     ------------------- | --------------
//     1                   | 00
//     2                   | 01
//     4                   | 10
//     8                   | 11
//
// The layout of SIB byte:
//
//     76543210
//     .....XXX <--- BASE field: base register address
//     ..XXX <------ INDEX field: address of register used as scale
//     XX <--------- SCALE field: specifies multiple of INDEX: USERSCALE * INDEX
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
    // When index set to 0b100 it means INDEX = 0 and SCALE = 0.
    Sib.INDEX_NONE = regfile_1.R64.RSP & 7;
    // If Modrm.mod = 0b00, BASE = 0b101, means no BASE.
    // if Modrm.mod is 0b01 or 0b10, use RBP + disp8 or RBP + disp32, respectively.
    Sib.BASE_NONE = regfile_1.R64.RBP & 7;
    return Sib;
}(InstructionPart));
exports.Sib = Sib;
// ## Displacement
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
// ## Immediate
//
// Immediate constant value that follows other instruction bytes.
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
