import {isTnumber, Relative, SIZE, TOperand} from '../../operand';
import {TRexDefinition} from "./table";
import {IVexDefinition} from "./parts/PrefixVex";
import {IEvexDefinition} from "./parts/PrefixEvex";
import {EXT, MODE, MODES} from "./consts";
import Mnemonic from "../../Mnemonic";
import {defaults} from './table';
import {OperandsX86} from "./operand/index";
import {IInstructionOptionsX86} from "./instruction";
import {TTableOperand} from "../../table";

export type TOperandTemplate = TTableOperand[];
export type TOperandMatch = TTableOperand[];

const OPS = [];

export class Match {
    mnemonic: MnemonicX86;
    operandMatch: TOperandMatch;

    constructor (mnemonic: MnemonicX86, operandMatch: TOperandMatch) {
        this.mnemonic = mnemonic;
        this.operandMatch = operandMatch;
    }
}

class MnemonicX86 extends Mnemonic {
    mnemonic: string = defaults.mn;
    operandSize: SIZE = defaults.s;
    opcode: number = defaults.o;
    operandTemplates: TOperandTemplate[] = OPS;
    opreg: number = defaults.or;
    operandSizeDefault: number = defaults.ds;
    lock: boolean = defaults.lock;
    regInOp: boolean = defaults.r;
    opcodeDirectionBit: boolean = defaults.dbit;
    useModrm: boolean = defaults.mr;
    rep: boolean = defaults.rep;
    repne: boolean = defaults.repne;
    prefixes: number[] = defaults.pfx;
    opEncoding: string = defaults.en;
    rex: TRexDefinition = defaults.rex;
    vex: IVexDefinition = null;
    evex: IEvexDefinition = null;
    mode: MODE = defaults.mod;
    extensions: EXT[] = defaults.ext;

    toJson () {
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

    toString () {
        let opregstr = '';
        if (this.opreg > -1) opregstr = ' /' + this.opreg;

        const lock = this.lock ? ' LOCK' : '';
        const rex = this.rex ? ' REX ' + this.rex : '';
        const vex = this.vex ? ' VEX ' + JSON.stringify(this.vex) : '';
        const evex = this.evex ? ' EVEX ' + JSON.stringify(this.evex) : '';

        let dbit = '';
        if (this.opcodeDirectionBit) dbit = ' d-bit';

        return super.toString() + opregstr + lock + rex + vex + evex + dbit;
    }

    protected matchOperandTemplateCase (tpl: TTableOperand, operand: TOperand): TTableOperand {
        if (typeof tpl === 'number') {
            if (tpl === operand) return tpl;
            else return null;
        } else if (typeof tpl === 'object') {
            // Object: rax, rbx, r8, etc...
            if(tpl === operand) return tpl;
            else return null;
        } else if(typeof tpl === 'function') {
            // Class: o.Register, o.Memory, o.Immediate, etc...
            if (tpl.prototype instanceof Relative) { // as typeof o.Relative
                // Here we cannot yet check any sizes even cannot check if number
                // fits the immediate size because we will have to rebase the o.Relative
                // to the currenct instruction Expression.
                if (isTnumber(operand)) return tpl;
                else if (operand instanceof Relative) return tpl;
                else return null;
            } else {
                // o.Register, o.Memory
                if(operand instanceof tpl) return tpl;
                else return null;
            }
        } else
            throw TypeError('Invalid operand definition.'); // Should never happen.
    }

    protected matchOperandTemplate (template: TOperandTemplate, operand: TOperand): TTableOperand {
        for (const tpl of template) {
            let match = this.matchOperandTemplateCase(tpl, operand);
            if (match) return match;
        }
    }

    match (ops: OperandsX86, opts: IInstructionOptionsX86): Match {
        if(opts.size !== SIZE.ANY) {
            if(opts.size !== this.operandSize) return null;
        }
        if (!this.operandTemplates) return null;
        if (this.operandTemplates.length !== ops.list.length) return null;

        // If registers are 5-bit wide, we can encode them only with EVEX, not VEX.
        if(this.vex && ops.has5bitRegister()) return null;

        if (!ops.list.length) return new Match(this, []);

        const matches: TOperandMatch = [];

        for(let i = 0; i < ops.list.length; i++) {
            const template = this.operandTemplates[i];
            const operand = ops.list[i];
            const match = this.matchOperandTemplate(template, operand);

            if (!match) return null;

            matches.push(match);
        }

        return new Match(this, matches);
    }
}

export default MnemonicX86;
