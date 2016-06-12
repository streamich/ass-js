import * as d from '../def';
import * as t from './table';
import {isTnumber, Tnumber, SIZE, TUiOperand, TUiOperandNormalized,
    Operand, Constant, Relative, Relative8, Relative16, Relative32} from "../operand";
import * as oo from '../operand';
import * as o from './operand';
import {extend} from '../util';
import {IVexDefinition} from "./table";


export type IVexDefinition = t.IVexDefinition;

export class Def extends d.Def {

    // 256.66.0F3A.W0 => {L: 1, pp: 1, mmmmm: 1, W: 0}
    static parseVexString(vstr: string): t.IVexDefinition {
        var vdef: t.IVexDefinition = {
            vvvv:   '',
            L:      0b0,
            pp:     0b00,
            mmmmm:  0b00000, // 00000B is reserved, will #UD
            W:      0b0,
            WIG:    false,
        };

        // vvvv: NDS, NDD, DDS
        if(vstr.indexOf('NDS') > -1)        vdef.vvvv = 'NDS';
        else if(vstr.indexOf('NDD') > -1)   vdef.vvvv = 'NDD';
        else if(vstr.indexOf('DDS') > -1)   vdef.vvvv = 'DDS';

        // L: 128, 256, LIG, LZ
        if(vstr.indexOf('256') > -1)        vdef.L = 0b1;

        // pp: 66, F2, F3
        if(vstr.indexOf('.66.') > -1)       vdef.pp = 0b01;
        else if(vstr.indexOf('.F2.') > -1)  vdef.pp = 0b11;
        else if(vstr.indexOf('.F3.') > -1)  vdef.pp = 0b10;

        // mmmmm: 0F, 0F3A, 0F38
        if(vstr.indexOf('0F38') > -1)       vdef.mmmmm = 0b00010;
        else if(vstr.indexOf('0F3A') > -1)  vdef.mmmmm = 0b00011;
        else if(vstr.indexOf('0F') > -1)    vdef.mmmmm = 0b00001; // Could still be 2-byte VEX prefix

        // W: W0, W1
        if(vstr.indexOf('W1') > -1)         vdef.W = 0b1;

        // WIG
        if(vstr.indexOf('WIG') > -1)        vdef.WIG = true;

        return vdef;
    }

    opreg: number;
    operands: (t.TOperandTemplate[])[];
    operandSizeDefault: number;
    lock: boolean;
    regInOp: boolean;
    opcodeDirectionBit: boolean;
    mandatoryRex: boolean;
    useModrm: boolean;
    rep: boolean;
    repne: boolean;
    prefixes: number[];
    vex: t.IVexDefinition;
    opEncoding: string;
    mode: t.MODE;
    cpuid: t.CPUID;


    constructor(group: DefGroup, def: t.Definition) {
        super(group, def);

        this.opreg              = def.or;
        this.operandSizeDefault = def.ds;
        this.lock               = def.lock;
        this.regInOp            = def.r;
        this.opcodeDirectionBit = def.dbit;
        this.mandatoryRex       = def.rex;
        this.useModrm           = def.mr;
        this.rep                = def.rep;
        this.repne              = def.repne;
        this.prefixes           = def.pfx;
        this.opEncoding         = def.en;
        this.mode               = def.mod;
        this.cpuid              = def.cpu;

        if(typeof def.vex === 'string')
            this.vex = Def.parseVexString(def.vex as string);
        else
            this.vex = def.vex as t.IVexDefinition;
    }

    protected matchOperandTemplate(tpl: t.TOperandTemplate, operand: TUiOperandNormalized): t.TOperandTemplate|any {
        var OperandClass = tpl as any; // as typeof o.Operand;
        if((typeof OperandClass === 'function') && (OperandClass.name.indexOf('Immediate') === 0)) { // o.Immediate, o.ImmediateUnsigned, o.Immediate8, etc...
            if(!isTnumber(operand)) return null;
            var ImmediateClass = OperandClass as typeof oo.Immediate;
            try { // Try if our immediate value fits into our immediate type
                new ImmediateClass(operand as Tnumber);
                return ImmediateClass;
            } catch(e) {
                return null;
            }
        } else
            return super.matchOperandTemplate(tpl as any, operand);
    }

