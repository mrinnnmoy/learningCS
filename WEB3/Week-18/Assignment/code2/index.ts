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
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  createInitializeNonTransferableMintInstruction,
  createInitializePermanentDelegateInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transferChecked,
  burnChecked,
} from "@solana/spl-token";

import {
  createInitializeInstruction,
  pack,
  type TokenMetadata,
} from "@solana/spl-token-metadata";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);
const DECIMALS = 0; // a whole, indivisible credential

async function main(): Promise<void> {
  const payer = loadLocalWallet();

  const mintKeypair = Keypair.generate(); // the one unavoidable exception, see Assignment intro
  const mint = mintKeypair.publicKey;

  const metadata: TokenMetadata = {
    mint,
    name: "Course Completion Credential",
    symbol: "WEEK18",
    uri: "https://example.com/credential.json",
    additionalMetadata: [],
  };

  const extensions = [
    ExtensionType.NonTransferable,
    ExtensionType.PermanentDelegate,
    ExtensionType.MetadataPointer,
  ];
  const mintLen = getMintLen(extensions);
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen,
  );

  const createMintTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
    createInitializePermanentDelegateInstruction(
      mint,
      payer.publicKey,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMetadataPointerInstruction(
      mint,
      payer.publicKey,
      mint,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMintInstruction(
      mint,
      DECIMALS,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint,
      updateAuthority: payer.publicKey,
      mint,
      mintAuthority: payer.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    }),
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
  console.log("Soulbound credential mint created:", mint.toBase58());

  const holderAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    false,
    "confirmed",
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  await mintTo(
    connection,
    payer,
    mint,
    holderAta.address,
    payer,
    1,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  console.log("Minted 1 credential to your ATA:", holderAta.address.toBase58());

  const [otherOwnerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("credential-other"), payer.publicKey.toBuffer()],
    MEMO_PROGRAM_ID,
  );
  const otherAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    otherOwnerPda,
    true,
    "confirmed",
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  try {
    await transferChecked(
      connection,
      payer,
      holderAta.address,
      mint,
      otherAta.address,
      payer,
      1,
      DECIMALS,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    console.log(
      "\nUnexpectedly succeeded transferring a non-transferable token — this should not happen.",
    );
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log("\nTransfer correctly failed (NonTransferable):");
    console.log("  ", reason);
  }

  // Revoke via the PERMANENT DELEGATE. Note: this course's wallet
  // rule means the delegate and the holder are necessarily the SAME
  // real wallet in this demo — the MECHANISM (burning via delegate
  // authority, not owner authority) is genuine, but a fully separate
  // "issuer revokes a stranger's credential" scenario would need a
  // second real holder, deliberately outside this course's scope.
  const revokeSig = await burnChecked(
    connection,
    payer,
    holderAta.address,
    mint,
    payer,
    1,
    DECIMALS,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );
  console.log(
    "\nRevoked (burned via permanent delegate authority). Signature:",
    revokeSig,
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
