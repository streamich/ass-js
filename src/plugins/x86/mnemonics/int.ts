import {immu8} from '../atoms';

// INT Software interrupt
export default [{},
    // CC INT 3 NP Valid Valid Interrupt 3—trap to debugger.
    {o: 0xCC, ops: [3]},
    // CD ib INT imm8 I Valid Valid Interrupt vector specified by immediate byte.
    {o: 0xCD, ops: [immu8]},
];
