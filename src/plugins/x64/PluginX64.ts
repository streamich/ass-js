import Plugin from "../Plugin";
import {InstructionX64} from './instruction';
import MNEMONICS from './__generated/__map';
import MnemonicVariationsX86 from "../x86/MnemonicVariationsX86";
import {Operands, Register, SIZE, TUiOperand} from "../../operand";
import {IInstructionOptionsX86, InstructionSetX86} from "../x86/instruction";
import {Match} from "../x86/MnemonicX86";
import {OperandsX86} from "../x86/operand/index";


class PluginX64 extends Plugin {
    onAsm (asm) {
        asm.hooks.instruction.tap('PluginX64', () => new InstructionX64());
        asm.hooks.command.tap('PluginX64', (name, args) => {
            if (MNEMONICS[name]) {
                return this.mnemonic(name, args);
            }
        });
    }

    normalizeInstructionOptions (opts: number | IInstructionOptionsX86): IInstructionOptionsX86 {
        let options: IInstructionOptionsX86;

        if (opts === void 0) {
            options = {} as IInstructionOptionsX86;
        } else if (typeof opts === 'number') {
            options = {
                size: opts as number
            };
        } else if (typeof opts === 'object') {
            options = opts;
        } else
            throw TypeError(`options must be a number or object.`);

        if (options.size === void 0)
            options.size = SIZE.ANY;

        return options;
    }

    private matchFilter = (options: IInstructionOptionsX86) => (match: Match) => {
        // Check mode of CPU.
        if(!(this.asm.opts.mode & match.mnemonic.mode)) return false;

        // If EVEX-specific options provided by user,
        // remove instruction definition matches that don't have EVEX prefix.
        const needsEvex = options.mask || (options.z !== void 0);
        if (needsEvex && !match.mnemonic.evex) return false;

        return true;
    };

    mnemonic (name: string, args: any[]) {
        const variations: MnemonicVariationsX86 = require('./__generated/' + name).default;

        let uiOperands: TUiOperand[] = args[0];
        if (uiOperands && !Array.isArray(uiOperands)) {
            uiOperands = [uiOperands];
        }

        const options: IInstructionOptionsX86 = this.normalizeInstructionOptions(args[1]);
        const operands: OperandsX86 = this.asm.ops(uiOperands, options.size);

        // If operand size not specified, try inferring it from register size.
        if (options.size <= 0) {
            for (const operand of operands.list) {
                if (operand instanceof Register) {
                    options.size = operand.size;
                    break;
                }
            }
        }

        const matches = variations.matches(operands, options, this.matchFilter(options));
        const instructionSet = new InstructionSetX86 (operands, matches, options);

        this.asm.insert(instructionSet);

        const insn = instructionSet.pickShortestInstruction();

        if (insn) {
            this.asm.replace(insn, instructionSet.index);
            return insn;
        } else
            return instructionSet;
    }
}

export default PluginX64;
