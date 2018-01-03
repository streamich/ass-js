function formatOctet(octet): string {
    const neg = octet < 0 ? '-' : '';

    octet = Math.abs(octet);

    return octet <= 0xF ? neg + '0x0' + octet.toString(16).toUpperCase() : neg + '0x' + octet.toString(16).toUpperCase();
}

export default formatOctet;
