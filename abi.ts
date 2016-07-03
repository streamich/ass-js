import * as o from './x86/operand';
import * as ii from './instruction';
import {Code} from './code';


export class Function {
    abi: Abi = null;
    lbl: ii.Label = null;           // Label is created for every function.
    clobbered: o.Register[] = [];   // Clobbered registers.
    stackFrame = false;             // Whether to create a new stack frame.
    locals = 0;                     // Stack size reserved for function local variables.

    _(bodyCallback): this {
        return this.implement(bodyCallback);
    }

    implement(bodyCallback): this {
        this.abi.code.insert(this.lbl);

        // Prologue
        this.abi.prologue(this.stackFrame, this.clobbered, this.locals);

        // Function body
        bodyCallback();

        // Epilogue
        this.abi.epilogue(this.stackFrame, this.clobbered, this.locals);

        return this;
    }
}


// Implements platform and architecture specific ABI conventions, for example,
// calls the right syscall instruction, be it `syscall`, `sysenter`, `int 0x80` or anything else;
// `push`es and `pop`s function arguments to stack according to calling conventions, etc.
export class Abi {

    FunctionClass = Function;

    code: Code;

    // rax, rdi, rsi, rdx, r10, r8, r9
    syscallArgs         = [o.rax, o.rdi, o.rsi, o.rdx, o.r10, o.r8, o.r9];
    notSyscallArgs      = [o.rbx, o.rcx, o.r11, o.r12, o.r13, o.r14, o.r15];

    // args: rdi, rsi, rdx, rcx, r8, r9 + stack
    callArgs            = [o.rdi, o.rsi, o.rdx, o.rcx, o.r8, o.r9];

    // scratch: rax, rdi, rsi, rdx, rcx, r8, r9, r10, r11
    scratchRegisters    = [o.rax, o.rdi, o.rsi, o.rdx, o.rcx, o.r8, o.r9, o.r10, o.r11];

    // preserved: rbx, rsp, rbp, r12, r13, r14, r15
    preservedRegisters  = [o.rbx, o.rsp, o.rbp, o.r12, o.r13, o.r14, o.r15];

    constructor(code: Code) {
        this.code = code;
    }

    syscall(args: any[] = []) {
        if(args.length > 7)
            throw TypeError('System call can have up to 6 arguments.');

        for(var j = 0; j < args.length; j++) {
            var arg = args[j];
            if(arg !== null) {
                this.code._('mov', [this.syscallArgs[j], arg]);
            }
        }
        this.code._('syscall');
    }

    func(lbl_name: string|ii.Label, stackFrame = false, clobbered: o.Register[] = [], locals: number = 0): Function {
        var lbl: ii.Label;
        if(lbl_name instanceof ii.Label) lbl = lbl_name as ii.Label;
        else if(typeof lbl_name === 'string') lbl = this.code.lbl(lbl_name as string);
        else throw TypeError('lbl_name must be a string or a Label.');

        var func = new this.FunctionClass;
        func.abi = this;
        func.lbl = lbl;
        func.clobbered = clobbered;
        func.stackFrame = stackFrame;
        func.locals = locals;
        return func;
    }

    prologue(stackFrame = false, clobbered: o.Register[] = [], locals: number = 0) {
        if(stackFrame || locals) {
            // this.code._('enter', [locals, 0]);
            this.code._('push', o.rbp);
            this.code._('mov', [o.rbp, o.rsp]);
            if(locals)
                this.code._('sub', [o.rsp, locals]);
        }
        for(var j = 0; j < clobbered.length; j++) {
            var reg = clobbered[j];
            if (this.preservedRegisters.indexOf(reg) > -1) {
                this.code._('push', reg);
            }
        }
    }

    epilogue(stackFrame = false, clobbered: o.Register[] = [], locals: number = 0) {
        for(var j = clobbered.length - 1; j > -1; j--) {
            var reg = clobbered[j];
            if (this.preservedRegisters.indexOf(reg) > -1) {
                this.code._('pop', reg);
            }
        }
        if(stackFrame || locals) {
            // this.code._('leave');
            this.code._('mov', [o.rsp, o.rbp]);
            this.code._('pop', o.rbp);
        }
        this.code._('ret');
    }

    call(target: ii.Expression|Function, args: any[] = [], preserve: o.Register[] = this.scratchRegisters) {
        // Save registers.
        for(var j = 0; j < preserve.length; j++) {
            var reg = preserve[j];
            if(this.scratchRegisters.indexOf(reg) > -1) {
                this.code._('push', reg);
            }
        }

        for(var j = 0; j < args.length; j++) {
            var arg = args[j];
            if(arg !== null) {
                if(j < this.callArgs.length) {
                    this.code._('mov', [this.callArgs[j], arg]);
                } else {
                    this.code._('push', args[j]);
                }
            }
        }

        var expr: ii.Expression;
        if(target instanceof ii.Expression) expr = target;
        else if(target instanceof Function) expr = target.lbl;
        else throw TypeError('`target` must be an Expression or a Function.');

        this.code._('call', expr);

        // Restore registers.
        for(var j = preserve.length - 1; j > -1; j--) {
            var reg = preserve[j];
            if(this.scratchRegisters.indexOf(reg) > -1) {
                this.code._('pop', reg);
            }
        }
    }

}

