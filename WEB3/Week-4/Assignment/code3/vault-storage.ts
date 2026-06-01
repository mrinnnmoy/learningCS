import {
  randomBytes,
  scryptSync,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_FILE = join(__dirname, "vault.json");

interface EncryptedVault {
  salt: string;
  iv: string;
  ciphertext: string;
  authTag: string;
}

function deriveEncryptionKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, 32);
}

export function vaultExists(): boolean {
  return existsSync(VAULT_FILE);
}

export function saveEncryptedSeed(seed: Buffer, password: string): void {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveEncryptionKey(password, salt);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(seed), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const record: EncryptedVault = {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    authTag: authTag.toString("hex"),
  };
  writeFileSync(VAULT_FILE, JSON.stringify(record, null, 2), "utf-8");
}

export function loadEncryptedSeed(password: string): Buffer {
  if (!vaultExists()) {
    throw new Error(`No vault found. Run "create <password>" first.`);
  }
  const record = JSON.parse(
    readFileSync(VAULT_FILE, "utf-8"),
  ) as EncryptedVault;

  const salt = Buffer.from(record.salt, "hex");
  const iv = Buffer.from(record.iv, "hex");
  const ciphertext = Buffer.from(record.ciphertext, "hex");
  const authTag = Buffer.from(record.authTag, "hex");
  const key = deriveEncryptionKey(password, salt);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
