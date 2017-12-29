import {IVexDefinition} from "./parts/PrefixVex";

// 256.66.0F3A.W0 => {L: 1, pp: 1, mmmmm: 1, W: 0}
function parseVexString(vstr: string): IVexDefinition {
    const vdef: IVexDefinition = {
        vvvv:   '',
        L:      0b0,
        pp:     0b00,
        mmmmm:  0b00001,    // 00000B is reserved, will #UD
        W:      0b1,        // Inverted, 1 means 2-byte VEX, or ignored.
        WIG:    false,
    };

    // vvvv: NDS, NDD, DDS
    if(vstr.indexOf('NDS') > -1)        vdef.vvvv = 'NDS';
    else if(vstr.indexOf('NDD') > -1)   vdef.vvvv = 'NDD';
    else if(vstr.indexOf('DDS') > -1)   vdef.vvvv = 'DDS';

    // L: 128, 256, LIG, LZ
    if(vstr.indexOf('256') > -1)        vdef.L = 0b1;
    else if(vstr.indexOf('512') > -1)   vdef.L = 0b10; // EVEX

    // pp: 66, F2, F3
    if(vstr.indexOf('.66.') > -1)       vdef.pp = 0b01;
    else if(vstr.indexOf('.F2.') > -1)  vdef.pp = 0b11;
    else if(vstr.indexOf('.F3.') > -1)  vdef.pp = 0b10;

    // mmmmm: 0F, 0F3A, 0F38
    if(vstr.indexOf('0F38') > -1)       vdef.mmmmm = 0b00010;
    else if(vstr.indexOf('0F3A') > -1)  vdef.mmmmm = 0b00011;
    else if(vstr.indexOf('0F') > -1)    vdef.mmmmm = 0b00001; // Could still be 2-byte VEX prefix

    // W: W0, W1
    if(vstr.indexOf('W0') > -1)         vdef.W = 0b0;

    // WIG
    if(vstr.indexOf('WIG') > -1)        vdef.WIG = true;

    return vdef;
}

export default parseVexString;
