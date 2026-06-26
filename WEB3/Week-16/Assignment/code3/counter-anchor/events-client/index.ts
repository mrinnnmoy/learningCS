import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
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

  // --- Event listening (Concept 6). Subscribed BEFORE sending
  // anything — events only fire for transactions confirmed after the
  // subscription is active. The callback is typed `any` deliberately
  // here: addEventListener's exact callback shape has shifted across
  // recent Anchor versions, verify yours against your installed
  // @coral-xyz/anchor's own .d.ts before tightening this.
  let eventReceived = false;
  const listenerId = await program.addEventListener(
    "counterIncremented",
    (event: any) => {
      eventReceived = true;
      console.log(
        "\n[event] CounterIncremented:",
        event.counter.toBase58(),
        "-> new_count",
        event.newCount.toString(),
      );
    },
  );

  // --- Combined transaction (Concept 7): a plain, non-Anchor
  // ComputeBudgetProgram instruction alongside an Anchor-generated
  // one, in the same transaction.
  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1000,
  });
  const incrementIx = await program.methods
    .increment()
    .accounts({ counter: counterPda, payer: walletKeypair.publicKey })
    .instruction();

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: walletKeypair.publicKey,
    blockhash,
    lastValidBlockHeight,
  })
    .add(priorityFeeIx)
    .add(incrementIx);

  const sig = await connection.sendTransaction(tx, [walletKeypair]);
  await connection.confirmTransaction({
    signature: sig,
    blockhash,
    lastValidBlockHeight,
  });
  console.log("Increment (with priority fee) confirmed:", sig);

  // Give the WebSocket subscription a moment to deliver the event
  // before checking it and cleaning up.
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("\nEvent received before cleanup:", eventReceived);
  await program.removeEventListener(listenerId);

  // --- Error decoding (Concept 8): deliberately re-initialize an
  // ALREADY-initialized counter.
  try {
    await program.methods
      .initialize()
      .accounts({ counter: counterPda, payer: walletKeypair.publicKey })
      .rpc();
    console.log("\nUnexpectedly succeeded — this should not happen.");
  } catch (err: unknown) {
    if (err instanceof anchor.AnchorError) {
      console.log("\nCaught an AnchorError:");
      console.log("  Code:", err.error.errorCode.code);
      console.log("  Message:", err.error.errorMessage);
    } else {
      const reason = err instanceof Error ? err.message : String(err);
      console.log(
        "\nCaught a non-Anchor error (expected here — re-creating an existing",
      );
      console.log(
        "account fails at the System Program/CPI level, not as a custom Anchor error):",
      );
      console.log("  Message:", reason);
    }
  }
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
