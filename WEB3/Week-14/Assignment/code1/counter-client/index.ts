import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Paste the Program Id printed by `solana program deploy` (How to
// Build, Step 5) here.
const PROGRAM_ID = new PublicKey("GDtX89xvjSbaV5PY38zT3xXDTvEbL8hEUuuKyVZpckGp");

const COUNTER_SEED = Buffer.from("counter");

async function sendInstruction(
  payer: Keypair,
  counterPda: PublicKey,
  discriminant: number,
): Promise<string> {
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: counterPda, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([discriminant]),
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: payer.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(ix);
  const signature = await connection.sendTransaction(tx, [payer]);
  await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  });
  return signature;
}

async function main(): Promise<void> {
  const payer = loadLocalWallet();
  const [counterPda] = PublicKey.findProgramAddressSync(
    [COUNTER_SEED, payer.publicKey.toBuffer()],
    PROGRAM_ID,
  );
  console.log("Payer:", payer.publicKey.toBase58());
  console.log("Counter PDA:", counterPda.toBase58());

  const existing = await connection.getAccountInfo(counterPda);
  if (existing === null) {
    const initSig = await sendInstruction(payer, counterPda, 0); // 0 = Initialize
    console.log("\nInitialized. Signature:", initSig);
  } else {
    console.log("\nCounter already initialized, skipping Initialize.");
  }

  const afterInit = await connection.getAccountInfo(counterPda);
  if (!afterInit)
    throw new Error("Counter account not found after initialize.");
  console.log("Count:", afterInit.data.readBigUInt64LE(0).toString());

  const incSig = await sendInstruction(payer, counterPda, 1); // 1 = Increment
  console.log("\nIncremented. Signature:", incSig);

  const afterIncrement = await connection.getAccountInfo(counterPda);
  if (!afterIncrement)
    throw new Error("Counter account not found after increment.");
  console.log("Count:", afterIncrement.data.readBigUInt64LE(0).toString());
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
