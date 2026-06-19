import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Keypair, PublicKey } from "@solana/web3.js";

function loadLocalWalletPublicKey(): PublicKey {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey).publicKey;
}

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

function main(): void {
  const owner = loadLocalWalletPublicKey();
  const seeds = [Buffer.from("user-profile"), owner.toBuffer()];

  const [canonicalPda, canonicalBump] = PublicKey.findProgramAddressSync(
    seeds,
    MEMO_PROGRAM_ID,
  );
  console.log("Owner (your real wallet):", owner.toBase58());
  console.log("Canonical PDA: ", canonicalPda.toBase58());
  console.log(
    "Canonical bump:",
    canonicalBump,
    "(the highest bump that lands off-curve)",
  );

  // Prove a non-canonical bump can ALSO be valid, and produces a
  // DIFFERENT PDA — exactly why a program must only ever trust the
  // canonical bump, never one supplied by a client (Concept 5).
  console.log("\nSearching lower bumps for an alternate valid PDA...");
  let alternateFound = false;
  for (let bump = canonicalBump - 1; bump >= 0; bump--) {
    try {
      const alternatePda = PublicKey.createProgramAddressSync(
        [...seeds, Buffer.from([bump])],
        MEMO_PROGRAM_ID,
      );
      console.log(
        `  Bump ${bump} is ALSO valid (off-curve): ${alternatePda.toBase58()}`,
      );
      console.log(
        `  Different from the canonical PDA: ${!alternatePda.equals(canonicalPda)}`,
      );
      alternateFound = true;
      break;
    } catch {
      // This bump landed on-curve (or otherwise failed) — expected
      // for most values, keep searching downward.
      continue;
    }
  }
  if (!alternateFound) {
    console.log(
      "  (No alternate valid bump found below the canonical one in this run.)",
    );
  }
}

main();
