import Prefix from './Prefix';
import {IVexDefinition} from './PrefixVex';
import {IPushable} from "../../../expression";

export interface IEvexDefinition extends IVexDefinition {}

// EVEX is 4 bytes:
// 62H
//
// 76543210
// ||||||mm ---> mm
// ||||00 -----> always 00
// |||~ -------> R-prime = Rp
// ||B --------> B
// |X ---------> X
// R ----------> R
//
// 76543210
// ||||||pp ---> pp
// |||||1 -----> always 1
// |vvvv-------> vvvv
// W ----------> W
//
// 76543210
// |||||aaa ---> aaa
// ||||~ ------> V-prime = Vp
// |||b -------> b
// |LL --------> LL
// z ----------> z
class PrefixEvex extends Prefix {

    // VEX includes
    R       = 0b1;      // VEX.R - Inverted
    X       = 0b1;      // VEX.X - Inverted
    B       = 0b1;      // VEX.B - Inverted
    W       = 0b1;      // VEX.W - Inverted
    vvvv    = 0b1111;   // VEX.vvvv - Inverted
    pp      = 0b00;     // VEX.pp
    mm      = 0b00;     // Low 2 bits of VEX.mmmmm

    // New in EVEX
    Rp      = 0b1;      // REX.R extension - Inverted
    z       = 0b0;      // Zeroing/merging
    LL      = 0b00;     // Like VEX.L but extended to 2 bits.
    b       = 0b0;      // Broadcast/RC/SAE context
    Vp      = 0b1;      // VEX.vvvv exntension - Inverted
    aaa     = 0b000;    // Opmask register ID

    constructor(evexdef: IEvexDefinition) {
        super();
        this.LL = evexdef.L;
        this.mm = evexdef.mmmmm & 0b11;
        this.pp = evexdef.pp;
        this.W = evexdef.W;
    }

    write(arr: IPushable) {
        arr.push(0x62);
        arr.push((this.R << 7) | (this.X << 6) | (this.B << 5) | (this.Rp << 4) | this.mm);
        arr.push((this.W << 7) | (this.vvvv << 3) | 0b00000100 | this.pp);
        arr.push((this.z << 7) | (this.LL << 5) | (this.b << 4) | (this.Vp << 3) | this.aaa);
    }
}

export default PrefixEvex;
