import {
  createPrivateKey,
  createPublicKey,
  createHmac,
  type KeyObject,
} from "node:crypto";

const ED25519_PKCS8_PREFIX = Buffer.from(
  "302e020100300506032b657004220420",
  "hex",
);
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export function keypairFromSeed(seed: Buffer): {
  privateKey: KeyObject;
  publicKey: KeyObject;
} {
  if (seed.length !== 32) {
    throw new Error(
      `Ed25519 seeds must be exactly 32 bytes, got ${seed.length}.`,
    );
  }
  const der = Buffer.concat([ED25519_PKCS8_PREFIX, seed]);
  const privateKey = createPrivateKey({
    key: der,
    format: "der",
    type: "pkcs8",
  });
  const publicKey = createPublicKey(privateKey);
  return { privateKey, publicKey };
}

export function publicKeyToHex(publicKey: KeyObject): string {
  const der = publicKey.export({ format: "der", type: "spki" });
  return der.subarray(ED25519_SPKI_PREFIX.length).toString("hex");
}

export function deriveChildSeed(
  masterSeed: Buffer,
  accountIndex: number,
): Buffer {
  return createHmac("sha256", masterSeed)
    .update(`account:${accountIndex}`)
    .digest();
}
