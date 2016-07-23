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
var TemplateLock = (function (_super) {
    __extends(TemplateLock, _super);
    function TemplateLock() {
        _super.apply(this, arguments);
        this.name = 'lock';
        this.octets = [p.PREFIX.LOCK];
    }
    return TemplateLock;
}(i.Template));
exports.TemplateLock = TemplateLock;
var TemplateRex = (function (_super) {
    __extends(TemplateRex, _super);
    function TemplateRex(args) {
        _super.call(this, args);
        this.name = 'rex';
        this.args = [0, 0, 0, 0];
        var _a = this.args, W = _a[0], R = _a[1], X = _a[2], B = _a[3];
        var rex = new p.PrefixRex(W, R, X, B);
        rex.write(this.octets);
    }
    return TemplateRex;
}(i.Template));
exports.TemplateRex = TemplateRex;
var Align = (function (_super) {
    __extends(Align, _super);
    function Align() {
        _super.apply(this, arguments);
        this.templates = Align.nop;
    }
    Align.nop = [
        [0x90],
        [0x66, 0x90],
        [0x0F, 0x1F, 0x00],
        [0x0F, 0x1F, 0x40, 0x00],
        [0x0F, 0x1F, 0x44, 0x00, 0x00],
        [0x66, 0x0F, 0x1F, 0x44, 0x00, 0x00],
        [0x0F, 0x1F, 0x80, 0x00, 0x00, 0x00, 0x00],
        [0x0F, 0x1F, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00],
        [0x66, 0x0F, 0x1F, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00],
    ];
    return Align;
}(i.Align));
exports.Align = Align;
// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        _super.apply(this, arguments);
        // Instruction parts.
        this.pfxOpSize = null;
        this.pfxAddrSize = null;
        this.pfxLock = null;
        this.pfxRep = null;
        this.pfxRepne = null;
        this.pfxSegment = null;
        this.prefixes = [];
        this.pfxEx = null; // One of REX, VEX, EVEX prefixes, only one allowed.
        this.opcode = new p.Opcode; // required
        this.modrm = null;
        this.sib = null;
        this.displacement = null;
        this.immediates = [];
        // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
        // We set this to `false` to be compatible with GAS assembly, which we use for testing.
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
        this.pfxEx = null;
        this.opcode = new p.Opcode; // required
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
        if (this.pfxEx)
            this.pfxEx.write(arr);
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
        // Determine size of displacement
        this.fixDisplacementSize();
        return _super.prototype.getFixedSizeExpression.call(this);
    };
    Instruction.prototype.evaluate = function () {
        this.ops.evaluate(this);
        var max = 2; // Up to 2 immediates.
        for (var j = 0; j < max; j++) {
            var rel = this.ops.getRelative(j);
            if (rel) {
                var res = rel.result;
                // var res = (rel.result as number) - this.bytes();
                this.immediates[j].value.setValue(res);
            }
        }
        // Evaluate displacement variable.
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
        this.length++;
        this.lengthMax++;
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
    Instruction.prototype.toStringExpression = function () {
        var expression = _super.prototype.toStringExpression.call(this);
        if (this.pfxLock)
            expression += " {" + this.pfxLock.toString() + "}";
        if (this.pfxSegment)
            expression += " {" + this.pfxSegment.toString() + "}";
        if (this.opts.mask)
            expression += " {" + this.opts.mask.toString() + "}";
        if (this.opts.z)
            expression += " {z}";
        return expression;
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
        if (this.def.vex)
            this.createVexPrefix();
        else if (this.def.evex)
            this.createEvexPrefix();
        // Mandatory prefixes required by op-code.
        if (this.def.prefixes) {
            for (var _i = 0, _a = this.def.prefixes; _i < _a.length; _i++) {
                var val = _a[_i];
                this.prefixes.push(new p.PrefixStatic(val));
            }
            this.length += this.def.prefixes.length;
            this.lengthMax += this.def.prefixes.length;
        }
    };
    Instruction.prototype.createVexPrefix = function () {
        // These bits in VEX are inverted, so they actually all mean "0" zeros.
        var R = 1, X = 1, B = 1, vvvv = 15;
        var pos = this.def.opEncoding.indexOf('v');
        if (pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register);
            if (!reg)
                throw Error("Could not find Register operand at position " + pos + " to encode VEX.vvvv");
            vvvv = (~reg.get4bitId()) & 15; // Inverted
        }
        pos = this.def.opEncoding.indexOf('r');
        if (pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register);
            if (!reg)
                throw Error("Could not find Register operand at position " + pos + " to encode VEX.R");
            if (reg.idSize() > 3)
                R = 0; // Inverted
        }
        pos = this.def.opEncoding.indexOf('m');
        if (pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register);
            if (reg && (reg.idSize() > 3))
                B = 0; // Inverted
        }
        var mem = this.ops.getMemoryOperand();
        if (mem) {
            if (mem.base && (mem.base.idSize() > 3))
                B = 0;
            if (mem.index && (mem.index.idSize() > 3))
                X = 0;
        }
        this.pfxEx = new p.PrefixVex(this.def.vex, R, X, B, vvvv);
        this.length += this.pfxEx.bytes;
        this.lengthMax += this.pfxEx.bytes;
    };
    Instruction.prototype.createEvexPrefix = function () {
        var evex = this.pfxEx = new p.PrefixEvex(this.def.evex);
        this.length += 3;
        this.lengthMax += 3;
        var pos = this.def.opEncoding.indexOf('v');
        if (pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register);
            if (!reg)
                throw Error("Could not find Register operand at position " + pos + " to encode EVEX.vvvv");
            evex.vvvv = (~reg.get4bitId()) & 15; // Inverted
            evex.Vp = reg.id & 16 ? 0 : 1; // Inverted
        }
        pos = this.def.opEncoding.indexOf('r');
        if (pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register);
            if (!reg)
                throw Error("Could not find Register operand at position " + pos + " to encode VEX.R");
            var id_size = reg.idSize();
            if (id_size > 3)
                evex.R = 0; // Inverted
            if (id_size > 4) {
                evex.Rp = 0; // Inverted
                if (reg.id & 8)
                    evex.R = 0;
                else
                    evex.R = 1;
            }
        }
        pos = this.def.opEncoding.indexOf('m');
        if (pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register);
            if (reg) {
                if (reg.idSize() > 3)
                    evex.B = 0; // Inverted
                if (reg.idSize() > 4) {
                    evex.X = 0; // Inverted
                    if (reg.id & 8)
                        evex.B = 0;
                    else
                        evex.B = 1;
                }
            }
        }
        var mem = this.ops.getMemoryOperand();
        if (mem) {
            if (mem.base && (mem.base.idSize() > 3))
                evex.B = 0; // Inverted
            if (mem.index && (mem.index.idSize() > 3))
                evex.X = 0; // Inverted
        }
        if (this.opts.mask)
            this.mask(this.opts.mask);
        if (typeof this.opts.z !== 'undefined')
            this.z(this.opts.z);
    };
    // Set mask register for `EVEX` instructions.
    Instruction.prototype.mask = function (k) {
        if (!(this.pfxEx instanceof p.PrefixEvex))
            throw Error('Cannot set mask on non-EVEX instruction.');
        if (k.id === 0)
            throw TypeError('Mask register 000 cannot be used as mask.');
        this.pfxEx.aaa = k.get3bitId();
        return this;
    };
    // Set `z` bit for `EVEX` instructions.
    Instruction.prototype.z = function (value) {
        if (value === void 0) { value = 1; }
        if (!(this.pfxEx instanceof p.PrefixEvex))
            throw Error('Cannot set z-bit on non-EVEX instruction.');
        this.pfxEx.z = value ? 1 : 0;
        return this;
    };
    Instruction.prototype.createOpcode = function () {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.opcode;
        var _a = this.ops.list, dst = _a[0], src = _a[1];
        if (def.regInOp) {
            // We have register encoded in op-code here.
            if (!dst || (!dst.isRegister()))
                throw TypeError("Operation needs destination Register.");
            opcode.op = (opcode.op & p.Opcode.MASK_OP) | dst.get3bitId();
        }
        else {
            // Direction bit `d`
            if (this.def.opcodeDirectionBit) {
                var direction = p.Opcode.DIRECTION.REG_IS_DST;
                if (src instanceof o.Register) {
                    direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }
                // *reg-to-reg* operation
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
        var encoding = this.def.opEncoding;
        var mod = 0, reg = 0, rm = 0;
        var _a = this.ops.list, dst = _a[0], src = _a[1];
        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && !!dst; // Destination operand is NOT encoded in main op-code byte.
        if (has_opreg || dst_in_modrm) {
            // var reg_is_dst = !!(this.opcode.op & p.Opcode.DIRECTION.REG_IS_DST);
            var reg_is_dst = this.def.opEncoding[0] !== 'm' ? true : false;
            if (has_opreg) {
                // If we have `opreg`, then instruction has up to one operand.
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
                // Reg-to-reg instruction;
                if ((encoding.length === 2) && (dst instanceof o.Register) && (src instanceof o.Register)) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    var regreg = (reg_is_dst ? dst : src);
                    var rmreg = (reg_is_dst ? src : dst);
                    reg = regreg.get3bitId();
                    rm = rmreg.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    this.length++;
                    this.lengthMax++;
                    return;
                }
                var rpos = encoding.indexOf('r');
                var rreg;
                if ((rpos > -1) && (rreg = this.ops.getAtIndexOfClass(rpos, o.Register))) {
                    reg = rreg.get3bitId();
                }
                else {
                    // var r: o.Register = this.op.getRegisterOperand(this.regToRegDirectionRegIsDst);
                    var r = this.ops.getRegisterOperand(this.regToRegDirectionRegIsDst ? 0 : 1);
                    if (!r)
                        r = this.ops.getRegisterOperand();
                    if (r) {
                        mod = p.Modrm.MOD.REG_TO_REG;
                        reg = r.get3bitId();
                    }
                }
            }
            var mpos = encoding.indexOf('m');
            if (mpos > -1) {
                var mreg = this.ops.getAtIndexOfClass(mpos, o.Register);
                if (mreg) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = mreg.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    this.length++;
                    this.lengthMax++;
                    return;
                }
            }
            else {
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            if (!dst) {
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            // `o.Memory` class makes sure that ESP cannot be a SIB index register and
            // that EBP always has displacement value even if 0x00.
            // Memory operand can be encoded in only one way (Modrm.rm + SIB) so we
            // ignore here `def.opEncoding` field.
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
            // dispX
            // We use `disp32` with SIB byte version because the version without SIB byte
            // will be used for RIP-relative addressing.
            if (!m.base && !m.index && m.displacement) {
                m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                mod = p.Modrm.MOD.INDIRECT;
                rm = p.Modrm.RM.NEEDS_SIB; // SIB byte follows
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            // [BASE]
            // [BASE] + dispX
            // `o.Memory` class makes sure that EBP always has displacement value even if 0x00,
            // so EBP will not appear here.
            if (m.base && !m.index) {
                mod = p.Modrm.getModDispSize(m);
                if (mod === p.Modrm.MOD.DISP32)
                    m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                // SIB byte follows in `[RSP]` case, and `[RBP]` is impossible as RBP
                // always has a displacement, [RBP] case is used for RIP-relative addressing.
                rm = m.base.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }
            // [BASE + INDEX x SCALE] + dispX
            if (m.base || m.index) {
                mod = p.Modrm.getModDispSize(m);
                if (m.displacement)
                    if ((mod === p.Modrm.MOD.DISP32) || (mod === p.Modrm.MOD.INDIRECT))
                        m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                rm = p.Modrm.RM.NEEDS_SIB; // SIB byte follows
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
            // RSP register cannot be used as index, `o.Memory` class already ensures it
            // if used in normal way.
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
                // Displacement will be at least 1 byte,
                // but we skip `this.length` for now.
                this.lengthMax += o.DisplacementValue.SIZE.DISP32 / 8; // max 4 bytes
            }
            else {
                var size = this.displacement.value.size / 8;
                this.length += size;
                this.lengthMax += size;
            }
        }
        else if (this.modrm && this.sib && (this.sib.B === p.Sib.BASE_NONE)) {
            // Some SIB byte encodings require displacement, if we don't have displacement yet
            // add zero displacement.
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
        var max = 2; // Up to 2 immediates.
        for (var j = 0; j < max; j++) {
            var imm = this.ops.getImmediate(j);
            var immp;
            if (imm) {
                // If immediate does not have concrete size, use the size of instruction operands.
                // if(imm.constructor === o.Immediate) {
                //     var ImmediateClass = this.def.getImmediateClass();
                //     if(ImmediateClass) imm = new ImmediateClass(imm.value, imm.signed);
                //     else {
                //         var size = this.op.size;
                //         imm = o.Immediate.factory(size, imm.value, imm.signed);
                //         imm.extend(size);
                //     }
                // }
                // if (this.displacement && (this.displacement.value.size === SIZE.Q))
                //     throw TypeError(`Cannot have Immediate with ${SIZE.Q} bit Displacement.`);
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
// Wrapper around multiple instructions when different machine instructions can be used to perform the same task.
// For example, `jmp` with `rel8` or `rel32` immediate, or when multiple instruction definitions match provided operands.
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
