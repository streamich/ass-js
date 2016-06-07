import * as r from '../x86/regfile';
import * as o from '../x86/operand';
import * as i from '../x86/instruction';
import * as p from '../x86/parts';


export class Instruction extends i.Instruction {

    pfxRex: p.PrefixRex = null;

    bytes(): number {
        var bytes = super.bytes();
        if(this.pfxRex) bytes++;
        return bytes;
    }

    protected writePrefixes(arr: number[]) {
        super.writePrefixes(arr);
        if(this.pfxRex) this.pfxRex.write(arr); // REX prefix must precede immediate op-code byte.
    }

    protected needs32To64OperandSizeChange() {
        // Default operand size in x64 mode is 32 bits.
        // return this.op.size === o.SIZE.Q;
        return this.def.operandSize === o.SIZE.Q;
    }

    protected needsRexPrefix() {
        if(this.def.mandatoryRex) return true;
        if(!this.op.list.length) return false;
        // if(!this.op.hasRegisterOrMemory()) return false;
        if(this.op.hasExtendedRegister()) return true;

        var {dst, src} = this.op;
        // sil, dil, spl, bpl
        // if(((dst instanceof o.Register8) && !(dst instanceof o.Register8High) && (dst.id >= r.R8.SPL) && (dst.id <= r.R8.DIL)) ||
        //     ((src instanceof o.Register8) && !(src instanceof o.Register8High) && (src.id >= r.R8.SPL) && (src.id <= r.R8.DIL))) return true;
        if((dst === o.sil) || (dst === o.dil) || (dst === o.spl) || (dst === o.bpl) ||
            (src === o.sil) || (src === o.dil) || (src === o.spl) || (src === o.bpl)) return true;

        if(this.def.operandSizeDefault === o.SIZE.Q) return false;
        if(this.needs32To64OperandSizeChange()) return true;
        return false;
    }

    protected createPrefixes() {
        super.createPrefixes();
        if(this.needsRexPrefix()) this.createRex();
    }

    protected createRex() {
        var {dst, src} = this.op;
        if((dst instanceof o.Register8High) || (src instanceof o.Register8High))
            throw Error('Cannot encode REX prefix with high 8-bit register.');

        var W = 0, R = 0, X = 0, B = 0;

        if(this.needs32To64OperandSizeChange() && (this.def.operandSizeDefault !== o.SIZE.Q)) W = 1;

        var {dst, src} = this.op;

        if((dst instanceof o.Register) && (src instanceof o.Register)) {
            if((dst as o.Register).isExtended()) R = 1;
            if((src as o.Register).isExtended()) B = 1;
        } else {

            var r: o.Register = this.op.getRegisterOperand();
            var mem: o.Memory = this.op.getMemoryOperand();

            if(r) {
                if(r.isExtended())
                    if(mem) R = 1;
                    else    B = 1;
            }

            if(mem) {
                if(mem.base && mem.base.isExtended()) B = 1;
                if(mem.index && mem.index.isExtended()) X = 1;
            }
        }

        this.pfxRex = new p.PrefixRex(W, R, X, B);
    }

    // Adding RIP-relative addressing in long mode.
    //
    // > In the 64-bit mode, any instruction that uses ModRM addressing can use RIP-relative addressing.
    //
    // > Without RIP-relative addressing, ModRM instructions address memory relative to zero. With RIP-relative
    // > addressing, ModRM instructions can address memory relative to the 64-bit RIP using a signed
    // > 32-bit displacement.
    protected createModrm() {
        var mem: o.Memory = this.op.getMemoryOperand();
        if(mem && mem.base && (mem.base instanceof o.RegisterRip)) {
            if(mem.index || mem.scale)
                throw TypeError('RIP-relative addressing does not support index and scale addressing.');

            if(!mem.displacement)
                // throw TypeError('RIP-relative addressing requires 4-byte displacement.');
                mem.disp(0);
            if(mem.displacement.size < o.SIZE.D) // Maybe this should go to `.createDisplacement()`?
                mem.displacement.zeroExtend(o.SIZE.D);

            // Encode `Modrm.reg` field.
            var reg = 0;
            if(this.def.opreg > -1) {
                reg = this.def.opreg;
            } else {
                var r: o.Register = this.op.getRegisterOperand();
                if (r) reg = r.get3bitId();
            }

            this.modrm = new p.Modrm(p.Modrm.MOD.INDIRECT, reg, p.Modrm.RM.INDIRECT_DISP);

        } else super.createModrm();
    }
}
