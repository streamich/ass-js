import {SIZE, Register} from '../../operand';
import {ITableDefinitionX86, TRexDefinition, TTableOperandX86} from "./table";
import {IVexDefinition} from "./parts/PrefixVex";
import {IEvexDefinition} from "./parts/PrefixEvex";
import {EXT, MODE, MODES} from "./consts";
import Mnemonic from "../../Mnemonic";

class MnemonicX86 extends Mnemonic {
    mnemonic: string = '';
    operandSize: SIZE = SIZE.NONE;
    opcode: number = 0x00;
    operands: TTableOperandX86[][];
    opreg: number;
    operandSizeDefault: number;
    lock: boolean;
    regInOp: boolean;
    opcodeDirectionBit: boolean;
    useModrm: boolean;
    rep: boolean;
    repne: boolean;
    prefixes: number[];
    opEncoding: string;
    rex: TRexDefinition;
    vex: IVexDefinition;
    evex: IEvexDefinition;
    mode: MODE;
    extensions: EXT[];

    toJson() {
        let json = super.toJson();

        if (this.opreg > 0) json.opcodeExtensionInModrm = this.opreg;
        if (this.regInOp) json.registerInOpcode = true;
        json.operandEncoding = this.opEncoding;
        if (this.lock) json.lock = true;

        if (this.opcodeDirectionBit) json.setOpcodeDirectionBit = true;

        if (this.vex) json.vex = this.vex;
        if (this.evex) json.evex = this.evex;
        if (this.prefixes) json.extraPrefixes = this.prefixes;

        if (this.rep) json.prefixRep = true;
        if (this.repne) json.prefixRepne = true;

        if (this.rex) json.rex = this.rex;
        if (!this.useModrm) json.skipMorm = true;

        json.modes = [];
        if (this.mode) {
            for (const mode of MODES) {
                if (this.mode & (MODE[mode] as any as number)) json.modes.push(mode);
            }
        }

        if (this.extensions) {
            json.extensions = [];
            for(var ext of this.extensions) json.extensions.push(EXT[ext]);
        }

        return json;
    }

/*
    protected matchOperandTemplate(tpl: t.TTableOperand, operand: o.TOperand): t.TTableOperand|any {
        if(typeof tpl === 'number') {
            if((tpl as any) === operand) return tpl;
            else return null;
        } else if(typeof tpl === 'object') { // Object: rax, rbx, r8, etc...
            if((tpl as any) === operand) return tpl;
            else return null;
        } else if(typeof tpl === 'function') { // Class: o.Register, o.Memory, o.Immediate, etc...
            var OperandClass = tpl as any; // as typeof o.Operand;
            if(OperandClass.name.indexOf('Relative') === 0) { // as typeof o.Relative
                // Here we cannot yet check any sizes even cannot check if number
                // fits the immediate size because we will have to rebase the o.Relative
                // to the currenct instruction Expression.
                if(o.isTnumber(operand)) return OperandClass;
                else if(operand instanceof o.Relative) return OperandClass;
                else return null;
            } else { // o.Register, o.Memory
                if(operand instanceof OperandClass) return OperandClass;
                else return null;
            }
        } else
            throw TypeError('Invalid operand definition.'); // Should never happen.
    }

    protected matchOperandTemplates(templates: t.TTableOperand[], operand: o.TOperand): t.TTableOperand|any {
        for(let tpl of templates) {
            var match = this.matchOperandTemplate(tpl, operand);
            if(match) return match;
        }
        return null;
    }

    matchOperands(ops: o.Operands): (any|t.TTableOperand)[] {
        if(!this.operands) return null;
        if(this.operands.length !== ops.list.length) return null;
        if(!ops.list.length) return [];
        var matches: t.TTableOperand[] = [];
        for(let i = 0; i < ops.list.length; i++) {
            let templates = this.operands[i];
            let operand = ops.list[i];
            var match = this.matchOperandTemplates(templates, operand);

            if(!match) return null;
            matches.push(match);
        }
        return matches;
    }

    toStringOperand(operand) {
        if(typeof operand === 'number') return operand;
        if(typeof operand === 'string') return operand;
        if(operand instanceof o.Operand) return operand.toString();
        else if(typeof operand === 'function') {
            if(operand === o.Register)      return 'r';
            if(operand === o.Memory)        return 'm';
            if(operand === o.Relative)      return 'rel';
            if(operand === o.Relative8)     return 'rel8';
            if(operand === o.Relative16)    return 'rel16';
            if(operand === o.Relative32)    return 'rel32';
        } else return 'operand';
    }

    getMnemonic(): string {
        var size = this.operandSize;
        if((size === o.SIZE.ANY) || (size === o.SIZE.NONE)) return this.mnemonic;
        return this.mnemonic + o.SIZE[size].toLowerCase();
    }

    toJsonOperands() {
        var ops = [];
        for(var op_tpl of this.operands) {
            var op_out = [];
            for(var op of op_tpl) {
                op_out.push(this.toStringOperand(op));
            }
            if(op_out.length > 1) ops.push(op_out);
            else ops.push(op_out[0]);
        }
        return ops;
    }

    toString() {
        var opcode = ' ' + (new o.Constant(this.opcode, false)).toString();

        var operands = [];
        for(var ops of this.operands) {
            var opsarr = [];
            for(var op of ops) {
                opsarr.push(this.toStringOperand(op));
            }
            operands.push(opsarr.join('/'));
        }
        var operandsstr = '';
        if(operands.length) operandsstr = ' ' + operands.join(',');

        var size = '';
        if(this.operandSize > 0) size = ' ' + this.operandSize + '-bit';

        return this.mnemonic + size + opcode + operandsstr;
    }
    */
}

export default MnemonicX86;
