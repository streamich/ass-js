import {Operand} from "../../../operand";
import * as generator from './generator';

function parser (str: string): Operand {
    return generator[str];
}

export default parser;
