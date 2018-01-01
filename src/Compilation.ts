import Asm from "./Asm";
import {Expression, ExpressionVariable, ExpressionVolatile, IPushable} from "./expression";
import CodeBuffer from "./CodeBuffer";
import {TOctets} from "./plugins/data/Data";
import Hook from "./hooks/Hook";

// Expressions are compiled in 3 passes:
//
//  - *1st pass* -- maximum offset `maxOffset` for each expression
//      is computed, some expression might not know their size jet,
//      not all expressions are known, future references. First pass
//      is when user performs insertion of commands.
//  - *2nd pass* -- all expressions known now, each expression
//      should pick its right size, exact `offset` is computed
//      for each expression.
//  - *3rd pass* -- now we know exact `offset` of each expression,
//      so in this pass we fill in the addresses.
//
class Compilation {
    asm: Asm<any>;
    bin: CodeBuffer = null;

    hooks = {
        compiled: new Hook([]),
    };

    constructor (asm: Asm<any>) {
        this.asm = asm;
    }

    compile (container?: number[]): TOctets | Buffer {
        // 1st pass is performed as instructions are `insert`ed,
        // `.offsetMax` is calculated, and possibly `.offset`.

        // Instructions without size can now determine their size
        // based on `.offsetMax` and calculate their real `.offset`.
        this.do2ndPass();

        // Offsets are now know, here we evaluate references.
        const bin = this.bin = this.createBuffer();
        this.do3rdPass(bin);

        this.hooks.compiled.call();

        if (!container) return bin.truncate();
        else {
            for (let i = 0; i < bin.cursor; i++)
                container.push(bin.buf[i]);

            return container;
        }
    }

    doPass (callback: (expression: Expression, index: number) => void) {
        const {expressions} = this.asm;

        for(let i = 0; i < expressions.length; i++)
            callback(expressions[i], i);
    }

    createBuffer () {
        const lastExpression = this.asm.expressions[this.asm.expressions.length - 1];
        const maxLength = lastExpression.offsetMax + lastExpression.bytesMax();
        return new CodeBuffer(maxLength);
    }

    do2ndPass () {
        this.doPass((expression, index) => {
            if(expression instanceof ExpressionVolatile) {
                const fixedExpression = expression.getFixedSizeExpression();

                this.asm.replace(fixedExpression, index);
                fixedExpression.calcOffset();
            } else {
                expression.calcOffset();
            }
        });
    }

    do3rdPass (buffer: IPushable) {
        this.doPass((expression, index) => {
            if (expression instanceof ExpressionVariable)
                expression.evaluate();
            expression.write(buffer);
        });
    }
}

export default Compilation;
