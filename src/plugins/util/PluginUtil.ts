import Plugin from '../Plugin';
import Asm from '../../Asm';
import Align from './Align';
import Label from '../../Label';
import {Operands} from "../../operand";

class PluginUtil extends Plugin {
    onAsm (asm: Asm<any>) {
        asm.hooks.command.tap('PluginData', (name, args) => {
            switch (name) {
                case 'align': return this.align(...args);
                case 'label': return this.label.apply(this, args);
            }
        });
        asm.hooks.ops.tap('PluginData', (operands, size) => new Operands(operands, size));
    }

    align (bytes = 4, fill: number|number[][] = null) {
        const align = new Align(bytes);
        if(fill !== null) {
            if(typeof fill === 'number') align.templates = [[fill]] as number[][];
            else align.templates = fill;
        }
        return this.asm.insert(align);
    }

    label (name: string): Label {
        return this.asm.insert(this.asm.lbl(name)) as Label;
    }
}

export default PluginUtil;
