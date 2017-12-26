import Align from '../util/Align';

export class AlignX86 extends Align {

    static nop = [
        [0x90],                                                 // 1 byte : NOP = XCHG (E)AX, (E)AX
        [0x66, 0x90],                                           // 2 : 66 NOP
        [0x0F, 0x1F, 0x00],                                     // 3 : NOP DWORD ptr [EAX]
        [0x0F, 0x1F, 0x40, 0x00],                               // 4 : NOP DWORD ptr [EAX + 00H]
        [0x0F, 0x1F, 0x44, 0x00, 0x00],                         // 5 : NOP DWORD ptr [EAX + EAX*1 + 00H]
        [0x66, 0x0F, 0x1F, 0x44, 0x00, 0x00],                   // 6 : 66 NOP DWORD ptr [EAX + EAX*1 + 00H]
        [0x0F, 0x1F, 0x80, 0x00, 0x00, 0x00, 0x00],             // 7 : NOP DWORD ptr [EAX + 00000000H]
        [0x0F, 0x1F, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00],       // 8 : NOP DWORD ptr [EAX + EAX*1 + 00000000H]
        [0x66, 0x0F, 0x1F, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00], // 9 : 66 NOP DWORD ptr [EAX + EAX*1 + 00000000H]
    ];

    templates = AlignX86.nop;
}

export default AlignX86;
