"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var operand_1 = require('../operand');
var oo = require('../operand');
var o = require('./operand');
var i = require('../instruction');
var p = require('./parts');
exports.SIZE_UNKNOWN = -1;
var Expression = (function (_super) {
    __extends(Expression, _super);
    function Expression() {
        _super.apply(this, arguments);
    }
    return Expression;
}(i.Expression));
exports.Expression = Expression;
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        _super.apply(this, arguments);
        this.pfxOpSize = null;
        this.pfxAddrSize = null;
        this.pfxLock = null;
        this.pfxRep = null;
        this.pfxRepne = null;
        this.pfxSegment = null;
        this.prefixes = [];
        this.opcode = new p.Opcode;
        this.modrm = null;
        this.sib = null;
        this.displacement = null;
        this.immediates = [];
        this.regToRegDirectionRegIsDst = false;
    }
    Instruction.prototype.build = function () {
        _super.prototype.build.call(this);
        this.pfxOpSize = null;
        this.pfxAddrSize = null;
        this.pfxLock = null;
        this.pfxRep = null;
        this.pfxRepne = null;
        this.pfxSegment = null;
        this.prefixes = [];
        this.opcode = new p.Opcode;
        this.modrm = null;
        this.sib = null;
        this.displacement = null;
        this.immediates = [];
        this.length = 0;
        this.lengthMax = 0;
        this.createPrefixes();
        this.createOpcode();
        this.createModrm();
        this.createSib();
        this.createDisplacement();
        this.createImmediates();
        return this;
    };
    Instruction.prototype.writePrefixes = function (arr) {
        if (this.pfxLock)
            this.pfxLock.write(arr);
        if (this.pfxRep)
            this.pfxRep.write(arr);
        if (this.pfxRepne)
            this.pfxRepne.write(arr);
        if (this.pfxAddrSize)
            this.pfxAddrSize.write(arr);
        if (this.pfxSegment)
            this.pfxSegment.write(arr);
        if (this.pfxOpSize)
            this.pfxOpSize.write(arr);
        for (var _i = 0, _a = this.prefixes; _i < _a.length; _i++) {
            var pfx = _a[_i];
            pfx.write(arr);
        }
    };
    Instruction.prototype.write = function (arr) {
        this.writePrefixes(arr);
        this.opcode.write(arr);
        if (this.modrm)
            this.modrm.write(arr);
        if (this.sib)
            this.sib.write(arr);
        if (this.displacement)
            this.displacement.write(arr);
        if (this.immediates.length)
            for (var _i = 0, _a = this.immediates; _i < _a.length; _i++) {
                var imm = _a[_i];
                imm.write(arr);
            }
        return arr;
    };
    Instruction.prototype.fixDisplacementSize = function () {
        if (this.displacement && this.displacement.value.variable) {
            var variable = this.displacement.value.variable;
            var val = variable.evaluatePreliminary(this);
            var size = oo.Constant.sizeClass(val);
            if (size > o.DisplacementValue.SIZE.DISP8)
                this.length += o.DisplacementValue.SIZE.DISP32 / 8;
            else
                this.length += o.DisplacementValue.SIZE.DISP8 / 8;
        }
    };
    Instruction.prototype.getFixedSizeExpression = function () {
        this.fixDisplacementSize();
        return _super.prototype.getFixedSizeExpression.call(this);
    };
    Instruction.prototype.evaluate = function () {
        this.ops.evaluate(this);
        var max = 2;
        for (var j = 0; j < max; j++) {
            var rel = this.ops.getRelative(j);
            if (rel) {
                var res = rel.result;
                this.immediates[j].value.setValue(res);
            }
        }
        if (this.displacement && this.displacement.value.variable) {
            var value = this.displacement.value;
            var variable = value.variable;
            var val = variable.evaluate(this);
            var size = value.size;
            value.setValue(val);
            if (value.size > size)
                throw Error("Displacement does not fit in " + size + " bits.");
            else
                value.signExtend(size);
        }
        return _super.prototype.evaluate.call(this);
    };
    Instruction.prototype.lock = function () {
        if (!this.def.lock)
            throw Error("Instruction \"" + this.def.mnemonic + "\" does not support LOCK.");
        this.pfxLock = new p.PrefixLock;
        return this;
    };
    Instruction.prototype.bt = function () {
        return this.ds();
    };
    Instruction.prototype.bnt = function () {
        return this.cs();
    };
    Instruction.prototype.rep = function () {
        if (p.PrefixRep.supported.indexOf(this.def.mnemonic) === -1)
            throw Error("Instruction \"" + this.def.mnemonic + "\" does not support REP prefix.");
        this.pfxRep = new p.PrefixRep;
        return this;
    };
    Instruction.prototype.repe = function () {
        if (p.PrefixRepe.supported.indexOf(this.def.mnemonic) === -1)
            throw Error("Instruction \"" + this.def.mnemonic + "\" does not support REPE/REPZ prefix.");
        this.pfxRep = new p.PrefixRepe;
        return this;
    };
    Instruction.prototype.repz = function () {
        return this.repe();
    };
    Instruction.prototype.repne = function () {
        if (p.PrefixRepne.supported.indexOf(this.def.mnemonic) === -1)
            throw Error("Instruction \"" + this.def.mnemonic + "\" does not support REPNE/REPNZ prefix.");
        this.pfxRepne = new p.PrefixRepne;
        return this;
    };
    Instruction.prototype.repnz = function () {
        return this.repne();
    };
    Instruction.prototype.cs = function () {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.CS);
        return this;
    };
    Instruction.prototype.ss = function () {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.SS);
        return this;
    };
    Instruction.prototype.ds = function () {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.DS);
        return this;
    };
    Instruction.prototype.es = function () {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.ES);
        return this;
    };
    Instruction.prototype.fs = function () {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.FS);
        return this;
    };
    Instruction.prototype.gs = function () {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.GS);
        return this;
    };
    Instruction.prototype.toString = function (margin, hex) {
        if (margin === void 0) { margin = '    '; }
        if (hex === void 0) { hex = true; }
        var parts = [];
        if (this.pfxLock)
            parts.push(this.pfxLock.toString());
        if (this.pfxSegment)
            parts.push(this.pfxSegment.toString());
        parts.push(_super.prototype.toString.call(this, margin, hex));
        return parts.join(' ');
    };
    Instruction.prototype.needsOperandSizeOverride = function () {
        if ((this.code.operandSize === operand_1.SIZE.D) && (this.def.operandSize === operand_1.SIZE.W))
            return true;
        if ((this.code.operandSize === operand_1.SIZE.W) && (this.def.operandSize === operand_1.SIZE.D))
            return true;
        return false;
    };
    Instruction.prototype.needsAddressSizeOverride = function () {
        var mem = this.ops.getMemoryOperand();
        if (mem) {
            var reg = mem.reg();
            if (reg && (reg.size !== this.code.addressSize))
                return true;
        }
        return false;
    };
    Instruction.prototype.createPrefixes = function () {
        if (this.needsOperandSizeOverride()) {
            this.pfxOpSize = new p.PrefixOperandSizeOverride;
            this.length++;
            this.lengthMax++;
        }
        if (this.needsAddressSizeOverride()) {
            this.pfxAddrSize = new p.PrefixAddressSizeOverride;
            this.length++;
            this.lengthMax++;
        }
        if (this.def.prefixes) {
            for (var _i = 0, _a = this.def.prefixes; _i < _a.length; _i++) {
                var val = _a[_i];
                this.prefixes.push(new p.PrefixStatic(val));
            }
            this.length += this.def.prefixes.length;
            this.lengthMax += this.def.prefixes.length;
        }
    };
    Instruction.prototype.createOpcode = function () {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.opcode;
        var _a = this.ops.list, dst = _a[0], src = _a[1];
        if (def.regInOp) {
            if (!dst || !dst.isRegister())
                throw TypeError("Operation needs destination register.");
            opcode.op = (opcode.op & p.Opcode.MASK_OP) | dst.get3bitId();
        }
        else {
            if (this.def.opcodeDirectionBit) {
                var direction = p.Opcode.DIRECTION.REG_IS_DST;
                if (src instanceof o.Register) {
                    direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }
                if ((dst instanceof o.Register) && (src instanceof o.Register)) {
                    if (this.regToRegDirectionRegIsDst)
                        direction = p.Opcode.DIRECTION.REG_IS_DST;
                    else
                        direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }
                opcode.op = (opcode.op & p.Opcode.MASK_DIRECTION) | direction;
            }
        }
        var bytes = opcode.bytes();
        this.length += bytes;
        this.lengthMax += bytes;
    };
    Instruction.prototype.createModrm = function () {
        if (!this.def.useModrm)
            return;
        if (!this.ops.hasRegisterOrMemory())
            return;
        var _a = this.ops.list, dst = _a[0], src = _a[1];
        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && !!dst;
        if (has_opreg || dst_in_modrm) {
            var mod = 0, reg = 0, rm = 0;
            var reg_is_dst = !!(this.opcode.op & p.Opcode.DIRECTION.REG_IS_DST);
            if (has_opreg) {
                reg = this.def.opreg;
                var r = this.ops.getRegisterOperand();
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = r.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    this.length++;
                    this.lengthMax++;
                    return;
                }
            }
            else {
                var r = this.ops.getRegisterOperand(reg_is_dst);
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    reg = r.get3bitId();
                }
            }
            if (!dst) {
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            if ((dst instanceof o.Register) && (src instanceof o.Register)) {
                mod = p.Modrm.MOD.REG_TO_REG;
                var rmreg = (reg_is_dst ? src : dst);
                rm = rmreg.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            var m = this.ops.getMemoryOperand();
            if (!m) {
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            if (!m.base && !m.index && !m.displacement)
                throw TypeError('Invalid Memory reference.');
            if (m.index && !m.scale)
                throw TypeError('Memory Index reference needs Scale factor.');
            if (!m.base && !m.index && m.displacement) {
                m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                mod = p.Modrm.MOD.INDIRECT;
                rm = p.Modrm.RM.NEEDS_SIB;
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            if (m.base && !m.index) {
                mod = p.Modrm.getModDispSize(m);
                if (mod === p.Modrm.MOD.DISP32)
                    m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                rm = m.base.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            if (m.base || m.index) {
                mod = p.Modrm.getModDispSize(m);
                if (m.displacement)
                    if ((mod === p.Modrm.MOD.DISP32) || (mod === p.Modrm.MOD.INDIRECT))
                        m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                rm = p.Modrm.RM.NEEDS_SIB;
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            throw Error('Fatal error, unreachable code.');
        }
    };
    Instruction.prototype.createSib = function () {
        if (!this.modrm)
            return;
        if (this.modrm.mod === p.Modrm.MOD.REG_TO_REG)
            return;
        if ((this.modrm.rm !== p.Modrm.RM.NEEDS_SIB))
            return;
        var m = this.ops.getMemoryOperand();
        if (!m)
            throw Error('No Memory operand to encode SIB.');
        var scalefactor = 0, I = 0, B = 0;
        if (m.scale)
            scalefactor = m.scale.value;
        if (m.index) {
            I = m.index.get3bitId();
            if (I === p.Sib.INDEX_NONE)
                throw Error("Register " + m.index.toString() + " cannot be used as SIB index.");
        }
        else {
            I = p.Sib.INDEX_NONE;
        }
        if (m.base) {
            B = m.base.get3bitId();
        }
        else
            B = p.Sib.BASE_NONE;
        this.sib = new p.Sib(scalefactor, I, B);
        this.length++;
        this.lengthMax++;
    };
    Instruction.prototype.createDisplacement = function () {
        var m = this.ops.getMemoryOperand();
        if (m && m.displacement) {
            this.displacement = new p.Displacement(m.displacement);
            if (m.displacement.variable) {
                this.lengthMax += o.DisplacementValue.SIZE.DISP32 / 8;
            }
            else {
                var size = this.displacement.value.size / 8;
                this.length += size;
                this.lengthMax += size;
            }
        }
        else if (this.modrm && this.sib && (this.sib.B === p.Sib.BASE_NONE)) {
            var disp = null;
            switch (this.modrm.mod) {
                case p.Modrm.MOD.INDIRECT:
                    disp = new o.DisplacementValue(0);
                    disp.signExtend(o.DisplacementValue.SIZE.DISP32);
                    break;
                case p.Modrm.MOD.DISP8:
                    disp = new o.DisplacementValue(0);
                    disp.signExtend(o.DisplacementValue.SIZE.DISP8);
                    break;
                case p.Modrm.MOD.DISP32:
                    disp = new o.DisplacementValue(0);
                    disp.signExtend(o.DisplacementValue.SIZE.DISP32);
                    break;
            }
            if (disp)
                this.displacement = new p.Displacement(disp);
            var size = this.displacement.value.size / 8;
            this.length += size;
            this.lengthMax += size;
        }
    };
    Instruction.prototype.createImmediates = function () {
        var max = 2;
        for (var j = 0; j < max; j++) {
            var imm = this.ops.getImmediate(j);
            var immp;
            if (imm) {
                immp = new p.Immediate(imm);
                this.immediates[j] = immp;
                var size = immp.value.size >> 3;
                this.length += size;
                this.lengthMax += size;
            }
            else {
                var rel = this.ops.getRelative(j);
                if (rel) {
                    var immval = oo.Immediate.factory(rel.size, 0);
                    immp = new p.Immediate(immval);
                    this.immediates[j] = immp;
                    var size = rel.size >> 3;
                    this.length += size;
                    this.lengthMax += size;
                }
            }
        }
    };
    return Instruction;
}(i.Instruction));
exports.Instruction = Instruction;
var InstructionSet = (function (_super) {
    __extends(InstructionSet, _super);
    function InstructionSet() {
        _super.apply(this, arguments);
    }
    InstructionSet.prototype.cloneOperands = function () {
        return this.ops.clone(o.Operands);
    };
    InstructionSet.prototype.lock = function () {
        return this;
    };
    InstructionSet.prototype.bt = function () {
        return this;
    };
    InstructionSet.prototype.bnt = function () {
        return this;
    };
    InstructionSet.prototype.rep = function () {
        return this;
    };
    InstructionSet.prototype.repe = function () {
        return this;
    };
    InstructionSet.prototype.repz = function () {
        return this;
    };
    InstructionSet.prototype.repnz = function () {
        return this;
    };
    InstructionSet.prototype.repne = function () {
        return this;
    };
    InstructionSet.prototype.cs = function () {
        return this;
    };
    InstructionSet.prototype.ss = function () {
        return this;
    };
    InstructionSet.prototype.ds = function () {
        return this;
    };
    InstructionSet.prototype.es = function () {
        return this;
    };
    InstructionSet.prototype.fs = function () {
        return this;
    };
    InstructionSet.prototype.gs = function () {
        return this;
    };
    return InstructionSet;
}(i.InstructionSet));
exports.InstructionSet = InstructionSet;
