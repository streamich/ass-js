import Plugin from "../Plugin";
import {InstructionX64} from './instruction';


class PluginX64 extends Plugin {
    onAsm (asm) {
        asm.hooks.instruction.tap('PluginX64', () => new InstructionX64());
    }
}

export default PluginX64;
