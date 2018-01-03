import PluginEthereum from "../plugins/ethereum/PluginEthereum";

const PresetEthereum = (opts = {}) => {
    const plugins = [
        new PluginEthereum(),
    ];

    return {
        plugins
    };
};

export default PresetEthereum;
