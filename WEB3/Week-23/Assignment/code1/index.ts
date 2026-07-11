import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { encodeURL } from "@solana/pay";
import QRCode from "qrcode";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");

  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf8")),
  );

  return Keypair.fromSecretKey(secretKey);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const wallet = loadLocalWallet();

  const amountSol = 0.001;

  const amountLamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const reference = Keypair.generate().publicKey;

  const label = "Week 23 Solana Pay Demo";

  const message = "Order #4471";

  //----------------------------------------------------
  // Build Solana Pay URL
  //----------------------------------------------------

  const url = encodeURL({
    recipient: wallet.publicKey,
    amount: amountSol,
    reference,
    label,
    message,
  });

  console.log("Solana Pay URL:");
  console.log(url.toString());

  await QRCode.toFile("payment-qr.png", url.toString());

  console.log("QR code saved to payment-qr.png");

  //----------------------------------------------------
  // Build payment transaction
  //----------------------------------------------------

  const ix = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: wallet.publicKey,
    lamports: amountLamports,
  });

  // Required Solana Pay reference account
  ix.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  });

  const tx = new Transaction().add(ix);

  const signature = await sendAndConfirmTransaction(connection, tx, [wallet]);

  console.log("\nPayment sent.");
  console.log("Signature:", signature);

  //----------------------------------------------------
  // Merchant side
  //----------------------------------------------------

  console.log("\nSearching by reference public key...");

  let foundSignature: string | null = null;

  for (let i = 0; i < 15; i++) {
    const signatures = await connection.getSignaturesForAddress(
      reference,
      {
        limit: 1,
      },
      "confirmed",
    );

    if (signatures.length > 0) {
      foundSignature = signatures[0].signature;
      break;
    }

    await sleep(1000);
  }

  if (!foundSignature) {
    throw new Error("Unable to locate transaction using reference key.");
  }

  console.log("Found transaction:", foundSignature);

  //----------------------------------------------------
  // Fetch transaction
  //----------------------------------------------------

  const txInfo = await connection.getParsedTransaction(foundSignature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (!txInfo) {
    throw new Error("Transaction not available.");
  }

  //----------------------------------------------------
  // Validate recipient + amount
  //----------------------------------------------------

  let validated = false;

  for (const instruction of txInfo.transaction.message.instructions) {
    if (instruction.program === "system" && "parsed" in instruction) {
      const parsed = instruction.parsed as any;

      if (parsed.type !== "transfer") {
        continue;
      }

      const info = parsed.info;

      if (
        info.destination === wallet.publicKey.toBase58() &&
        Number(info.lamports) === amountLamports
      ) {
        validated = true;
        break;
      }
    }
  }

  if (!validated) {
    throw new Error("Validation failed: recipient or amount mismatch.");
  }

  console.log("\nValidated payment amount: confirmed");

  console.log(
    "Confirmed: amount and recipient both match the original request.",
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);

  console.error("\nRequest failed:", reason);

  process.exit(1);
});
