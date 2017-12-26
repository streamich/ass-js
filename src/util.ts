export const noop = () => {};
export const extend = require('fast-extend');

export class UInt64 {

    static hi(a: number, lo: number = UInt64.lo(a)): number {
        var hi = a - lo;
        hi /= 4294967296;
        return hi;
    }

    static lo(a: number): number {
        var lo = a | 0;
        if (lo < 0) lo += 4294967296;
        return lo;
    }

    static joinToNumber(hi: number, lo: number): number {
        // if ((lo !== lo|0) && (lo !== (lo|0) + 4294967296))  throw new Error ("lo out of range: "+lo);
        // if ((hi !== hi|0) && hi >= 1048576)                 throw new Error ("hi out of range: "+hi);

        if (lo < 0) lo += 4294967296;
        return hi * 4294967296 + lo;
    }

    static toNumber(num64: [number, number]): number {
        var [lo, hi] = num64;
        if (lo < 0) lo += 4294967296;
        return hi * 4294967296 + lo;
    }

    static toNumber64(num: number): [number, number] {
        var lo = num | 0;
        if (lo < 0) lo += 4294967296;

        var hi = num - lo;
        hi /= 4294967296;

        return [lo, hi];
    }
}
