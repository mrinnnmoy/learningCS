import { mod, modInverse, randomBigInt } from "./finiteField";

export interface Share {
  x: bigint;
  y: bigint;
}

export function splitSecret(
  secret: bigint,
  threshold: number,
  totalShares: number,
  prime: bigint,
): Share[] {
  const coefficients: bigint[] = [secret];
  for (let i = 1; i < threshold; i++) {
    coefficients.push(randomBigInt(prime));
  }

  const shares: Share[] = [];
  for (let x = 1n; x <= BigInt(totalShares); x++) {
    let y = 0n;
    for (let i = coefficients.length - 1; i >= 0; i--) {
      y = mod(y * x + coefficients[i], prime);
    }
    shares.push({ x, y });
  }
  return shares;
}

export function reconstructSecret(shares: Share[], prime: bigint): bigint {
  let secret = 0n;
  for (let i = 0; i < shares.length; i++) {
    let numerator = 1n;
    let denominator = 1n;
    for (let j = 0; j < shares.length; j++) {
      if (i === j) continue;
      numerator = mod(numerator * (0n - shares[j].x), prime);
      denominator = mod(denominator * (shares[i].x - shares[j].x), prime);
    }
    const lagrangeCoefficient = mod(
      numerator * modInverse(denominator, prime),
      prime,
    );
    secret = mod(secret + shares[i].y * lagrangeCoefficient, prime);
  }
  return secret;
}
