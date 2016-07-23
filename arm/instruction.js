"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (COND) {
    COND[COND["EQ"] = 0] = "EQ";
    COND[COND["NE"] = 1] = "NE";
    COND[COND["HS"] = 2] = "HS";
    COND[COND["LO"] = 3] = "LO";
    COND[COND["MI"] = 4] = "MI";
    COND[COND["PL"] = 5] = "PL";
    COND[COND["VS"] = 6] = "VS";
    COND[COND["VC"] = 7] = "VC";
    COND[COND["HI"] = 8] = "HI";
    COND[COND["LS"] = 9] = "LS";
    COND[COND["GE"] = 10] = "GE";
    COND[COND["LT"] = 11] = "LT";
    COND[COND["GT"] = 12] = "GT";
    COND[COND["LE"] = 13] = "LE";
    COND[COND["AL"] = 14] = "AL";
    COND[COND["NV"] = 15] = "NV";
})(exports.COND || (exports.COND = {}));
var COND = exports.COND;
var Instruction = (function () {
    function Instruction() {
        //      3322222222221111111111
        //      10987654321098765432109876543210
        this.tpl = 0;
        //      ||||||||||||||||||||||||||||||||
        //      ||||||IPUBWS
        //      |||||| L UAL
        //      ||||||   N
        //      ||||00
        //      XXXX ---> Condition
        this.cond = COND.AL;
        this.A = 0;
        this.I = 0;
        this.P = 0;
        this.U = 0;
        this.N = 0;
        this.B = 0;
        this.W = 0;
        this.S = 0;
        this.L = 0;
    }
    return Instruction;
}());
exports.Instruction = Instruction;
var InstructionDataProcessing = (function (_super) {
    __extends(InstructionDataProcessing, _super);
    function InstructionDataProcessing() {
        _super.apply(this, arguments);
        this.tpl = 0;
    }
    return InstructionDataProcessing;
}(Instruction));
exports.InstructionDataProcessing = InstructionDataProcessing;
var InstructionDataMultiply = (function (_super) {
    __extends(InstructionDataMultiply, _super);
    function InstructionDataMultiply() {
        _super.apply(this, arguments);
        this.tpl = 0;
    }
    return InstructionDataMultiply;
}(Instruction));
exports.InstructionDataMultiply = InstructionDataMultiply;
var InstructionLongMultiply = (function (_super) {
    __extends(InstructionLongMultiply, _super);
    function InstructionLongMultiply() {
        _super.apply(this, arguments);
        //      3322222222221111111111
        //      10987654321098765432109876543210
        this.tpl = 8388608;
    }
    return InstructionLongMultiply;
}(Instruction));
exports.InstructionLongMultiply = InstructionLongMultiply;
