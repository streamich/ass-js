import {RegisterX86} from './operand/register';
import * as operand from './operand/operand';

export function r (str: string): RegisterX86 {
    let register = operand[str];
    return register;
}
