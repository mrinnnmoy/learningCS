import { readFileSync } from "fs";
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
import idl from "./escrow_program.json" with { type: "json" };

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const maker = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(maker), {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  const mintA = await createMint(connection, maker, maker.publicKey, null, 6);
  const mintB = await createMint(connection, maker, maker.publicKey, null, 6);
  console.log("Mint A (offered):", mintA.toBase58());
  console.log("Mint B (wanted):  ", mintB.toBase58());

  const makerAtaA = await getOrCreateAssociatedTokenAccount(
    connection,
    maker,
    mintA,
    maker.publicKey,
  );
  await mintTo(
    connection,
    maker,
    mintA,
    makerAtaA.address,
    maker,
    1000 * 10 ** 6,
  );

  const [escrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), maker.publicKey.toBuffer()],
    program.programId,
  );
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow-vault"), maker.publicKey.toBuffer()],
    program.programId,
  );
  const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("escrow-vault-authority"), maker.publicKey.toBuffer()],
    program.programId,
  );

  const makeSig = await program.methods
    .make(new BN(100 * 10 ** 6), new BN(50 * 10 ** 6))
    .accounts({
      escrow: escrowPda,
      vault: vaultPda,
      vaultAuthority: vaultAuthorityPda,
      maker: maker.publicKey,
      makerTokenA: makerAtaA.address,
      mintA,
      mintB,
    })
    .rpc();
  console.log("\nMade escrow (offering 100 A for 50 B). Signature:", makeSig);

  const vaultAfterMake = await getAccount(connection, vaultPda);
  console.log(
    "Vault balance right after making:",
    vaultAfterMake.amount.toString(),
  );

  const cancelSig = await program.methods
    .cancel()
    .accounts({
      escrow: escrowPda,
      vault: vaultPda,
      vaultAuthority: vaultAuthorityPda,
      maker: maker.publicKey,
      makerTokenA: makerAtaA.address,
    })
    .rpc();
  console.log("\nCancelled. Signature:", cancelSig);

  const vaultAfterCancel = await getAccount(connection, vaultPda);
  console.log(
    "Vault balance after cancelling:",
    vaultAfterCancel.amount.toString(),
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
