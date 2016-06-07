import * as t from './table';
import * as o from './operand';
import {extend} from '../util';
import {Code, Operand} from './code';
import {isTnumber} from "./operand";


// const Immediates = [o.Immediate, o.Immediate8, o.Immediate16, o.Immediate32, o.Immediate64];


// const bySize = {};
// bySize[o.SIZE.NONE]     = [o.Immediate,     o.Register,     o.Memory];
// bySize[o.SIZE.B]        = [o.Immediate8,    o.Register8,    o.Memory8];
// bySize[o.SIZE.W]        = [o.Immediate16,   o.Register16,   o.Memory16];
// bySize[o.SIZE.D]        = [o.Immediate32,   o.Register32,   o.Memory32];
// bySize[o.SIZE.Q]        = [o.Immediate64,   o.Register64,   o.Memory64];


export class Def {
    group: DefGroup;

    opcode: number;
    opreg: number;
    mnemonic: string;
    operands: (t.TOperandTemplate[])[];
    operandSize: number;
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
        this.group = group;

        this.opcode             = def.o;
        this.opreg              = def.or;
        this.mnemonic           = def.mn;
        this.operandSize        = def.s;
        this.operandSizeDefault = def.ds;
        this.lock               = def.lock;
        this.regInOp            = def.r;
        this.opcodeDirectionBit = def.dbit;
        this.mandatoryRex       = def.rex;
        this.useModrm           = def.mr;
        this.rep                = def.rep;
        this.repne              = def.repne;
        this.prefixes           = def.pfx;

        // Operand template.
        this.operands = [];
        if(def.ops && def.ops.length) {
            for(var operand of def.ops) {
                if(!(operand instanceof Array)) operand = [operand] as t.TOperandTemplate[];

                var flattened = (operand as any).reduce((a, b) => {

                    // Determine operand size from o.Register operands
                    var cur_size = o.SIZE.NONE;
                    if(b instanceof o.Register) { // rax, rbx, eax, ax, al, etc..
                        cur_size = b.size;
                    } else if((typeof b === 'function') && (b.name.indexOf('Register') === 0)) { // o.Register, o.Register8, ..., o.RegisterRip, .. etc.
                        cur_size = (new b).size;
                    }
                    if(cur_size !== o.SIZE.NONE) {
                        if (this.operandSize > o.SIZE.NONE) {
                            if (this.operandSize !== cur_size)
                                throw TypeError('Instruction operand size definition mismatch: ' + this.mnemonic);
                        } else this.operandSize = cur_size;
                    }

                    return a.concat(b);
                }, []);
                operand = flattened;

                this.operands.push(operand as t.TOperandTemplate[]);
            }
        }
    }

    // protected getOperandConstructorSize(Constructor) {
    //     if(bySize[o.SIZE.B].indexOf(Constructor) > -1) return o.SIZE.B;
    //     if(bySize[o.SIZE.W].indexOf(Constructor) > -1) return o.SIZE.W;
    //     if(bySize[o.SIZE.D].indexOf(Constructor) > -1) return o.SIZE.D;
    //     if(bySize[o.SIZE.Q].indexOf(Constructor) > -1) return o.SIZE.Q;
    //     return o.SIZE.NONE;
    // }

    protected matchOperandTemplates(templates: t.TOperandTemplate[], operand: o.TUserInterfaceOperand): t.TOperandTemplate {
        for(let tpl of templates) {
            if(typeof tpl === 'object') { // Object: rax, rbx, r8, etc...
                if((tpl as any) === operand) return tpl;
            } else if(typeof tpl === 'function') { // Class: o.Register, o.Memory, o.Immediate, etc...
                var OperandClass = tpl as any; // as typeof o.Operand;
                if(OperandClass.name.indexOf('Immediate') === 0) { // o.Immediate, o.ImmediateUnsigned, o.Immediate8, etc...
                    if(!o.isTnumber(operand)) continue;
                    var ImmediateClass = OperandClass as typeof o.Immediate;
                    try { // Try if our immediate value fits into our immediate type
                        new ImmediateClass(operand as o.Tnumber);
                        return ImmediateClass;
                    } catch(e) {
                        continue;
                    }
                } else { // o.Register, o.Memory
                    if(operand instanceof OperandClass) return OperandClass;
                }
            } else
                throw TypeError('Invalid operand definition.'); // Should never happen.
        }
        return null;
    }

    matchOperands(operands: o.TUserInterfaceOperand[]): t.TOperandTemplate[] {
        if(this.operands.length !== operands.length) return null;
        if(!operands.length) return [];
        var matches: t.TOperandTemplate[] = [];
        for(let i = 0; i < operands.length; i++) {
            let templates = this.operands[i];
            let operand = operands[i];
            var match = this.matchOperandTemplates(templates, operand);

            if(!match) return null;
            matches.push(match);
        }
        return matches;
    }

    // getImmediateClass(): typeof o.Immediate {
    //     for(var operand of this.operands) {
    //         for(var type of operand) {
    //             if(Immediates.indexOf(type) > -1) return type;
    //         }
    //     }
    //     return null;
    // }

    // hasOperandsOfSize(size: o.SIZE) {
    //     if(this.operandSize === o.SIZE.NONE) return true;
    //     if(this.operandSize === o.SIZE.ANY) return true;
    //     if(this.operandSize === size) return true;
    //     return false;
    // }

    toStringOperand(operand) {
        if(operand instanceof o.Operand) return operand.toString();
        else if(typeof operand === 'function') {
            if(operand === o.Immediate)             return 'imm';
            if(operand === o.Immediate8)            return 'imm8';
            if(operand === o.Immediate16)           return 'imm16';
            if(operand === o.Immediate32)           return 'imm32';
            if(operand === o.Immediate64)           return 'imm64';
            if(operand === o.ImmediateUnsigned)     return 'immu';
            if(operand === o.ImmediateUnsigned8)    return 'immu8';
            if(operand === o.ImmediateUnsigned16)   return 'immu16';
            if(operand === o.ImmediateUnsigned32)   return 'immu32';
            if(operand === o.ImmediateUnsigned64)   return 'immu64';
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
        } else return 'operand';
    }

    getMnemonic(): string {
        var size = this.operandSize;
        if((size === o.SIZE.ANY) || (size === o.SIZE.NONE)) return this.mnemonic;
        return this.mnemonic + o.SIZE[size].toLowerCase();
    }

    toString() {
        var operands = [];
        for(var ops of this.operands) {
            var opsarr = [];
            for(var op of ops) {
                opsarr.push(this.toStringOperand(op));
            }
            operands.push(opsarr.join('/'));
        }
        var operandsstr = '';
        if(operands.length) operandsstr = ' ' + operands.join(', ');

        var opregstr = '';
        if(this.opreg > -1) opregstr = ' /' + this.opreg;

        var lock = this.lock ? ' LOCK' : '';
        var rex = this.mandatoryRex ? ' REX' : '';

        return this.getMnemonic() + operandsstr + opregstr + lock + rex;
    }
}


