import {ITableDefinitionX86, TTableOperandX86} from "./table";
import MnemonicX86 from "./MnemonicX86";
import {Register, SIZE} from "../../operand";

const mnemonicFromDefX86: (def: ITableDefinitionX86) => MnemonicX86 = def => {
    const mnemonic = new MnemonicX86;

    mnemonic.opcode               = def.o;
    mnemonic.mnemonic             = def.mn;
    mnemonic.operandSize          = def.s;
    mnemonic.operands             = [];
    mnemonic.opreg                = def.or;
    mnemonic.operandSizeDefault   = def.ds;
    mnemonic.lock                 = def.lock;
    mnemonic.regInOp              = def.r;
    mnemonic.opcodeDirectionBit   = def.dbit;
    mnemonic.rex                  = def.rex;
    mnemonic.useModrm             = def.mr;
    mnemonic.rep                  = def.rep;
    mnemonic.repne                = def.repne;
    mnemonic.prefixes             = def.pfx;
    mnemonic.opEncoding           = def.en;
    mnemonic.mode                 = def.mod;
    mnemonic.extensions           = def.ext;

    // Operand template.
    if(def.ops && def.ops.length) {
        let impliedSize = SIZE.NONE;
        for(let operand of def.ops) {
            if(!(operand instanceof Array)) operand = [operand] as TTableOperandX86[];

            let flattened = (operand as any).reduce((a, b) => {

                // Determine operand size from o.Register operands
                let cur_size = SIZE.NONE;
                if(b instanceof Register) { // rax, rbx, eax, ax, al, etc..
                    cur_size = b.size;
                } else if((typeof b === 'function') && (b.name.indexOf('Register') === 0)) {
                    // o.Register, o.Register8, ..., o.RegisterRip, .. etc.
                    cur_size = (new b).size;
                }

                if(cur_size !== SIZE.NONE) {
                    if (mnemonic.operandSize <= SIZE.NONE) {
                        if (impliedSize > SIZE.NONE) {
                            if (impliedSize !== cur_size)
                                throw TypeError('Instruction operand size definition mismatch: ' + mnemonic.mnemonic);
                        } else impliedSize = cur_size;
                    }
                }

                return a.concat(b);
            }, []);
            operand = flattened;

            mnemonic.operands.push(operand as TTableOperandX86[]);
        }

        if(mnemonic.operandSize <= SIZE.NONE) {
            mnemonic.operandSize = impliedSize;
        }
    }

    return mnemonic;
};

export default mnemonicFromDefX86;
