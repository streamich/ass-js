import {X64} from "../src/index";

const asm = X64();

// asm._('db', 123);
// asm._('db', 1, 4);
// asm._('db', [1, 2, 3]);
// asm._('db', [1, 2, 3], 2);
// asm._('db', 'foo');
// asm._('db', 'foo', 'utf8');
// asm._('db', 'foo', 2);
// asm._('db', Buffer.from([1, 2, 3]), 2);

// asm._('dw', 1, true);
// asm._('dw', 1, false);
// asm._('dw', [1, 2, 3], false);

// asm._('dd', 1, true);
// asm._('dd', 1, false);
// asm._('dd', [1, 2, 3], true);
// asm._('dd', [1, 2, 3], false););

// asm._('dq', 1, true);
// asm._('dq', 1, false);
// asm._('dq', [[1, 1]]);
// asm._('dq', [[0xff, 0xffffffff], [0xee, 0xeeeeeeee]]);
// asm._('dq', [1, 2, 3], true);
// asm._('dq', [1, 2, 3], false);


// asm._('resb', 10);
// asm._('resw', 10);
// asm._('resd', 10);
// asm._('resq', 10);
// asm._('rest', 10);


// asm._('incbin', __filename, 3, 6);
// asm._('incbin', __filename, 100);
// asm._('incbin', __filename);

console.log(asm.toString());
