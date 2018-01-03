import {Operand, SIZE} from "../../operand";
import formatOctets from "../data/formatOctets";

export enum SIZE_ETHEREUM {
    S0 = 0,
    S1 = 8,
    S2 = 2 * 8,
    S3 = 3 * 8,
    S4 = 4 * 8,
    S5 = 5 * 8,
    S6 = 6 * 8,
    S7 = 7 * 8,
    S8 = 8 * 8,
    S9 = 9 * 8,
    S10 = 10 * 8,
    S11 = 11 * 8,
    S12 = 12 * 8,
    S13 = 13 * 8,
    S14 = 14 * 8,
    S15 = 15 * 8,
    S16 = 16 * 8,
}

export type TOctetsEthereum = number[] | Buffer | Uint8Array;

export class ConstantEthereum extends Operand {
    octets: TOctetsEthereum;

    constructor (octets: TOctetsEthereum) {
        super();

        this.octets = octets;
        this.size = octets.length;
    }

    toString () {
        return formatOctets(this.octets);
    }
}
