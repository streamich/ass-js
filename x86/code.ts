import * as o from './operand';
import * as t from './table';
import * as d from './def';
import * as i from './instruction';
import {number64} from './operand';
import {UInt64} from '../util';


export type Operand = o.TUserInterfaceOperand;


export abstract class Code {

    operandSize = o.SIZE.D;    // Default operand size.
    addressSize = o.SIZE.D;    // Default address size.

    mode: o.MODE = o.MODE.X64;

    protected expr: i.Expression[] = [];

    protected ClassInstruction = i.Instruction;

    protected ins(definition: d.Def, operands: o.Operands): i.Instruction {
        var instruction = new this.ClassInstruction(definition, operands, this);
        instruction.create();
        instruction.index = this.expr.length;
        this.expr.push(instruction);
        return instruction;
    }

    protected createInstructionFromGroupSize(bySize: {[s: number]: d.Def[]}, size: o.SIZE, ui_ops: o.TUserInterfaceOperand[]) {
        let matches: t.TOperandTemplate[];
        let definition: d.Def;
        for(let xdef of bySize[size]) {
            definition = xdef as d.Def;
            matches = definition.matchOperands(ui_ops);
            if(matches) break;
        }

        if(!matches)
            throw Error('Given operands could not find instruction definition.');

        var ops = o.Operands.fromUiOpsAndTpl(ui_ops, matches);
        return this.ins(definition, ops);
    }

    protected attachGroupMethods(group: d.DefGroup) {
        var mnemonic = group.mnemonic;
        var bySize = group.groupBySize();

        // Create methods with size postfix, like: pushq, pushd, pushw, etc..
        for(let s in bySize) {
            let size = parseInt(s) as o.SIZE;
            if(size > o.SIZE.NONE) {// B, W, D, Q, ...
                this[mnemonic + o.SIZE[size].toLowerCase()] = (...ui_ops: o.TUserInterfaceOperand[]) => {
                    return this.createInstructionFromGroupSize(bySize, size, ui_ops);
                };
            }
        }

        // Create general method where we determine operand size from profided operands.
        this[mnemonic] = (...ui_ops: Operand[]) => {
            if(ui_ops.length) {
                var size = o.Operands.findSize(ui_ops);
                if(size < o.SIZE.B) {
                    if(bySize[o.SIZE.NONE]) { // Operation does not require operand size.
                        return this.createInstructionFromGroupSize(bySize, o.SIZE.NONE, ui_ops);
                    } else
                        throw TypeError('Could not determine operand size.');
                }
                if(!bySize[size])
                    throw Error(`Instruction ${mnemonic} has no ${size}-bit definition.`);
                return this[mnemonic + o.SIZE[size].toLowerCase()].apply(this, ui_ops);
            } else {
                return this.createInstructionFromGroupSize(bySize, o.SIZE.NONE, ui_ops);
            }
        };
    }

    attachMethods(table: d.DefTable) {
        for(let groupname in table.groups) {
            let group = table.groups[groupname];
            this.attachGroupMethods(group);
        }
    }

    // instructionFromTable(group: string, ops: o.TUserInterfaceOperand[] = [], size: o.SIZE = o.SIZE.ANY): i.Instruction {
    //     var operands = o.Operands.fromUiOps(ops, size, );
    //
    //     var definition = this.table.find(group, operands);
    //     if(!definition)
    //         throw Error(`Definition for "${group}${operands.list.length ? ' ' + operands.toString() : ''}" not found.`);
    //     return this.ins(definition, operands, size);
    // }

    // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
    //
    // > The size of a displacement is 1, 2, or 4 bytes.
    //
    // > Also, in 64-bit mode, support is provided for some 64-bit displacement
    // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
    // > information on this.
    mem(disp: number|number64): o.Memory {
        if(typeof disp === 'number')
            return o.Memory.factory(this.addressSize).disp(disp as number);
        else if((disp instanceof Array) && (disp.length == 2))
            return o.Memory.factory(this.addressSize).disp(disp as number64);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    }

    disp(disp: number|number64): o.Memory {
        return this.mem(disp);
    }
    
    imm(value: o.Tnumber, signed = true) {
        return signed ? new o.Immediate(value) : new o.ImmediateUnsigned(value);
    }

    label(name: string): i.Label {
        var label = new i.Label(name);
        this.expr.push(label);
        return label;
    }

    db(str: string, encoding?: string): i.Data;
    db(octets: number[]): i.Data;
    db(buf: Buffer): i.Data;
    db(a: string|number[]|Buffer, b?: string): i.Data {
        var octets: number[];

        if(a instanceof Array) {
            octets = a as number[];
        } else if(typeof a === 'string') {
            var encoding = typeof b === 'string' ? b : 'ascii';
            // var buf = Buffer.from(a, encoding);
            var buf = new Buffer(a, encoding);
            octets = Array.prototype.slice.call(buf, 0);
        } else if(a instanceof Buffer) {
            octets = Array.prototype.slice.call(a, 0);
        }
        else
            throw TypeError('Data must be an array of octets, a Buffer or a string.');

        var data = new i.Data;
        data.index = this.expr.length;
        data.octets = octets;
        this.expr.push(data);
        return data;
    }

