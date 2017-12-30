import Asm from "../Asm";

export abstract class Plugin {
    opts: object;
    asm: Asm<any>;

    constructor (opts: object = {}) {
        this.opts = opts;
    }

    abstract onAsm (asm: Asm<any>);
}

export default Plugin;
