import {
  Connection,
  clusterApiUrl,
  Keypair,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { readFileSync } from "fs";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function main(): Promise<void> {
  // Load Solana CLI wallet
  const secretKey = Uint8Array.from(
    JSON.parse(
      readFileSync(`${process.env.HOME}/.config/solana/id.json`, "utf8"),
    ),
  );

  const payer = Keypair.fromSecretKey(secretKey);
  const receiver = Keypair.generate();

  // Check balance
  let payerBalance = await connection.getBalance(payer.publicKey);

  if (payerBalance < LAMPORTS_PER_SOL / 10) {
    console.log("Requesting devnet airdrop for payer...");

    try {
      const airdropSig = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL,
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        signature: airdropSig,
        blockhash,
        lastValidBlockHeight,
      });

      payerBalance = await connection.getBalance(payer.publicKey);
    } catch (err) {
      throw new Error(
        "Unable to obtain a Devnet airdrop. Please fund your CLI wallet manually and try again.",
      );
    }
  } else {
    console.log("Payer already has sufficient balance. Skipping airdrop.");
  }

  console.log("Payer funded with:", payerBalance / LAMPORTS_PER_SOL, "SOL");

  // Create transfer instruction
  const transferIx = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: receiver.publicKey,
    lamports: 1000,
  });

  // Fresh blockhash
  const { blockhash } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions: [transferIx],
  }).compileToV0Message();

  // Base fee
  const fee = await connection.getFeeForMessage(message);

  console.log(
    "\nBase fee for a one-signature transfer:",
    fee.value,
    "lamports",
  );

  // Rent exemption
  const rentEmptyAccount =
    await connection.getMinimumBalanceForRentExemption(0);

  const rentTokenSizedAccount =
    await connection.getMinimumBalanceForRentExemption(165);

  console.log(
    "\nRent-exempt minimum, 0-byte account:  ",
    rentEmptyAccount,
    "lamports",
  );

  console.log(
    "Rent-exempt minimum, 165-byte account:",
    rentTokenSizedAccount,
    "lamports (SPL token account size — Week 17)",
  );

  // Simulate transaction
  const tx = new VersionedTransaction(message);
  tx.sign([payer]);

  const simulation = await connection.simulateTransaction(tx, {
    sigVerify: false,
    replaceRecentBlockhash: true,
  });

  // Ignore rent-related simulation errors.
  // We only need the compute units consumed.
  console.log(
    "\nCompute units consumed by this transfer:",
    simulation.value.unitsConsumed,
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
