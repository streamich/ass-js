import {Memory, Operands, Register, SIZE, TUiOperand} from '../../../operand';
import {RegisterX86,} from "./register";
import {MemoryX86} from "./memory";

// Collection of operands an instruction might have.
export class OperandsX86 extends Operands {

    static findSize(ops: TUiOperand[]): SIZE {
        for(const operand of ops) {
            if(operand instanceof RegisterX86) return (operand as RegisterX86).size;
        }
        return SIZE.NONE;
    }

    hasImmediate(): boolean {
        return !!this.getImmediate();
    }

    hasExtendedRegister(): boolean {
        for(const op of this.list) {
            if(op instanceof Register) {
                if((op as Register).idSize() > 3) return true;
            } else if(op instanceof Memory) {
                const mem = op as MemoryX86;

                if(mem.base && (mem.base.idSize() > 3)) return true;
                if(mem.index && (mem.index.idSize() > 3)) return true;
            }
        }
        return false;
    }
}


export * from './displacement';
export * from './register';
export * from './memory';
export * from './generator';
