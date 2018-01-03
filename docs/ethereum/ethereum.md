# Ethereum

Getting started

```js
import {Ethereum} from 'ass-js';

const asm = Ethereum();
```

Add commands

```js
asm.code(_ => {
    _('ADD');
    _('JUMPI'):
});
```

Push to stack

```js
_('PUSH1', 0xFF);
_('PUSH2', [1, 2]);

_('PUSH', 1, 2, 3);
```
