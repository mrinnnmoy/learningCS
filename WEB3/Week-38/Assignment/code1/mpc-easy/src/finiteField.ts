export function mod(a: bigint, m: bigint): bigint {
  return ((a % m) + m) % m;
}

export function modInverse(a: bigint, m: bigint): bigint {
  let [oldR, r] = [mod(a, m), m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return mod(oldS, m);
}

export function randomBigInt(max: bigint): bigint {
  const { randomBytes } = require("crypto");
  const byteLength = (max.toString(2).length + 7) >> 3;
  let value: bigint;
  do {
    value = BigInt("0x" + randomBytes(byteLength).toString("hex"));
  } while (value >= max);
  return value;
}

export const M127 = 2n ** 127n - 1n; // a real, well-known Mersenne prime — Easy's own small-secret field
