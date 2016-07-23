import * as o from '../../x86/operand';
import {Code} from '../../x86/x64/code';
import {Abi} from '../../abi';
import * as t from '../../../typebase/typebase';
import {UInt64} from '../../util';
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

const __DEBUG__ = true;

const enum CONST {
    STDOUT          = 1,
}

const enum SYS {
    write           = 1,
    mmap            = 9,
    clone           = 56,
    exit            = 60,
    sched_yield     = 24,
    getuid          = 102,
    getpid          = 39,
}

const enum CLONE {
    VM              = 0x00000100,
    FS              = 0x00000200,
    FILES           = 0x00000400,
    SIGHAND         = 0x00000800,
    PARENT          = 0x00008000,
    THREAD          = 0x00010000,
    IO              = 0x80000000,
    THREAD_FLAGS = CLONE.VM | CLONE.FS | CLONE.FILES | CLONE.SIGHAND |
        CLONE.PARENT | CLONE.THREAD | CLONE.IO,
}

const enum LOCK {
    UNINITIALIZED   = 0,    // Block not used yet.
    FREE            = 1,    // Block ready to be acquired by a thread.
    LOCKED          = 2,    // Block locked by a thread, thread is executing syscall.
    DONE            = 3,    // Thread done executing syscall, result stored at offset 8.
    EXIT            = 4,    // Thread has to perform SYS_exit syscall.
}


const MAP_GROWSDOWN     = 0x0100;
const MAP_ANONYMOUS     = 0x0020;
const MAP_PRIVATE       = 0x0002;

const PROT_READ         = 0x1;
const PROT_WRITE        = 0x2;
const PROT_EXEC         = 0x4;


export class Asyscall {

    sbuf: any = null;

    threads: number     = 0;
    queue: number       = 100;
    intsize             = 8;
    stackSize           = 10 * this.intsize;
    stacksSize          = 0;
    queueBlockSize      = 8 * this.intsize; // control INT + syscall num + 6 args
    queueLength         = 0;
    queueSize           = 0;

    id: number = 0;             // ID of syscall incrementing every call.
    offset: number = 0;         // Offset of the next block to be written in
    offsetStart: number = 0;    // Offset of the first block
    offsetEnd: number = 0;      // Offset of the last block

    errorTimeout = UInt64.toNumber64(-1);

    nextId() {
        return (this.id + 1) % 0x7FFFFFFF;
    }

    nextOffset() {
        var offset = this.offset + this.queueBlockSize;
        if(offset > this.offsetEnd) return this.offsetStart;
        else return offset;
    }

    nextTick(callback) {
        setImmediate(callback, 1);
    }

    build(threads = 4, queue = 100) {
        this.threads = threads;
        this.stacksSize = this.threads * this.stackSize;
        this.queue = queue;
        this.queueSize = this.queue * this.queueBlockSize;

        this.compile();
        this.sbuf.call([]);
    }

