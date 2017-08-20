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
var operand_1 = require("../../operand");
var code = require("../code");
var d = require("../def");
var instruction_1 = require("./instruction");
var t = require("./table");
var Code = (function (_super) {
    __extends(Code, _super);
    function Code() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.table = Code.table;
        _this.ClassInstruction = instruction_1.Instruction;
        _this.operandSize = operand_1.SIZE.D;
        _this.addressSize = operand_1.SIZE.Q;
        return _this;
    }
    Code.create = function (name) {
        if (name === void 0) { name = 'start'; }
        var newcode = new Code(name);
        newcode.addMethods();
        return newcode;
    };
    return Code;
}(code.Code));
Code.table = new d.DefTable(t.table, t.defaults);
Code._methodsAdded = false;
exports.Code = Code;
