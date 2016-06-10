import * as d from '../def';
import * as t from './table';
import {isTnumber, Tnumber, SIZE, TUiOperand, TUiOperandNormalized,
    Operand, Constant, Relative, Relative8, Relative16, Relative32} from "../operand";
import * as oo from '../operand';
import * as o from './operand';


export class Def extends d.Def {
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
            if(operand === oo.Immediate)             return 'imm';
            if(operand === oo.Immediate8)            return 'imm8';
            if(operand === oo.Immediate16)           return 'imm16';
            if(operand === oo.Immediate32)           return 'imm32';
            if(operand === oo.Immediate64)           return 'imm64';
            if(operand === oo.ImmediateUnsigned)     return 'immu';
            if(operand === oo.ImmediateUnsigned8)    return 'immu8';
            if(operand === oo.ImmediateUnsigned16)   return 'immu16';
            if(operand === oo.ImmediateUnsigned32)   return 'immu32';
            if(operand === oo.ImmediateUnsigned64)   return 'immu64';
            if(operand === o.Register)              return 'r';
            if(operand === o.Register8)             return 'r8';
            if(operand === o.Register16)            return 'r16';
            if(operand === o.Register32)            return 'r32';
            if(operand === o.Register64)            return 'r64';
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
}


export class DefTable extends d.DefTable {
    DefGroupClass = DefGroup;
}


export class DefMatch extends d.DefMatch {

}


export class DefMatchList extends d.DefMatchList {

}
