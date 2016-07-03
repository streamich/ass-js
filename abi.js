"use strict";
var o = require('./x86/operand');
var ii = require('./instruction');
var Function = (function () {
    function Function() {
        this.abi = null;
        this.lbl = null;
        this.clobbered = [];
        this.stackFrame = false;
        this.locals = 0;
    }
    Function.prototype._ = function (bodyCallback) {
        return this.implement(bodyCallback);
    };
    Function.prototype.implement = function (bodyCallback) {
        this.abi.code.insert(this.lbl);
        this.abi.prologue(this.stackFrame, this.clobbered, this.locals);
        bodyCallback();
        this.abi.epilogue(this.stackFrame, this.clobbered, this.locals);
        return this;
    };
    return Function;
}());
exports.Function = Function;
var Abi = (function () {
    function Abi(code) {
        this.FunctionClass = Function;
        this.syscallArgs = [o.rax, o.rdi, o.rsi, o.rdx, o.r10, o.r8, o.r9];
        this.notSyscallArgs = [o.rbx, o.rcx, o.r11, o.r12, o.r13, o.r14, o.r15];
        this.callArgs = [o.rdi, o.rsi, o.rdx, o.rcx, o.r8, o.r9];
        this.scratchRegisters = [o.rax, o.rdi, o.rsi, o.rdx, o.rcx, o.r8, o.r9, o.r10, o.r11];
        this.preservedRegisters = [o.rbx, o.rsp, o.rbp, o.r12, o.r13, o.r14, o.r15];
        this.code = code;
    }
    Abi.prototype.syscall = function (args) {
        if (args === void 0) { args = []; }
        if (args.length > 7)
            throw TypeError('System call can have up to 6 arguments.');
        for (var j = 0; j < args.length; j++) {
            var arg = args[j];
            if (arg !== null) {
                this.code._('mov', [this.syscallArgs[j], arg]);
            }
        }
        this.code._('syscall');
    };
    Abi.prototype.func = function (lbl_name, stackFrame, clobbered, locals) {
        if (stackFrame === void 0) { stackFrame = false; }
        if (clobbered === void 0) { clobbered = []; }
        if (locals === void 0) { locals = 0; }
        var lbl;
        if (lbl_name instanceof ii.Label)
            lbl = lbl_name;
        else if (typeof lbl_name === 'string')
            lbl = this.code.lbl(lbl_name);
        else
            throw TypeError('lbl_name must be a string or a Label.');
        var func = new this.FunctionClass;
        func.abi = this;
        func.lbl = lbl;
        func.clobbered = clobbered;
        func.stackFrame = stackFrame;
        func.locals = locals;
        return func;
    };
    Abi.prototype.prologue = function (stackFrame, clobbered, locals) {
        if (stackFrame === void 0) { stackFrame = false; }
        if (clobbered === void 0) { clobbered = []; }
        if (locals === void 0) { locals = 0; }
        if (stackFrame || locals) {
            this.code._('push', o.rbp);
            this.code._('mov', [o.rbp, o.rsp]);
            if (locals)
                this.code._('sub', [o.rsp, locals]);
        }
        for (var j = 0; j < clobbered.length; j++) {
            var reg = clobbered[j];
            if (this.preservedRegisters.indexOf(reg) > -1) {
                this.code._('push', reg);
            }
        }
    };
    Abi.prototype.epilogue = function (stackFrame, clobbered, locals) {
        if (stackFrame === void 0) { stackFrame = false; }
        if (clobbered === void 0) { clobbered = []; }
        if (locals === void 0) { locals = 0; }
        for (var j = clobbered.length - 1; j > -1; j--) {
            var reg = clobbered[j];
            if (this.preservedRegisters.indexOf(reg) > -1) {
                this.code._('pop', reg);
            }
        }
        if (stackFrame || locals) {
            this.code._('mov', [o.rsp, o.rbp]);
            this.code._('pop', o.rbp);
        }
        this.code._('ret');
    };
    Abi.prototype.call = function (target, args, preserve) {
        if (args === void 0) { args = []; }
        if (preserve === void 0) { preserve = this.scratchRegisters; }
        for (var j = 0; j < preserve.length; j++) {
            var reg = preserve[j];
            if (this.scratchRegisters.indexOf(reg) > -1) {
                this.code._('push', reg);
            }
        }
        for (var j = 0; j < args.length; j++) {
            var arg = args[j];
            if (arg !== null) {
                if (j < this.callArgs.length) {
                    this.code._('mov', [this.callArgs[j], arg]);
                }
                else {
                    this.code._('push', args[j]);
                }
            }
        }
        var expr;
        if (target instanceof ii.Expression)
            expr = target;
        else if (target instanceof Function)
            expr = target.lbl;
        else
            throw TypeError('`target` must be an Expression or a Function.');
        this.code._('call', expr);
        for (var j = preserve.length - 1; j > -1; j--) {
            var reg = preserve[j];
            if (this.scratchRegisters.indexOf(reg) > -1) {
                this.code._('pop', reg);
            }
        }
    };
    return Abi;
}());
exports.Abi = Abi;
