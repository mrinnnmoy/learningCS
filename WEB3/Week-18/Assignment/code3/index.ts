import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  AccountState,
  getMintLen,
  createInitializeDefaultAccountStateInstruction,
  createInitializeInterestBearingMintInstruction,
  createInitializeMintInstruction,
  getOrCreateAssociatedTokenAccount,
  thawAccount,
  mintTo,
  amountToUiAmount,
  getAccount,
} from "@solana/spl-token";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const DECIMALS = 6;

async function main(): Promise<void> {
  const payer = loadLocalWallet();

  const mintKeypair = Keypair.generate(); // the one unavoidable exception, see Assignment intro
  const mint = mintKeypair.publicKey;

  const extensions = [
    ExtensionType.DefaultAccountState,
    ExtensionType.InterestBearingConfig,
  ];
  const mintLen = getMintLen(extensions);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

  const interestRateBasisPoints = 500; // 5%, illustrative

  const createMintTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeDefaultAccountStateInstruction(
      mint,
      AccountState.Frozen,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeInterestBearingMintInstruction(
      mint,
      payer.publicKey,
      interestRateBasisPoints,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMintInstruction(
      mint,
      DECIMALS,
      payer.publicKey,
      payer.publicKey,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  createMintTx.feePayer = payer.publicKey;
  createMintTx.recentBlockhash = blockhash;
  const createSig = await connection.sendTransaction(createMintTx, [
    payer,
    mintKeypair,
  ]);
  await connection.confirmTransaction({
    signature: createSig,
    blockhash,
    lastValidBlockHeight,
  });
  console.log(
    "Compliance-gated, interest-bearing mint created:",
    mint.toBase58(),
  );

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    false,
    "confirmed",
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  const freshAccount = await getAccount(
    connection,
    ata.address,
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
  );
  console.log(
    "\nNew ATA state immediately after creation:",
    freshAccount.isFrozen ? "Frozen" : "Initialized",
  );

  try {
    await mintTo(
      connection,
      payer,
      mint,
      ata.address,
      payer,
      1000 * 10 ** DECIMALS,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    console.log(
      "Unexpectedly minted into a frozen account — this should not happen.",
    );
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log("Mint into frozen account correctly failed:", reason);
  }

  const thawSig = await thawAccount(
    connection,
    payer,
    ata.address,
    mint,
    payer,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  console.log(
    "\nThawed ATA (e.g. after a real project's KYC step). Signature:",
    thawSig,
  );

  const mintAmount = 1000 * 10 ** DECIMALS;
  await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer,
    mintAmount,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  console.log("Minted 1000 tokens after thawing.");

  const rawBalance = (
    await getAccount(
      connection,
      ata.address,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    )
  ).amount;
  const uiAmount = await amountToUiAmount(
    connection,
    payer,
    mint,
    rawBalance,
    TOKEN_2022_PROGRAM_ID,
  );
  console.log("\nRaw stored balance:       ", rawBalance.toString());
  console.log("Interest-adjusted display:", uiAmount);
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
