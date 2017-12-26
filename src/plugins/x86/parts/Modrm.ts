import InstructionPart from './InstructionPart';
import {R64} from '../regfile';
import {DisplacementValue, Memory} from '../operand';

// ## Mod-R/M
//
// Mod-R/M is an optional byte after the op-code that specifies the direction
// of operation or extends the op-code.
//
//     76543210
//     .....XXX <--- R/M field: Register or Memory
//     ..XXX <------ REG field: Register or op-code extension
//     XX <--------- MOD field: mode of operation
class Modrm extends InstructionPart {

    // Two bits of `MOD` field in `Mod-R/M` byte.
    static MOD = {
        INDIRECT:   0b00,
        DISP8:      0b01,
        DISP32:     0b10,
        REG_TO_REG: 0b11,
    };

    static RM = {
        // When this value is encoded in R/M field, SIB byte has to follow Mod-R/M byte.
        NEEDS_SIB: R64.RSP & 0b111,

        // When this value is encoded in R/M field, and MOD is 0b00 = INDIRECT,
        // disp32 bytes have to follow Mod-R/M byte. But not in long-mode,
        // in long-mode it is used for RIP-relative adressing.
        INDIRECT_DISP: R64.RBP & 0b111,
    };

    static getModDispSize(mem: Memory) {
        if(!mem.displacement || !mem.base)                                  return Modrm.MOD.INDIRECT;
        else if(mem.displacement.size === DisplacementValue.SIZE.DISP8)   return Modrm.MOD.DISP8;
        else if(mem.displacement.size <= DisplacementValue.SIZE.DISP32)   return Modrm.MOD.DISP32;
        else throw Error('64-bit displacement not supported yet.');
    }

    mod: number = 0;
    reg: number = 0;
    rm: number  = 0;

    constructor(mod, reg, rm) {
        super();
        this.mod = mod;
        this.reg = reg;
        this.rm = rm;
    }

    write(arr: number[] = []): number[] {
        arr.push((this.mod << 6) | (this.reg << 3) | this.rm);
        return arr;
    }
}

export default Modrm;
