import Data from '../data/Data';

// A pre-filled template with some binary data.
export class Template extends Data {
    name = 'template';
    args: any[];

    constructor(args = []) {
        super();
        this.args = args;
    }

    toString(margin = '    ', comment = true) {
        var expression = this.name + this.args.join(', ');
        var cmt = '';
        if(comment) {
            cmt = `${this.bytes()} bytes`;
        }
        return this.formatToString(margin, expression, cmt);
    }
}

export default Template;
