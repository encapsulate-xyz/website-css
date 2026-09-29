CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
def polymod(values):
    gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]; chk = 1
    for v in values:
        b = chk >> 25; chk = (chk & 0x1ffffff) << 5 ^ v
        for i in range(5): chk ^= gen[i] if ((b >> i) & 1) else 0
    return chk
def hrp_expand(hrp): return [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 31 for x in hrp]
def decode(addr):
    pos = addr.rfind("1"); hrp, data = addr[:pos], [CHARSET.find(c) for c in addr[pos + 1:]]
    assert polymod(hrp_expand(hrp) + data) == 1, "bad checksum"
    return hrp, data[:-6]
def encode(hrp, data):
    values = hrp_expand(hrp) + data
    pm = polymod(values + [0] * 6) ^ 1
    return hrp + "1" + "".join(CHARSET[d] for d in data + [(pm >> 5 * (5 - i)) & 31 for i in range(6)])
def reprefix(addr, hrp): return encode(hrp, decode(addr)[1])
