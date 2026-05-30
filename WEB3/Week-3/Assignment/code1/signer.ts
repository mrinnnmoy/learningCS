import { generateKeyPairSync, sign, verify, type KeyObject } from "node:crypto";

interface Keypair {
  publicKey: KeyObject;
  privateKey: KeyObject;
  publicKeyPem: string;
  privateKeyPem: string;
}

function generateKeypair(): Keypair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey
    .export({ type: "spki", format: "pem" })
    .toString();
  const privateKeyPem = privateKey
    .export({ type: "pkcs8", format: "pem" })
    .toString();
  return { publicKey, privateKey, publicKeyPem, privateKeyPem };
}

function signMessage(message: string, privateKey: KeyObject): Buffer {
  return sign(null, Buffer.from(message, "utf-8"), privateKey);
}

function verifySignature(
  message: string,
  signature: Buffer,
  publicKey: KeyObject,
): boolean {
  return verify(null, Buffer.from(message, "utf-8"), publicKey, signature);
}

function main(): void {
  console.log("Generating an Ed25519 keypair...\n");
  const alice = generateKeypair();

  console.log("Alice's public key (safe to share with anyone):");
  console.log(alice.publicKeyPem);

  console.log(
    "Alice's private key (never share this in real use — printed here only so you can see its shape):",
  );
  console.log(alice.privateKeyPem);

  const message = "Alice approves payment of 5 coins to Bob";
  console.log(`Message to sign: "${message}"\n`);

  const signature = signMessage(message, alice.privateKey);
  console.log(`Signature (hex): ${signature.toString("hex")}\n`);

  const validCheck = verifySignature(message, signature, alice.publicKey);
  console.log(
    `Verify with Alice's real public key and the original message: ${validCheck}`,
  );

  const mallory = generateKeypair();
  const wrongKeyCheck = verifySignature(message, signature, mallory.publicKey);
  console.log(
    `Verify the same signature with a DIFFERENT public key (Mallory's): ${wrongKeyCheck}`,
  );

  const tamperedMessage = "Alice approves payment of 5000 coins to Bob";
  const tamperedCheck = verifySignature(
    tamperedMessage,
    signature,
    alice.publicKey,
  );
  console.log(
    `Verify Alice's real public key against a TAMPERED message: ${tamperedCheck}`,
  );
}

main();