    dw(words: number[], littleEndian = true): i.Data {
        var size = 4;
        var octets = new Array(words.length * size);
        for(var i = 0; i < words.length; i++) {
            if(littleEndian) {
                octets[i * size + 0] = (words[i] >> 0x00) & 0xFF;
                octets[i * size + 1] = (words[i] >> 0x08) & 0xFF;
            } else {
                octets[i * size + 0] = (words[i] >> 0x08) & 0xFF;
                octets[i * size + 1] = (words[i] >> 0x00) & 0xFF;
            }
        }
        return this.db(octets);
    }

    dd(doubles: number[], littleEndian = true): i.Data {
        var size = 4;
        var octets = new Array(doubles.length * size);
        for(var i = 0; i < doubles.length; i++) {
            if(littleEndian) {
                octets[i * size + 0] = (doubles[i] >> 0x00) & 0xFF;
                octets[i * size + 1] = (doubles[i] >> 0x08) & 0xFF;
                octets[i * size + 2] = (doubles[i] >> 0x10) & 0xFF;
                octets[i * size + 3] = (doubles[i] >> 0x18) & 0xFF;
            } else {
                octets[i * size + 0] = (doubles[i] >> 0x18) & 0xFF;
                octets[i * size + 1] = (doubles[i] >> 0x10) & 0xFF;
                octets[i * size + 2] = (doubles[i] >> 0x08) & 0xFF;
                octets[i * size + 3] = (doubles[i] >> 0x00) & 0xFF;
            }
        }
        return this.db(octets);
    }

    dq(quads: (number|number64)[], littleEndian = true): i.Data {
        if(!(quads instanceof Array))
            throw TypeError('Quads must be and array of number[] or [number, number][].');
        if(!quads.length) return this.dd([]);

        var doubles = new Array(quads.length * 2);

        if(typeof quads[0] === 'number') { // number[]
            var qnumbers = quads as number[];
            for(var i = 0; i < qnumbers.length; i++) {
                var hi = UInt64.hi(qnumbers[i]);
                var lo = UInt64.lo(qnumbers[i]);
                if(littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                } else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        } else if(quads[0] instanceof Array) { // number64[]
            var numbers64 = quads as number64[];
            for(var i = 0; i < numbers64.length; i++) {
                var [lo, hi] = numbers64[i];
                if(littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                } else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        } else
            throw TypeError('Quads must be and array of number[] or [number, number][].');

        return this.dd(doubles);
    }

    resb(length: number): i.DataUninitialized {
        var data = new i.DataUninitialized(length);
        data.index = this.expr.length;
        this.expr.push(data);
        return data;
    }

    resw(length: number): i.DataUninitialized {
        return this.resb(length * 2);
    }

    resd(length: number): i.DataUninitialized {
        return this.resb(length * 4);
    }

    resq(length: number): i.DataUninitialized {
        return this.resb(length * 8);
    }

    rest(length: number): i.DataUninitialized {
        return this.resb(length * 10);
    }

    incbin(filepath: string, offset?: number, len?: number): i.Data {
        var fs = require('fs');

        if(typeof offset === 'undefined') { // incbin(filepath);
            return this.db(fs.readFileSync(filepath));

        } else if(typeof len === 'undefined') { // incbin(filepath, offset);
            if(typeof offset !== 'number')
                throw TypeError('Offset must be a number.');

            var fd = fs.openSync(filepath, 'r');

            var total_len = 0;
            var data: Buffer[] = [];
            const CHUNK = 4096;
            var buf = new Buffer(CHUNK);
            var bytes = fs.readSync(fd, buf, 0, CHUNK, offset);
            data.push(buf.slice(0, bytes));
            total_len += len;

            while((bytes > 0) && (total_len < len)) {
                buf = new Buffer(4096);
                bytes = fs.readSync(fd, buf, 0, CHUNK);
                if(bytes > 0) {
                    data.push(buf.slice(0, bytes));
                    total_len += bytes;
                }
            }

            buf = Buffer.concat(data);
            if(total_len > len) buf = buf.slice(0, len);

            fs.closeSync(fd);
            return this.db(buf);
        } else { // incbin(filepath, offset, len);
            if(typeof offset !== 'number')
                throw TypeError('Offset must be a number.');
            if(typeof len !== 'number')
                throw TypeError('Length must be a number.');

            var buf = new Buffer(len);
            var fd = fs.openSync(filepath, 'r');
            var bytes = fs.readSync(fd, buf, 0, len, offset);
            buf = buf.slice(0, bytes);
            fs.closeSync(fd);
            return this.db(buf);
        }
    }

    compile() {
        var code: number[] = [];
        for(var ins of this.expr) code = ins.write(code);
        return code;
    }

    toString(hex = true) {
        return this.expr.map((ins) => { return ins.toString('    ', hex); }).join('\n');
    }
}
