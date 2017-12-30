import InstructionPart from './InstructionPart';
import {R64} from '../regfile';
import {IPushable} from "../../../expression";

// ## SIB
//
// SIB (scale-index-base) is optional byte used when dereferencing memory
// with complex offset, like when you do:
//
//     mov rax, [rbp + rdx * 8]
//
// The above operation in SIB byte is encoded as follows:
//
//     rbp + rdx * 8 = BASE + INDEX * USERSCALE
//
// Where `USERSCALE` can only be 1, 2, 4 or 8; and is encoded as follows:
//
//     USERSCALE (decimal) | SCALE (binary)
//     ------------------- | --------------
//     1                   | 00
//     2                   | 01
//     4                   | 10
//     8                   | 11
//
// The layout of SIB byte:
//
//     76543210
//     .....XXX <--- BASE field: base register address
//     ..XXX <------ INDEX field: address of register used as scale
//     XX <--------- SCALE field: specifies multiple of INDEX: USERSCALE * INDEX
class Sib extends InstructionPart {
    // When index set to 0b100 it means INDEX = 0 and SCALE = 0.
    static INDEX_NONE = R64.RSP & 0b111;

    // If Modrm.mod = 0b00, BASE = 0b101, means no BASE.
    // if Modrm.mod is 0b01 or 0b10, use RBP + disp8 or RBP + disp32, respectively.
    static BASE_NONE = R64.RBP & 0b111;

    S: number = 0;
    I: number = 0;
    B: number = 0;

    constructor(scalefactor, I, B) {
        super();
        this.setScale(scalefactor);
        this.I = I;
        this.B = B;
    }

    setScale(scalefactor) {
        switch(scalefactor) {
            case 1: this.S = 0b00; break;
            case 2: this.S = 0b01; break;
            case 4: this.S = 0b10; break;
            case 8: this.S = 0b11; break;
            default: this.S = 0;
            // default: throw TypeError(`User scale must be on of [1, 2, 4, 8], given: ${userscale}.`);
        }
    }

    write(arr: IPushable) {
        arr.push((this.S << 6) | (this.I << 3) | this.B);
    }
}

export default Sib;
