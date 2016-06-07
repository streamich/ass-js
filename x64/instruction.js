"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('../x86/operand');
var i = require('../x86/instruction');
var p = require('../x86/parts');
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        _super.apply(this, arguments);
        this.pfxRex = null;
    }
    Instruction.prototype.bytes = function () {
        var bytes = _super.prototype.bytes.call(this);
        if (this.pfxRex)
            bytes++;
        return bytes;
    };
    Instruction.prototype.writePrefixes = function (arr) {
        _super.prototype.writePrefixes.call(this, arr);
        if (this.pfxRex)
            this.pfxRex.write(arr); // REX prefix must precede immediate op-code byte.
    };
    Instruction.prototype.needs32To64OperandSizeChange = function () {
        // Default operand size in x64 mode is 32 bits.
        // return this.op.size === o.SIZE.Q;
        return this.def.operandSize === o.SIZE.Q;
    };
    Instruction.prototype.needsRexPrefix = function () {
        if (this.def.mandatoryRex)
            return true;
        if (!this.op.list.length)
            return false;
        // if(!this.op.hasRegisterOrMemory()) return false;
        if (this.op.hasExtendedRegister())
            return true;
        var _a = this.op, dst = _a.dst, src = _a.src;
        // sil, dil, spl, bpl
        // if(((dst instanceof o.Register8) && !(dst instanceof o.Register8High) && (dst.id >= r.R8.SPL) && (dst.id <= r.R8.DIL)) ||
        //     ((src instanceof o.Register8) && !(src instanceof o.Register8High) && (src.id >= r.R8.SPL) && (src.id <= r.R8.DIL))) return true;
        if ((dst === o.sil) || (dst === o.dil) || (dst === o.spl) || (dst === o.bpl) ||
            (src === o.sil) || (src === o.dil) || (src === o.spl) || (src === o.bpl))
            return true;
        if (this.def.operandSizeDefault === o.SIZE.Q)
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
        var _a = this.op, dst = _a.dst, src = _a.src;
        if ((dst instanceof o.Register8High) || (src instanceof o.Register8High))
            throw Error('Cannot encode REX prefix with high 8-bit register.');
        var W = 0, R = 0, X = 0, B = 0;
        if (this.needs32To64OperandSizeChange() && (this.def.operandSizeDefault !== o.SIZE.Q))
            W = 1;
        var _b = this.op, dst = _b.dst, src = _b.src;
        if ((dst instanceof o.Register) && (src instanceof o.Register)) {
            if (dst.isExtended())
                R = 1;
            if (src.isExtended())
                B = 1;
        }
        else {
            var r = this.op.getRegisterOperand();
            var mem = this.op.getMemoryOperand();
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
    };
    // Adding RIP-relative addressing in long mode.
    //
    // > In the 64-bit mode, any instruction that uses ModRM addressing can use RIP-relative addressing.
    //
    // > Without RIP-relative addressing, ModRM instructions address memory relative to zero. With RIP-relative
    // > addressing, ModRM instructions can address memory relative to the 64-bit RIP using a signed
    // > 32-bit displacement.
    Instruction.prototype.createModrm = function () {
        var mem = this.op.getMemoryOperand();
        if (mem && mem.base && (mem.base instanceof o.RegisterRip)) {
            if (mem.index || mem.scale)
                throw TypeError('RIP-relative addressing does not support index and scale addressing.');
            if (!mem.displacement)
                // throw TypeError('RIP-relative addressing requires 4-byte displacement.');
                mem.disp(0);
            if (mem.displacement.size < o.SIZE.D)
                mem.displacement.zeroExtend(o.SIZE.D);
            // Encode `Modrm.reg` field.
            var reg = 0;
            if (this.def.opreg > -1) {
                reg = this.def.opreg;
            }
            else {
                var r = this.op.getRegisterOperand();
                if (r)
                    reg = r.get3bitId();
            }
            this.modrm = new p.Modrm(p.Modrm.MOD.INDIRECT, reg, p.Modrm.RM.INDIRECT_DISP);
        }
        else
            _super.prototype.createModrm.call(this);
    };
    return Instruction;
}(i.Instruction));
exports.Instruction = Instruction;
