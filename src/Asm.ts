import {Expression} from './expression';
import {SIZE} from './operand';
import Hook from './hooks/Hook';
import Label from './Label';
import Plugin from './plugins/Plugin';
import {Instruction} from './instruction';
import Compilation from "./Compilation";

export interface IAsmOptions {
    main?: string,
    littleEndian?: boolean,     // Which way to encode constants by default.
    operandSize?: SIZE,         // Default operand size.
    addressSize?: SIZE,         // Default address size.
    plugins: Plugin[],
}

class Asm<TOptions extends IAsmOptions> {
    expressions: Expression[] = [];
    opts: TOptions;

    hooks = {
        mnemonic: new Hook(['mnemonic', 'operands', 'opts']),
        command: new Hook(['name', 'args']),
        op: new Hook(['operand']),
        ops: new Hook(['operands', 'size']),
        instruction: new Hook([]),
        compilation: new Hook(['compilation']),
    };

    _: any = (name: string, ...args: any[]) =>
        this.command.apply(this, [name, ...args]);

    constructor (opts: TOptions) {
        if (typeof opts !== 'object' || !opts)
            throw new TypeError('Need to provide options object to Asm.');

        this.insert(this.lbl(opts.main || 'main'));

        if (typeof opts.littleEndian === void 0) opts.littleEndian = true;
        if (typeof opts.operandSize === void 0) opts.operandSize = SIZE.D;
        if (typeof opts.addressSize === void 0) opts.addressSize = SIZE.D;

        const {plugins} = opts;
        for (const plugin of plugins) {
            plugin.asm = this;
            plugin.onAsm(this);
        }

        this.opts = opts;

        this._.lbl = this.lbl.bind(this);
        this._.op = this.op.bind(this);
        this._.ops = this.ops.bind(this);
        this._.insert = this.insert.bind(this);
    }

    command (name: string, ...args: any[]) {
       return this.hooks.command.call(name, args);
    }

    code (template) {
        template(this._);
    }

    replace (expr: Expression, index = this.expressions.length): Expression {
        expr.index = index;
        expr.asm = this;
        this.expressions[index] = expr;
        expr.calcOffsetMaxAndOffset(); // 1st pass
        return expr;
    }

    insert (expr: Expression): Expression {
        this.replace(expr, this.expressions.length);
        expr.build();
        return expr;
    }

    get label (): Label {
        return this.expressions[0] as Label;
    }

    op (str: string) {
        return this.hooks.op.call(str);
    }

    ops (operands: any[], size: SIZE = this.opts.operandSize) {
        return this.hooks.ops.call(operands, size);
    }

    lbl (name?: string): Label {
        return new Label(name);
    }

    instruction (): Instruction {
        return this.hooks.instruction.call();
    }

    compile (container?: number[]): Buffer | number[] {
        const compilation = new Compilation(this);
        this.hooks.compilation.call(compilation);

        return compilation.compile(container);
    }

    toString (lineNumbers = true, hex = true) {
        const lines = [];
        for(let i = 0; i < this.expressions.length; i++) {
            const expr = this.expressions[i];

            let lineNum = '';
            if(lineNumbers) {
                lineNum = i + '';
                if (lineNum.length < 3) lineNum = ((new Array(4 - lineNum.length)).join('0')) + lineNum;
                lineNum += ' ';
            }
            lines.push(lineNum + expr.toString('    ', hex));
        }
        return lines.join('\n');
    }
}

export default Asm;
