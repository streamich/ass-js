import {Symbol} from './operand';
import {Expression} from './expression';

export class Label extends Expression {

    symbol: Symbol = null;

    length = 0;

    constructor(name?: string) {
        super();
        // if((typeof name !== 'string') || !name)
        //     throw TypeError('Label name must be a non-empty string.');
        this.symbol = new Symbol(this, 0, name);
    }

    getName () {
        return this.symbol.name;
    }

    toString () {
        return this.getName() + ':';
    }
}

export default Label;
