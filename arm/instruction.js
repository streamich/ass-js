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
var COND;
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
})(COND = exports.COND || (exports.COND = {}));
var Instruction = (function () {
    function Instruction() {
        this.tpl = 0;
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tpl = 0;
        return _this;
    }
    return InstructionDataProcessing;
}(Instruction));
exports.InstructionDataProcessing = InstructionDataProcessing;
var InstructionDataMultiply = (function (_super) {
    __extends(InstructionDataMultiply, _super);
    function InstructionDataMultiply() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tpl = 0;
        return _this;
    }
    return InstructionDataMultiply;
}(Instruction));
exports.InstructionDataMultiply = InstructionDataMultiply;
var InstructionLongMultiply = (function (_super) {
    __extends(InstructionLongMultiply, _super);
    function InstructionLongMultiply() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tpl = 8388608;
        return _this;
    }
    return InstructionLongMultiply;
}(Instruction));
exports.InstructionLongMultiply = InstructionLongMultiply;
