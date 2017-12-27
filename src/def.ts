import * as o from './operand';
import * as t from './table';
import {extend} from './util';
import * as c from './code';


type TInstructionOptions = c.IInstructionOptions;


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
