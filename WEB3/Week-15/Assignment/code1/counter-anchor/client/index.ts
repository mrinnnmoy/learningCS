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

// idl.address (from target/idl/counter_anchor.json) is the deployed
// program's own on-chain ID — no separate PROGRAM_ID constant needed,
// unlike Week 14's client, this is exactly what Concept 5 means by
// "the IDL replaces manual bookkeeping."
const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), walletKeypair.publicKey.toBuffer()],
    program.programId,
  );
  console.log("Payer:", walletKeypair.publicKey.toBase58());
  console.log("Counter PDA:", counterPda.toBase58());

  const existing = await connection.getAccountInfo(counterPda);
  if (existing === null) {
    const initSig = await program.methods
      .initialize()
      .accounts({ counter: counterPda, payer: walletKeypair.publicKey })
      .rpc();
    console.log("\nInitialized. Signature:", initSig);
  } else {
    console.log("\nCounter already initialized, skipping Initialize.");
  }

  let state = await program.account.counterAccount.fetch(counterPda);
  console.log("Count:", state.count.toString());

  const incSig = await program.methods
    .increment()
    .accounts({ counter: counterPda, payer: walletKeypair.publicKey })
    .rpc();
  console.log("\nIncremented. Signature:", incSig);

  state = await program.account.counterAccount.fetch(counterPda);
  console.log("Count:", state.count.toString());
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
