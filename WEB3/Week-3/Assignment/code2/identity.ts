import {
  generateKeyPairSync,
  sign,
  verify,
  createPrivateKey,
  createPublicKey,
} from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_DIR = join(__dirname, "keys");

export interface StoredIdentity {
  name: string;
  publicKeyPem: string;
  privateKeyPem: string;
}

export function createIdentity(name: string): StoredIdentity {
  if (!existsSync(KEYS_DIR)) {
    mkdirSync(KEYS_DIR, { recursive: true });
  }
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const identity: StoredIdentity = {
    name,
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKeyPem: privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString(),
  };
  writeFileSync(
    join(KEYS_DIR, `${name}.json`),
    JSON.stringify(identity, null, 2),
    "utf-8",
  );
  return identity;
}

export function loadIdentity(name: string): StoredIdentity {
  const filePath = join(KEYS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    throw new Error(
      `No identity found for "${name}". Run "identity create ${name}" first.`,
    );
  }
  return JSON.parse(readFileSync(filePath, "utf-8")) as StoredIdentity;
}

export function signWithIdentity(
  identity: StoredIdentity,
  message: string,
): string {
  const privateKey = createPrivateKey(identity.privateKeyPem);
  return sign(null, Buffer.from(message, "utf-8"), privateKey).toString("hex");
}

export function verifyWithPublicKeyPem(
  publicKeyPem: string,
  message: string,
  signatureHex: string,
): boolean {
  const publicKey = createPublicKey(publicKeyPem);
  return verify(
    null,
    Buffer.from(message, "utf-8"),
    publicKey,
    Buffer.from(signatureHex, "hex"),
  );
}