    exec(num, arg1?, arg2?, arg3?, arg4?, arg5?, arg6?, callback?);
    exec() {
        var id = this.id = this.nextId();
        var offset = this.offset;
        var buf = this.sbuf;

        // Mark lock of next block as UNINITIALIZED so that threads stop at
        // that and wait until something is written there.
        buf.writeInt32LE(LOCK.UNINITIALIZED, this.nextOffset());

        // Block ID -- each block has a unique ID, in case queue is overfilled, blocks determine that
        // they time-out by their ID.
        buf.writeInt32LE(id, offset + 4);

        // Write arguments to block and find callback function.
        var offset_args = offset + 8;
        var callback;
        for(var j = 0; j < arguments.length; j++) {
            var arg = arguments[j];
            if(typeof arg === 'function') {
                callback = arg;
                break;
            } else {
                if(typeof arg === 'number') {
                    var [lo, hi] = UInt64.toNumber64(arg);
                    buf.writeInt32LE(lo, offset_args + (j * 8));
                    buf.writeInt32LE(hi, offset_args + (j * 8) + 4);
                } else if(arg instanceof Array) {
                    buf.writeInt32LE(arg[0], offset_args + (j * 8));
                    buf.writeInt32LE(arg[1], offset_args + (j * 8) + 4);
                } else if(typeof arg === 'string') {
                    // ...
                }
            }
        }

        // Fill the rest of the block with 0x00
        for(var j = arguments.length; j < 7; j++) {
            buf.writeInt32LE(0, offset_args + (j * 8));
            buf.writeInt32LE(0, offset_args + (j * 8) + 4);
        }

        // The last thing we do, is mark this block as available for threads.
        buf.writeInt32LE(LOCK.FREE, offset);

        this.offset = this.nextOffset();

        var poll = () => {
            // console.log('polling');
            this.nextTick(() => {

                // Check ID first, if ID does not match, then our queue has overflown
                // and we timeout this call.
                var id_read = buf.readInt32LE(offset + 4);
                if(id_read !== id) {
                    callback(this.errorTimeout);
                    return;
                }

                var lock = buf[offset];
                if(lock === LOCK.DONE) {
                    var result = [buf.readInt32LE(offset + (7 * 8)), buf.readInt32LE(offset + (7 * 8) + 4)];
                    // var thread_id = buf.readInt32LE(offset + (6 * 8));
                    // callback(result, thread_id);
                    callback(result);
                } else
                    poll();
            });
        };
        poll();
    }

    stop() {
        for(var offset = this.offsetStart; offset <= this.offsetEnd; offset += this.queueBlockSize) {
            this.sbuf.writeInt32LE(LOCK.EXIT, offset);
            this.id = this.nextId();
            this.sbuf.writeInt32LE(this.id, offset + 4);
        }
        // this.sbuf.free();
    }

