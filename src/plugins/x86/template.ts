import Template from '../template/Template';
import {PREFIX, PrefixRex} from './parts/parts';

export class TemplateX86Lock extends Template {
    name = 'lock';
    octets = [PREFIX.LOCK];
}

export class TemplateX86Rex extends Template {
    name = 'rex';
    args = [0, 0, 0, 0];

    constructor(args: [number, number, number, number]) {
        super(args);
        const [W, R, X, B] = this.args;
        const rex = new PrefixRex(W, R, X, B);
        rex.write(this.octets);
    }
}
