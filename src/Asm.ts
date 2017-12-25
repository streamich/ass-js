import {Expression} from './expression';
import Hook from './hooks/Hook';

class Asm {
    expressions: Expression[] = [];
    littleEndian = true; // Which way to encode constants by default.

    hooks = {
        mnemonic: new Hook(['mnemonic', 'operands', 'opts']),
        command: new Hook(['name', 'args']),
    };

    mnemonic (mnemonic: string, operands?: any[], opts?: object) {
        return this.hooks.mnemonic.call(mnemonic, operands, opts);
    }

    _ = (mnemonic: string, operands?: any[], opts?: object) =>
        this.mnemonic(mnemonic, operands, opts);

    command (name: string, ...args: any[]) {
       return this.hooks.command.call(name, args);
    }

    $ = (name: string, ...args: any[]) =>
        this.command.apply(this, [name, ...args]);

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
