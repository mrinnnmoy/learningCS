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
} from "@solana/web3.js";

import {
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializeTransferFeeConfigInstruction,
  createInitializeMintInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transferCheckedWithFee,
  getTransferFeeAmount,
  unpackAccount,
  harvestWithheldTokensToMint,
  withdrawWithheldTokensFromMint,
} from "@solana/spl-token";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

const DECIMALS = 6;

async function main() {
  const payer = loadLocalWallet();

  // Fresh mint keypair (required)
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  const extensions = [ExtensionType.TransferFeeConfig];
  const mintLen = getMintLen(extensions);

  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

  const feeBasisPoints = 100; // 1%
  const maxFee = 1_000_000n; // 1 token (6 decimals)

  // ------------------------------------------------------------------
  // Create Token-2022 mint
  // ------------------------------------------------------------------

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      lamports,
      space: mintLen,
      programId: TOKEN_2022_PROGRAM_ID,
    }),

    createInitializeTransferFeeConfigInstruction(
      mint,
      payer.publicKey,
      payer.publicKey,
      feeBasisPoints,
      maxFee,
      TOKEN_2022_PROGRAM_ID,
    ),

    createInitializeMintInstruction(
      mint,
      DECIMALS,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  const latest = await connection.getLatestBlockhash();

  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = latest.blockhash;

  const createSig = await connection.sendTransaction(tx, [payer, mintKeypair]);

  await connection.confirmTransaction({
    signature: createSig,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  });

  console.log("Token-2022 mint created (1% transfer fee):", mint.toBase58());

  // ------------------------------------------------------------------
  // Your ATA
  // ------------------------------------------------------------------

  const primaryAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    false,
    "confirmed",
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  const mintAmount = 1000n * 10n ** BigInt(DECIMALS);

  await mintTo(
    connection,
    payer,
    mint,
    primaryAta.address,
    payer,
    mintAmount,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  console.log("Minted 1000 tokens to your ATA.");

  // ------------------------------------------------------------------
  // PDA vault
  // ------------------------------------------------------------------

  const [vaultOwnerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token2022-vault"), payer.publicKey.toBuffer()],
    MEMO_PROGRAM_ID,
  );

  const vaultAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    vaultOwnerPda,
    true,
    "confirmed",
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  // ------------------------------------------------------------------
  // Transfer with fee
  // ------------------------------------------------------------------

  const transferAmount = 100n * 10n ** BigInt(DECIMALS);

  const expectedFee = (transferAmount * BigInt(feeBasisPoints)) / 10000n;

  const transferSig = await transferCheckedWithFee(
    connection,
    payer,
    primaryAta.address,
    mint,
    vaultAta.address,
    payer,
    transferAmount,
    DECIMALS,
    expectedFee,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  console.log(
    "\nTransferred 100 tokens (fee withheld). Signature:",
    transferSig,
  );

  // ------------------------------------------------------------------
  // Read withheld fee
  // ------------------------------------------------------------------

  const accountInfo = await connection.getAccountInfo(vaultAta.address);

  if (!accountInfo) {
    throw new Error("Vault ATA not found.");
  }

  const unpacked = unpackAccount(
    vaultAta.address,
    accountInfo,
    TOKEN_2022_PROGRAM_ID,
  );

  const withheld = getTransferFeeAmount(unpacked);

  console.log(
    "Withheld fee sitting in vault:",
    withheld?.withheldAmount.toString() ?? "0",
  );

  // ------------------------------------------------------------------
  // Harvest
  // ------------------------------------------------------------------

  const harvestSig = await harvestWithheldTokensToMint(
    connection,
    payer,
    mint,
    [vaultAta.address],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  console.log("\nHarvested withheld fees to mint. Signature:", harvestSig);

  // ------------------------------------------------------------------
  // Withdraw
  // ------------------------------------------------------------------

  const withdrawSig = await withdrawWithheldTokensFromMint(
    connection,
    payer,
    mint,
    primaryAta.address,
    payer,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  console.log("Withdrew harvested fees to your ATA. Signature:", withdrawSig);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
