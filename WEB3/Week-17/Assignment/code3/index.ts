import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  freezeAccount,
  thawAccount,
  transfer,
  createMint,
  createMultisig,
  mintTo,
} from "@solana/spl-token";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const MINT_ADDRESS = new PublicKey("HwDybmxqmcJzANH8sSgvwXh6otxFMsFLp315mQi3aQDN");
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

async function main(): Promise<void> {
  const payer = loadLocalWallet();

  const primaryAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    MINT_ADDRESS,
    payer.publicKey,
  );
  const [vaultOwnerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token-vault"), payer.publicKey.toBuffer()],
    MEMO_PROGRAM_ID,
  );
  const vaultAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    MINT_ADDRESS,
    vaultOwnerPda,
    true,
  );

  // --- Freeze / thaw (Concept 7) ---
  const freezeSig = await freezeAccount(
    connection,
    payer,
    vaultAta.address,
    MINT_ADDRESS,
    payer,
  );
  console.log("Frozen vault ATA. Signature:", freezeSig);

  try {
    await transfer(
      connection,
      payer,
      primaryAta.address,
      vaultAta.address,
      payer,
      1_000_000,
    );
    console.log(
      "\nUnexpectedly succeeded transferring into a frozen account — this should not happen.",
    );
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log("\nTransfer into frozen account correctly failed:");
    console.log("  ", reason);
  }

  const thawSig = await thawAccount(
    connection,
    payer,
    vaultAta.address,
    MINT_ADDRESS,
    payer,
  );
  console.log("\nThawed vault ATA. Signature:", thawSig);

  const retrySig = await transfer(
    connection,
    payer,
    primaryAta.address,
    vaultAta.address,
    payer,
    1_000_000,
  );
  console.log("Transfer after thawing succeeded. Signature:", retrySig);

  // --- 1-of-1 multisig authority (Concept 9) ---
  // A genuine M-of-N multisig needs N > 1 real signers to demonstrate
  // actual multi-party approval. This course's wallet rule (one real
  // signer only) means this demonstrates the STRUCTURE, a Multisig
  // account set as an authority, and the requirement to enumerate its
  // signers when using it, rather than true multi-party authorization.
  // A real 2-of-3 setup needs two more real people's wallets.
  const multisig = await createMultisig(
    connection,
    payer,
    [payer.publicKey],
    1,
  );
  console.log("\nMultisig account (1-of-1):", multisig.toBase58());

  const multisigMint = await createMint(connection, payer, multisig, null, 6);
  console.log(
    "New mint with multisig mint_authority:",
    multisigMint.toBase58(),
  );

  const multisigAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    multisigMint,
    payer.publicKey,
  );
  const multisigMintSig = await mintTo(
    connection,
    payer,
    multisigMint,
    multisigAta.address,
    multisig,
    500 * 10 ** 6,
    [payer], // the multisig's actual required signer(s) — one, honestly, here
  );
  console.log("Minted via multisig authority. Signature:", multisigMintSig);
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
