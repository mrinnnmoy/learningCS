import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import * as anchor from "@anchor-lang/core";
import BN from "bn.js";
import { AnchorProvider, Program, Wallet } from "@anchor-lang/core";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import idl from "./overflow_vault.json" with { type: "json" };

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
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.publicKey.toBuffer()],
    program.programId,
  );

  // Safe to call every run — `init` refuses to run twice against the
  // same PDA (Concept 7), so guard against a rerun the same way
  // Week 19's environment fixes established.
  const existingVault = await connection.getAccountInfo(vaultPda);
  if (existingVault === null) {
    await program.methods
      .initialize()
      .accounts({ vault: vaultPda, owner: owner.publicKey })
      .rpc();
    console.log("Vault initialized:", vaultPda.toBase58());
  } else {
    console.log("Vault already initialized:", vaultPda.toBase58());
  }

  await program.methods
    .deposit(new BN(500))
    .accounts({ vault: vaultPda, owner: owner.publicKey })
    .rpc();
  console.log("Deposited 500.");

  await program.methods
    .withdraw(new BN(200))
    .accounts({ vault: vaultPda, owner: owner.publicKey })
    .rpc();
  console.log("Withdrew 200.");

  const afterNormalOps = await program.account.vaultAccount.fetch(vaultPda);
  console.log(
    "Balance after normal operations:",
    afterNormalOps.balance.toString(),
  );

  // Deliberate over-withdrawal — this should fail cleanly with a
  // named InsufficientBalance error, not corrupt the balance.
  try {
    await program.methods
      .withdraw(new BN(1_000_000))
      .accounts({ vault: vaultPda, owner: owner.publicKey })
      .rpc();
    console.log("Unexpected: over-withdrawal succeeded.");
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log("\nCaught expected error on over-withdrawal:");
    console.log(
      reason.includes("InsufficientBalance")
        ? "InsufficientBalance, as expected."
        : reason,
    );
  }

  const finalState = await program.account.vaultAccount.fetch(vaultPda);
  console.log(
    "\nFinal balance (unchanged by the failed withdrawal):",
    finalState.balance.toString(),
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
