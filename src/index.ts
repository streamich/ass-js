import Asm from "./Asm";
import PresetX64 from "./presets/PresetX64";
import PresetEthereum from "./presets/PresetEthereum";

export const X64 = (opts?) => new Asm(PresetX64(opts));
export const Ethereum = (opts?) => new Asm(PresetEthereum(opts));
