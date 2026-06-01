import {
  randomBytes,
  createPrivateKey,
  createPublicKey,
  type KeyObject,
} from "node:crypto";
import { bytesToPhrase, phraseToBytes } from "./wordlist.js";

const ED25519_PKCS8_PREFIX = Buffer.from(
  "302e020100300506032b657004220420",
  "hex",
);

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function keypairFromSeed(seed: Buffer): {
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

function publicKeyToHex(publicKey: KeyObject): string {
  const der = publicKey.export({ format: "der", type: "spki" });
  return der.subarray(ED25519_SPKI_PREFIX.length).toString("hex");
}

function main(): void {
  console.log("Generating 32 bytes of fresh randomness...\n");
  const seed = randomBytes(32);

  const phrase = bytesToPhrase(seed);
  console.log(
    "Your recovery phrase (32 words — write this down, never share it):\n",
  );
  console.log(phrase);
  console.log("");

  const { publicKey } = keypairFromSeed(seed);
  const publicKeyHex = publicKeyToHex(publicKey);
  console.log(`Public key derived from this phrase: ${publicKeyHex}\n`);

  console.log("Simulating recovery: turning the phrase back into bytes...\n");
  const recoveredSeed = phraseToBytes(phrase);
  console.log(
    `Recovered seed matches original seed? ${recoveredSeed.equals(seed)}`,
  );

  const { publicKey: recoveredPublicKey } = keypairFromSeed(recoveredSeed);
  const recoveredPublicKeyHex = publicKeyToHex(recoveredPublicKey);
  console.log(
    `Public key derived from the recovered phrase: ${recoveredPublicKeyHex}`,
  );
  console.log(
    `Matches the original public key? ${recoveredPublicKeyHex === publicKeyHex}`,
  );
}

main();
