"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var o = require("../../x86/operand");
var code_1 = require("../../x86/x64/code");
var abi_1 = require("../../abi");
var util_1 = require("../../util");
var StaticBuffer = require('../../../static-buffer/buffer').StaticBuffer;
var libsys = require('../../../libsys/libsys');
// Create a queue where syscall parameters written to memory, threads run in the background
// and execute the syscalls and write result back to the blocks. Block format:
//
//      <---------- 32 bits ----------> <---------- 32 bits ----------->
//     +================================================================+
//     | Lock                          | Block ID                       |   Block 0
//     +----------------------------------------------------------------+
//     | Syscall number                                                 |
//     +----------------------------------------------------------------+
//     | Argument 1                                                     |
//     +----------------------------------------------------------------+
//     | Argument 2                                                     |
//     +----------------------------------------------------------------+
//     | Argument 3                                                     |
//     +----------------------------------------------------------------+
//     | Argument 4                                                     |
//     +----------------------------------------------------------------+
//     | Argument 5 / Thread ID                                         |
//     +----------------------------------------------------------------+
//     | Argument 6 / Result                                            |
//     +================================================================+
//     |                            ....                                |   Block 1
//     +----------------------------------------------------------------+
//     +                            ....                                |
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
        this.queueBlockSize = 8 * this.intsize; // control INT + syscall num + 6 args
        this.queueLength = 0;
        this.queueSize = 0;
        this.id = 0; // ID of syscall incrementing every call.
        this.offset = 0; // Offset of the next block to be written in
        this.offsetStart = 0; // Offset of the first block
        this.offsetEnd = 0; // Offset of the last block
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
        // Mark lock of next block as UNINITIALIZED so that threads stop at
        // that and wait until something is written there.
        buf.writeInt32LE(0 /* UNINITIALIZED */, this.nextOffset());
        // Block ID -- each block has a unique ID, in case queue is overfilled, blocks determine that
        // they time-out by their ID.
        buf.writeInt32LE(id, offset + 4);
        // Write arguments to block and find callback function.
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
                    // ...
                }
            }
        }
        // Fill the rest of the block with 0x00
        for (var j = arguments.length; j < 7; j++) {
            buf.writeInt32LE(0, offset_args + (j * 8));
            buf.writeInt32LE(0, offset_args + (j * 8) + 4);
        }
        // The last thing we do, is mark this block as available for threads.
        buf.writeInt32LE(1 /* FREE */, offset);
        this.offset = this.nextOffset();
        var poll = function () {
            // console.log('polling');
            _this.nextTick(function () {
                // Check ID first, if ID does not match, then our queue has overflown
                // and we timeout this call.
                var id_read = buf.readInt32LE(offset + 4);
                if (id_read !== id) {
                    callback(_this.errorTimeout);
                    return;
                }
                var lock = buf[offset];
                if (lock === 3 /* DONE */) {
                    var result = [buf.readInt32LE(offset + (7 * 8)), buf.readInt32LE(offset + (7 * 8) + 4)];
                    // var thread_id = buf.readInt32LE(offset + (6 * 8));
                    // callback(result, thread_id);
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
            this.sbuf.writeInt32LE(4 /* EXIT */, offset);
            this.id = this.nextId();
            this.sbuf.writeInt32LE(this.id, offset + 4);
        }
        // this.sbuf.free();
    };
    Asyscall.prototype.compile = function () {
        var _this = this;
        var _ = new code_1.Code;
        var abi = new abi_1.Abi(_);
        var func_create_thread = abi.func('func_create_thread', false, [o.rax, o.rsi, o.rcx, o.rdx]);
        var func_thread = abi.func('func_thread');
        var lbl_stacks = _.lbl('stacks');
        var lbl_queue = _.lbl('queue');
        // main()
        for (var j = 1; j <= this.threads; j++) {
            abi.call(func_create_thread, [j], []);
        }
        _._('ret');
        func_create_thread._(function () {
            _._('mov', [o.rax, o.rdi]); // Thread index, starting from 1
            _._('mov', [o.rcx, _this.stackSize]); // Stack size
            _._('mul', o.rcx); // Stack offset
            _._('lea', [o.rsi, o.rip.disp(lbl_stacks.rel(-_this.intsize * 2))]); // Address of stack frame bottom + 1
            _._('add', [o.rsi, o.rax]); // Address of stack top for this thread, RSI second arg to syscall
            _._('lea', [o.rdx, o.rip.disp(func_thread.lbl)]); // Address of thread function code in top of stack
            _._('mov', [o.rsi.ref(), o.rdx]); // Top of stack, RET address
            _._('mov', [o.rsi.disp(_this.intsize), o.rdi]); // Thread ID in bottom of stack
            // long clone(unsigned long flags, void *child_stack);
            abi.syscall([56 /* clone */, -2147381504 /* THREAD_FLAGS */]); // 2nd arg RSI, stack top address
            // When thread starts the address of its starting function is
            // stored on its stack, the next instruction here is `RET` so it
            // jumps to that address.
        });
        func_thread._(function () {
            var r_block = o.r13; // Current block address
            var r_first_block = o.r14;
            var r_last_block = o.r15;
            var thread_stop = _.lbl('thread_stop');
            _._('lea', [r_first_block, o.rip.disp(lbl_queue)]); // R14 = Queue start address
            _._('mov', [r_last_block, r_first_block]);
            _._('add', [r_last_block, _this.queueSize - _this.queueBlockSize]); // R15 = Last block address
            _._('mov', [r_block, r_first_block]); // R13 = Current block address
            var loop = _.label('loop'); // loop start
            (function () {
                var lbl_process_block = _.lbl('process_block');
                var lbl_execute_block = _.lbl('execute_block');
                var lbl_skip_to_next_block = _.lbl('skip_to_next_block');
                _._('cmp', [r_block, r_last_block]); // check iterator bounds
                _._('jbe', lbl_process_block);
                _._('mov', [r_block, r_first_block]);
                _.insert(lbl_process_block);
                _._('mov', [o.eax, r_block.ref()]); // Lock in RAX
                _._('cmp', [o.eax, 4 /* EXIT */]); // if(lock == LOCK.EXIT) -> stop thread
                _._('je', thread_stop);
                _._('cmp', [o.eax, 0 /* UNINITIALIZED */]); // Wait for this block until something is written to it
                _._('jne', lbl_execute_block);
                abi.syscall([24 /* sched_yield */]); // yield and ...
                _._('jmp', lbl_process_block); // ... try this block again
                _.insert(lbl_execute_block);
                _._('cmp', [o.eax, 1 /* FREE */]); // Check block is possibly available
                _._('jne', lbl_skip_to_next_block);
                _._('mov', [o.edx, 2 /* LOCKED */]);
                _._('cmpxchg', [r_block.ref(), o.edx]).lock(); // Try to acquire lock for this block
                _._('cmp', [r_block.ref(), 2 /* LOCKED */], 32); // Check we actually got the lock
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
                _._('mov', [r_block.disp(_this.intsize * 7), o.rax]); // Store syscall result in memory, in place of 6th argument
                _._('mov', [r_block.ref(), 3 /* DONE */], 32); // Mark block as DONE
                // Store ID of this thread in place of 5th argument, for DEBUG purposes
                // _._('mov', [o.rax, o.rsp.ref()]);
                // _._('mov', [r_block.disp(this.intsize * 6), o.rax]);
                _.insert(lbl_skip_to_next_block);
                _._('add', [r_block, _this.queueBlockSize]); // r_block += block_size
                _._('jmp', loop);
            })();
            _.insert(thread_stop);
            _._('mov', [r_block.disp(8), 0xBABE]);
            abi.syscall([60 /* exit */]);
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
asyscall.exec(39 /* getpid */, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39 /* getpid */, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39 /* getpid */, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39 /* getpid */, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39 /* getpid */, function (res, thread) {
    console.log('result pid:', res, thread);
});
asyscall.exec(39 /* getpid */, function (res, thread) {
    console.log('result pid:', res, thread);
});
var buf = new Buffer("Hello World\n");
var addr = libsys.addressBuffer64(buf);
asyscall.exec(1 /* write */, 1, addr, buf.length, function (res, thread) {
    console.log('write: ', res, thread);
});
asyscall.exec(1 /* write */, 1, addr, buf.length, function (res, thread) {
    console.log('write: ', res, thread);
});
asyscall.exec(1 /* write */, 1, addr, buf.length, function (res, thread) {
    console.log('write: ', res, thread);
});
console.log('id', asyscall.id);
setTimeout(function () {
    asyscall.stop();
    setTimeout(function () {
        asyscall.sbuf.print();
    }, 100);
}, 100);
