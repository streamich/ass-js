// https://github.com/zack-bitcoin/ethereum-assembly
//
//     ```
// 3 3 mul
//
//     60 03           PUSH1 3
//     60 03           PUSH1 3
//     02              MUL
//
// foo jump
//
//     60 0f           PUSH1 0x0F ($15)
//     56              JUMP
//
//
// 27 0 0 log1 \this code wont be run. we jumped over it.
//
//     60 1b           PUSH1 0x1B ($27)
//     60 00           PUSH1 0
//     60 00           PUSH1 0
//     a1              LOG 1
//     5b              JUMPDEST
//
//     61 01 a5        PUSH2 0x01A5 ($421)
//     60 00           PUSH1 0
//     60 00           PUSH1 0
//
// jumpdest foo
//
// 420 0 0 log1 \this code runs 9 times (from 3 and 3 we multiplied above)
//
//     a1              LOG 1
//
// 1 swap1 sub    \run 9 times
//
//     60 01           PUSH1 0x01
//     90              SWAP1
//     03              SUB
//
// dup iszero iszero foo jumpi \this jumps us back to foo
//
//     80              DUP1
//     15              ISZERO
//     15              ISZERO
//     60 0f           PUSH1 0x0F ($15)
//     57              JUMPI
//
// 06 0 0 log1
//
//     60 06           PUSH1 0x06
//     60 00           PUSH1 0x00
//     60 00           PUSH1 0x00
//     a1              LOG1
//
// ```

import {Ethereum} from "../../src/index";

const asm = Ethereum();

asm.code(_ => {
    _('PUSH', 3);
    _('MUL', 3);

    _('PUSH', 0xF);
    _('JUMP');

    _('PUSH', 27);
    _('PUSH', 0);
    _('PUSH', 0);
    _('LOG1');
    _('JUMPDEST');

    _('PUSH2', 1, 0xA5);
    _('PUSH', 0);
    _('PUSH1', 0);

    _('LOG1');

    _('PUSH', 1);
    _('SWAP1');
    _('SUB');

    _('DUP1');
    _('ISZERO');
    _('ISZERO');
    _('PUSH', 15);
    _('JUMPI');

    _('PUSH', 6);
    _('PUSH', 0);
    _('PUSH', 0);
    _('LOG1');
});

console.log(String(asm));

const code = (asm.compile() as Buffer).toString('hex');

console.log(code);

const VM = require('ethereumjs-vm');
const vm = new VM();

vm.on('step', function (data) {
    console.log(data.opcode.name)
});

vm.runCode({
    code: Buffer.from(code, 'hex'),
    gasLimit: Buffer.from('ffffffff', 'hex')
}, function(err, results){
    console.log('returned: ' + results.return.toString('hex'));
});
