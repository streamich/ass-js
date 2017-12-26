import PluginData from '../plugins/data/PluginData';
import PluginUtil from '../plugins/util/PluginUtil';
import PluginX86 from '../plugins/x86/PluginX86';
import PluginX64 from '../plugins/x64/PluginX64';
import PluginTemplate from '../plugins/template/PluginTemplate';
import {SIZE} from '../operand';

const PresetX64 = (opts = {}) => {
    const plugins = [
        new PluginTemplate(),
        new PluginX64(),
        new PluginX86(),
        new PluginData(),
        new PluginUtil(),
    ];

    return {
        operandSize: SIZE.D,
        addressSize: SIZE.Q,
        ...opts,
        plugins
    };
};

export default PresetX64;
