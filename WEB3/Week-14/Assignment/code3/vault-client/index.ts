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
// Build, Step 4) here.
const PROGRAM_ID = new PublicKey("7ctYkBSot9txEVoMiPedXrE8S7SCUkCLGe8CQWS8RT75");

const VAULT_SEED = Buffer.from("vault");

// Borsh enum layout: [variant index: 1 byte][u64 field: 8 bytes, LE]
function encodeInstruction(variant: 0 | 1, amount: bigint): Buffer {
  const buffer = Buffer.alloc(9);
  buffer.writeUInt8(variant, 0);
  buffer.writeBigUInt64LE(amount, 1);
  return buffer;
}

async function sendVaultInstruction(
  payer: Keypair,
  vaultPda: PublicKey,
  data: Buffer,
): Promise<string> {
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
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
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [VAULT_SEED, payer.publicKey.toBuffer()],
    PROGRAM_ID,
  );
  console.log("Depositor:", payer.publicKey.toBase58());
  console.log("Vault PDA:", vaultPda.toBase58());

  const depositAmount = 2_000_000n; // 0.002 SOL
  const depositSig = await sendVaultInstruction(
    payer,
    vaultPda,
    encodeInstruction(0, depositAmount),
  );
  console.log("\nDeposited. Signature:", depositSig);
  console.log(
    "Vault balance:",
    await connection.getBalance(vaultPda),
    "lamports",
  );

  const withdrawAmount = 1_000_000n; // withdraw half back
  const withdrawSig = await sendVaultInstruction(
    payer,
    vaultPda,
    encodeInstruction(1, withdrawAmount),
  );
  console.log("\nWithdrew. Signature:", withdrawSig);
  console.log(
    "Vault balance:",
    await connection.getBalance(vaultPda),
    "lamports",
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
