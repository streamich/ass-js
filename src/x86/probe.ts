import {Code} from './code';
import * as o from './operand';


export interface IProbe {
    (mnemonic, operands, opts?: any): void;
    r(name, index?): any;
    // o: typeof o;
}

export type TAsmTemplate = (probe: IProbe) => void;


export function createProbe(code: Code) {
    var probe: IProbe = ((mnemonic, operands, opts?: any) => {
        code._(mnemonic, operands, opts);
    }) as any;

    probe.r = (rname, index) => {
        return o[rname];
    };

    return probe;
}
