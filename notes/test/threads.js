"use strict";
var o = require('../../x86/operand');
var code_1 = require('../../x86/x64/code');
var abi_1 = require('../../abi');
var util_1 = require('../../util');
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;
var libsys = require('../../../libsys/libsys');
var __DEBUG__ = true;
var MAP_GROWSDOWN = 0x0100;
var MAP_ANONYMOUS = 0x0020;
var MAP_PRIVATE = 0x0002;
var PROT_READ = 0x1;
var PROT_WRITE = 0x2;
var PROT_EXEC = 0x4;
var Asyscall = (function () {
    function Asyscall() {
        this.sbuf = null;
        this.threads = 0;
        this.queue = 100;
        this.intsize = 8;
        this.stackSize = 10 * this.intsize;
        this.stacksSize = 0;
        this.queueBlockSize = 8 * this.intsize;
        this.queueLength = 0;
        this.queueSize = 0;
        this.id = 0;
        this.offset = 0;
        this.offsetStart = 0;
        this.offsetEnd = 0;
        this.errorTimeout = util_1.UInt64.toNumber64(-1);
    }
    Asyscall.prototype.nextId = function () {
        return (this.id + 1) % 0x7FFFFFFF;
    };
    Asyscall.prototype.nextOffset = function () {
        var offset = this.offset + this.queueBlockSize;
        if (offset > this.offsetEnd)
            return this.offsetStart;
        else
            return offset;
    };
    Asyscall.prototype.nextTick = function (callback) {
        setImmediate(callback, 1);
    };
    Asyscall.prototype.build = function (threads, queue) {
        if (threads === void 0) { threads = 4; }
        if (queue === void 0) { queue = 100; }
        this.threads = threads;
        this.stacksSize = this.threads * this.stackSize;
        this.queue = queue;
        this.queueSize = this.queue * this.queueBlockSize;
        this.compile();
        this.sbuf.call([]);
    };
    Asyscall.prototype.exec = function () {
        var _this = this;
        var id = this.id = this.nextId();
        var offset = this.offset;
        var buf = this.sbuf;
        buf.writeInt32LE(0, this.nextOffset());
        buf.writeInt32LE(id, offset + 4);
        var offset_args = offset + 8;
        var callback;
        for (var j = 0; j < arguments.length; j++) {
            var arg = arguments[j];
            if (typeof arg === 'function') {
                callback = arg;
                break;
            }
            else {
                if (typeof arg === 'number') {
                    var _a = util_1.UInt64.toNumber64(arg), lo = _a[0], hi = _a[1];
                    buf.writeInt32LE(lo, offset_args + (j * 8));
                    buf.writeInt32LE(hi, offset_args + (j * 8) + 4);
                }
                else if (arg instanceof Array) {
                    buf.writeInt32LE(arg[0], offset_args + (j * 8));
                    buf.writeInt32LE(arg[1], offset_args + (j * 8) + 4);
                }
                else if (typeof arg === 'string') {
                }
            }
        }
        for (var j = arguments.length; j < 7; j++) {
            buf.writeInt32LE(0, offset_args + (j * 8));
            buf.writeInt32LE(0, offset_args + (j * 8) + 4);
        }
        buf.writeInt32LE(1, offset);
        this.offset = this.nextOffset();
        var poll = function () {
            _this.nextTick(function () {
                var id_read = buf.readInt32LE(offset + 4);
                if (id_read !== id) {
                    callback(_this.errorTimeout);
                    return;
                }
                var lock = buf[offset];
                if (lock === 3) {
                    var result = [buf.readInt32LE(offset + (7 * 8)), buf.readInt32LE(offset + (7 * 8) + 4)];
                    callback(result);
                }
                else
                    poll();
            });
        };
        poll();
    };
    Asyscall.prototype.stop = function () {
        for (var offset = this.offsetStart; offset <= this.offsetEnd; offset += this.queueBlockSize) {
            this.sbuf.writeInt32LE(4, offset);
            this.id = this.nextId();
            this.sbuf.writeInt32LE(this.id, offset + 4);
        }
    };
    Asyscall.prototype.compile = function () {
        var _this = this;
        var _ = new code_1.Code;
        var abi = new abi_1.Abi(_);
        var func_create_thread = abi.func('func_create_thread', false, [o.rax, o.rsi, o.rcx, o.rdx]);
        var func_thread = abi.func('func_thread');
        var lbl_stacks = _.lbl('stacks');
        var lbl_queue = _.lbl('queue');
        for (var j = 1; j <= this.threads; j++) {
            abi.call(func_create_thread, [j], []);
        }
        _._('ret');
        func_create_thread._(function () {
            _._('mov', [o.rax, o.rdi]);
            _._('mov', [o.rcx, _this.stackSize]);
            _._('mul', o.rcx);
            _._('lea', [o.rsi, o.rip.disp(lbl_stacks.rel(-_this.intsize * 2))]);
            _._('add', [o.rsi, o.rax]);
            _._('lea', [o.rdx, o.rip.disp(func_thread.lbl)]);
            _._('mov', [o.rsi.ref(), o.rdx]);
            _._('mov', [o.rsi.disp(_this.intsize), o.rdi]);
            abi.syscall([56, -2147381504]);
        });
        func_thread._(function () {
            var r_block = o.r13;
            var r_first_block = o.r14;
            var r_last_block = o.r15;
            var thread_stop = _.lbl('thread_stop');
            _._('lea', [r_first_block, o.rip.disp(lbl_queue)]);
            _._('mov', [r_last_block, r_first_block]);
            _._('add', [r_last_block, _this.queueSize - _this.queueBlockSize]);
            _._('mov', [r_block, r_first_block]);
            var loop = _.label('loop');
            (function () {
                var lbl_process_block = _.lbl('process_block');
                var lbl_execute_block = _.lbl('execute_block');
                var lbl_skip_to_next_block = _.lbl('skip_to_next_block');
                _._('cmp', [r_block, r_last_block]);
                _._('jbe', lbl_process_block);
                _._('mov', [r_block, r_first_block]);
                _.insert(lbl_process_block);
                _._('mov', [o.eax, r_block.ref()]);
                _._('cmp', [o.eax, 4]);
                _._('je', thread_stop);
                _._('cmp', [o.eax, 0]);
                _._('jne', lbl_execute_block);
                abi.syscall([24]);
                _._('jmp', lbl_process_block);
                _.insert(lbl_execute_block);
                _._('cmp', [o.eax, 1]);
                _._('jne', lbl_skip_to_next_block);
                _._('mov', [o.edx, 2]);
                _._('cmpxchg', [r_block.ref(), o.edx]).lock();
                _._('cmp', [r_block.ref(), 2], 32);
                _._('jne', lbl_skip_to_next_block);
                abi.syscall([
                    r_block.disp(_this.intsize),
                    r_block.disp(_this.intsize * 2),
                    r_block.disp(_this.intsize * 3),
                    r_block.disp(_this.intsize * 4),
                    r_block.disp(_this.intsize * 5),
                    r_block.disp(_this.intsize * 6),
                    r_block.disp(_this.intsize * 7),
                ]);
                _._('mov', [r_block.disp(_this.intsize * 7), o.rax]);
                _._('mov', [r_block.ref(), 3], 32);
                _.insert(lbl_skip_to_next_block);
                _._('add', [r_block, _this.queueBlockSize]);
                _._('jmp', loop);
            })();
            _.insert(thread_stop);
            _._('mov', [r_block.disp(8), 0xBABE]);
            abi.syscall([60]);
        });
        _.align(8);
        _.dq(0xFF);
        _.insert(lbl_stacks);
        _.db(0, this.stacksSize);
        _.align(8);
        _.dq(0xFF);
        _.insert(lbl_queue);
        _.db(0, this.queueSize);
        var bin = _.compile();
        this.sbuf = StaticBuffer.from(bin, 'rwe');
        this.offsetStart = this.sbuf.length - this.queueSize;
        this.offset = this.offsetStart;
        this.offsetEnd = this.sbuf.length - this.queueBlockSize;
        console.log(_.toString());
        return bin;
    };
    return Asyscall;
}());
exports.Asyscall = Asyscall;
var asyscall = new Asyscall;
asyscall.build(4, 10);
console.log(asyscall.errorTimeout);
asyscall.exec(39, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39, function (res, thread) {
    console.log('result pid:', res, thread);
});
var buf = new Buffer("Hello World\n");
var addr = libsys.addressBuffer64(buf);
asyscall.exec(1, 1, addr, buf.length, function (res, thread) {
    console.log('write: ', res, thread);
});
asyscall.exec(1, 1, addr, buf.length, function (res, thread) {
    console.log('write: ', res, thread);
});
asyscall.exec(1, 1, addr, buf.length, function (res, thread) {
    console.log('write: ', res, thread);
});
console.log('id', asyscall.id);
setTimeout(function () {
    asyscall.stop();
    setTimeout(function () {
        asyscall.sbuf.print();
    }, 100);
}, 100);