    toStringOperand(operand) {
        if(operand instanceof Operand) return operand.toString();
        else if(typeof operand === 'function') {
            if(operand === oo.Immediate)            return 'imm';
            if(operand === oo.Immediate8)           return 'imm8';
            if(operand === oo.Immediate16)          return 'imm16';
            if(operand === oo.Immediate32)          return 'imm32';
            if(operand === oo.Immediate64)          return 'imm64';
            if(operand === oo.ImmediateUnsigned)    return 'immu';
            if(operand === oo.ImmediateUnsigned8)   return 'immu8';
            if(operand === oo.ImmediateUnsigned16)  return 'immu16';
            if(operand === oo.ImmediateUnsigned32)  return 'immu32';
            if(operand === oo.ImmediateUnsigned64)  return 'immu64';
            if(operand === o.Register)              return 'r';
            if(operand === o.Register8)             return 'r8';
            if(operand === o.Register16)            return 'r16';
            if(operand === o.Register32)            return 'r32';
            if(operand === o.Register64)            return 'r64';
            if(operand === o.RegisterSegment)       return 'sreg';
            if(operand === o.RegisterMmx)           return 'mmx';
            if(operand === o.RegisterXmm)           return 'xmm';
            if(operand === o.RegisterYmm)           return 'ymm';
            if(operand === o.RegisterZmm)           return 'zmm';
            if(operand === o.Memory)                return 'm';
            if(operand === o.Memory8)               return 'm8';
            if(operand === o.Memory16)              return 'm16';
            if(operand === o.Memory32)              return 'm32';
            if(operand === o.Memory64)              return 'm64';
            if(operand === Relative)                return 'rel';
            if(operand === Relative8)               return 'rel8';
            if(operand === Relative16)              return 'rel16';
            if(operand === Relative32)              return 'rel32';
        } else return super.toStringOperand(operand);
    }

    toJson() {
        var json = super.toJson();

        if(this.opreg > 0) json.opcodeExtensionInModrm = this.opreg;
        if(this.regInOp) json.registerInOpcode = true;
        json.operandEncoding = this.opEncoding;
        if(this.lock) json.lock = true;

        if(this.opcodeDirectionBit) json.setOpcodeDirectionBit = true;

        if(this.vex) json.vex = this.vex;
        if(this.prefixes) json.extraPrefixes = this.prefixes;

        if(this.rep) json.prefixRep = true;
        if(this.repne) json.prefixRepne = true;

        if(this.mandatoryRex) json.mandatoryRex = true;
        if(!this.useModrm) json.skipMorm = true;

        if(this.mode) {
            json.mode = [];
            if(this.mode & t.MODE.X32) json.mode.push('x32');
            if(this.mode & t.MODE.X64) json.mode.push('x64');
        }

        if(this.cpuid) {
            json.cpuid = [];
            if(this.cpuid & t.CPUID.MMX) json.cpuid.push('MMX');
            if(this.cpuid & t.CPUID.SSE2) json.cpuid.push('SSE2');
            if(this.cpuid & t.CPUID.AVX) json.cpuid.push('AVX');
            if(this.cpuid & t.CPUID.AVX2) json.cpuid.push('AVX2');
        }

        return json;
    }

    toString() {
        var opregstr = '';
        if(this.opreg > -1) opregstr = ' /' + this.opreg;

        var lock = this.lock ? ' LOCK' : '';
        var rex = this.mandatoryRex ? ' REX' : '';

        var dbit = '';
        if(this.opcodeDirectionBit) dbit = ' d-bit';

        return super.toString() + opregstr + lock + rex + dbit;
    }
}


export class DefGroup extends d.DefGroup {
    DefClass = Def;
    defaultOperandSize: number;

    createDefinitions(defs: t.Definition[], defaults: t.Definition) {
        super.createDefinitions(defs, defaults);

        var [group_defaults, ] = defs;
        group_defaults = extend({}, defaults, group_defaults);
        this.defaultOperandSize = group_defaults.ds;
    }
    
    toJson() {
        var json = super.toJson();
        json.defaultOperandSize = this.defaultOperandSize;
        return json;
    }
}


export class DefTable extends d.DefTable {
    DefGroupClass = DefGroup;
}


export class DefMatch extends d.DefMatch {

}


export class DefMatchList extends d.DefMatchList {

}
