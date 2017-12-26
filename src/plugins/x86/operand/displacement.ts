import * as o from "../../../operand";
import {Immediate, number64, SIZE} from "../../../operand";
import {Expression} from "../../../expression";

export class DisplacementValue extends Immediate {
    static SIZE = {
        DISP8: SIZE.B,
        DISP32: SIZE.D,
    };

    static fromExpression(expr: Expression) {
        var rel = o.Relative.fromExpression(expr);
        return DisplacementValue.fromVariable(rel);
    }

    static fromVariable(value: o.Tvariable) {
        var disp: DisplacementValue;
        if (value instanceof o.Variable) {
            disp = new DisplacementValue(0);
            disp.setVariable(value as o.Variable);
        } else if (o.isTnumber(value)) {
            disp = new DisplacementValue(value as o.Tnumber);
        } else
            throw TypeError('Displacement must be of type Tvariable.');
        return disp;
    }

    constructor(value: number | number64) {
        super(value, true);
    }
}
