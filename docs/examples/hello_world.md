# Hello World

In this example we will write "Hello World!" to console using *Assembler.js*. We will
start with a basic example where we first hard-code all the values and gradually
progress to a complete solution where we just input the variablees and all the
offsets are calculated automatically.

First we `require` the X64 assembler generator:

```js
import {X64} from 'ass-js';
```

We will also need [`StaticBuffer`](http://www.npmjs.com/package/static-buffer)
to actually execute our machine code, stright from JavaScript, first install it:

```shell
npm i static-buffer
```

Import `StaticBuffer` like so:

```js
import {StaticBuffer} from 'static-buffer/buffer';
```

Now we create our `asm` object, which will hold all our assembler instructions and then compile them.

```js
const asm = X64({main: 'hello_world_app'});
```

Finally we can create our *"Hello World"* app in X64 assembly for *Linux*:

```js
asm._('db', 'Hello World!\n');
asm._('mov', ['rax', 1]);
asm._('mov', ['rdi', 1]);
asm._('lea', ['rsi', asm._('rip').disp(-34)]);
asm._('mov', ['rdx', 13]);
asm._('syscall');
asm._('ret');
```

On Mac, you would have to write this:

```js
asm._('db', 'Hello World!\n');
asm._('mov', ['rax', 0x2000004]);
asm._('mov', ['rdi', 1]);
asm._('lea', ['rsi', asm._('rip').disp(-34)]);
asm._('mov', ['rdx', 13]);
asm._('syscall');
asm._('ret');
```

Let's look at it line-by-line:

 - `asm._('db', 'Hello World!\n');` -- simply adds `"Hello World!\n"` string to our code.
 - `asm._('mov', ['rax', 1]);` -- stores `1` in `rax` register, which will tell Linux kernel to execute syscall No. 1, which is
 `write` syscall, that writes some data to some file descriptor.
 - `asm._('mov', ['rdi', 1]);` -- stores `1` in `rdi` register, which represents a file descriptor to which Linux kernel will
 write the data, `1` stands for `STDOUT` which will be the console in our case.
 - `asm._('lea', ['rsi', asm._('rip').disp(-34)]);` -- this expression stores the address of the beginning of our `"Hello World!\n"` string
 into the `rsi` register, here we use *"RIP-relative addressing"*, where we basically say that our string actually started
 `34` bytes before the end of this instruction.
 - `asm._('mov', ['rdx', 13]);` -- stores `13` in `rdx` register which tells the kernel the length of our string we want to print.
 - `asm._('syscall');` -- this command tells the Linux kernel to execute our system call with the arguments we just provided.
 - `asm._('ret');` -- this command is required by `StaticBuffer` that we will use to execute this code, it will basically stop
 executing any further machine instructions and `return` to `JavaScript`.

To view your program in human-friendly way, you can print it using `console.log(asm.toString());`
it will output something like this:

    000 hello_world_app:
    001     db 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x0A; 000000|000000 13 bytes
    002     movq    rax, 0x00000001                 ; 00000D|00000D 0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00
    003     movq    rdi, 0x00000001                 ; 000014|000014 0x48, 0xC7, 0xC7, 0x01, 0x00, 0x00, 0x00
    004     leaq    rsi, [rip + 0xFFFFFFDE]         ; 00001B|00001B 0x48, 0x8D, 0x35, 0xDE, 0xFF, 0xFF, 0xFF
    005     movq    rdx, 0x0000000D                 ; 000022|000022 0x48, 0xC7, 0xC2, 0x0D, 0x00, 0x00, 0x00
    006     syscall                                 ; 000029|000029 0x0F, 0x05
    007     ret                                     ; 00002B|00002B 0xC3

You can compile your program using `asm.compile()`, it will output an array of machine code of your program.

So, let's run our code using `StaticBuffer` now:

```js
const bin = asm.compile();
StaticBuffer.from(bin, 'rwe').call([], 13);
```

This should output `Hello World!` to your console (if you are running on x86_64 Linux). The `StaticBuffer.from(bin, 'rwe')`
allocates a `StaticBuffer` in memory which is just like `Buffer` but for which you can specify protection, in this case
we provided `rwe`, which stands for **r**eadable, **w**ritable and **e**xecutable memory. `.call([], 13)` simply calls our
code with empty arguments list `[]` at offset `13`, because first 13 bytes is our `Hello World!\n` string.

However, at this point our code is very static as we hard-coded all the numbers manually, let's fix this. First thing we
can do is put the basic things in `JavaScript` variables:

```js
const SYS_write = 1;
const STDOUT = 1;
const str = 'Hello World!\n';

asm._('db', str);
asm._('mov', ['rax', SYS_write]);
asm._('mov', ['rdi', STDOUT]);
asm._('lea', ['rsi', asm._('rip').disp(-34)]);
asm._('mov', ['rdx', 13]);
asm._('syscall');
asm._('ret');
```

We still have location of our string `rip.disp(-34)` and its length `13` hard-coded, let's fix that as well. The latter one is
easy, we just replace `13` by `str.length`. The former one is a bit more tricky, because we know that our string starts 34 bytes before
`asm._('lea', ['rsi', asm._('rip').disp(-34)])` instruction only after we have actually compiled our machine code,
but before the code is compiled there is no way to know what is the exact offset.

Luckily every command you run on assembly object `asm` returns an `Expression`, and you can provide that `Expression` to displacement
`.disp` method which will calculate the correct offset itself during compilation, here is how we do it:

```js
const db = asm._('db', str);

asm._('mov', ['rax', SYS_write]);
asm._('mov', ['rdi', STDOUT]);
asm._('lea', ['rsi', asm._('rip').disp(db)]);
asm._('mov', ['rdx', str.length]);
asm._('syscall');
asm._('ret');
```

Now if your would print the code as string `console.log(asm.toString())`, you would get something like this:

    000 hello_world_app:
    001     db 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x0A; 000000|000000 13 bytes
    002     movq    rax, 0x00000001                 ; 00000D|00000D 0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00
    003     movq    rdi, 0x00000001                 ; 000014|000014 0x48, 0xC7, 0xC7, 0x01, 0x00, 0x00, 0x00
    004     leaq    rsi, [rip + <hello_world_app+[1] = -34>]; 00001B|00001B 0x48, 0x8D, 0x35, 0xDE, 0xFF, 0xFF, 0xFF
    005     movq    rdx, 0x0000000D                 ; 000022|000022 0x48, 0xC7, 0xC2, 0x0D, 0x00, 0x00, 0x00
    006     syscall                                 ; 000029|000029 0x0F, 0x05
    007     ret                                     ; 00002B|00002B 0xC3

Let's compare the line `004` with our previous print out:

    004     leaq    rsi, [rip + 0xFFFFFFDE]         ; 00001B|00001B 0x48, 0x8D, 0x35, 0xDE, 0xFF, 0xFF, 0xFF
    004     leaq    rsi, [rip + <hello_world_app+[1] = -34>]; 00001B|00001B 0x48, 0x8D, 0x35, 0xDE, 0xFF, 0xFF, 0xFF

As your can see, first time we hard-coded `-34` (0xFFFFFFDE), however now we provided the `db` expression to our displacement
and it calculated the `-34` value itself `<hello_world_app+[1] = -34>`, here `hello_word_app+[1]` means expression number `001`.

Now to generate a prettier output (than `hello_word_app+[1]`), we can create a label expression ourselves and name it however we want:

```js
const str_lbl = asm.label('my_string');
asm._('db', str);

asm._('mov', ['rax', SYS_write]);
asm._('mov', ['rdi', STDOUT]);
asm._('lea', ['rsi', asm._('rip').disp(str_lbl)]);
asm._('mov', ['rdx', str.length]);
asm._('syscall');
asm._('ret');
```

Above `asm.label('my_string')` creates *and inserts* a label expression with the name `my_string` just before our string, now if we print
our code to console we get a better looking output:

    005     leaq    rsi, [rip + <my_string = -34>]  ; 00001B|00001B 0x48, 0x8D, 0x35, 0xDE, 0xFF, 0xFF, 0xFF

Finally, last thing we want to do is to have our actual code first and put the `Hello World!` string after the code. This gives us a new
problem: we need to provide an expression to `rip.disp()` but we will create it only at the end of the code. What we can do is use `asm.lbl()`
method, which creates a label *but does not insert it* into our code, we will later insert it ourselves using `asm.insert` method.

```js
const str_lbl = asm.lbl('my_string');

asm._('mov', ['rax', SYS_write]);
asm._('mov', ['rdi', STDOUT]);
asm._('lea', ['rsi', asm._('rip').disp(str_lbl)]);
asm._('mov', ['rdx', str.length]);
asm._('syscall');
asm._('ret');

asm.insert(str_lbl);
asm._('db', str);

var bin = asm.compile();
StaticBuffer.from(bin, 'rwe').call([], 0);
```

Now note that we call our code without an offset `.call([], 0)`, because now our code starts from the start of the buffer and `Hello World!`
string moved to the end:

    000 hello_world_app:
    001     movq    rax, 0x00000001                 ; 000000|000000 0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00
    002     movq    rdi, 0x00000001                 ; 000007|000007 0x48, 0xC7, 0xC7, 0x01, 0x00, 0x00, 0x00
    003     leaq    rsi, [rip + <my_string = 10>]   ; 00000E|00000E 0x48, 0x8D, 0x35, 0x0A, 0x00, 0x00, 0x00
    004     movq    rdx, 0x0000000D                 ; 000015|000015 0x48, 0xC7, 0xC2, 0x0D, 0x00, 0x00, 0x00
    005     syscall                                 ; 00001C|00001C 0x0F, 0x05
    006     ret                                     ; 00001E|00001E 0xC3
    007 my_string:
    008     db 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x0A; 00001F|00001F 13 bytes
