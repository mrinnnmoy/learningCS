import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  burn,
  getAccount,
  getMint,
} from "@solana/spl-token";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Paste Easy's mint address here.
const MINT_ADDRESS = new PublicKey("HwDybmxqmcJzANH8sSgvwXh6otxFMsFLp315mQi3aQDN");
const DECIMALS = 6;

// A real, deployed program's address, used only as a realistic
// programId to derive a PDA against (Week 13's exact pattern) —
// never actually invoked.
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
  console.log(
    "Vault owner PDA (no private key, Week 13):",
    vaultOwnerPda.toBase58(),
  );

  // allowOwnerOffCurve: true — required because vaultOwnerPda is a
  // PDA (Week 13, Concept 2), not a real wallet. Without this flag,
  // getOrCreateAssociatedTokenAccount assumes an off-curve owner is a
  // mistake and refuses.
  const vaultAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    MINT_ADDRESS,
    vaultOwnerPda,
    true,
  );
  console.log("Vault ATA:", vaultAta.address.toBase58());

  const transferAmount = 100 * 10 ** DECIMALS;
  const transferSig = await transfer(
    connection,
    payer,
    primaryAta.address,
    vaultAta.address,
    payer,
    transferAmount,
  );
  console.log("\nTransferred. Signature:", transferSig);

  const primaryAfterTransfer = await getAccount(connection, primaryAta.address);
  const vaultAfterTransfer = await getAccount(connection, vaultAta.address);
  console.log("Primary ATA balance:", primaryAfterTransfer.amount.toString());
  console.log("Vault ATA balance:  ", vaultAfterTransfer.amount.toString());

  const burnAmount = 50 * 10 ** DECIMALS;
  const burnSig = await burn(
    connection,
    payer,
    primaryAta.address,
    MINT_ADDRESS,
    payer,
    burnAmount,
  );
  console.log("\nBurned. Signature:", burnSig);

  const primaryAfterBurn = await getAccount(connection, primaryAta.address);
  const mintAfterBurn = await getMint(connection, MINT_ADDRESS);
  console.log(
    "Primary ATA balance after burn:",
    primaryAfterBurn.amount.toString(),
  );
  console.log(
    "Mint supply after burn:        ",
    mintAfterBurn.supply.toString(),
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
