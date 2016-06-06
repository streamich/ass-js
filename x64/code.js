"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var code = require('../x86/code');
var o = require('../x86/operand');
var d = require('../x86/def');
var instruction_1 = require('./instruction');
var t = require('./table');
exports.table = new d.DefTable(t.table, t.defaults);
var Code = (function (_super) {
    __extends(Code, _super);
    function Code() {
        _super.apply(this, arguments);
        this.ClassInstruction = instruction_1.Instruction;
        this.operandSize = o.SIZE.D;
        this.addressSize = o.SIZE.Q;
    }
    Code.create = function () {
        var code = new Code;
        code.attachMethods(exports.table);
        return code;
    };
    return Code;
}(code.Code));
exports.Code = Code;
