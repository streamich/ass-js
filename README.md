# Assembler.js

`x86` assembler in JavaScript.

Store 25 in `RAX` register:

```js
import {rax} from 'ass-js/lib/x86/operand';
import {Code} from 'ass-js/lib/x86/x64/code';

const code = Code.create();
code._('mov', [rax, 25]);
```

Compile to machine code:

```js
const bin = code.compile();
console.log(bin); // [ 72, 199, 192, 25, 0, 0, 0 ]
```

Show text representation:

```js
console.log(String(code));
```

See supported instructions:

```js
code.table.createAll();
console.log(code.table.toString());
console.log(code.table.toJson());
```

# Examples

### Hello World

In this example we will write "Hello World!" to console using `ass.js`. We will
start with a basic example where we first hard-code all the values and gradually
progress to a complete solution where we just input the variablees and all the offsets are calculated automatically.

First we `require` things we are going to use:
 
```js
import {rax, rdx, rsi, rdi, rip} from 'ass-js/x86/operand'; // x86 registers that we will use.
import {Code} from 'ass-js/x86/x64/code'; // Code object that will `.compile()` our code.
```

We will also need [`StaticBuffer`](http://www.npmjs.com/package/static-buffer) to actually execute our machine code:

```js
var StaticBuffer = require('static-buffer/buffer').StaticBuffer;
```

Now we create our `Code` object, we name it `_`, which will hold all our assembler instructions and then compile them.

```js
var _ = new Code('hello_world_app');
```

Finally we can create our *"Hello World"* app in `x86` assembler for *Linux*:

```js
_.db('Hello World!\n');
_._('mov', [rax, 1]);
_._('mov', [rdi, 1]);
_._('lea', [rsi, rip.disp(-34)]);
_._('mov', [rdx, 13]);
_._('syscall');
_._('ret');
```

Let's look at it line-by-line:

 - `_.db('Hello World!\n');` -- simply adds `"Hello World!\n"` string to our code.
 - `_._('mov', [rax, 1]);` -- stores `1` in `rax` register, which will tell Linux kernel to execute syscall No. 1, which is
 `write` syscall, that writes some data to some file descriptor.
 - `_._('mov', [rdi, 1]);` -- stores `1` in `rdi` register, which represents a file descriptor to which Linux kernel will
 write the data, `1` stands for `STDOUT` which will be the console in our case.
 - `_._('lea', [rsi, rip.disp(-34)]);` -- this expression stores the address of the beginning of our `"Hello World!\n"` string
 into the `rsi` register, here we use *"RIP-relative addressing"*, where we basically say that our string actually started
 `34` bytes before the end of this instruction.
 - `_._('mov', [rdx, 13]);` -- stores `13` in `rdx` register which tells the kernel the length of our string we want to print.
 - `_._('syscall');` -- this command tells the Linux kernel to execute our system call with the arguments we just provided.
 - `_._('ret');` -- this command is required by `StaticBuffer` that we will use to execute this code, it will basically stop
 executing any further machine instructions and `return` to `JavaScript`.
 
To view your program you can print it using `console.log(_.toString());` it will output something like this:

    000 hello_world_app:
    001     db 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x0A; 000000|000000 13 bytes
    002     movq    rax, 0x00000001                 ; 00000D|00000D 0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00
    003     movq    rdi, 0x00000001                 ; 000014|000014 0x48, 0xC7, 0xC7, 0x01, 0x00, 0x00, 0x00
    004     leaq    rsi, [rip + 0xFFFFFFDE]         ; 00001B|00001B 0x48, 0x8D, 0x35, 0xDE, 0xFF, 0xFF, 0xFF
    005     movq    rdx, 0x0000000D                 ; 000022|000022 0x48, 0xC7, 0xC2, 0x0D, 0x00, 0x00, 0x00
    006     syscall                                 ; 000029|000029 0x0F, 0x05
    007     ret                                     ; 00002B|00002B 0xC3

You can compile your program using `_.compile()`, it will output an array of machine code of your program.

So, let's run our code using `StaticBuffer` now:

```js
var bin = _.compile();
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

var str = 'Hello World!\n';
_.db(str);
_._('mov', [rax, SYS_write]);
_._('mov', [rdi, STDOUT]);
_._('lea', [rsi, rip.disp(-34)]);
_._('mov', [rdx, 13]);
_._('syscall');
_._('ret');
```

We still have location of our string `rip.disp(-34)` and its length `13` hard-coded, let's fix that as well. The latter one is
easy, we just replace it by `str.length`. The former one is a bit more tricky, because we know that our string starts 34 bytes before
`_.lea(rsi, rip.disp(-34))` instruction only after we have actually compiled our machine code,
but before the code is compiled there is no way to know what is the exact offset.

Luckily every command you run on code object `_` returns an `Expression`, and you can provide that `Expression` to displacement
`.disp` method which will calculate the correct offset itself during compilation, here is how we do it:

```js
var str = 'Hello World!\n';
var db = _.db(str);
_._('mov', [rax, SYS_write]);
_._('mov', [rdi, STDOUT]);
_._('lea', [rsi, rip.disp(db)]);
_._('mov', [rdx, str.length]);
_._('syscall');
_._('ret');
```

Now if your would print the code as string `console.log(_.toString())`, you would get something like this:

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
var str = 'Hello World!\n';
var str_lbl = _.label('my_string');
_.db(str);

_._('mov', [rax, SYS_write]);
_._('mov', [rdi, STDOUT]);
_._('lea', [rsi, rip.disp(str_lbl)]);
_._('mov', [rdx, str.length]);
_._('syscall');
_._('ret');
```

Above `_.label('my_string')` creates *and inserts* label expression with name `my_string` just before our string, now if we print
our code to console we get a better looking output:

    005     leaq    rsi, [rip + <my_string = -34>]  ; 00001B|00001B 0x48, 0x8D, 0x35, 0xDE, 0xFF, 0xFF, 0xFF
    
Finally, last thing we want to do is to have our actual code first and put the `Hello World!` string after the code. This gives us a new 
problem: we need to provide an expression to `rip.disp()` but we will create it only at the end of the code. What we can do is use `_.lbl`
method, which creates a label *but does not insert it* into our code, however we can use that label and `_.insert` it manually ourselves later,
here is what you do:

```js
var str = 'Hello World!\n';
var str_lbl = _.lbl('my_string');

_._('mov', [rax, SYS_write]);
_._('mov', [rdi, STDOUT]);
_._('lea', [rsi, rip.disp(str_lbl)]);
_._('mov', [rdx, str.length]);
_._('syscall');
_._('ret');

_.insert(str_lbl);
_.db(str);


var bin = _.compile();
StaticBuffer.from(bin, 'rwe').call([]);
```

Now note that we call our code without an offset `.call([])`, because now our code starts from the start of the buffer and `Hello World!`
string moved to the end.

    000 hello_world_app:
    001     movq    rax, 0x00000001                 ; 000000|000000 0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00
    002     movq    rdi, 0x00000001                 ; 000007|000007 0x48, 0xC7, 0xC7, 0x01, 0x00, 0x00, 0x00
    003     leaq    rsi, [rip + <my_string = 10>]   ; 00000E|00000E 0x48, 0x8D, 0x35, 0x0A, 0x00, 0x00, 0x00
    004     movq    rdx, 0x0000000D                 ; 000015|000015 0x48, 0xC7, 0xC2, 0x0D, 0x00, 0x00, 0x00
    005     syscall                                 ; 00001C|00001C 0x0F, 0x05
    006     ret                                     ; 00001E|00001E 0xC3
    007 my_string:
    008     db 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, 0x0A; 00001F|00001F 13 bytes
