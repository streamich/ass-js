"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var operand_1 = require('../../operand');
var o = require('../operand');
var i = require('../instruction');
var p = require('../parts');
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        _super.apply(this, arguments);
        this.pfxRex = null;
    }
    Instruction.prototype.writePrefixes = function (arr) {
        _super.prototype.writePrefixes.call(this, arr);
        if (this.pfxRex)
            this.pfxRex.write(arr);
    };
    Instruction.prototype.needs32To64OperandSizeChange = function () {
        return this.def.operandSize === operand_1.SIZE.Q;
    };
    Instruction.prototype.needsRexPrefix = function () {
        if (this.def.mandatoryRex)
            return true;
        if (!this.ops.list.length)
            return false;
        if (this.ops.hasExtendedRegister())
            return true;
        var _a = this.ops.list, dst = _a[0], src = _a[1];
        if ((dst === o.sil) || (dst === o.dil) || (dst === o.spl) || (dst === o.bpl) ||
            (src === o.sil) || (src === o.dil) || (src === o.spl) || (src === o.bpl))
            return true;
        if (this.def.operandSizeDefault === operand_1.SIZE.Q)
            return false;
        if (this.needs32To64OperandSizeChange())
            return true;
        return false;
    };
    Instruction.prototype.createPrefixes = function () {
        _super.prototype.createPrefixes.call(this);
        if (this.needsRexPrefix())
            this.createRex();
    };
    Instruction.prototype.createRex = function () {
        var _a = this.ops.list, dst = _a[0], src = _a[1];
        if ((dst instanceof o.Register8High) || (src instanceof o.Register8High))
            throw Error('Cannot encode REX prefix with high 8-bit register.');
        var W = 0, R = 0, X = 0, B = 0;
        if (this.needs32To64OperandSizeChange() && (this.def.operandSizeDefault !== operand_1.SIZE.Q))
            W = 1;
        if ((dst instanceof o.Register) && (src instanceof o.Register)) {
            if (dst.isExtended())
                R = 1;
            if (src.isExtended())
                B = 1;
        }
        else {
            var r = this.ops.getRegisterOperand();
            var mem = this.ops.getMemoryOperand();
            if (r) {
                if (r.isExtended())
                    if (mem)
                        R = 1;
                    else
                        B = 1;
            }
            if (mem) {
                if (mem.base && mem.base.isExtended())
                    B = 1;
                if (mem.index && mem.index.isExtended())
                    X = 1;
            }
        }
        this.pfxRex = new p.PrefixRex(W, R, X, B);
        this.length++;
    };
    Instruction.prototype.createModrm = function () {
        var mem = this.ops.getMemoryOperand();
        if (mem && mem.base && (mem.base instanceof o.RegisterRip)) {
            if (mem.index || mem.scale)
                throw TypeError('RIP-relative addressing does not support index and scale addressing.');
            if (!mem.displacement)
                mem.disp(0);
            if (mem.displacement.size < operand_1.SIZE.D)
                mem.displacement.zeroExtend(operand_1.SIZE.D);
            var reg = 0;
            if (this.def.opreg > -1) {
                reg = this.def.opreg;
            }
            else {
                var r = this.ops.getRegisterOperand();
                if (r)
                    reg = r.get3bitId();
            }
            this.modrm = new p.Modrm(p.Modrm.MOD.INDIRECT, reg, p.Modrm.RM.INDIRECT_DISP);
            this.length++;
        }
        else
            _super.prototype.createModrm.call(this);
    };
    return Instruction;
}(i.Instruction));
exports.Instruction = Instruction;
