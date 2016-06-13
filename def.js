"use strict";
var o = require('./operand');
var util_1 = require('./util');
var Def = (function () {
    function Def(group, def) {
        var _this = this;
        this.group = null;
        this.mnemonic = '';
        this.operandSize = o.SIZE.NONE;
        this.opcode = 0x00;
        this.group = group;
        this.opcode = def.o;
        this.mnemonic = def.mn;
        this.operandSize = def.s;
        this.operands = [];
        if (def.ops && def.ops.length) {
            var implied_size = o.SIZE.NONE;
            for (var _i = 0, _a = def.ops; _i < _a.length; _i++) {
                var operand = _a[_i];
                if (!(operand instanceof Array))
                    operand = [operand];
                var flattened = operand.reduce(function (a, b) {
                    var cur_size = o.SIZE.NONE;
                    if (b instanceof o.Register) {
                        cur_size = b.size;
                    }
                    else if ((typeof b === 'function') && (b.name.indexOf('Register') === 0)) {
                        cur_size = (new b).size;
                    }
                    if (cur_size !== o.SIZE.NONE) {
                        if (_this.operandSize <= o.SIZE.NONE) {
                            if (implied_size > o.SIZE.NONE) {
                                if (implied_size !== cur_size)
                                    throw TypeError('Instruction operand size definition mismatch: ' + _this.mnemonic);
                            }
                            else
                                implied_size = cur_size;
                        }
                    }
                    return a.concat(b);
                }, []);
                operand = flattened;
                this.operands.push(operand);
            }
            if (this.operandSize <= o.SIZE.NONE) {
                this.operandSize = implied_size;
            }
        }
    }
    Def.prototype.matchOperandTemplate = function (tpl, operand) {
        if (typeof tpl === 'number') {
            if (tpl === operand)
                return tpl;
            else
                return null;
        }
        else if (typeof tpl === 'object') {
            if (tpl === operand)
                return tpl;
            else
                return null;
        }
        else if (typeof tpl === 'function') {
            var OperandClass = tpl;
            if (OperandClass.name.indexOf('Relative') === 0) {
                if (o.isTnumber(operand))
                    return OperandClass;
                else if (operand instanceof o.Relative)
                    return OperandClass;
                else
                    return null;
            }
            else {
                if (operand instanceof OperandClass)
                    return OperandClass;
                else
                    return null;
            }
        }
        else
            throw TypeError('Invalid operand definition.');
    };
    Def.prototype.matchOperandTemplates = function (templates, operand) {
        for (var _i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
            var tpl = templates_1[_i];
            var match = this.matchOperandTemplate(tpl, operand);
            if (match)
                return match;
        }
        return null;
    };
    Def.prototype.matchOperands = function (ops) {
        if (!this.operands)
            return null;
        if (this.operands.length !== ops.list.length)
            return null;
        if (!ops.list.length)
            return [];
        var matches = [];
        for (var i = 0; i < ops.list.length; i++) {
            var templates = this.operands[i];
            var operand = ops.list[i];
            var match = this.matchOperandTemplates(templates, operand);
            if (!match)
                return null;
            matches.push(match);
        }
        return matches;
    };
    Def.prototype.toStringOperand = function (operand) {
        if (typeof operand === 'number')
            return operand;
        if (typeof operand === 'string')
            return operand;
        if (operand instanceof o.Operand)
            return operand.toString();
        else if (typeof operand === 'function') {
            if (operand === o.Register)
                return 'r';
            if (operand === o.Memory)
                return 'm';
            if (operand === o.Relative)
                return 'rel';
            if (operand === o.Relative8)
                return 'rel8';
            if (operand === o.Relative16)
                return 'rel16';
            if (operand === o.Relative32)
                return 'rel32';
        }
        else
            return 'operand';
    };
    Def.prototype.getMnemonic = function () {
        var size = this.operandSize;
        if ((size === o.SIZE.ANY) || (size === o.SIZE.NONE))
            return this.mnemonic;
        return this.mnemonic + o.SIZE[size].toLowerCase();
    };
    Def.prototype.toJsonOperands = function () {
        var ops = [];
        for (var _i = 0, _a = this.operands; _i < _a.length; _i++) {
            var op_tpl = _a[_i];
            var op_out = [];
            for (var _b = 0, op_tpl_1 = op_tpl; _b < op_tpl_1.length; _b++) {
                var op = op_tpl_1[_b];
                op_out.push(this.toStringOperand(op));
            }
            if (op_out.length > 1)
                ops.push(op_out);
            else
                ops.push(op_out[0]);
        }
        return ops;
    };
    Def.prototype.toJson = function () {
        var json = {
            opcode: this.opcode,
            opcodeHex: this.opcode.toString(16),
        };
        if (this.operandSize)
            json.operandSize = this.operandSize;
        var ops = this.toJsonOperands();
        if (ops.length)
            json.operands = ops;
        return json;
    };
    Def.prototype.toString = function () {
        var opcode = ' ' + (new o.Constant(this.opcode, false)).toString();
        var operands = [];
        for (var _i = 0, _a = this.operands; _i < _a.length; _i++) {
            var ops = _a[_i];
            var opsarr = [];
            for (var _b = 0, ops_1 = ops; _b < ops_1.length; _b++) {
                var op = ops_1[_b];
                opsarr.push(this.toStringOperand(op));
            }
            operands.push(opsarr.join('/'));
        }
        var operandsstr = '';
        if (operands.length)
            operandsstr = ' ' + operands.join(',');
        var size = '';
        if (this.operandSize > 0)
            size = ' ' + this.operandSize + '-bit';
        return this.mnemonic + size + opcode + operandsstr;
    };
    return Def;
}());
exports.Def = Def;
var DefGroup = (function () {
    function DefGroup(table, mnemonic) {
        this.table = null;
        this.mnemonic = '';
        this.defs = [];
        this.DefClass = Def;
        this.table = table;
        this.mnemonic = mnemonic;
    }
    DefGroup.prototype.createDefinitions = function (defs, defaults) {
        var group_defaults = defs[0], definitions = defs.slice(1);
        if (!definitions.length)
            definitions = [group_defaults];
        if (!group_defaults.mn)
            group_defaults.mn = this.mnemonic;
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var definition = definitions_1[_i];
            this.defs.push(new this.DefClass(this, util_1.extend({}, defaults, group_defaults, definition)));
        }
    };
    DefGroup.prototype.groupBySize = function () {
        var sizes = {};
        for (var _i = 0, _a = this.defs; _i < _a.length; _i++) {
            var def = _a[_i];
            var size = def.operandSize;
            if (!sizes[size])
                sizes[size] = [];
            sizes[size].push(def);
        }
        return sizes;
    };
    DefGroup.prototype.toJson = function () {
        var instructions = [];
        for (var _i = 0, _a = this.defs; _i < _a.length; _i++) {
            var def = _a[_i];
            instructions.push(def.toJson());
        }
        return {
            mnemonic: this.mnemonic,
            definitions: instructions,
        };
    };
    DefGroup.prototype.toString = function () {
        var defs = [];
        for (var _i = 0, _a = this.defs; _i < _a.length; _i++) {
            var def = _a[_i];
            defs.push(def.toString());
        }
        return this.mnemonic.toUpperCase() + ":\n    " + defs.join('\n    ');
    };
    return DefGroup;
}());
exports.DefGroup = DefGroup;
var DefTable = (function () {
    function DefTable(table, defaults) {
        this.DefGroupClass = DefGroup;
        this.groups = {};
        this.table = table;
        this.defaults = defaults;
    }
    DefTable.prototype.getGroup = function (mnemonic) {
        if (!this.groups[mnemonic]) {
            this.createGroup(mnemonic);
        }
        return this.groups[mnemonic];
    };
    DefTable.prototype.createGroup = function (mnemonic) {
        var group = new this.DefGroupClass(this, mnemonic);
        group.createDefinitions(this.table[mnemonic], this.defaults);
        this.groups[mnemonic] = group;
    };
    DefTable.prototype.matchDefinitions = function (mnemonic, ops, size) {
        if (size === void 0) { size = o.SIZE.ANY; }
        var group = this.getGroup(mnemonic);
        if (!group)
            throw Error("No such mnemonic \"" + mnemonic + "\".");
        var matches = new DefMatchList;
        matches.matchAll(group.defs, ops, size);
        return matches;
    };
    DefTable.prototype.toJson = function () {
        var json = {};
        for (var group_name in this.groups) {
            json[group_name] = this.groups[group_name].toJson();
        }
        return json;
    };
    DefTable.prototype.toString = function () {
        var groups = [];
        for (var group_name in this.groups) {
            groups.push(this.groups[group_name].toString());
        }
        return groups.join('\n');
    };
    return DefTable;
}());
exports.DefTable = DefTable;
var DefMatch = (function () {
    function DefMatch() {
        this.def = null;
        this.opTpl = [];
    }
    return DefMatch;
}());
exports.DefMatch = DefMatch;
var DefMatchList = (function () {
    function DefMatchList() {
        this.list = [];
    }
    DefMatchList.prototype.match = function (def, ops, size) {
        if (size !== o.SIZE.ANY) {
            if (size !== def.operandSize)
                return;
        }
        var tpl = def.matchOperands(ops);
        if (tpl) {
            var match = new DefMatch;
            match.def = def;
            match.opTpl = tpl;
            this.list.push(match);
        }
    };
    DefMatchList.prototype.matchAll = function (defs, ops, size) {
        if (size === void 0) { size = o.SIZE.ANY; }
        for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
            var def = defs_1[_i];
            this.match(def, ops, size);
        }
    };
    return DefMatchList;
}());
exports.DefMatchList = DefMatchList;
