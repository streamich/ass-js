import * as o from './operand';
import * as t from './table';
import {extend} from './util';


export class Def {
    group: DefGroup = null;

    mnemonic: string = '';
    operandSize: o.SIZE = o.SIZE.NONE;
    opcode: number = 0x00;
    operands: (any|t.TOperandTemplate[])[];

    constructor(group: DefGroup, def: t.Definition) {
        this.group = group;

        this.opcode             = def.o;
        this.mnemonic           = def.mn;
        this.operandSize        = def.s;

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

    protected matchOperandTemplate(tpl: t.TOperandTemplate, operand: o.TOperand): t.TOperandTemplate|any {
        if(typeof tpl === 'object') { // Object: rax, rbx, r8, etc...
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

    protected matchOperandTemplates(templates: t.TOperandTemplate[], operand: o.TOperand): t.TOperandTemplate|any {
        for(let tpl of templates) {
            var match = this.matchOperandTemplate(tpl, operand);
            if(match) return match;
        }
        return null;
    }

    matchOperands(ops: o.Operands): (any|t.TOperandTemplate)[] {
        if(this.operands.length !== ops.list.length) return null;
        if(!ops.list.length) return [];
        var matches: t.TOperandTemplate[] = [];
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

        return this.getMnemonic() + opcode + operandsstr;
    }
}


export class DefGroup {

    table: DefTable = null;

    mnemonic: string = '';

    defs: Def[] = [];

    DefClass: any = Def;

    constructor(table: DefTable, mnemonic: string) {
        this.table = table;
        this.mnemonic = mnemonic;
    }

    createDefinitions(defs: t.Definition[], defaults: t.Definition) {
        var [group_defaults, ...definitions] = defs;

        // If only one object provided, we treat it as instruction definition rather then
        // as group defaults.
        if(!definitions.length) definitions = [group_defaults];

        // Mnemonic.
        if(!group_defaults.mn) group_defaults.mn = this.mnemonic;

        for(var definition of definitions)
            this.defs.push(new this.DefClass(this, extend<t.Definition>({}, defaults, group_defaults, definition)));
    }

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

    DefGroupClass: any = DefGroup;

    groups: {[s: string]: DefGroup;}|any = {};

    create(table: t.TableDefinition, defaults: t.Definition): this {
        for(var mnemonic in table) {
            var group = new this.DefGroupClass(this, mnemonic);
            group.createDefinitions(table[mnemonic], defaults);
            this.groups[mnemonic] = group;
        }
        return this;
    }

    toString() {
        var groups = [];
        for(var group_name in this.groups) {
            groups.push(this.groups[group_name].toString());
        }
        return groups.join('\n');
    }
}


export class DefMatch {
    def: Def = null;
    opTpl: t.TOperandTemplate[] = [];
}


export class DefMatchList {
    list: DefMatch[] = [];

    match(def: Def, ops: o.Operands) {
        var tpl = def.matchOperands(ops);
        if(tpl) {
            var match = new DefMatch;
            match.def = def;
            match.opTpl = tpl;
            this.list.push(match);
        }
    }

    matchAll(defs: Def[], ops: o.Operands) {
        for(var def of defs) this.match(def, ops);
    }
}
