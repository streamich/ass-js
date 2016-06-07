"use strict";
var o = require('./operand');
var util_1 = require('../util');
// const Immediates = [o.Immediate, o.Immediate8, o.Immediate16, o.Immediate32, o.Immediate64];
// const bySize = {};
// bySize[o.SIZE.NONE]     = [o.Immediate,     o.Register,     o.Memory];
// bySize[o.SIZE.B]        = [o.Immediate8,    o.Register8,    o.Memory8];
// bySize[o.SIZE.W]        = [o.Immediate16,   o.Register16,   o.Memory16];
// bySize[o.SIZE.D]        = [o.Immediate32,   o.Register32,   o.Memory32];
// bySize[o.SIZE.Q]        = [o.Immediate64,   o.Register64,   o.Memory64];
var Def = (function () {
    function Def(group, def) {
        var _this = this;
        this.group = group;
        this.opcode = def.o;
        this.opreg = def.or;
        this.mnemonic = def.mn;
        this.operandSize = def.s;
        this.operandSizeDefault = def.ds;
        this.lock = def.lock;
        this.regInOp = def.r;
        this.opcodeDirectionBit = def.dbit;
        this.mandatoryRex = def.rex;
        this.useModrm = def.mr;
        this.rep = def.rep;
        this.repne = def.repne;
        this.prefixes = def.pfx;
        // Operand template.
        this.operands = [];
        if (def.ops && def.ops.length) {
            for (var _i = 0, _a = def.ops; _i < _a.length; _i++) {
                var operand = _a[_i];
                if (!(operand instanceof Array))
                    operand = [operand];
                var flattened = operand.reduce(function (a, b) {
                    // Determine operand size from o.Register operands
                    var cur_size = o.SIZE.NONE;
                    if (b instanceof o.Register) {
                        cur_size = b.size;
                    }
                    else if ((typeof b === 'function') && (b.name.indexOf('Register') === 0)) {
                        cur_size = (new b).size;
                    }
                    if (cur_size !== o.SIZE.NONE) {
                        if (_this.operandSize > o.SIZE.NONE) {
                            if (_this.operandSize !== cur_size)
                                throw TypeError('Instruction operand size definition mismatch: ' + _this.mnemonic);
                        }
                        else
                            _this.operandSize = cur_size;
                    }
                    return a.concat(b);
                }, []);
                operand = flattened;
                this.operands.push(operand);
            }
        }
    }
    // protected getOperandConstructorSize(Constructor) {
    //     if(bySize[o.SIZE.B].indexOf(Constructor) > -1) return o.SIZE.B;
    //     if(bySize[o.SIZE.W].indexOf(Constructor) > -1) return o.SIZE.W;
    //     if(bySize[o.SIZE.D].indexOf(Constructor) > -1) return o.SIZE.D;
    //     if(bySize[o.SIZE.Q].indexOf(Constructor) > -1) return o.SIZE.Q;
    //     return o.SIZE.NONE;
    // }
    Def.prototype.matchOperandTemplates = function (templates, operand) {
        for (var _i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
            var tpl = templates_1[_i];
            if (typeof tpl === 'object') {
                if (tpl === operand)
                    return tpl;
            }
            else if (typeof tpl === 'function') {
                var OperandClass = tpl; // as typeof o.Operand;
                if (OperandClass.name.indexOf('Immediate') === 0) {
                    if (!o.isTnumber(operand))
                        continue;
                    var ImmediateClass = OperandClass;
                    try {
                        new ImmediateClass(operand);
                        return ImmediateClass;
                    }
                    catch (e) {
                        continue;
                    }
                }
                else if (OperandClass.name.indexOf('Relative') === 0) {
                    // Here we cannot yet check any sizes even cannot check if number
                    // fits the immediate size because we will have to rebase the o.Relative
                    // to the currenct instruction Expression.
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
                }
            }
            else
                throw TypeError('Invalid operand definition.'); // Should never happen.
        }
        return null;
    };
    Def.prototype.matchOperands = function (operands) {
        if (this.operands.length !== operands.length)
            return null;
        if (!operands.length)
            return [];
        var matches = [];
        for (var i = 0; i < operands.length; i++) {
            var templates = this.operands[i];
            var operand = operands[i];
            var match = this.matchOperandTemplates(templates, operand);
            if (!match)
                return null;
            matches.push(match);
        }
        return matches;
    };
    // getImmediateClass(): typeof o.Immediate {
    //     for(var operand of this.operands) {
    //         for(var type of operand) {
    //             if(Immediates.indexOf(type) > -1) return type;
    //         }
    //     }
    //     return null;
    // }
    // hasOperandsOfSize(size: o.SIZE) {
    //     if(this.operandSize === o.SIZE.NONE) return true;
    //     if(this.operandSize === o.SIZE.ANY) return true;
    //     if(this.operandSize === size) return true;
    //     return false;
    // }
    Def.prototype.toStringOperand = function (operand) {
        if (operand instanceof o.Operand)
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
    Def.prototype.toString = function () {
        // var opcode = ' 0x' + this.opcode.toString(16).toUpperCase();
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
        var opregstr = '';
        if (this.opreg > -1)
            opregstr = ' /' + this.opreg;
        var lock = this.lock ? ' LOCK' : '';
        var rex = this.mandatoryRex ? ' REX' : '';
        var dbit = '';
        if (this.opcodeDirectionBit)
            dbit = ' d-bit';
        return this.getMnemonic() + opcode + operandsstr + opregstr + lock + rex + dbit;
    };
    return Def;
}());
exports.Def = Def;
var DefGroup = (function () {
    function DefGroup(table, mnemonic, defs, defaults) {
        this.mnemonic = '';
        this.defs = [];
        this.table = table;
        this.mnemonic = mnemonic;
        var group_defaults = defs[0], definitions = defs.slice(1);
        // If only one object provided, we treat it as instruction definition rather then
        // as group defaults.
        if (!definitions.length)
            definitions = [group_defaults];
        // Mnemonic.
        if (!group_defaults.mn)
            group_defaults.mn = mnemonic;
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var definition = definitions_1[_i];
            this.defs.push(new Def(this, util_1.extend({}, defaults, group_defaults, definition)));
        }
    }
    // find(operands: o.TUserInterfaceOperand[]): Def {
    //     for(var def of this.defs) {
    //         if(def.validateOperands(operands)) {
    // No operands -- no size check
    // if(!def.operands.length) return def;
    // We are fine with any size
    // if(operands.size === o.SIZE.ANY) return def;
    // See if operands match the sizes required by instruction.
    // else if(def.hasOperandsOfSize(operands.size)) {
    //     return def;
    // }
    // }
    // }
    // return null;
    // }
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
    DefMatchList.prototype.match = function (def, ui_ops) {
        var tpl = def.matchOperands(ui_ops);
        if (tpl) {
            var match = new DefMatch;
            match.def = def;
            match.opTpl = tpl;
            this.list.push(match);
        }
    };
    DefMatchList.prototype.matchAll = function (defs, ui_ops) {
        for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
            var def = defs_1[_i];
            this.match(def, ui_ops);
        }
    };
    return DefMatchList;
}());
exports.DefMatchList = DefMatchList;
var DefTable = (function () {
    function DefTable(table, defaults) {
        this.groups = {};
        for (var mnemonic in table) {
            var group = new DefGroup(this, mnemonic, table[mnemonic], defaults);
            this.groups[mnemonic] = group;
        }
    }
    // find(name: string, operands: o.Operands): Def {
    //     var group: DefGroup = this.groups[name] as DefGroup;
    //     return group.find(operands);
    // }
    // attachMethods(code: Code) {
    //     for(var group in this.groups) {
    //         this.groups[group].attachMethods(code);
    //     }
    // }
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
