"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var regfile_1 = require('./regfile');
var o = require('./operand');
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
        _super.apply(this, arguments);
    }
    return Prefix;
}(InstructionPart));
exports.Prefix = Prefix;
(function (PREFIX) {
    PREFIX[PREFIX["LOCK"] = 240] = "LOCK";
    PREFIX[PREFIX["REPNE"] = 242] = "REPNE";
    PREFIX[PREFIX["REP"] = 243] = "REP";
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
// Prefixes that consist of a single static byte.
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
// Lock prefix for performing atomic memory operations.
var PrefixLock = (function (_super) {
    __extends(PrefixLock, _super);
    function PrefixLock() {
        _super.call(this, PREFIX.LOCK);
    }
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
        _super.call(this);
        this.W = W;
        this.R = R;
        this.X = X;
        this.B = B;
    }
    PrefixRex.prototype.write = function (arr) {
        if (this.W || this.R || this.X || this.B)
            arr.push(PREFIX.REX | (this.W << 3) | (this.R << 2) | (this.X << 1) | this.B);
        return arr;
    };
    return PrefixRex;
}(Prefix));
exports.PrefixRex = PrefixRex;
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
        _super.apply(this, arguments);
        // Main op-code value.
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
// ## Immediate
//
// Immediate constant value that follows other instruction bytes.
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
