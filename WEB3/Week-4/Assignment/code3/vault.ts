import { randomBytes, sign, verify } from "node:crypto";
import { keypairFromSeed, publicKeyToHex, deriveChildSeed } from "./keys.js";
import {
  saveEncryptedSeed,
  loadEncryptedSeed,
  vaultExists,
} from "./vault-storage.js";
import { bytesToPhrase } from "./wordlist.js";

function printUsage(): void {
  console.log(`
Usage:
  node vault.js create <password>                    Create a new encrypted vault (prints a one-time backup phrase)
  node vault.js accounts <password> <count>           Derive and list <count> accounts from the vault
  node vault.js sign <password> <index> "<message>"   Sign a message using account <index>, derived on demand
`);
}

function main(): void {
  const [command, password, ...rest] = process.argv.slice(2);

  if (command === "create" && password) {
    if (vaultExists()) {
      console.log(
        "A vault already exists. Delete vault.json first if you want to start over.",
      );
      return;
    }
    const masterSeed = randomBytes(32);
    saveEncryptedSeed(masterSeed, password);

    console.log("Vault created and encrypted on disk.\n");
    console.log(
      "ONE-TIME BACKUP PHRASE — write this down, it will not be shown again:\n",
    );
    console.log(bytesToPhrase(masterSeed));
    console.log(
      "\nThe raw master seed is never stored on disk in plaintext — only this",
    );
    console.log("encrypted vault file, protected by your password.");
    return;
  }

  if (command === "accounts" && password && rest[0]) {
    const count = Number(rest[0]);
    try {
      const masterSeed = loadEncryptedSeed(password);
      console.log(`Deriving ${count} account(s) from the vault:\n`);
      for (let i = 0; i < count; i++) {
        const childSeed = deriveChildSeed(masterSeed, i);
        const { publicKey } = keypairFromSeed(childSeed);
        console.log(`Account #${i}: ${publicKeyToHex(publicKey)}`);
      }
    } catch (err) {
      console.error(`Failed to open vault: ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  if (command === "sign" && password && rest[0] && rest[1]) {
    const accountIndex = Number(rest[0]);
    const message = rest.slice(1).join(" ");
    try {
      const masterSeed = loadEncryptedSeed(password);
      const childSeed = deriveChildSeed(masterSeed, accountIndex);
      const { privateKey, publicKey } = keypairFromSeed(childSeed);

      const signature = sign(null, Buffer.from(message, "utf-8"), privateKey);
      const valid = verify(
        null,
        Buffer.from(message, "utf-8"),
        publicKey,
        signature,
      );

      console.log(
        `Signed with Account #${accountIndex} (${publicKeyToHex(publicKey)}):`,
      );
      console.log(`  message:   "${message}"`);
      console.log(`  signature: ${signature.toString("hex")}`);
      console.log(`  verified:  ${valid}`);
    } catch (err) {
      console.error(`Failed to sign: ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  printUsage();
  process.exit(command ? 1 : 0);
}

main();
