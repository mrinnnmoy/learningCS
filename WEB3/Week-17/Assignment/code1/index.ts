import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
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

async function main(): Promise<void> {
  const payer = loadLocalWallet();

  // createMint generates a fresh keypair internally for the mint
  // ACCOUNT's own address (Week 14's create_account pattern, wrapped)
  // — nothing here is a throwaway SIGNER, payer funds and authorizes
  // everything, the mint account itself just needs somewhere to live.
  const decimals = 6;
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    decimals,
  );
  console.log("Mint created:", mint.toBase58());

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
  );
  console.log("Your ATA:", ata.address.toBase58());

  const mintAmount = 1000 * 10 ** decimals; // 1000.000000 tokens
  const mintSig = await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    payer,
    mintAmount,
  );
  console.log("\nMinted. Signature:", mintSig);

  const mintInfo = await getMint(connection, mint);
  console.log("\nSupply (raw):   ", mintInfo.supply.toString());
  console.log(
    "Supply (human):",
    Number(mintInfo.supply) / 10 ** mintInfo.decimals,
  );

  const accountInfo = await getAccount(connection, ata.address);
  console.log("\nATA balance (raw):   ", accountInfo.amount.toString());
  console.log(
    "ATA balance (human):",
    Number(accountInfo.amount) / 10 ** mintInfo.decimals,
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
