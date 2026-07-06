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
} from "@solana/spl-token";
import idl from "./per_user_vault.json" with { type: "json" };

const MINT_RECORD_PATH = join(import.meta.dirname, "mint-address.json");

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const owner = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(owner), {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  // Mint persistence, Week 19's environment fix — a vault is created
  // once and permanently tied to whichever mint existed at that
  // moment, so the mint has to be stable across runs too.
  let mint: PublicKey;
  if (existsSync(MINT_RECORD_PATH)) {
    const record = JSON.parse(readFileSync(MINT_RECORD_PATH, "utf-8"));
    mint = new PublicKey(record.mint);
    console.log("Reusing existing mint:", mint.toBase58());
  } else {
    mint = await createMint(connection, owner, owner.publicKey, null, 6);
    writeFileSync(
      MINT_RECORD_PATH,
      JSON.stringify({ mint: mint.toBase58() }, null, 2),
    );
    console.log("Mint created:", mint.toBase58());
  }

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.publicKey.toBuffer()],
    program.programId,
  );
  const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault-authority"), owner.publicKey.toBuffer()],
    program.programId,
  );

  const ownerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    owner,
    mint,
    owner.publicKey,
  );

  const ataInfo = await getAccount(connection, ownerAta.address);
  if (ataInfo.amount < BigInt(500)) {
    await mintTo(connection, owner, mint, ownerAta.address, owner, 1000);
    console.log("Minted 1000 tokens to your ATA.");
  } else {
    console.log("ATA already funded, skipping mint.");
  }

  // Vault-existence check, Week 19's environment fix — `init` only
  // ever runs once against this per-user PDA.
  const existingVault = await connection.getAccountInfo(vaultPda);
  if (existingVault === null) {
    await program.methods
      .initializeVault()
      .accounts({
        vault: vaultPda,
        vaultAuthority: vaultAuthorityPda,
        mint,
        owner: owner.publicKey,
      })
      .rpc();
    console.log("Vault initialized:", vaultPda.toBase58());
  } else {
    console.log("Vault already initialized:", vaultPda.toBase58());
  }

  const vaultBefore = await getAccount(connection, vaultPda);
  console.log("\nVault balance before:", vaultBefore.amount.toString());

  await program.methods
    .deposit(new BN(200))
    .accounts({
      vault: vaultPda,
      owner: owner.publicKey,
      ownerTokenAccount: ownerAta.address,
    })
    .rpc();
  console.log("Deposited 200.");

  await program.methods
    .withdraw(new BN(50))
    .accounts({
      vault: vaultPda,
      vaultAuthority: vaultAuthorityPda,
      owner: owner.publicKey,
      ownerTokenAccount: ownerAta.address,
    })
    .rpc();
  console.log("Withdrew 50.");

  const vaultAfter = await getAccount(connection, vaultPda);
  console.log("\nVault balance after:", vaultAfter.amount.toString());
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
