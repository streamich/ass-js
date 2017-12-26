import InstructionPart from './InstructionPart';

// ## Op-code
//
// Primary op-code of the instruction. Often the lower 2 or 3 bits of the
// instruction op-code may be set independently.
//
// `d` and `s` bits, specify: d - direction of the instruction, and s - size of the instruction.
//  - **s**
//      - 1 -- word size
//      - 0 -- byte size
//  - **d**
//      - 1 -- register is destination
//      - 0 -- register is source
//
//     76543210
//     ......ds
//
// Lower 3 bits may also be used to encode register for some instructions. We set
// `.regInOp = true` if that is the case.
//
//     76543210
//     .....000 = RAX
class Opcode extends InstructionPart {

    /* Now we support up to 3 byte instructions */
    static MASK_SIZE        = 0b111111111111111111111110;   // `s` bit
    static MASK_DIRECTION   = 0b111111111111111111111101;   // `d` bit
    static MASK_OP          = 0b111111111111111111111000;   // When register is encoded into op-code.

    static SIZE = { // `s` bit
        BYTE: 0b0,
        WORD_OR_DOUBLE: 0b1,
    };

    static DIRECTION = { // `d` bit
        REG_IS_SRC: 0b00,
        REG_IS_DST: 0b10,
    };

    // Main op-code value.
    op: number = 0;

    bytes(): number {
        if(this.op > 0xFFFF) return 3;
        if(this.op > 0xFF) return 2;
        return 1;
    }

    write(arr: number[]): number[] {
        // Op-code can be up to 3 bytes long.
        var op = this.op;
        if(op > 0xFFFF) arr.push((op & 0xFF0000) >> 16);
        if(op > 0xFF) arr.push((op & 0xFF00) >> 8);
        arr.push(op & 0xFF);
        return arr;
    }
}

export default Opcode;
