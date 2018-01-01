# `cpuid`

In this example we will create a JavaScript function that calls X64 `cpuid`
method with different arguments and returns results.

First write our X64 assembly that calls `cpuid` instruction with given arguments:

```js
const tpl = _ => {
    // Save rbx, rcx, and rdx registers on stack.
    _('push', 'rbx');
    _('push', 'rcx');
    _('push', 'rdx');

    // Use first two arguments (eax and ecx) to our function as
    // parameters to CPUID call.
    _('mov', ['eax', 'edi']);
    _('mov', ['ecx', 'esi']);

    // Execute CPUID call.
    _('cpuid');

    const resultEax = _.lbl('result_eax');
    const resultEbx = _.lbl('result_ebx');
    const resultEdx = _.lbl('result_edx');
    const resultEcx = _.lbl('result_ecx');

    // Store results in memory.
    _('mov', [rip.disp(resultEax), 'eax']);
    _('mov', [rip.disp(resultEbx), 'ebx']);
    _('mov', [rip.disp(resultEdx), 'edx']);
    _('mov', [rip.disp(resultEcx), 'ecx']);

    // Restore registers we saved on the stack.
    _('pop', 'rdx');
    _('pop', 'rcx');
    _('pop', 'rbx');

    // Return
    _('ret');

    _('align', 4);

    _.insert(resultEax);
    _('dd', 0);
    _.insert(resultEbx);
    _('dd', 0);
    _.insert(resultEdx);
    _('dd', 0);
    _.insert(resultEcx);
    _('dd', 0);
};
```

Above in assembly we have written a *"function"* that receives two arguments
and uses those to call `cpuid` instruction. After the call it stores the
results in a space allocated right after the return `ret` instruction of the function.

Now compile our code:

```js
const asm = X64();
asm.code(tpl);

const bin = asm.compile([]);
```

And create a JavaScript wrapper function that receives two arguments and
executes the `cpuid` instruction:

```js
function cpuid (eax, ecx) {
    const sb = StaticBuffer.from(bin, 'rwe');

    sb.call([eax, ecx]);

    return [
        sb.readInt32LE(sb.length - 16),
        sb.readInt32LE(sb.length - 12),
        sb.readInt32LE(sb.length - 8),
        sb.readInt32LE(sb.length - 4),
    ];
}
```
