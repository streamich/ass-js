"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('./operand');
var p = require('./parts');
exports.SIZE_MAX = 15; // Max instruction size in bytes.
exports.SIZE_UNKNOWN = -1;
var Expression = (function () {
    function Expression() {
        // Index where instruction was inserted in `Code`s buffer.
        this.index = 0;
        // Byte offset of the instruction in compiled machine code.
        this.offset = -1;
        // Same as `offset` but for instructions that we don't know byte size yet we assume `MAX_SIZE`.
        this.offsetMax = -1;
        this.code = null;
    }
    Expression.prototype.bind = function (code) {
        this.code = code;
    };
    Expression.prototype.calcOffsets = function () {
        // Calculate offset of this instruction inside the code block.
        if (this.index === 0) {
            this.offset = 0;
            this.offsetMax = 0;
        }
        else {
            var prev = this.code.expr[this.index - 1];
            var size = prev.bytes();
            if (size !== exports.SIZE_UNKNOWN) {
                if (prev.offset !== -1)
                    this.offset = prev.offset + size;
            }
            else
                this.offset = -1;
            if (prev.offsetMax !== -1)
                this.offsetMax = prev.offsetMax + prev.bytesMax();
        }
    };
    Expression.prototype.build = function () {
        this.calcOffsets();
    };
    // Generate everything necessary to be able to write expression out into binary buffer.
    Expression.prototype.compile = function () {
        this.calcOffsets();
        return this;
    };
    // Size in bytes of the instruction.
    Expression.prototype.bytes = function () {
        return exports.SIZE_UNKNOWN;
    };
    Expression.prototype.bytesMax = function () {
        return this.bytes();
    };
    Expression.prototype.rel = function (offset) {
        if (offset === void 0) { offset = 0; }
        var rel = new o.Relative(this, offset);
        return rel;
    };
    return Expression;
}());
exports.Expression = Expression;
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(name) {
        _super.call(this);
        if ((typeof name !== 'string') || !name)
            throw TypeError('Label name must be a non-empty string.');
        this.name = name;
    }
    Label.prototype.write = function (arr) {
        return arr;
    };
    Label.prototype.bytes = function () {
        return 0;
    };
    Label.prototype.toString = function () {
        return this.name + ':';
    };
    return Label;
}(Expression));
exports.Label = Label;
var Data = (function (_super) {
    __extends(Data, _super);
    function Data() {
        _super.apply(this, arguments);
        this.octets = [];
    }
    Data.prototype.write = function (arr) {
        this.offset = arr.length;
        arr = arr.concat(this.octets);
        return arr;
    };
    Data.prototype.bytes = function () {
        return this.octets.length;
    };
    Data.prototype.toString = function (margin) {
        if (margin === void 0) { margin = '    '; }
        var data = this.octets.map(function (byte) {
            return byte <= 0xF ? '0' + byte.toString(16).toUpperCase() : byte.toString(16).toUpperCase();
        });
        return margin + 'db 0x' + data.join(', 0x');
    };
    return Data;
}(Expression));
exports.Data = Data;
var DataUninitialized = (function (_super) {
    __extends(DataUninitialized, _super);
    function DataUninitialized(length) {
        _super.call(this);
        this.length = length;
    }
    DataUninitialized.prototype.write = function (arr) {
        this.offset = arr.length;
        arr = arr.concat(new Array(this.length));
        return arr;
    };
    DataUninitialized.prototype.bytes = function () {
        return this.length;
    };
    DataUninitialized.prototype.toString = function (margin) {
        if (margin === void 0) { margin = '    '; }
        return margin + 'resb ' + this.length;
    };
    return DataUninitialized;
}(Expression));
exports.DataUninitialized = DataUninitialized;
// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        _super.apply(this, arguments);
        this.code = null;
        this.def = null;
        this.op = null;
        // Instruction parts.
        this.pfxOpSize = null;
        this.pfxAddrSize = null;
        this.pfxLock = null;
        this.pfxRep = null;
        this.pfxRepne = null;
        this.pfxSegment = null;
        this.prefixes = [];
        this.opcode = new p.Opcode; // required
        this.modrm = null;
        this.sib = null;
        this.displacement = null;
        this.immediate = null;
        // Size in bytes of this instruction.
        this.length = 0;
        // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
        // We set this to `false` to be compatible with GAS assembly, which we use for testing.
        this.regToRegDirectionRegIsDst = false;
    }
    // constructor(code: Code, def: Definition, op: Operands) {
    // constructor(def: d.Def, op: o.Operands) {
    //     super();
    //     this.def = def;
    //     this.op = op;
    // }
    Instruction.prototype.build = function () {
        _super.prototype.build.call(this);
        this.pfxOpSize = null;
        this.pfxAddrSize = null;
        this.pfxLock = null;
        this.pfxRep = null;
        this.pfxRepne = null;
        this.pfxSegment = null;
        this.prefixes = [];
        this.opcode = new p.Opcode; // required
        this.modrm = null;
        this.sib = null;
        this.displacement = null;
        this.immediate = null;
        this.createPrefixes();
        this.createOpcode();
        this.createModrm();
        this.createSib();
        this.createDisplacement();
        this.createImmediate();
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
        if (this.offset === -1)
            this.offset = arr.length;
        this.writePrefixes(arr);
        this.opcode.write(arr);
        if (this.modrm)
            this.modrm.write(arr);
        if (this.sib)
            this.sib.write(arr);
        if (this.displacement)
            this.displacement.write(arr);
        if (this.immediate)
            this.immediate.write(arr);
        return arr;
    };
    Instruction.prototype.bytes = function () {
        return this.length;
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
        parts.push(this.def.getMnemonic());
        if ((parts.join(' ')).length < 8)
            parts.push((new Array(7 - (parts.join(' ')).length)).join(' '));
        if (this.op.list.length)
            parts.push(this.op.toString());
        var expression = margin + parts.join(' ');
        var offset = 'XXXXXX';
        if (this.offset !== -1) {
            offset = this.offset.toString(16).toUpperCase();
            offset = (new Array(7 - offset.length)).join('0') + offset;
        }
        var max_offset = 'XXXXXX';
        if (this.offsetMax !== -1) {
            max_offset = this.offsetMax.toString(16).toUpperCase();
            max_offset = (new Array(7 - max_offset.length)).join('0') + max_offset;
        }
        var comment = '';
        if (hex) {
            var cols = 36;
            var spaces = (new Array(1 + Math.max(0, cols - expression.length))).join(' ');
            var octets = this.write([]).map(function (byte) {
                return byte <= 0xF ? '0' + byte.toString(16).toUpperCase() : byte.toString(16).toUpperCase();
            });
            comment = spaces + ("; " + offset + "|" + max_offset + ": 0x") + octets.join(', 0x'); // + ' / ' + this.def.toString();
        }
        return expression + comment;
    };
    Instruction.prototype.needsOperandSizeOverride = function () {
        if (!this.op.list.length)
            return false;
        if ((this.code.operandSize === o.SIZE.D) && (this.def.operandSize === o.SIZE.W))
            return true;
        if ((this.code.operandSize === o.SIZE.W) && (this.def.operandSize === o.SIZE.D))
            return true;
        return false;
    };
    Instruction.prototype.needsAddressSizeOverride = function () {
        var mem = this.op.getMemoryOperand();
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
        }
        if (this.needsAddressSizeOverride()) {
            this.pfxAddrSize = new p.PrefixAddressSizeOverride;
            this.length++;
        }
        // Mandatory prefixes required by op-code.
        if (this.def.prefixes) {
            for (var _i = 0, _a = this.def.prefixes; _i < _a.length; _i++) {
                var val = _a[_i];
                this.prefixes.push(new p.PrefixStatic(val));
            }
            this.length += this.def.prefixes.length;
        }
    };
    Instruction.prototype.createOpcode = function () {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.opcode;
        var _a = this.op, dst = _a.dst, src = _a.src;
        if (def.regInOp) {
            // We have register encoded in op-code here.
            if (!dst || !dst.isRegister())
                throw TypeError("Operation needs destination register.");
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
        this.length += opcode.bytes();
    };
    Instruction.prototype.createModrm = function () {
        if (!this.def.useModrm)
            return;
        if (!this.op.hasRegisterOrMemory())
            return;
        var _a = this.op, dst = _a.dst, src = _a.src;
        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && !!dst; // Destination operand is NOT encoded in main op-code byte.
        if (has_opreg || dst_in_modrm) {
            var mod = 0, reg = 0, rm = 0;
            var reg_is_dst = !!(this.opcode.op & p.Opcode.DIRECTION.REG_IS_DST);
            if (has_opreg) {
                // If we have `opreg`, then instruction has up to one operand.
                reg = this.def.opreg;
                var r = this.op.getRegisterOperand();
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = r.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    this.length++;
                    return;
                }
            }
            else {
                // var r: o.Register = this.op.getRegisterOperand(this.regToRegDirectionRegIsDst);
                var r = this.op.getRegisterOperand(reg_is_dst);
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    reg = r.get3bitId();
                }
            }
            if (!dst) {
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                return;
            }
            // Reg-to-reg instruction;
            if ((dst instanceof o.Register) && (src instanceof o.Register)) {
                mod = p.Modrm.MOD.REG_TO_REG;
                // var rmreg: o.Register = (this.regToRegDirectionRegIsDst ? src : dst) as o.Register;
                var rmreg = (reg_is_dst ? src : dst);
                rm = rmreg.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                return;
            }
            // `o.Memory` class makes sure that ESP cannot be a SIB index register and
            // that EBP always has displacement value even if 0x00.
            var m = this.op.getMemoryOperand();
            if (!m) {
                // throw Error('No Memory reference for Modrm byte.');
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
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
        var m = this.op.getMemoryOperand();
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
    };
    Instruction.prototype.createDisplacement = function () {
        var m = this.op.getMemoryOperand();
        if (m && m.displacement) {
            this.displacement = new p.Displacement(m.displacement);
            this.length += this.displacement.value.size / 8;
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
            this.length += this.displacement.value.size / 8;
        }
    };
    Instruction.prototype.createImmediate = function () {
        var imm = this.op.getImmediate();
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
            // if (this.displacement && (this.displacement.value.size === o.SIZE.Q))
            //     throw TypeError(`Cannot have Immediate with ${o.SIZE.Q} bit Displacement.`);
            this.immediate = new p.Immediate(imm);
            this.length += this.immediate.value.size >> 3;
        }
    };
    return Instruction;
}(Expression));
exports.Instruction = Instruction;
// Wrapper around multiple instructions when different machine instructions can be used to perform the same task.
// For example, `jmp` with `rel8` or `rel32` immediate, or when multiple instruction definitions match provided operands.
var InstructionCandidates = (function (_super) {
    __extends(InstructionCandidates, _super);
    function InstructionCandidates() {
        _super.apply(this, arguments);
        this.matches = null;
        this.operands = [];
        this.insn = [];
        this.picked = -1; // Index of instruction that was eventually chosen.
    }
    InstructionCandidates.prototype.lock = function () {
        for (var _i = 0, _a = this.insn; _i < _a.length; _i++) {
            var insn = _a[_i];
            insn.lock();
        }
        return this;
    };
    InstructionCandidates.prototype.write = function (arr) {
        if (this.picked === -1)
            throw Error('Instruction candidates not reduced.');
        return this.getPicked().write(arr);
    };
    InstructionCandidates.prototype.toString = function (margin, hex) {
        if (margin === void 0) { margin = '    '; }
        if (hex === void 0) { hex = true; }
        if (this.picked === -1) {
            var str = '(one of:)\n';
            var lines = [];
            for (var i = 0; i < this.insn.length; i++) {
                if (this.insn[i].op)
                    lines.push(this.insn[i].toString(margin, hex));
                else
                    lines.push('    ' + this.matches.list[i].def.toString());
            }
            // for(var match of this.matches.list) {
            //     lines.push('    ' + match.def.toString());
            // }
            return str + lines.join('\n');
        }
        else
            return this.getPicked().toString(margin, hex);
    };
    InstructionCandidates.prototype.getPicked = function () {
        return this.insn[this.picked];
    };
    InstructionCandidates.prototype.bytes = function () {
        return this.picked === -1 ? exports.SIZE_UNKNOWN : this.getPicked().bytes();
    };
    InstructionCandidates.prototype.bytesMax = function () {
        var max = 0;
        for (var _i = 0, _a = this.insn; _i < _a.length; _i++) {
            var ins = _a[_i];
            if (ins) {
                var bytes = ins.bytes();
                if (bytes > max)
                    max = bytes;
            }
        }
        return bytes;
    };
    InstructionCandidates.prototype.pickShortestInstruction = function () {
        // Pick the shortest instruction if we know all instruction sizes, otherwise don't pick any.
        var size = exports.SIZE_UNKNOWN;
        var isize = 0;
        for (var j = 0; j < this.insn.length; j++) {
            var insn = this.insn[j];
            isize = insn.bytes();
            if (isize === exports.SIZE_UNKNOWN) {
                this.picked = -1;
                return null;
            }
            if ((size === exports.SIZE_UNKNOWN) || (isize < size)) {
                size = isize;
                this.picked = j;
            }
        }
        return this.getPicked();
    };
    InstructionCandidates.prototype.build = function () {
        _super.prototype.build.call(this);
        var len = this.matches.list.length;
        this.insn = new Array(len);
        for (var j = 0; j < len; j++) {
            var match = this.matches.list[j];
            var insn = new this.code.ClassInstruction;
            insn.index = this.index;
            insn.def = match.def;
            try {
                var ops = o.Operands.fromUiOpsAndTpl(insn, this.operands, match.opTpl);
                insn.op = ops;
                insn.bind(this.code);
                insn.build();
                this.insn[j] = insn;
            }
            catch (e) {
                this.insn[j] = null;
            }
        }
    };
    InstructionCandidates.prototype.compile = function () {
        this.calcOffsets();
        return this;
    };
    return InstructionCandidates;
}(Expression));
exports.InstructionCandidates = InstructionCandidates;
