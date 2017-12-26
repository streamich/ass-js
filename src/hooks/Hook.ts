export interface ITap {
    name: string,
    fn: (...args) => any,
    type: 'sync'
}

class Hook {
    args: string[];
    taps = [];

    constructor (args = []) {
        this.args = args;
    }

    tap (opts: ITap | string, fn) {
        let options: ITap;

        if(typeof opts === "string")
            options = {name: opts} as ITap;
        if(typeof options !== "object" || options === null)
            throw new Error("Invalid arguments to tap(options: Object, fn: function)");

        options = {
            ...options,
            type: 'sync',
            fn: fn
        };

        if(typeof options.name !== "string" || !options.name)
            throw new Error("Missing name for tap");

        this.taps.push(options);
    }

    call (...args) {
        let result;
        const {taps} = this;

        for (let i = 0; i < taps.length; i++) {
            result = taps[i].fn.apply(null, args);

            if (result !== void 0) return result;
        }

        return result;
    }
}

export default Hook;