    compile(): number[] {
        var _ = new Code;
        var abi = new Abi(_);

        var func_create_thread      = abi.func('func_create_thread', false, [o.rax, o.rsi, o.rcx, o.rdx]);
        var func_thread             = abi.func('func_thread');
        var lbl_stacks              = _.lbl('stacks');
        var lbl_queue               = _.lbl('queue');

        // main()
        for(var j = 1; j <= this.threads; j++) {
            abi.call(func_create_thread, [j], []);
        }
        _._('ret');

        func_create_thread._(() => {
            _._('mov', [o.rax, o.rdi]);                                         // Thread index, starting from 1
            _._('mov', [o.rcx, this.stackSize]);                                // Stack size
            _._('mul', o.rcx);                                                  // Stack offset

            _._('lea', [o.rsi, o.rip.disp(lbl_stacks.rel(-this.intsize * 2))]); // Address of stack frame bottom + 1
            _._('add', [o.rsi, o.rax]);                                         // Address of stack top for this thread, RSI second arg to syscall

            _._('lea', [o.rdx, o.rip.disp(func_thread.lbl)]);                   // Address of thread function code in top of stack
            _._('mov', [o.rsi.ref(), o.rdx]);                                   // Top of stack, RET address

            _._('mov', [o.rsi.disp(this.intsize), o.rdi]);                      // Thread ID in bottom of stack

            // long clone(unsigned long flags, void *child_stack);
            abi.syscall([SYS.clone, CLONE.THREAD_FLAGS]); // 2nd arg RSI, stack top address
            // When thread starts the address of its starting function is
            // stored on its stack, the next instruction here is `RET` so it
            // jumps to that address.
        });

        func_thread._(() => {
            var r_block = o.r13;            // Current block address
            var r_first_block = o.r14;
            var r_last_block = o.r15;

            var thread_stop = _.lbl('thread_stop');

            _._('lea', [r_first_block, o.rip.disp(lbl_queue)]);                 // R14 = Queue start address
            _._('mov', [r_last_block, r_first_block]);
            _._('add', [r_last_block, this.queueSize - this.queueBlockSize]);   // R15 = Last block address
            _._('mov', [r_block, r_first_block]);                               // R13 = Current block address

            var loop = _.label('loop');                                         // loop start
            (() => {
                var lbl_process_block = _.lbl('process_block');
                var lbl_execute_block = _.lbl('execute_block');
                var lbl_skip_to_next_block = _.lbl('skip_to_next_block');

                _._('cmp', [r_block, r_last_block]);                        // check iterator bounds
                _._('jbe', lbl_process_block);
                _._('mov', [r_block, r_first_block]);

                _.insert(lbl_process_block);
                _._('mov', [o.eax, r_block.ref()]);                         // Lock in RAX

                _._('cmp', [o.eax, LOCK.EXIT]);                             // if(lock == LOCK.EXIT) -> stop thread
                _._('je', thread_stop);

                _._('cmp', [o.eax, LOCK.UNINITIALIZED]);                    // Wait for this block until something is written to it
                _._('jne', lbl_execute_block);
                abi.syscall([SYS.sched_yield]);                             // yield and ...
                _._('jmp', lbl_process_block);                              // ... try this block again

                _.insert(lbl_execute_block);
                _._('cmp', [o.eax, LOCK.FREE]);                             // Check block is possibly available
                _._('jne', lbl_skip_to_next_block);

                _._('mov', [o.edx, LOCK.LOCKED]);
                _._('cmpxchg', [r_block.ref(), o.edx]).lock();              // Try to acquire lock for this block
                _._('cmp', [r_block.ref(), LOCK.LOCKED], 32);               // Check we actually got the lock
                _._('jne', lbl_skip_to_next_block);

                abi.syscall([                                               // Execute the syscall
                    r_block.disp(this.intsize),
                    r_block.disp(this.intsize * 2),
                    r_block.disp(this.intsize * 3),
                    r_block.disp(this.intsize * 4),
                    r_block.disp(this.intsize * 5),
                    r_block.disp(this.intsize * 6),
                    r_block.disp(this.intsize * 7),
                ]);
                _._('mov', [r_block.disp(this.intsize * 7), o.rax]);        // Store syscall result in memory, in place of 6th argument
                _._('mov', [r_block.ref(), LOCK.DONE], 32);                 // Mark block as DONE

                // Store ID of this thread in place of 5th argument, for DEBUG purposes
                // _._('mov', [o.rax, o.rsp.ref()]);
                // _._('mov', [r_block.disp(this.intsize * 6), o.rax]);

                _.insert(lbl_skip_to_next_block);
                _._('add', [r_block, this.queueBlockSize]);                 // r_block += block_size
                _._('jmp', loop);
            })();

            _.insert(thread_stop);
            _._('mov', [r_block.disp(8), 0xBABE]);
            abi.syscall([SYS.exit]);
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
    }
}


var asyscall = new Asyscall;
asyscall.build(4, 10);
console.log(asyscall.errorTimeout);
asyscall.exec(SYS.getpid, function(res, thread) {
    console.log('result pid:', res, thread);
});

asyscall.exec(SYS.getpid, function(res, thread) {
    console.log('result pid:', res, thread);
});

asyscall.exec(SYS.getpid, function(res, thread) {
    console.log('result pid:', res, thread);
});

asyscall.exec(SYS.getpid, function(res, thread) {
    console.log('result pid:', res, thread);
});

asyscall.exec(SYS.getpid, function(res, thread) {
    console.log('result pid:', res, thread);
});

asyscall.exec(SYS.getpid, function(res, thread) {
    console.log('result pid:', res, thread);
});

var buf = new Buffer("Hello World\n");
var addr = libsys.addressBuffer64(buf);
asyscall.exec(SYS.write, 1, addr, buf.length, function(res, thread) {
    console.log('write: ', res, thread);
});
asyscall.exec(SYS.write, 1, addr, buf.length, function(res, thread) {
    console.log('write: ', res, thread);
});
asyscall.exec(SYS.write, 1, addr, buf.length, function(res, thread) {
    console.log('write: ', res, thread);
});

console.log('id', asyscall.id);

setTimeout(() => {
    asyscall.stop();
    setTimeout(() => {
        asyscall.sbuf.print();
    }, 100);
}, 100);

