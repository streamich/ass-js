import {SIZE} from '../operand';
import * as oo from '../operand';
import * as o from './operand';
import * as t from './table';
import * as i from '../instruction';
import * as p from './parts';
import * as d from './def';
import * as c from './code';


export const SIZE_UNKNOWN = -1;

export abstract class Expression extends i.Expression {}


export class TemplateLock extends i.Template {
    name = 'lock';
    octets = [p.PREFIX.LOCK];
}

export class TemplateRex extends i.Template {
    name = 'rex';
    args = [0, 0, 0, 0];

    constructor(args) {
        super(args);
        var [W, R, X, B] = this.args;
        var rex = new p.PrefixRex(W, R, X, B);
        rex.write(this.octets);
    }
}


export class Align extends i.Align {

    static nop = [
        [0x90],                                                 // 1 byte : NOP = XCHG (E)AX, (E)AX
        [0x66, 0x90],                                           // 2 : 66 NOP
        [0x0F, 0x1F, 0x00],                                     // 3 : NOP DWORD ptr [EAX]
        [0x0F, 0x1F, 0x40, 0x00],                               // 4 : NOP DWORD ptr [EAX + 00H]
        [0x0F, 0x1F, 0x44, 0x00, 0x00],                         // 5 : NOP DWORD ptr [EAX + EAX*1 + 00H]
        [0x66, 0x0F, 0x1F, 0x44, 0x00, 0x00],                   // 6 : 66 NOP DWORD ptr [EAX + EAX*1 + 00H]
        [0x0F, 0x1F, 0x80, 0x00, 0x00, 0x00, 0x00],             // 7 : NOP DWORD ptr [EAX + 00000000H]
        [0x0F, 0x1F, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00],       // 8 : NOP DWORD ptr [EAX + EAX*1 + 00000000H]
        [0x66, 0x0F, 0x1F, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00], // 9 : 66 NOP DWORD ptr [EAX + EAX*1 + 00000000H]
    ];
    
    templates = Align.nop;
}


export interface IInstruction {
    lock(): this;
    bt(): this;
    bnt(): this;
    rep(): this;
    repe(): this;
    repz(): this;
    repnz(): this;
    repne(): this;
    cs(): this;
    ss(): this;
    ds(): this;
    es(): this;
    fs(): this;
    gs(): this;
}


// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
export class Instruction extends i.Instruction implements IInstruction {
    def: d.Def;
    ops: o.Operands;
    opts: c.IInstructionOptions;

    // Instruction parts.
    pfxOpSize: p.PrefixOperandSizeOverride = null;
    pfxAddrSize: p.PrefixAddressSizeOverride = null;
    pfxLock: p.PrefixLock = null;
    pfxRep: p.PrefixRep|p.PrefixRepe = null;
    pfxRepne: p.PrefixRepne = null;
    pfxSegment: p.PrefixStatic = null;
    prefixes: p.PrefixStatic[] = [];
    pfxEx: p.PrefixRex|p.PrefixVex|p.PrefixEvex = null;  // One of REX, VEX, EVEX prefixes, only one allowed.
    opcode: p.Opcode = new p.Opcode; // required
    modrm: p.Modrm = null;
    sib: p.Sib = null;
    displacement: p.Displacement = null;
    immediates: p.Immediate[] = [];

    // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
    // We set this to `false` to be compatible with GAS assembly, which we use for testing.
    protected regToRegDirectionRegIsDst: boolean = false;


    build(): this {
        super.build();

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
    }

    protected writePrefixes(arr: number[]) {
        if(this.pfxLock)        this.pfxLock.write(arr);
        if(this.pfxRep)         this.pfxRep.write(arr);
        if(this.pfxRepne)       this.pfxRepne.write(arr);
        if(this.pfxAddrSize)    this.pfxAddrSize.write(arr);
        if(this.pfxSegment)     this.pfxSegment.write(arr);
        if(this.pfxOpSize)      this.pfxOpSize.write(arr);
        for(var pfx of this.prefixes) pfx.write(arr);
        if(this.pfxEx)          this.pfxEx.write(arr);
    }

    write(arr: number[]): number[] {
        this.writePrefixes(arr);
        this.opcode.write(arr);
        if(this.modrm)              this.modrm.write(arr);
        if(this.sib)                this.sib.write(arr);
        if(this.displacement)       this.displacement.write(arr);
        if(this.immediates.length)  for(var imm of this.immediates) imm.write(arr);
        return arr;
    }

