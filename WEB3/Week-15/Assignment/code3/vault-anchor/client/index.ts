import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import BN from "bn.js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import idl from "./vault_anchor.json" assert { type: "json" };

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const walletKeypair = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(walletKeypair), {
  commitment: "confirmed",
});
anchor.setProvider(provider);

const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), walletKeypair.publicKey.toBuffer()],
    program.programId,
  );
  console.log("Depositor:", walletKeypair.publicKey.toBase58());
  console.log("Vault PDA:", vaultPda.toBase58());

  const depositAmount = new BN(2_000_000); // 0.002 SOL
  const depositSig = await program.methods
    .deposit(depositAmount)
    .accounts({ vault: vaultPda, depositor: walletKeypair.publicKey })
    .rpc();
  console.log("\nDeposited. Signature:", depositSig);
  console.log(
    "Vault balance:",
    await connection.getBalance(vaultPda),
    "lamports",
  );

  const withdrawAmount = new BN(1_000_000); // withdraw half back
  const withdrawSig = await program.methods
    .withdraw(withdrawAmount)
    .accounts({ vault: vaultPda, depositor: walletKeypair.publicKey })
    .rpc();
  console.log("\nWithdrew. Signature:", withdrawSig);
  console.log(
    "Vault balance:",
    await connection.getBalance(vaultPda),
    "lamports",
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
