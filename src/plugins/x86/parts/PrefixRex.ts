import {PREFIX} from './Prefix';
import Prefix from './Prefix';
import {IPushable} from "../../../expression";

// ## REX
//
// REX is an optional prefix used for two reasons:
//
//  1. For 64-bit instructions that require this prefix to be used.
//  2. When using extended registers: r8, r9, r10, etc..; r8d, r9d, r10d, etc...
//
// REX byte layout:
//
//     76543210
//     .1..WRXB
//     .......B <--- R/M field in Mod-R/M byte, or BASE field in SIB byte addresses one of the extended registers.
//     ......X <---- INDEX field in SIB byte addresses one of the extended registers.
//     .....R <----- REG field in Mod-R/M byte addresses one of the extended registers.
//     ....W <------ Used instruction needs REX prefix.
//     .1 <--------- 0x40 identifies the REX prefix.
class PrefixRex extends Prefix {
    W: number; // 0 or 1
    R: number; // 0 or 1
    X: number; // 0 or 1
    B: number; // 0 or 1

    constructor(W, R, X, B) {
        super();
        this.W = W;
        this.R = R;
        this.X = X;
        this.B = B;
    }

    write(arr: IPushable) {
        arr.push(PREFIX.REX | (this.W << 3) | (this.R << 2) | (this.X << 1) | this.B);
    }
}

export default PrefixRex;
