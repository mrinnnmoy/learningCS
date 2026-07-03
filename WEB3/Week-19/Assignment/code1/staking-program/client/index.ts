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
  getAccount,
  mintTo,
  setAuthority,
  AuthorityType,
} from "@solana/spl-token";
import idl from "./staking_program.json" with { type: "json" };

const MINT_RECORD_PATH = join(import.meta.dirname, "mint-address.json");

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const payer = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(payer), {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  const [authorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    program.programId,
  );
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  // The vault PDA (seeds ["vault"]) is a single global account for this
  // whole program deployment — it can only ever be initialized once,
  // against one mint, permanently. So the mint has to persist across
  // runs too, not be recreated fresh each time.
  let mint: PublicKey;
  if (existsSync(MINT_RECORD_PATH)) {
    const record = JSON.parse(readFileSync(MINT_RECORD_PATH, "utf-8"));
    mint = new PublicKey(record.mint);
    console.log("Reusing existing mint:", mint.toBase58());
  } else {
    mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      6,
    );
    writeFileSync(
      MINT_RECORD_PATH,
      JSON.stringify({ mint: mint.toBase58() }, null, 2),
    );
    console.log("Mint created:", mint.toBase58());
  }

  const stakerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
  );

  const stakeAmount = new BN(100 * 10 ** 6);

  // Only mint (and only while `payer` still holds mint authority) if the
  // staker doesn't already have enough to stake — keeps reruns from
  // piling up unlimited free tokens for no reason.
  const ataInfo = await getAccount(connection, stakerAta.address);
  if (ataInfo.amount < BigInt(stakeAmount.toString())) {
    const existingVaultForAuthorityCheck =
      await connection.getAccountInfo(vaultPda);
    if (existingVaultForAuthorityCheck !== null) {
      throw new Error(
        "Staker ATA is short on tokens, but the vault already exists — " +
          "mint authority has already moved to the program PDA, so payer " +
          "can no longer mint more. This mint is now permanently tied to " +
          "this deployment's vault.",
      );
    }
    await mintTo(
      connection,
      payer,
      mint,
      stakerAta.address,
      payer,
      1000 * 10 ** 6,
    );
    console.log("Minted 1000 tokens to your ATA (for staking).");
  } else {
    console.log("Staker ATA already funded, skipping mint.");
  }

  const existingVault = await connection.getAccountInfo(vaultPda);
  if (existingVault === null) {
    // Only reachable on the very first run, while payer still holds
    // mint authority — transfer it to the program's PDA (Week 11,
    // Concept 5) right before initializing, so the program itself can
    // mint rewards on unstake from then on.
    await setAuthority(
      connection,
      payer,
      mint,
      payer.publicKey,
      AuthorityType.MintTokens,
      authorityPda,
    );
    console.log(
      "Mint authority transferred to program PDA:",
      authorityPda.toBase58(),
    );

    await program.methods
      .initializeVault()
      .accounts({
        vault: vaultPda,
        authority: authorityPda,
        mint,
        payer: payer.publicKey,
      })
      .rpc();
    console.log("Vault initialized:", vaultPda.toBase58());
  } else {
    console.log("Vault already initialized:", vaultPda.toBase58());
  }

  const [positionPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("position"), payer.publicKey.toBuffer()],
    program.programId,
  );

  const lockDuration = new BN(60); // 60 seconds, practical for a live devnet test
  const stakeSig = await program.methods
    .stake(stakeAmount, lockDuration)
    .accounts({
      stakePosition: positionPda,
      staker: payer.publicKey,
      stakerTokenAccount: stakerAta.address,
      vault: vaultPda,
    })
    .rpc();
  console.log("\nStaked. Signature:", stakeSig);

  const position = await program.account.stakePosition.fetch(positionPda);
  console.log("\nPosition:");
  console.log("  Amount:   ", position.amount.toString());
  console.log("  State:    ", position.state);
  console.log(
    "  Unlock at:",
    new Date(position.unlockAt.toNumber() * 1000).toISOString(),
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
