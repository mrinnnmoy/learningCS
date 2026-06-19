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

const DEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

type SeedInput = string | Buffer | PublicKey;

function toSeedBuffer(seed: SeedInput): Buffer {
  if (typeof seed === "string") return Buffer.from(seed);
  if (seed instanceof PublicKey) return seed.toBuffer();
  return seed;
}

function derivePda(
  seeds: SeedInput[],
  programId: PublicKey,
): [PublicKey, number] {
  const seedBuffers = seeds.map(toSeedBuffer);
  return PublicKey.findProgramAddressSync(seedBuffers, programId);
}

function main(): void {
  const owner = loadLocalWalletPublicKey();
  console.log("Owner (your real wallet):", owner.toBase58());

  // Three different logical account TYPES, same owner, same
  // programId — distinguished purely by a differentiating prefix
  // seed (Concept 8).
  const [vaultPda, vaultBump] = derivePda(["vault", owner], DEMO_PROGRAM_ID);
  const [profilePda, profileBump] = derivePda(
    ["user-profile", owner],
    DEMO_PROGRAM_ID,
  );
  const [counterPda, counterBump] = derivePda(
    ["counter", owner],
    DEMO_PROGRAM_ID,
  );

  console.log("\nVault PDA:        ", vaultPda.toBase58(), " bump:", vaultBump);
  console.log(
    "User-profile PDA: ",
    profilePda.toBase58(),
    " bump:",
    profileBump,
  );
  console.log(
    "Counter PDA:      ",
    counterPda.toBase58(),
    " bump:",
    counterBump,
  );

  const allDifferent =
    !vaultPda.equals(profilePda) &&
    !vaultPda.equals(counterPda) &&
    !profilePda.equals(counterPda);
  console.log("\nAll three PDAs are pairwise distinct:", allDifferent);

  // Deliberately violate the 32-byte-per-seed limit (Concept 8).
  console.log("\nTesting the 32-byte-per-seed limit with a 33-byte seed...");
  try {
    const tooLongSeed = Buffer.alloc(33, 1);
    derivePda([tooLongSeed], DEMO_PROGRAM_ID);
    console.log("  Unexpectedly succeeded — this should not happen.");
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log("  Correctly rejected:", reason);
  }
}

main();
