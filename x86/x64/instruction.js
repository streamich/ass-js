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
var operand_1 = require("../../operand");
var o = require("../operand");
var i = require("../instruction");
var p = require("../parts");
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Instruction.prototype.needs32To64OperandSizeChange = function () {
        return this.def.operandSize === operand_1.SIZE.Q;
    };
    Instruction.prototype.needsRexPrefix = function () {
        if (this.pfxEx)
            return false;
        if (this.def.rex)
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
        if (this.def.opEncoding === 'mr')
            _b = [src, dst], dst = _b[0], src = _b[1];
        var W = 0, R = 0, X = 0, B = 0;
        if (this.needs32To64OperandSizeChange() && (this.def.operandSizeDefault !== operand_1.SIZE.Q))
            W = 1;
        var pos = this.def.opEncoding.indexOf('m');
        if (pos > -1) {
            var m = this.ops.getMemoryOperand();
            if (m) {
                if (m.base && (m.base.idSize() > 3))
                    B = 1;
                if (m.index && (m.index.idSize() > 3))
                    X = 1;
            }
        }
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
                if (r.idSize() > 3)
                    if (mem)
                        R = 1;
                    else
                        B = 1;
            }
        }
        this.pfxEx = new p.PrefixRex(W, R, X, B);
        this.length++;
        this.lengthMax++;
        var _b;
    };
    Instruction.prototype.createModrm = function () {
        var mem = this.ops.getMemoryOperand();
        if (mem && mem.base && (mem.base instanceof o.RegisterRip)) {
            if (mem.index || mem.scale)
                throw TypeError('RIP-relative addressing does not support index and scale addressing.');
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
            this.lengthMax++;
        }
        else
            _super.prototype.createModrm.call(this);
    };
    Instruction.prototype.fixDisplacementSize = function () {
        var mem = this.ops.getMemoryOperand();
        if (mem && (typeof mem == 'object') && (mem.base instanceof o.RegisterRip)) {
        }
        else
            _super.prototype.fixDisplacementSize.call(this);
    };
    Instruction.prototype.createDisplacement = function () {
        var mem = this.ops.getMemoryOperand();
        if (mem && (typeof mem == 'object') && (mem.base instanceof o.RegisterRip)) {
            if (!mem.displacement)
                mem.disp(0);
            var size = o.DisplacementValue.SIZE.DISP32;
            if (mem.displacement.size < size)
                mem.displacement.signExtend(size);
            this.displacement = new p.Displacement(mem.displacement);
            this.length += size / 8;
            this.lengthMax += size / 8;
        }
        else
            return _super.prototype.createDisplacement.call(this);
    };
    return Instruction;
}(i.Instruction));
exports.Instruction = Instruction;
