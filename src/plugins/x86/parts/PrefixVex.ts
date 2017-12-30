import Prefix from './Prefix';
import {IPushable} from "../../../expression";

// "VEX.DDS.LIG.66.0F38.W1" => {vvvv: 'DDS', L: 0, pp: 1, mmmmm: 2, W: 1}
export interface IVexDefinition {
    L: number;
    vvvv: string;
    pp: number;
    mmmmm: number;
    W: number;
    WIG: boolean;
}

// ### 2-byte VEX:
// 76543210
// 11000100
//
// 76543210
// ||||||pp ---> pp
// |||||L -----> L
// |vvvv ------> vvvv
// R ----------> R
//
// ### 3-byte VEX:
// 76543210
// 11000101
//
// 76543210
// |||mmmmm ---> mmmmm
// ||B --------> B
// |X ---------> X
// R ----------> R
//
// 76543210
// ||||||pp ---> pp
// |||||L -----> L
// |vvvv ------> vvvv
// W ----------> W
class PrefixVex extends Prefix {

    static PP = {
        x66:    0b01,
        xF2:    0b11,
        xF3:    0b10,
    };

    static MMMMM = {
        x0F38:  0b00010,
        x0F3A:  0b00011,
        x0F:    0b00001,
    };

    bytes = 2; // VEX can be either 2 or 3 bytes.

    // R, X, B, W and vvvv are inverted.
    R = 1;  // Must be 1, if not used, otherwise wrong instruction.
    X = 1;  // Must be 1, if not used, otherwise wrong instruction.
    B = 1;
    W = 1;
    vvvv = 0b1111; // must be 0b1111, if not used, otherwise CPU will #UD

    mmmmm = 0;
    L = 0;
    pp = 0;

    constructor(vexdef: IVexDefinition, R = 1, X = 1, B = 1, vvvv = 0b1111) {
        super();
        this.L = vexdef.L;
        this.mmmmm = vexdef.mmmmm;
        this.pp = vexdef.pp;
        this.W = vexdef.W;

        if(vexdef.WIG) this.W = 0b0; // When WIG "W ignored", set to "0" to make compatible with GAS.

        this.R = R;
        this.X = X;
        this.B = B;
        this.vvvv = vvvv;

        if((this.X === 0) || (this.B === 0) ||
            ((this.W === 0) && !vexdef.WIG) ||
            (this.mmmmm === PrefixVex.MMMMM.x0F3A) || (this.mmmmm === PrefixVex.MMMMM.x0F38))
            this.promoteTo3bytes();
    }

    promoteTo3bytes() {
        this.bytes = 3;
    }

    write(arr: IPushable) {
        if(this.bytes === 2) { // 2-byte VEX
            arr.push(0b11000101); // 0xC5
            arr.push((this.R << 7) | (this.vvvv << 3) | (this.L << 2) | this.pp);
        } else { // 3-byte VEX
            arr.push(0b11000100); // 0xC4
            arr.push((this.R << 7) | (this.X << 6) | (this.B << 5) | this.mmmmm);
            arr.push((this.W << 7) | (this.vvvv << 3) | (this.L << 2) | this.pp);
        }
    }
}

export default PrefixVex;
