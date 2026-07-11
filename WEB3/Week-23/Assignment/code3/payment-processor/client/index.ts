import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

import * as anchor from "@anchor-lang/core";
import BN from "bn.js";
import { AnchorProvider, Program, Wallet } from "@anchor-lang/core";

import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  createInitializeAccountInstruction,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptAccount,
  ACCOUNT_SIZE,
} from "@solana/spl-token";

import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import idl from "./payment_processor.json" with { type: "json" };

const MINT_RECORD_PATH = join(import.meta.dirname, "mint-address.json");

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const wallet = loadLocalWallet();

// Same wallet = customer + merchant + relayer.
const provider = new AnchorProvider(connection, new Wallet(wallet), {
  commitment: "confirmed",
});

anchor.setProvider(provider);

const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  //------------------------------------------------------------------
  // Reuse a mint if it already exists.
  //------------------------------------------------------------------

  let mint: PublicKey;

  if (existsSync(MINT_RECORD_PATH)) {
    const record = JSON.parse(readFileSync(MINT_RECORD_PATH, "utf8"));
    mint = new PublicKey(record.mint);

    console.log("Reusing existing mint:", mint.toBase58());
  } else {
    mint = await createMint(connection, wallet, wallet.publicKey, null, 6);

    writeFileSync(
      MINT_RECORD_PATH,
      JSON.stringify(
        {
          mint: mint.toBase58(),
        },
        null,
        2,
      ),
    );

    console.log("Mint created:", mint.toBase58());
  }

  const customerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey,
  );

  //------------------------------------------------------------------
  // Merchant token account
  //------------------------------------------------------------------

  const merchantToken = Keypair.generate();

  const lamports = await getMinimumBalanceForRentExemptAccount(connection);

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: merchantToken.publicKey,
      space: ACCOUNT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeAccountInstruction(
      merchantToken.publicKey,
      mint,
      wallet.publicKey,
      TOKEN_PROGRAM_ID,
    ),
  );

  await sendAndConfirmTransaction(connection, tx, [wallet, merchantToken]);

  const merchantTokenAccount = merchantToken.publicKey;

  //------------------------------------------------------------------
  // Mint demo tokens if needed.
  //------------------------------------------------------------------

  const customerBalance = (await getAccount(connection, customerAta.address))
    .amount;

  if (customerBalance < BigInt(1000)) {
    await mintTo(connection, wallet, mint, customerAta.address, wallet, 10_000);

    console.log("Minted 10,000 tokens to your ATA.");
  }

  //------------------------------------------------------------------
  // Fresh order every run.
  //------------------------------------------------------------------

  const orderId = new BN(Date.now());
  const amount = new BN(300);

  const [paymentPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("payment"),
      wallet.publicKey.toBuffer(),
      orderId.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  console.log(
    `\nPaying order #${orderId.toString()} for ${amount.toString()} tokens (customer = merchant = relayer = your wallet, self-contained demo)...`,
  );

  //------------------------------------------------------------------
  // Pay
  //------------------------------------------------------------------

  await program.methods
    .pay(orderId, amount)
    .accounts({
      payment: paymentPda,

      customer: wallet.publicKey,
      relayer: wallet.publicKey,

      customerTokenAccount: customerAta.address,
      merchantTokenAccount,

      merchant: wallet.publicKey,
      mint,
    })
    .rpc();

  console.log("Paid.");

  const paymentAfterPay = await program.account.payment.fetch(paymentPda);

  console.log("Payment status:", paymentAfterPay.status);

  //------------------------------------------------------------------
  // Refund
  //------------------------------------------------------------------

  await program.methods
    .refund()
    .accounts({
      payment: paymentPda,

      merchant: wallet.publicKey,

      merchantTokenAccount,
      customerTokenAccount: customerAta.address,
    })
    .rpc();

  console.log("\nRefunded.");

  const paymentAfterRefund = await program.account.payment.fetch(paymentPda);

  console.log("Payment status:", paymentAfterRefund.status);
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
