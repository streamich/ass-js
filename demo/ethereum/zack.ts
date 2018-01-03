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