    protected fixDisplacementSize() {
        if(this.displacement && this.displacement.value.variable) {
            var variable = this.displacement.value.variable;
            var val = variable.evaluatePreliminary(this);
            var size = oo.Constant.sizeClass(val);
            if(size > o.DisplacementValue.SIZE.DISP8)   this.length += o.DisplacementValue.SIZE.DISP32 / 8;
            else                                        this.length += o.DisplacementValue.SIZE.DISP8 / 8;
        }
    }

    getFixedSizeExpression() {
        // Determine size of displacement
        this.fixDisplacementSize();
        return super.getFixedSizeExpression();
    }

    evaluate(): boolean {
        this.ops.evaluate(this);

        var max = 2; // Up to 2 immediates.
        for(var j = 0; j < max; j++) {
            var rel = this.ops.getRelative(j);
            if(rel) {
                var res = (rel.result as number);
                // var res = (rel.result as number) - this.bytes();
                this.immediates[j].value.setValue(res);
            }
        }

        // Evaluate displacement variable.
        if(this.displacement && this.displacement.value.variable) {
            var value = this.displacement.value;
            var variable = value.variable;
            var val = variable.evaluate(this);
            var size = value.size;
            value.setValue(val);
            if(value.size > size) throw Error(`Displacement does not fit in ${size} bits.`);
            else value.signExtend(size);
        }

        return super.evaluate();
    }

    lock(): this {
        if(!this.def.lock)
            throw Error(`Instruction "${this.def.mnemonic}" does not support LOCK.`);

        this.pfxLock = new p.PrefixLock;
        return this;
    }

    bt() { // Branch taken prefix.
        return this.ds();
    }

    bnt() { // Branch not taken prefix.
        return this.cs();
    }

    rep(): this {
        if(p.PrefixRep.supported.indexOf(this.def.mnemonic) === -1)
            throw Error(`Instruction "${this.def.mnemonic}" does not support REP prefix.`);
        this.pfxRep = new p.PrefixRep;
        return this;
    }

    repe() {
        if(p.PrefixRepe.supported.indexOf(this.def.mnemonic) === -1)
            throw Error(`Instruction "${this.def.mnemonic}" does not support REPE/REPZ prefix.`);
        this.pfxRep = new p.PrefixRepe;
        return this;
    }

    repz() {
        return this.repe();
    }

    repne(): this {
        if(p.PrefixRepne.supported.indexOf(this.def.mnemonic) === -1)
            throw Error(`Instruction "${this.def.mnemonic}" does not support REPNE/REPNZ prefix.`);
        this.pfxRepne = new p.PrefixRepne;
        return this;
    }

    repnz() {
        return this.repne();
    }

