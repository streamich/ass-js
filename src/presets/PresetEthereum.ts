import PluginEthereum from "../plugins/ethereum/PluginEthereum";
import PluginData from "../plugins/data/PluginData";
import PluginUtil from "../plugins/util/PluginUtil";

const PresetEthereum = (opts = {}) => {
    const plugins = [
        new PluginEthereum(),
        new PluginData(),
        new PluginUtil(),
    ];

    return {
        plugins
    };
};

export default PresetEthereum;
