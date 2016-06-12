"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var d = require('../def');
var t = require('./table');
var operand_1 = require("../operand");
var oo = require('../operand');
var o = require('./operand');
var util_1 = require('../util');
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
        this.opEncoding = def.en;
        this.mode = def.mod;
        this.cpuid = def.cpu;
        if (typeof def.vex === 'string')
            this.vex = Def.parseVexString(def.vex);
        else
            this.vex = def.vex;
    }
    Def.parseVexString = function (vstr) {
        var vdef = {
            vvvv: '',
            L: 0,
            pp: 0,
            mmmmm: 0,
            W: 0,
            WIG: false,
        };
        if (vstr.indexOf('NDS') > -1)
            vdef.vvvv = 'NDS';
        else if (vstr.indexOf('NDD') > -1)
            vdef.vvvv = 'NDD';
        else if (vstr.indexOf('DDS') > -1)
            vdef.vvvv = 'DDS';
        if (vstr.indexOf('256') > -1)
            vdef.L = 1;
        if (vstr.indexOf('.66.') > -1)
            vdef.pp = 1;
        else if (vstr.indexOf('.F2.') > -1)
            vdef.pp = 3;
        else if (vstr.indexOf('.F3.') > -1)
            vdef.pp = 2;
        if (vstr.indexOf('0F38') > -1)
            vdef.mmmmm = 2;
        else if (vstr.indexOf('0F3A') > -1)
            vdef.mmmmm = 3;
        else if (vstr.indexOf('0F') > -1)
            vdef.mmmmm = 1;
        if (vstr.indexOf('W1') > -1)
            vdef.W = 1;
        if (vstr.indexOf('WIG') > -1)
            vdef.WIG = true;
        return vdef;
    };
    Def.prototype.matchOperandTemplate = function (tpl, operand) {
        var OperandClass = tpl;
        if ((typeof OperandClass === 'function') && (OperandClass.name.indexOf('Immediate') === 0)) {
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
            if (operand === oo.Immediate)
                return 'imm';
            if (operand === oo.Immediate8)
                return 'imm8';
            if (operand === oo.Immediate16)
                return 'imm16';
            if (operand === oo.Immediate32)
                return 'imm32';
            if (operand === oo.Immediate64)
                return 'imm64';
            if (operand === oo.ImmediateUnsigned)
                return 'immu';
            if (operand === oo.ImmediateUnsigned8)
                return 'immu8';
            if (operand === oo.ImmediateUnsigned16)
                return 'immu16';
            if (operand === oo.ImmediateUnsigned32)
                return 'immu32';
            if (operand === oo.ImmediateUnsigned64)
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
            if (operand === o.RegisterSegment)
                return 'sreg';
            if (operand === o.RegisterMmx)
                return 'mmx';
            if (operand === o.RegisterXmm)
                return 'xmm';
            if (operand === o.RegisterYmm)
                return 'ymm';
            if (operand === o.RegisterZmm)
                return 'zmm';
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
    Def.prototype.toJson = function () {
        var json = _super.prototype.toJson.call(this);
        if (this.opreg > 0)
            json.opcodeExtensionInModrm = this.opreg;
        if (this.regInOp)
            json.registerInOpcode = true;
        json.operandEncoding = this.opEncoding;
        if (this.lock)
            json.lock = true;
        if (this.opcodeDirectionBit)
            json.setOpcodeDirectionBit = true;
        if (this.vex)
            json.vex = this.vex;
        if (this.prefixes)
            json.extraPrefixes = this.prefixes;
        if (this.rep)
            json.prefixRep = true;
        if (this.repne)
            json.prefixRepne = true;
        if (this.mandatoryRex)
            json.mandatoryRex = true;
        if (!this.useModrm)
            json.skipMorm = true;
        if (this.mode) {
            json.mode = [];
            if (this.mode & t.MODE.X32)
                json.mode.push('x32');
            if (this.mode & t.MODE.X64)
                json.mode.push('x64');
        }
        if (this.cpuid) {
            json.cpuid = [];
            if (this.cpuid & t.CPUID.MMX)
                json.cpuid.push('MMX');
            if (this.cpuid & t.CPUID.SSE2)
                json.cpuid.push('SSE2');
            if (this.cpuid & t.CPUID.AVX)
                json.cpuid.push('AVX');
            if (this.cpuid & t.CPUID.AVX2)
                json.cpuid.push('AVX2');
        }
        return json;
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
    DefGroup.prototype.createDefinitions = function (defs, defaults) {
        _super.prototype.createDefinitions.call(this, defs, defaults);
        var group_defaults = defs[0];
        group_defaults = util_1.extend({}, defaults, group_defaults);
        this.defaultOperandSize = group_defaults.ds;
    };
    DefGroup.prototype.toJson = function () {
        var json = _super.prototype.toJson.call(this);
        json.defaultOperandSize = this.defaultOperandSize;
        return json;
    };
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
