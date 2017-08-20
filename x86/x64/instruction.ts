import {SIZE} from '../../operand';
import * as o from '../operand';
import * as i from '../instruction';
import * as p from '../parts';


export class Instruction extends i.Instruction {

    protected needs32To64OperandSizeChange() {
        // Default operand size in x64 mode is 32 bits.
        return this.def.operandSize === SIZE.Q;
    }

    protected needsRexPrefix() {
        if(this.pfxEx) return false; // VEX or EVEX already set
        if(this.def.rex) return true;
        if(!this.ops.list.length) return false;
        // if(!this.ops.hasRegisterOrMemory()) return false;
        
        if(this.ops.hasExtendedRegister()) return true;

        var [dst, src] = this.ops.list;
        // sil, dil, spl, bpl
        // if(((dst instanceof o.Register8) && !(dst instanceof o.Register8High) && (dst.id >= r.R8.SPL) && (dst.id <= r.R8.DIL)) ||
        //     ((src instanceof o.Register8) && !(src instanceof o.Register8High) && (src.id >= r.R8.SPL) && (src.id <= r.R8.DIL))) return true;
        if((dst === o.sil) || (dst === o.dil) || (dst === o.spl) || (dst === o.bpl) ||
            (src === o.sil) || (src === o.dil) || (src === o.spl) || (src === o.bpl)) return true;

        if(this.def.operandSizeDefault === SIZE.Q) return false;
        if(this.needs32To64OperandSizeChange()) return true;
        return false;
    }

    protected createPrefixes() {
        super.createPrefixes();
        if(this.needsRexPrefix()) this.createRex();
    }

    protected createRex() {
        var [dst, src] = this.ops.list;
        if((dst instanceof o.Register8High) || (src instanceof o.Register8High))
            throw Error('Cannot encode REX prefix with high 8-bit register.');

        if(this.def.opEncoding === 'mr')
            [dst, src] = [src, dst];

        var W = 0, R = 0, X = 0, B = 0;

        if(this.needs32To64OperandSizeChange() && (this.def.operandSizeDefault !== SIZE.Q)) W = 1;

        var pos = this.def.opEncoding.indexOf('m');
        if(pos > -1) {
            var m = this.ops.getMemoryOperand() as o.Memory; // Memory operand is only one.
            if(m) {
                if(m.base && (m.base.idSize() > 3)) B = 1;
                if(m.index && (m.index.idSize() > 3)) X = 1;
            }
        }

        if((dst instanceof o.Register) && (src instanceof o.Register)) {
            if((dst as o.Register).isExtended()) R = 1;
            if((src as o.Register).isExtended()) B = 1;
        } else {

            var r = this.ops.getRegisterOperand();
            var mem: o.Memory = this.ops.getMemoryOperand() as o.Memory;

            if(r) {
                if(r.idSize() > 3)
                    if(mem) R = 1;
                    else    B = 1;
            }
        }

        this.pfxEx = new p.PrefixRex(W, R, X, B);
        this.length++;
        this.lengthMax++;
    }

    // Adding RIP-relative addressing in long mode.
    //
    // > In the 64-bit mode, any instruction that uses ModRM addressing can use RIP-relative addressing.
    //
    // > Without RIP-relative addressing, ModRM instructions address memory relative to zero. With RIP-relative
    // > addressing, ModRM instructions can address memory relative to the 64-bit RIP using a signed
    // > 32-bit displacement.
    protected createModrm() {
        var mem: o.Memory = this.ops.getMemoryOperand() as o.Memory;
        if(mem && mem.base && (mem.base instanceof o.RegisterRip)) {
            if(mem.index || mem.scale)
                throw TypeError('RIP-relative addressing does not support index and scale addressing.');

            // Encode `Modrm.reg` field.
            var reg = 0;
            if(this.def.opreg > -1) {
                reg = this.def.opreg;
            } else {
                var r = this.ops.getRegisterOperand();
                if(r) reg = r.get3bitId();
            }

            this.modrm = new p.Modrm(p.Modrm.MOD.INDIRECT, reg, p.Modrm.RM.INDIRECT_DISP);
            this.length++;
            this.lengthMax++;

        } else super.createModrm();
    }

    protected fixDisplacementSize() {
        var mem = this.ops.getMemoryOperand();
        if(mem && (typeof mem == 'object') && (mem.base instanceof o.RegisterRip)) { // RIP-relative addressing
            // Do nothing as we already created RIP-displacement which is always 4-bytes.
        } else
            super.fixDisplacementSize();
    }

    protected createDisplacement() {
        var mem = this.ops.getMemoryOperand() as o.Memory;
        if(mem && (typeof mem == 'object') && (mem.base instanceof o.RegisterRip)) {
            // RIP-relative addressing has always 4-byte displacement.

            if(!mem.displacement) mem.disp(0);

            var size = o.DisplacementValue.SIZE.DISP32;
            if(mem.displacement.size < size)
                mem.displacement.signExtend(size);

            this.displacement = new p.Displacement(mem.displacement);

            this.length += size / 8;
            this.lengthMax += size / 8;

        } else
            return super.createDisplacement();
    }
}
