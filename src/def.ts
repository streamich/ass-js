import * as o from './operand';
import * as t from './table';
import {extend} from './util';
import * as c from './code';


type TInstructionOptions = c.IInstructionOptions;

export class Def {
    group: DefGroup = null;

    mnemonic: string = '';
    operandSize: o.SIZE = o.SIZE.NONE;
    opcode: number = 0x00;
    operands: (any|t.TTableOperand[])[];

    constructor(group: DefGroup, def: t.ITableDefinition) {
        this.group = group;

        this.opcode             = def.o;
        this.mnemonic           = def.mn;
        this.operandSize        = def.s;

        // Operand template.
        this.operands = [];
        if(def.ops && def.ops.length) {
            var implied_size = o.SIZE.NONE;
            for(var operand of def.ops) {
                if(!(operand instanceof Array)) operand = [operand] as t.TTableOperand[];

                var flattened = (operand as any).reduce((a, b) => {

                    // Determine operand size from o.Register operands
                    var cur_size = o.SIZE.NONE;
                    if(b instanceof o.Register) { // rax, rbx, eax, ax, al, etc..
                        cur_size = b.size;
                    } else if((typeof b === 'function') && (b.name.indexOf('Register') === 0)) { // o.Register, o.Register8, ..., o.RegisterRip, .. etc.
                        cur_size = (new b).size;
                    }
                    if(cur_size !== o.SIZE.NONE) {
                        if (this.operandSize <= o.SIZE.NONE) {
                            if (implied_size > o.SIZE.NONE) {
                                if (implied_size !== cur_size)
                                    throw TypeError('Instruction operand size definition mismatch: ' + this.mnemonic);
                            } else implied_size = cur_size;
                        }
                    }

                    return a.concat(b);
                }, []);
                operand = flattened;

                this.operands.push(operand as t.TTableOperand[]);
            }

            if(this.operandSize <= o.SIZE.NONE) {
                this.operandSize = implied_size;
            }
        }
    }

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

    toJson() {
        var json: any = {
            opcode: this.opcode,
            opcodeHex: this.opcode.toString(16),
            // mnemonic: this.mnemonic,
        };

        if(this.operandSize) json.operandSize = this.operandSize;

        var ops = this.toJsonOperands();
        if(ops.length) json.operands = ops;

        return json;
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

    createDefinitions(defs: t.ITableDefinition[], defaults: t.ITableDefinition) {
        var [group_defaults, ...definitions] = defs;

        // If only one object provided, we treat it as instruction definition rather then
        // as group defaults.
        if(!definitions.length) definitions = [group_defaults];

        // Mnemonic.
        if(!group_defaults.mn) group_defaults.mn = this.mnemonic;

        for(var definition of definitions)
            this.defs.push(new this.DefClass(this, extend<t.ITableDefinition>({}, defaults, group_defaults, definition)));
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

    toJson(): any {
        var instructions = [];
        for(var def of this.defs) {
            instructions.push(def.toJson());
        }
        return {
            mnemonic: this.mnemonic,
            definitions: instructions,
        };
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

    table: t.ITableDefinition;

    defaults: t.ITableDefinition;

    constructor(table: t.ITableDefinition, defaults: t.ITableDefinition) {
        this.table = table;
        this.defaults = defaults;
    }

    getGroup(mnemonic: string): DefGroup {
        if(!this.groups[mnemonic]) {
            this.createGroup(mnemonic);
        }
        return this.groups[mnemonic];
    }

    protected createGroup(mnemonic: string) {
        var group = new this.DefGroupClass(this, mnemonic);

        var definitions = this.table[mnemonic];
        if((definitions.length === 1) && (typeof definitions[0] === 'string'))
            definitions = this.table[definitions[0] as string];

        group.createDefinitions(definitions, this.defaults);
        this.groups[mnemonic] = group;
    }

    createAll() {
        for(var mnemonic in this.table) {
            this.getGroup(mnemonic);
        }
    }

    matchDefinitions(mnemonic: string, ops: o.Operands, opts: TInstructionOptions): DefMatchList {
        var group = this.getGroup(mnemonic);
        if(!group)
            throw Error(`No such mnemonic "${mnemonic}".`);

        var matches = new DefMatchList;
        matches.matchAll(group.defs, ops, opts);
        return matches;
    }

    // create(table: t.TableDefinition, defaults: t.Definition): this {
    //     for(var mnemonic in table) {
    //         var group = new this.DefGroupClass(this, mnemonic);
    //         group.createDefinitions(table[mnemonic], defaults);
    //         this.groups[mnemonic] = group;
    //     }
    //     return this;
    // }

    toJson() {
        var json: any = {};
        for(var group_name in this.groups) {
            json[group_name] = this.groups[group_name].toJson();
        }
        return json;
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
    opTpl: t.TTableOperand[] = [];
}


export class DefMatchList {
    list: DefMatch[] = [];

    match(def: Def, ops: o.Operands, opts: TInstructionOptions) {
        if(opts.size !== o.SIZE.ANY) {
            if(opts.size !== def.operandSize) return;
        }

        var tpl = def.matchOperands(ops);
        if(tpl) {

            // If registers are 5-bit wide, we can encode them only with EVEX, not VEX.
            if((def as any).vex && ops.has5bitRegister()) return;

            var match = new DefMatch;
            match.def = def;
            match.opTpl = tpl;
            this.list.push(match);
        }
    }

    matchAll(defs: Def[], ops: o.Operands, opts: TInstructionOptions) {
        for(var def of defs) this.match(def, ops, opts);
    }
}