export class DefGroup {
    
    table: DefTable;

    mnemonic: string = '';

    defs: Def[] = [];

    constructor(table: DefTable, mnemonic: string, defs: t.Definition[], defaults: t.Definition) {
        this.table = table;
        this.mnemonic = mnemonic;
        var [group_defaults, ...definitions] = defs;

        // If only one object provided, we treat it as instruction definition rather then
        // as group defaults.
        if(!definitions.length) definitions = [group_defaults];

        // Mnemonic.
        if(!group_defaults.mn) group_defaults.mn = mnemonic;

        for(var definition of definitions)
            this.defs.push(new Def(this, extend<any>({}, defaults, group_defaults, definition)));
    }

    // find(operands: o.TUserInterfaceOperand[]): Def {
    //     for(var def of this.defs) {
    //         if(def.validateOperands(operands)) {
                // No operands -- no size check
                // if(!def.operands.length) return def;
                // We are fine with any size
                // if(operands.size === o.SIZE.ANY) return def;

                // See if operands match the sizes required by instruction.
                // else if(def.hasOperandsOfSize(operands.size)) {
                //     return def;
                // }
            // }
        // }
        // return null;
    // }

    groupBySize(): {[s: number]: Def[]} {
        var sizes: {[s: number]: Def[]} = {};
        for(var def of this.defs) {
            var size = def.operandSize;
            if(!sizes[size]) sizes[size] = [];
            sizes[size].push(def);
        }
        return sizes;
    }

    toString() {
        var defs = [];
        for(var def of this.defs) {
            defs.push(def.toString());
        }
        return `${this.mnemonic.toUpperCase()}:\n    ${defs.join('\n    ')}`;
    }
}


export class DefTable {

    groups: {[s: string]: DefGroup;}|any = {};
    
    constructor(table: t.TableDefinition, defaults: t.Definition) {
        for(var mnemonic in table) {
            var group = new DefGroup(this, mnemonic, table[mnemonic], defaults);
            this.groups[mnemonic] = group;
        }
    }

    // find(name: string, operands: o.Operands): Def {
    //     var group: DefGroup = this.groups[name] as DefGroup;
    //     return group.find(operands);
    // }

    // attachMethods(code: Code) {
    //     for(var group in this.groups) {
    //         this.groups[group].attachMethods(code);
    //     }
    // }

    toString() {
        var groups = [];
        for(var group_name in this.groups) {
            groups.push(this.groups[group_name].toString());
        }
        return groups.join('\n');
    }
}
