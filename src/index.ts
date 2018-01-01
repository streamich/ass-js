import Asm from "./Asm";
import PresetX64 from "./presets/PresetX64";

export const X64 = (opts?) => new Asm(PresetX64(opts));
