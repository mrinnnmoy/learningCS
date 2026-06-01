import {
  generateKeyPairSync,
  randomBytes,
  scryptSync,
  createCipheriv,
  createDecipheriv,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
  type KeyObject,
} from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYSTORE_DIR = join(__dirname, "keystores");

interface EncryptedKeystore {
  name: string;
  publicKeyPem: string;
  salt: string;
  iv: string;
  ciphertext: string;
  authTag: string;
}

function deriveEncryptionKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, 32);
}

export function createKeystore(name: string, password: string): string {
  if (!existsSync(KEYSTORE_DIR)) {
    mkdirSync(KEYSTORE_DIR, { recursive: true });
  }

  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const privateKeyDer = privateKey.export({ format: "der", type: "pkcs8" });

  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveEncryptionKey(password, salt);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(privateKeyDer),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const record: EncryptedKeystore = {
    name,
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    authTag: authTag.toString("hex"),
  };

  writeFileSync(
    join(KEYSTORE_DIR, `${name}.json`),
    JSON.stringify(record, null, 2),
    "utf-8",
  );
  return record.publicKeyPem;
}

export function unlockKeystore(name: string, password: string): KeyObject {
  const filePath = join(KEYSTORE_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    throw new Error(
      `No keystore found for "${name}". Run "create ${name} <password>" first.`,
    );
  }
  const record = JSON.parse(
    readFileSync(filePath, "utf-8"),
  ) as EncryptedKeystore;

  const salt = Buffer.from(record.salt, "hex");
  const iv = Buffer.from(record.iv, "hex");
  const ciphertext = Buffer.from(record.ciphertext, "hex");
  const authTag = Buffer.from(record.authTag, "hex");
  const key = deriveEncryptionKey(password, salt);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const privateKeyDer = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return createPrivateKey({ key: privateKeyDer, format: "der", type: "pkcs8" });
}

export function loadPublicKeyPem(name: string): string {
  const filePath = join(KEYSTORE_DIR, `${name}.json`);
  const record = JSON.parse(
    readFileSync(filePath, "utf-8"),
  ) as EncryptedKeystore;
  return record.publicKeyPem;
}

export function signMessage(message: string, privateKey: KeyObject): Buffer {
  return sign(null, Buffer.from(message, "utf-8"), privateKey);
}

export function verifyMessage(
  message: string,
  signature: Buffer,
  publicKeyPem: string,
): boolean {
  const publicKey = createPublicKey(publicKeyPem);
  return verify(null, Buffer.from(message, "utf-8"), publicKey, signature);
}
