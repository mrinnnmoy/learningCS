import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import idl from "./counter_anchor.json" assert { type: "json" };

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const walletKeypair = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(walletKeypair), {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), walletKeypair.publicKey.toBuffer()],
    program.programId,
  );

  // Single .fetch() — Week 15's baseline, one known PDA.
  const single = await program.account.counterAccount.fetch(counterPda);
  console.log("Single .fetch():", single.count.toString());

  // .all() — every counter that exists under this program, whoever
  // created it, not just the one address we already knew.
  const all = await program.account.counterAccount.all();
  console.log("\n.all() found", all.length, "counter account(s):");
  for (const entry of all) {
    console.log(
      `  ${entry.publicKey.toBase58()} -> count ${entry.account.count.toString()}`,
    );
  }

  // A PDA guaranteed to never have been initialized — a different
  // seed prefix under the same wallet and program, deterministic and
  // reproducible (Week 13), never touched by anything this course
  // has deployed.
  const [neverInitializedPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("unused-counter"), walletKeypair.publicKey.toBuffer()],
    program.programId,
  );

  // .fetchMultiple() — both addresses in ONE RPC round-trip. A miss
  // shows up as null in the same array position, not a thrown error.
  const batch = await program.account.counterAccount.fetchMultiple([
    counterPda,
    neverInitializedPda,
  ]);
  console.log("\n.fetchMultiple() results:");
  console.log(
    "  Real PDA:          ",
    batch[0] === null ? "null" : batch[0]!.count.toString(),
  );
  console.log(
    "  Never-initialized PDA:",
    batch[1] === null ? "null" : batch[1]!.count.toString(),
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
