import {Immediate, isTnumber, number64, Relative, SIZE, Tnumber, Tvariable, Variable} from "../../../operand";
import {Expression} from "../../../expression";

export class DisplacementValue extends Immediate {
    static SIZE = {
        DISP8: SIZE.B,
        DISP32: SIZE.D,
    };

    static fromExpression(expr: Expression) {
        const rel = Relative.fromExpression(expr);

        return DisplacementValue.fromVariable(rel);
    }

    static fromVariable(value: Tvariable) {
        let disp: DisplacementValue;

        if (value instanceof Variable) {
            disp = new DisplacementValue(0);
            disp.setVariable(value as Variable);
        } else if (isTnumber(value)) {
            disp = new DisplacementValue(value as any);
        } else
            throw TypeError('Displacement must be of type Tvariable.');

        return disp;
    }

    constructor(value: number | number64) {
        super(value, true);
    }
}
