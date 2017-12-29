import Asm from "./Asm";
import {Expression, ExpressionVolatile} from "./expression";

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
class Compiler {
    asm: Asm<any>;

    constructor (asm: Asm<any>) {
        this.asm = asm;
    }

    compile(): number[] {
        // 1st pass is performed as instructions are `insert`ed,
        // `.offsetMax` is calculated, and possibly `.offset`.

        // Instructions without size can now determine their size
        // based on `.offsetMax` and calculate their real `.offset`.
        this.do2ndPass();

        // Offsets are now know, here we evaluate references.
        return this.do3rdPass();
    }

    doPass (callback: (expression: Expression, index: number) => void) {
        const {expressions} = this.asm;

        for(let i = 0; i < expressions.length; i++)
            callback(expressions[i], i);
    }

    do2ndPass() {
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

    do3rdPass() {
        this.doPass((expression, index) => {

        });

        var code: number[] = [];
        for(var ins of this.expr) {
            if(ins instanceof i.ExpressionVariable)
                (ins as i.ExpressionVariable).evaluate();
            code = ins.write(code); // 3rd pass
        }
        return code;
    }
}

export default Compiler;
