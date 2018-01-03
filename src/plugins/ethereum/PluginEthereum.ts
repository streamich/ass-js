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
                if ((name[0] === 'P') && (name.substr(0, 4) === 'PUSH')) {
                    const size = parseInt(name.substr(4));

                    if (Array.isArray(args[0])) {
                        return this.pushX(args[0], size);
                    } else {
                        return this.pushX(args, size);
                    }
                } else {
                    return this.mnemonic(name, opcode);
                }
            } else if (name === 'PUSH') {
                return this.push.call(this, Array.isArray(args[0]) ? args[0] : args);
            }
        });
    }

    mnemonic (name, opcode) {
        const instruction = new InstructionEthereum(new MnemonicEthereum(name, opcode));

        return this.asm.insert(instruction);
    }

    pushX (octets: TOctetsEthereum, X = 1) {
        if (octets.length !== X)
            throw new Error(`PUSH${X} command expects ${X} byte immediate, ${octets.length} given. Consider using variadic PUSH command instead.`);

        const name = 'PUSH' + X;
        const mnemonic = new MnemonicEthereum(name, opcodes[name]);

        mnemonic.operandSize = SIZE_ETHEREUM['S' + X];

        const bytes = mnemonic.operandSize >> 3;
        const operands = new Operands([new ConstantEthereum(octets)]);
        const instruction = new InstructionEthereum(mnemonic, operands);

        return this.asm.insert(instruction);
    }

    push (octets: number[]) {
        console.log('HERE')
        let cursor = 0;
        const MAX = 32;

        do {
            let diff = octets.length - cursor;

            if (diff > MAX) {
                this.pushX(octets.slice(cursor, cursor + MAX), MAX);
                cursor += MAX;
            } else {
                return this.pushX(octets.slice(cursor), diff);
            }
        } while (true);
    }
}

export default PluginEthereum;
