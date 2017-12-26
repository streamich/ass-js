import {SIZE, number64, Tnumber, Operands} from './operand';
import {Expression, Label, Data, DataUninitialized, DataVariable} from './instruction';
import * as i from './instruction';
import * as o from './operand';
import * as d from './def';
import {UInt64, extend} from './util';





export class Code {
    expr: Expression[] = [];

    ClassInstruction = i.Instruction;
    ClassInstructionSet = i.InstructionSet;
    ClassOperands = o.Operands;

    littleEndian = true; // Which way to encode constants by default.

    table: d.DefTable;



    // Expressions are compiled in 3 passes:
    //
    //  - *1st pass* -- maximum offset `maxOffset` for each expression is computed, some expression might not know
    //  their size jet, not all expressions are known, future references. First pass is when user performs insertion of commands.
    //  - *2nd pass* -- all expressions known now, each expression should pick its right size, exact `offset` is computed for each expression.
    //  - *3rd pass* -- now we know exact `offset` of each expression, so in this pass we fill in the addresses.
    compile(): number[] {
        // 1st pass is performed as instructions are `insert`ed, `.offsetMax` is calculated, and possibly `.offset`.

        // Instructions without size can now determine their size based on `.offsetMax` and
        // calculate their real `.offset`.
        this.do2ndPass();

        // Offsets are now know, here we evaluate references.
        return this.do3rdPass();
    }

    do2ndPass() {
        // We probably cannot skip this 2nd pass, as instructions might change their sizes after inserted,
        // for example, when `.lock()` prefix is added.
        // var last = this.expr[this.expr.length - 1];
        // var all_offsets_known = last.offset >= 0;
        //
        // Edge case when only the last Expression has variable size.
        // var all_sizes_known = last.bytes() >= 0;
        //
        // if(all_offsets_known && all_sizes_known) return; // Skip 2nd pass.

        var prev = this.expr[0];
        prev.offset = 0;
        for(var j = 1; j < this.expr.length; j++) {
            var ins = this.expr[j];

            if(ins instanceof i.ExpressionVolatile) {
                var fixed = (ins as i.ExpressionVolatile).getFixedSizeExpression();
                this.replace(fixed, ins.index);
                ins = fixed;
                // (ins as i.ExpressionVolatile).determineSize();
            }

            // var bytes = prev.bytes();
            // if(bytes === i.SIZE_UNKNOWN)
            //     throw Error(`Instruction [${j}] does not have size.`);
            // ins.offset = prev.offset + bytes;

            // Need to call method, as `InstructionSet` contains multiple `Instruction`s,
            // that all need offset updated of picked instruction.
            ins.calcOffset();

            prev = ins;
        }
    }

    do3rdPass() {
        var code: number[] = [];
        for(var ins of this.expr) {
            if(ins instanceof i.ExpressionVariable)
                (ins as i.ExpressionVariable).evaluate();
            code = ins.write(code); // 3rd pass
        }
        return code;
    }
}
