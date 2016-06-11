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
var util_1 = require('../../util');
exports.table = (new d.DefTable).create(t.table, t.defaults);
var methods = code.Code.attachMethods({}, exports.table);
var Code = (function (_super) {
    __extends(Code, _super);
    function Code() {
        _super.apply(this, arguments);
        this.methods = methods;
        this.ClassInstruction = instruction_1.Instruction;
        this.operandSize = operand_1.SIZE.D;
        this.addressSize = operand_1.SIZE.Q;
    }
    Code.create = function (name) {
        if (!Code._methodsAdded) {
            util_1.extend(Code.prototype, methods);
            Code._methodsAdded = true;
        }
        var newcode = new Code(name);
        return newcode;
    };
    Code.table = exports.table;
    Code._methodsAdded = false;
    return Code;
}(code.Code));
exports.Code = Code;
