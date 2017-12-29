import * as d from '../../def';
import * as t from './table';
import * as oo from "../../operand";
import {
    isTnumber,
    Operand,
    Relative,
    Relative16,
    Relative32,
    Relative8,
    Tnumber,
    TUiOperandNormalized
} from "../../operand";
import {extend} from '../../util';
import {IVexDefinition} from "./parts/PrefixVex";
import {IEvexDefinition} from "./parts/PrefixEvex";
import {EXT, MODE} from "./consts";
import {
    Register16,
    Register32,
    Register64,
    Register8,
    RegisterMm,
    RegisterSegment,
    RegisterX86,
    RegisterXmm,
    RegisterYmm,
    RegisterZmm
} from "./operand/register";
import {MemoryX86, Memory16, Memory32, Memory64, Memory8} from "./operand/memory";

export class Def extends d.Def {

    constructor(group: DefGroup, def: t.ITableDefinitionX86) {
        super(group, def);

        if(typeof def.vex === 'string') this.vex = Def.parseVexString(def.vex as string);
        else this.vex = def.vex as IVexDefinition;

        if(typeof def.evex === 'string') this.evex = Def.parseEvexString(def.evex as string);
        else this.evex = def.evex as IEvexDefinition;
    }

    protected matchOperandTemplate(tpl: t.TTableOperandX86, operand: TUiOperandNormalized): t.TTableOperandX86|any {
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
            if(operand === RegisterX86)              return 'r';
            if(operand === Register8)             return 'r8';
            if(operand === Register16)            return 'r16';
            if(operand === Register32)            return 'r32';
            if(operand === Register64)            return 'r64';
            if(operand === RegisterSegment)       return 'sreg';
            if(operand === RegisterMm)            return 'mmx';
            if(operand === RegisterXmm)           return 'xmm';
            if(operand === RegisterYmm)           return 'ymm';
            if(operand === RegisterZmm)           return 'zmm';
            if(operand === MemoryX86)                return 'm';
            if(operand === Memory8)               return 'm8';
            if(operand === Memory16)              return 'm16';
            if(operand === Memory32)              return 'm32';
            if(operand === Memory64)              return 'm64';
            if(operand === Relative)                return 'rel';
            if(operand === Relative8)               return 'rel8';
            if(operand === Relative16)              return 'rel16';
            if(operand === Relative32)              return 'rel32';
        } else return super.toStringOperand(operand);
    }

    toString() {
        let opregstr = '';
        if(this.opreg > -1) opregstr = ' /' + this.opreg;

        const lock = this.lock ? ' LOCK' : '';
        const rex = this.rex ? ' REX ' + this.rex : '';
        const vex = this.vex ? ' VEX ' + JSON.stringify(this.vex) : '';
        const evex = this.evex ? ' EVEX ' + JSON.stringify(this.evex) : '';

        let dbit = '';
        if(this.opcodeDirectionBit) dbit = ' d-bit';

        return super.toString() + opregstr + lock + rex + vex + evex + dbit;
    }
}


export class DefGroup extends d.DefGroup {
    DefClass = Def;
    defaultOperandSize: number;

    createDefinitions(defs: t.ITableDefinitionX86[], defaults: t.ITableDefinitionX86) {
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
