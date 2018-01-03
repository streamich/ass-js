import formatOctet from "./formatOctet";

function formatOctets (octets: number[] | Buffer | Uint8Array, maxLength = 200) {
    if (octets.length < maxLength) {
        const out = [];

        for (let i = 0; i < octets.length; i++)
            out.push(formatOctet(octets[i]));

        return out.join(', ');
    } else
        return `[${this.bytes()} bytes]`;
}

export default formatOctets;
