import Plugin from '../Plugin';

class PluginTemplate extends Plugin {
    onAsm (asm) {
        asm.hooks.command.tap('PluginTemplate', (name, args) => {
            if (name === 'tpl') {
                const [Klass, ...rest] = args;
                return this.asm.insert(new Klass(rest));
            }
        });
    }
}

export default PluginTemplate;