    cs(): this {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.CS);
        return this;
    }

    ss(): this {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.SS);
        return this;
    }

    ds(): this {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.DS);
        return this;
    }

    es(): this {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.ES);
        return this;
    }

    fs(): this {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.FS);
        return this;
    }

    gs(): this {
        this.pfxSegment = new p.PrefixStatic(p.PREFIX.GS);
        return this;
    }

    protected toStringExpression() {
        var expression = super.toStringExpression();
        if(this.pfxLock) expression += ` {${this.pfxLock.toString()}}`;
        if(this.pfxSegment) expression += ` {${this.pfxSegment.toString()}}`;
        if(this.opts.mask) expression += ` {${this.opts.mask.toString()}}`;
        if(this.opts.z) expression += ` {z}`;
        return expression;
    }

    protected needsOperandSizeOverride() {
        if((this.code.operandSize === SIZE.D) && (this.def.operandSize === SIZE.W)) return true;
        if((this.code.operandSize === SIZE.W) && (this.def.operandSize === SIZE.D)) return true;
        return false;
    }

    protected needsAddressSizeOverride() {
        var mem = this.ops.getMemoryOperand();
        if(mem) {
            var reg = mem.reg();
            if(reg && (reg.size !== this.code.addressSize)) return true;
        }
        return false;
    }

    protected createPrefixes() {
        if(this.needsOperandSizeOverride()) {
            this.pfxOpSize = new p.PrefixOperandSizeOverride;
            this.length++;
            this.lengthMax++;
        }
        if(this.needsAddressSizeOverride()) {
            this.pfxAddrSize = new p.PrefixAddressSizeOverride;
            this.length++;
            this.lengthMax++;
        }

        if(this.def.vex) this.createVexPrefix();
        else if(this.def.evex) this.createEvexPrefix();


        // Mandatory prefixes required by op-code.
        if(this.def.prefixes) {
            for(var val of this.def.prefixes) {
                this.prefixes.push(new p.PrefixStatic(val));
            }
            this.length += this.def.prefixes.length;
            this.lengthMax += this.def.prefixes.length;
        }
    }

    protected createVexPrefix() {
        // These bits in VEX are inverted, so they actually all mean "0" zeros.
        var R = 1, X = 1, B = 1, vvvv = 0b1111;

        var pos = this.def.opEncoding.indexOf('v');
        if(pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register) as o.Register;
            if(!reg) throw Error(`Could not find Register operand at position ${pos} to encode VEX.vvvv`);
            vvvv = (~reg.get4bitId()) & 0b1111; // Inverted
        }

        pos = this.def.opEncoding.indexOf('r');
        if(pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register) as o.Register;
            if(!reg) throw Error(`Could not find Register operand at position ${pos} to encode VEX.R`);
            if(reg.idSize() > 3) R = 0; // Inverted
        }

        pos = this.def.opEncoding.indexOf('m');
        if(pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register) as o.Register;
            if(reg && (reg.idSize() > 3)) B = 0; // Inverted
        }

        var mem = this.ops.getMemoryOperand() as o.Memory;
        if(mem) {
            if (mem.base && (mem.base.idSize() > 3)) B = 0;
            if (mem.index && (mem.index.idSize() > 3)) X = 0;
        }

        // switch(this.def.vex.vvvv) {
        //     case 'NDS':
                // VEX.NDS: VEX.vvvv encodes the first source register in an instruction syntax where the content of
                // source registers will be preserved.
                // var r = this.ops.list[1] as o.Register;
                // vvvv = (~r.get4bitId()) & 0b1111;
                // break;
            // case 'NDD':
                // VEX.NDD: VEX.vvvv encodes the destination register that cannot be encoded by ModR/M:reg field.
                // var r = this.ops.list[0] as o.Register;
                // vvvv = (~r.get4bitId()) & 0b1111;
                // break;
            // case 'DDS':
                // VEX.DDS: VEX.vvvv encodes the second source register in a three-operand instruction syntax where
                // the content of first source register will be overwritten by the result.
                // var r = this.ops.list[2] as o.Register;
                // vvvv = (~r.get4bitId()) & 0b1111;
                // break;
            // If none of NDS, NDD, and DDS is present, VEX.vvvv must be 1111b
            // {Already set to 0b1111}
        // }

        this.pfxEx = new p.PrefixVex(this.def.vex, R, X, B, vvvv);
        this.length += (this.pfxEx as p.PrefixVex).bytes;
        this.lengthMax += (this.pfxEx as p.PrefixVex).bytes;
    }

    protected createEvexPrefix() {
        var evex = this.pfxEx = new p.PrefixEvex(this.def.evex);
        this.length += 3;
        this.lengthMax += 3;

        var pos = this.def.opEncoding.indexOf('v');
        if(pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register) as o.Register;
            if(!reg) throw Error(`Could not find Register operand at position ${pos} to encode EVEX.vvvv`);
            evex.vvvv = (~reg.get4bitId()) & 0b1111; // Inverted
            evex.Vp = reg.id & 0b10000 ? 0 : 1; // Inverted
        }

        pos = this.def.opEncoding.indexOf('r');
        if(pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register) as o.Register;
            if(!reg) throw Error(`Could not find Register operand at position ${pos} to encode VEX.R`);
            var id_size = reg.idSize();
            if(id_size > 3) evex.R = 0; // Inverted
            if(id_size > 4) evex.Rp = 0; // Inverted
        }

        pos = this.def.opEncoding.indexOf('m');
        if(pos > -1) {
            var reg = this.ops.getAtIndexOfClass(pos, o.Register) as o.Register;
            if(reg && (reg.idSize() > 3)) evex.B = 0; // Inverted
        }

        var mem = this.ops.getMemoryOperand() as o.Memory;
        if(mem) {
            if (mem.base && (mem.base.idSize() > 3)) evex.B = 0; // Inverted
            if (mem.index && (mem.index.idSize() > 3)) evex.X = 0; // Inverted
        }

        if(this.opts.mask) this.mask(this.opts.mask);
        if(typeof this.opts.z !== 'undefined') this.z(this.opts.z);
    }

    // Set mask register for `EVEX` instructions.
    mask(k: o.RegisterK): this {
        if(!(this.pfxEx instanceof p.PrefixEvex))
            throw Error('Cannot set mask on non-EVEX instruction.');
        if(k.id === 0)
            throw TypeError('Mask register 000 cannot be used as mask.');
        (this.pfxEx as p.PrefixEvex).aaa = k.get3bitId();
        return this;
    }

    // Set `z` bit for `EVEX` instructions.
    z(value: number|boolean = 1): this {
        if(!(this.pfxEx instanceof p.PrefixEvex))
            throw Error('Cannot set z-bit on non-EVEX instruction.');
        (this.pfxEx as p.PrefixEvex).z = value ? 1 : 0;
        return this;
    }

    protected createOpcode() {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.opcode;

        var [dst, src] = this.ops.list;

        if(def.regInOp) {
            // We have register encoded in op-code here.
            if(!dst || !(dst as oo.Operand).isRegister())
                throw TypeError(`Operation needs destination register.`);
            opcode.op = (opcode.op & p.Opcode.MASK_OP) | (dst as o.Register).get3bitId();
        } else {
            // Direction bit `d`
            if(this.def.opcodeDirectionBit) {
                var direction = p.Opcode.DIRECTION.REG_IS_DST;

                if(src instanceof o.Register) {
                    direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }

                // *reg-to-reg* operation
                if((dst instanceof o.Register) && (src instanceof o.Register)) {
                    if(this.regToRegDirectionRegIsDst)  direction = p.Opcode.DIRECTION.REG_IS_DST;
                    else                                direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }

                opcode.op = (opcode.op & p.Opcode.MASK_DIRECTION) | direction;
            }

            // Size bit `s`
            // if(this.def.opcodeSizeBit) {
            //     opcode.op = (opcode.op & p.Opcode.MASK_SIZE) | (p.Opcode.SIZE.WORD);
            //      ...
            // }
        }

        var bytes = opcode.bytes();
        this.length += bytes;
        this.lengthMax += bytes;
    }

    protected createModrm() {
        if(!this.def.useModrm) return;
        if(!this.ops.hasRegisterOrMemory()) return;

        var encoding = this.def.opEncoding;
        var mod = 0, reg = 0, rm = 0;

        var [dst, src] = this.ops.list;
        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && !!dst; // Destination operand is NOT encoded in main op-code byte.
        if(has_opreg || dst_in_modrm) {

            // var reg_is_dst = !!(this.opcode.op & p.Opcode.DIRECTION.REG_IS_DST);
            var reg_is_dst = this.def.opEncoding[0] !== 'm' ? true : false;

            if(has_opreg) {
                // If we have `opreg`, then instruction has up to one operand.
                reg = this.def.opreg;
                var r: o.Register = this.ops.getRegisterOperand() as o.Register;
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = r.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    this.length++;
                    this.lengthMax++;
                    return;
                }
            } else {

                // Reg-to-reg instruction;
                if((encoding.length === 2) && (dst instanceof o.Register) && (src instanceof o.Register)) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    var regreg: o.Register = (reg_is_dst ? dst : src) as o.Register;
                    var rmreg: o.Register = (reg_is_dst ? src : dst) as o.Register;
                    reg = regreg.get3bitId();
                    rm = rmreg.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    this.length++;
                    this.lengthMax++;
                    return;
                }

                var rpos = encoding.indexOf('r');
                var rreg;
                if((rpos > -1) && (rreg = this.ops.getAtIndexOfClass(rpos, o.Register) as o.Register)) {
                    reg = rreg.get3bitId();
                } else {
                    // var r: o.Register = this.op.getRegisterOperand(this.regToRegDirectionRegIsDst);
                    var r: o.Register = this.ops.getRegisterOperand(this.regToRegDirectionRegIsDst ? 0 : 1) as o.Register;
                    if(!r) r = this.ops.getRegisterOperand() as o.Register;
                    if(r) {
                        mod = p.Modrm.MOD.REG_TO_REG;
                        reg = r.get3bitId();
                    }
                }
            }

            var mpos = encoding.indexOf('m');
            if(mpos > -1) {
                var mreg = this.ops.getAtIndexOfClass(mpos, o.Register) as o.Register;
                if(mreg) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = (mreg as o.Register).get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    this.length++;
                    this.lengthMax++;
                    return;
                }
            } else {
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }

            if(!dst) { // No destination operand, just opreg.
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }

            // `o.Memory` class makes sure that ESP cannot be a SIB index register and
            // that EBP always has displacement value even if 0x00.
            // Memory operand can be encoded in only one way (Modrm.rm + SIB) so we
            // ignore here `def.opEncoding` field.
            var m: o.Memory = this.ops.getMemoryOperand() as o.Memory;

            if(!m) {
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }

            if(!m.base && !m.index && !m.displacement)
                throw TypeError('Invalid Memory reference.');
            if(m.index && !m.scale)
                throw TypeError('Memory Index reference needs Scale factor.');

            // dispX
            // We use `disp32` with SIB byte version because the version without SIB byte
            // will be used for RIP-relative addressing.
            if(!m.base && !m.index && m.displacement) {
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
            if(m.base && !m.index) {
                mod = p.Modrm.getModDispSize(m);
                if(mod === p.Modrm.MOD.DISP32)
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
            if(m.base || m.index) {
                mod = p.Modrm.getModDispSize(m);
                if(m.displacement)
                    if((mod === p.Modrm.MOD.DISP32) || (mod === p.Modrm.MOD.INDIRECT))
                        m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                rm = p.Modrm.RM.NEEDS_SIB; // SIB byte follows
                this.modrm = new p.Modrm(mod, reg, rm);
                this.length++;
                this.lengthMax++;
                return;
            }

            throw Error('Fatal error, unreachable code.');
        }
    }

    protected createSib() {
        if(!this.modrm) return;
        if(this.modrm.mod === p.Modrm.MOD.REG_TO_REG) return;
        if((this.modrm.rm !== p.Modrm.RM.NEEDS_SIB)) return;

        var m: o.Memory = this.ops.getMemoryOperand() as o.Memory;
        if(!m) throw Error('No Memory operand to encode SIB.');

        var scalefactor = 0, I = 0, B = 0;

        if(m.scale) scalefactor = m.scale.value;

        if(m.index) {
            I = m.index.get3bitId();

            // RSP register cannot be used as index, `o.Memory` class already ensures it
            // if used in normal way.
            if(I === p.Sib.INDEX_NONE)
                throw Error(`Register ${m.index.toString()} cannot be used as SIB index.`);

        } else {
            I = p.Sib.INDEX_NONE;
        }

        if(m.base) {
            B = m.base.get3bitId();
        } else
            B = p.Sib.BASE_NONE;

        this.sib = new p.Sib(scalefactor, I, B);
        this.length++;
        this.lengthMax++;
    }

    protected createDisplacement() {
        var m: o.Memory = this.ops.getMemoryOperand() as o.Memory;
        if(m && m.displacement) {
            this.displacement = new p.Displacement(m.displacement);

            if(m.displacement.variable) {                               // We don't know the size of displacement yet.
                // Displacement will be at least 1 byte,
                // but we skip `this.length` for now.
                this.lengthMax += o.DisplacementValue.SIZE.DISP32 / 8;  // max 4 bytes
            } else {
                var size = this.displacement.value.size / 8;
                this.length += size;
                this.lengthMax += size;
            }

        } else if(this.modrm && this.sib && (this.sib.B === p.Sib.BASE_NONE)) {
            // Some SIB byte encodings require displacement, if we don't have displacement yet
            // add zero displacement.
            var disp: o.DisplacementValue = null;
            switch(this.modrm.mod) {
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
            if(disp) this.displacement = new p.Displacement(disp);

            var size = this.displacement.value.size / 8;
            this.length += size;
            this.lengthMax += size;
        }
    }

    protected createImmediates() {
        var max = 2; // Up to 2 immediates.
        for(var j = 0; j < max; j++) {
            var imm = this.ops.getImmediate(j);
            var immp: p.Immediate;
            if(imm) {
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
            } else {
                var rel = this.ops.getRelative(j);
                if(rel) {
                    var immval = oo.Immediate.factory(rel.size, 0);
                    immp = new p.Immediate(immval);
                    this.immediates[j] = immp;

                    var size = rel.size >> 3;
                    this.length += size;
                    this.lengthMax += size;
                }
            }
        }
    }
}


// Wrapper around multiple instructions when different machine instructions can be used to perform the same task.
// For example, `jmp` with `rel8` or `rel32` immediate, or when multiple instruction definitions match provided operands.
export class InstructionSet extends i.InstructionSet implements IInstruction {

    protected cloneOperands() {
        return this.ops.clone(o.Operands);
    }

    lock() {
        return this;
    }

    bt(){
        return this;
    }

    bnt(){
        return this;
    }

    rep(){
        return this;
    }

    repe(){
        return this;
    }

    repz(){
        return this;
    }

    repnz(){
        return this;
    }

    repne(){
        return this;
    }

    cs(){
        return this;
    }

    ss(){
        return this;
    }

    ds(){
        return this;
    }

    es(){
        return this;
    }

    fs(){
        return this;
    }

    gs(){
        return this;
    }
}

