import Asm from "../Asm";

export abstract class Plugin {
    opts: object;
    asm: Asm;

    constructor (opts: object = {}) {
        this.opts = opts;
    }

    abstract onAsm (asm: Asm);
}

export default Plugin;
