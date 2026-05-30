import { generateKeyPairSync, type KeyObject } from "node:crypto";
import { createSignedBlock, isLedgerValid, type Block } from "./ledger.js";

interface Validator {
  name: string;
  publicKeyPem: string;
  privateKey: KeyObject;
}

function createValidator(name: string): Validator {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    name,
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKey,
  };
}

function main(): void {
  const validator1 = createValidator("validator-1");
  const validator2 = createValidator("validator-2");
  const outsider = createValidator("outsider");

  const registry = new Set<string>([
    validator1.publicKeyPem,
    validator2.publicKeyPem,
  ]);

  const chain: Block[] = [];
  chain.push(
    createSignedBlock(
      null,
      "Genesis Block",
      validator1.privateKey,
      validator1.publicKeyPem,
    ),
  );
  chain.push(
    createSignedBlock(
      chain[0],
      "Alice pays Bob 5 coins",
      validator2.privateKey,
      validator2.publicKeyPem,
    ),
  );
  chain.push(
    createSignedBlock(
      chain[1],
      "Bob pays Carol 2 coins",
      validator1.privateKey,
      validator1.publicKeyPem,
    ),
  );

  console.log(
    "Built a 3-block ledger, signed alternately by validator-1 and validator-2.\n",
  );
  const initialCheck = isLedgerValid(chain, registry);
  console.log(`Ledger valid? ${initialCheck.valid}\n`);

  console.log("Attempt 1 — tamper with Block #1's data without re-signing:");
  const tampered = chain.map((block) => ({ ...block }));
  tampered[1].data = "Alice pays Bob 5000 coins";
  const tamperedCheck = isLedgerValid(tampered, registry);
  console.log(`  Valid? ${tamperedCheck.valid} — ${tamperedCheck.reason}\n`);

  console.log(
    "Attempt 2 — a new block, validly signed, but by a key outside the registry:",
  );
  const outsiderChain = chain.map((block) => ({ ...block }));
  outsiderChain.push(
    createSignedBlock(
      outsiderChain[outsiderChain.length - 1],
      "Outsider adds a block",
      outsider.privateKey,
      outsider.publicKeyPem,
    ),
  );
  const outsiderCheck = isLedgerValid(outsiderChain, registry);
  console.log(`  Valid? ${outsiderCheck.valid} — ${outsiderCheck.reason}\n`);

  console.log(
    "Attempt 3 — copy a real, valid signature from one block onto a different block:",
  );
  const replayed = chain.map((block) => ({ ...block }));
  replayed[2].signature = replayed[0].signature;
  const replayCheck = isLedgerValid(replayed, registry);
  console.log(`  Valid? ${replayCheck.valid} — ${replayCheck.reason}`);
}

main();
