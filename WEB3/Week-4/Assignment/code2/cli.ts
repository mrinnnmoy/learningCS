import {
  createKeystore,
  unlockKeystore,
  loadPublicKeyPem,
  signMessage,
  verifyMessage,
} from "./keystore.js";

function printUsage(): void {
  console.log(`
Usage:
  node cli.js create <name> <password>   Generate and encrypt a new keystore
  node cli.js unlock <name> <password>   Decrypt, sign a demo message, and verify it
`);
}

function main(): void {
  const [command, name, password] = process.argv.slice(2);

  if (command === "create" && name && password) {
    const publicKeyPem = createKeystore(name, password);
    console.log(`Created encrypted keystore "${name}".`);
    console.log("Public key (safe to share):");
    console.log(publicKeyPem);
    return;
  }

  if (command === "unlock" && name && password) {
    try {
      const privateKey = unlockKeystore(name, password);
      const publicKeyPem = loadPublicKeyPem(name);

      const message = "Unlock test message";
      const signature = signMessage(message, privateKey);
      const valid = verifyMessage(message, signature, publicKeyPem);

      console.log(`Keystore "${name}" unlocked successfully.`);
      console.log(`Signed and verified a demo message: ${valid}`);
    } catch (err) {
      console.error(`Failed to unlock "${name}": ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  printUsage();
  process.exit(command ? 1 : 0);
}

main();
