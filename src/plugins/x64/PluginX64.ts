import Plugin from "../Plugin";
import {InstructionX64} from './instruction';


class PluginX64 extends Plugin {
    onAsm (asm) {
        asm.hooks.instruction.tap('PluginX64', () => new InstructionX64());
        asm.hooks.command.tap('PluginX64', (name, args) => {
            switch (name) {
                case 'mov': {
                    console.log('cmd', name, args);
                    return;
                }
            }
        });
    }
}

export default PluginX64;
