import Plugin from "../Plugin";
import {opcodes} from './table';
import {InstructionEthereum} from "./instruction";
import MnemonicEthereum from "./MnemonicEthereum";
import {ConstantEthereum, SIZE_ETHEREUM, TOctetsEthereum} from "./operand";
import {Constant, Operand, Operands} from "../../operand";

class PluginEthereum extends Plugin {
    onAsm (asm) {
        asm.hooks.command.tap('PluginEthereum', (name, args) => {
            name = name.toUpperCase();

            const opcode = opcodes[name];

            if (typeof opcode === 'number') {
                if (name === 'PUSH') {
                    this.push.apply(this, args);
                } else if ((name[0] === 'P') && (name.substr(0, 4) === 'PUSH')) {
                    const size = parseInt(name.substr(4));
                    return this.pushX(args[0], size);
                } else {
                    return this.mnemonic(name, opcode);
                }
            }
        });
    }

    mnemonic (name, opcode) {
        const instruction = new InstructionEthereum(new MnemonicEthereum(name, opcode));

        return this.asm.insert(instruction);
    }

    pushX (octets: TOctetsEthereum, X = 1) {
        const name = 'PUSH' + X;
        const mnemonic = new MnemonicEthereum(name, opcodes[name]);

        mnemonic.operandSize = SIZE_ETHEREUM['S' + X];

        const bytes = mnemonic.operandSize >> 3;
        const operands = new Operands([new ConstantEthereum(octets)]);
        const instruction = new InstructionEthereum(mnemonic, operands);

        return this.asm.insert(instruction);
    }

    push (data, size = 8) {

    }

    operands (uiOperands) {
        const operands = new Operands();
    }
}

export default PluginEthereum;
