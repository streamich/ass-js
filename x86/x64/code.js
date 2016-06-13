"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var operand_1 = require('../../operand');
var code = require('../code');
var d = require('../def');
var instruction_1 = require('./instruction');
var t = require('./table');
var Code = (function (_super) {
    __extends(Code, _super);
    function Code() {
        _super.apply(this, arguments);
        this.table = Code.table;
        this.ClassInstruction = instruction_1.Instruction;
        this.operandSize = operand_1.SIZE.D;
        this.addressSize = operand_1.SIZE.Q;
    }
    Code.create = function (name) {
        if (name === void 0) { name = 'start'; }
        var newcode = new Code(name);
        newcode.addMethods();
        return newcode;
    };
    Code.table = new d.DefTable(t.table, t.defaults);
    Code._methodsAdded = false;
    return Code;
}(code.Code));
exports.Code = Code;
