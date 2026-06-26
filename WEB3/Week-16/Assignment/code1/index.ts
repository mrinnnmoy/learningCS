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

async function fetchCount(counterPda: PublicKey): Promise<string> {
  const state = await program.account.counterAccount.fetch(counterPda);
  return state.count.toString();
}

async function main(): Promise<void> {
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), walletKeypair.publicKey.toBuffer()],
    program.programId,
  );
  console.log("Counter PDA:", counterPda.toBase58());
  console.log("Starting count:", await fetchCount(counterPda));

  // Way 1: .rpc() — sign, send, confirm, all in one call.
  const rpcSig = await program.methods
    .increment()
    .accounts({ counter: counterPda, payer: walletKeypair.publicKey })
    .rpc();
  console.log("\n[.rpc()] Signature:", rpcSig);
  console.log("[.rpc()] Count now:", await fetchCount(counterPda));

  // Way 2: .transaction() — unsigned Transaction, signed/sent/confirmed
  // manually (Week 10's confirmation pattern).
  const tx = await program.methods
    .increment()
    .accounts({ counter: counterPda, payer: walletKeypair.publicKey })
    .transaction();
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  tx.feePayer = walletKeypair.publicKey;
  tx.recentBlockhash = blockhash;
  const txSig = await connection.sendTransaction(tx, [walletKeypair]);
  await connection.confirmTransaction({
    signature: txSig,
    blockhash,
    lastValidBlockHeight,
  });
  console.log("\n[.transaction()] Signature:", txSig);
  console.log("[.transaction()] Count now:", await fetchCount(counterPda));

  // Way 3: .instruction() — raw TransactionInstruction, composed into
  // our OWN Transaction from scratch, exactly Week 14's raw shape.
  const ix = await program.methods
    .increment()
    .accounts({ counter: counterPda, payer: walletKeypair.publicKey })
    .instruction();
  const { blockhash: ixBlockhash, lastValidBlockHeight: ixLastValid } =
    await connection.getLatestBlockhash();
  const manualTx = new Transaction({
    feePayer: walletKeypair.publicKey,
    blockhash: ixBlockhash,
    lastValidBlockHeight: ixLastValid,
  }).add(ix);
  const ixSig = await connection.sendTransaction(manualTx, [walletKeypair]);
  await connection.confirmTransaction({
    signature: ixSig,
    blockhash: ixBlockhash,
    lastValidBlockHeight: ixLastValid,
  });
  console.log("\n[.instruction()] Signature:", ixSig);
  console.log("[.instruction()] Count now:", await fetchCount(counterPda));
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
