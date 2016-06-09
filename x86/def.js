"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var d = require('../def');
var operand_1 = require("../operand");
var o = require('./operand');
var Def = (function (_super) {
    __extends(Def, _super);
    function Def(group, def) {
        _super.call(this, group, def);
        this.opreg = def.or;
        this.operandSizeDefault = def.ds;
        this.lock = def.lock;
        this.regInOp = def.r;
        this.opcodeDirectionBit = def.dbit;
        this.mandatoryRex = def.rex;
        this.useModrm = def.mr;
        this.rep = def.rep;
        this.repne = def.repne;
        this.prefixes = def.pfx;
    }
    Def.prototype.matchOperandTemplate = function (tpl, operand) {
        var OperandClass = tpl; // as typeof o.Operand;
        if (OperandClass.name.indexOf('Immediate') === 0) {
            if (!operand_1.isTnumber(operand))
                return null;
            var ImmediateClass = OperandClass;
            try {
                new ImmediateClass(operand);
                return ImmediateClass;
            }
            catch (e) {
                return null;
            }
        }
        else
            return _super.prototype.matchOperandTemplate.call(this, tpl, operand);
    };
    Def.prototype.toStringOperand = function (operand) {
        if (operand instanceof operand_1.Operand)
            return operand.toString();
        else if (typeof operand === 'function') {
            if (operand === o.Immediate)
                return 'imm';
            if (operand === o.Immediate8)
                return 'imm8';
            if (operand === o.Immediate16)
                return 'imm16';
            if (operand === o.Immediate32)
                return 'imm32';
            if (operand === o.Immediate64)
                return 'imm64';
            if (operand === o.ImmediateUnsigned)
                return 'immu';
            if (operand === o.ImmediateUnsigned8)
                return 'immu8';
            if (operand === o.ImmediateUnsigned16)
                return 'immu16';
            if (operand === o.ImmediateUnsigned32)
                return 'immu32';
            if (operand === o.ImmediateUnsigned64)
                return 'immu64';
            if (operand === o.Register)
                return 'r';
            if (operand === o.Register8)
                return 'r8';
            if (operand === o.Register16)
                return 'r16';
            if (operand === o.Register32)
                return 'r32';
            if (operand === o.Register64)
                return 'r64';
            if (operand === o.Memory)
                return 'm';
            if (operand === o.Memory8)
                return 'm8';
            if (operand === o.Memory16)
                return 'm16';
            if (operand === o.Memory32)
                return 'm32';
            if (operand === o.Memory64)
                return 'm64';
            if (operand === operand_1.Relative)
                return 'rel';
            if (operand === operand_1.Relative8)
                return 'rel8';
            if (operand === operand_1.Relative16)
                return 'rel16';
            if (operand === operand_1.Relative32)
                return 'rel32';
        }
        else
            return _super.prototype.toStringOperand.call(this, operand);
    };
    Def.prototype.toString = function () {
        var opregstr = '';
        if (this.opreg > -1)
            opregstr = ' /' + this.opreg;
        var lock = this.lock ? ' LOCK' : '';
        var rex = this.mandatoryRex ? ' REX' : '';
        var dbit = '';
        if (this.opcodeDirectionBit)
            dbit = ' d-bit';
        return _super.prototype.toString.call(this) + opregstr + lock + rex + dbit;
    };
    return Def;
}(d.Def));
exports.Def = Def;
var DefGroup = (function (_super) {
    __extends(DefGroup, _super);
    function DefGroup() {
        _super.apply(this, arguments);
        this.DefClass = Def;
    }
    return DefGroup;
}(d.DefGroup));
exports.DefGroup = DefGroup;
var DefTable = (function (_super) {
    __extends(DefTable, _super);
    function DefTable() {
        _super.apply(this, arguments);
        this.DefGroupClass = DefGroup;
    }
    return DefTable;
}(d.DefTable));
exports.DefTable = DefTable;
var DefMatch = (function (_super) {
    __extends(DefMatch, _super);
    function DefMatch() {
        _super.apply(this, arguments);
    }
    return DefMatch;
}(d.DefMatch));
exports.DefMatch = DefMatch;
var DefMatchList = (function (_super) {
    __extends(DefMatchList, _super);
    function DefMatchList() {
        _super.apply(this, arguments);
    }
    return DefMatchList;
}(d.DefMatchList));
exports.DefMatchList = DefMatchList;
