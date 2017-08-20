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
var d = require("../def");
var t = require("./table");
var operand_1 = require("../operand");
var oo = require("../operand");
var o = require("./operand");
var util_1 = require("../util");
var Def = (function (_super) {
    __extends(Def, _super);
    function Def(group, def) {
        var _this = _super.call(this, group, def) || this;
        _this.opreg = def.or;
        _this.operandSizeDefault = def.ds;
        _this.lock = def.lock;
        _this.regInOp = def.r;
        _this.opcodeDirectionBit = def.dbit;
        _this.rex = def.rex;
        _this.useModrm = def.mr;
        _this.rep = def.rep;
        _this.repne = def.repne;
        _this.prefixes = def.pfx;
        _this.opEncoding = def.en;
        _this.mode = def.mod;
        _this.extensions = def.ext;
        if (typeof def.vex === 'string')
            _this.vex = Def.parseVexString(def.vex);
        else
            _this.vex = def.vex;
        if (typeof def.evex === 'string')
            _this.evex = Def.parseEvexString(def.evex);
        else
            _this.evex = def.evex;
        return _this;
    }
    Def.parseVexString = function (vstr) {
        var vdef = {
            vvvv: '',
            L: 0,
            pp: 0,
            mmmmm: 1,
            W: 1,
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
        else if (vstr.indexOf('512') > -1)
            vdef.L = 2;
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
        if (vstr.indexOf('W0') > -1)
            vdef.W = 0;
        if (vstr.indexOf('WIG') > -1)
            vdef.WIG = true;
        return vdef;
    };
    Def.parseEvexString = function (estr) {
        return Def.parseVexString(estr);
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
            if (operand === o.RegisterMm)
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
        if (this.evex)
            json.evex = this.evex;
        if (this.prefixes)
            json.extraPrefixes = this.prefixes;
        if (this.rep)
            json.prefixRep = true;
        if (this.repne)
            json.prefixRepne = true;
        if (this.rex)
            json.rex = this.rex;
        if (!this.useModrm)
            json.skipMorm = true;
        if (this.mode) {
            json.mode = [];
            if (this.mode & t.MODE.X32)
                json.mode.push('x32');
            if (this.mode & t.MODE.X64)
                json.mode.push('x64');
        }
        if (this.extensions) {
            json.extensions = [];
            for (var _i = 0, _a = this.extensions; _i < _a.length; _i++) {
                var ext = _a[_i];
                json.extensions.push(t.EXT[ext]);
            }
        }
        return json;
    };
    Def.prototype.toString = function () {
        var opregstr = '';
        if (this.opreg > -1)
            opregstr = ' /' + this.opreg;
        var lock = this.lock ? ' LOCK' : '';
        var rex = this.rex ? ' REX ' + this.rex : '';
        var vex = this.vex ? ' VEX ' + JSON.stringify(this.vex) : '';
        var evex = this.evex ? ' EVEX ' + JSON.stringify(this.evex) : '';
        var dbit = '';
        if (this.opcodeDirectionBit)
            dbit = ' d-bit';
        return _super.prototype.toString.call(this) + opregstr + lock + rex + vex + evex + dbit;
    };
    return Def;
}(d.Def));
exports.Def = Def;
var DefGroup = (function (_super) {
    __extends(DefGroup, _super);
    function DefGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.DefClass = Def;
        return _this;
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.DefGroupClass = DefGroup;
        return _this;
    }
    return DefTable;
}(d.DefTable));
exports.DefTable = DefTable;
var DefMatch = (function (_super) {
    __extends(DefMatch, _super);
    function DefMatch() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DefMatch;
}(d.DefMatch));
exports.DefMatch = DefMatch;
var DefMatchList = (function (_super) {
    __extends(DefMatchList, _super);
    function DefMatchList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DefMatchList;
}(d.DefMatchList));
exports.DefMatchList = DefMatchList;
