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
import idl from "./perp_market.json" with { type: "json" };

const MINT_RECORD_PATH = join(import.meta.dirname, "mint-address.json");

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const trader = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(trader), {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(idl as anchor.Idl, provider);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  let mint: PublicKey;
  if (existsSync(MINT_RECORD_PATH)) {
    const record = JSON.parse(readFileSync(MINT_RECORD_PATH, "utf-8"));
    mint = new PublicKey(record.mint);
    console.log("Reusing existing mint:", mint.toBase58());
  } else {
    mint = await createMint(connection, trader, trader.publicKey, null, 6);
    writeFileSync(
      MINT_RECORD_PATH,
      JSON.stringify({ mint: mint.toBase58() }, null, 2),
    );
    console.log("Mint created:", mint.toBase58());
  }

  const [marketPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), mint.toBuffer()],
    program.programId,
  );
  const [marketAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market-authority"), mint.toBuffer()],
    program.programId,
  );
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), mint.toBuffer()],
    program.programId,
  );

  const traderAta = await getOrCreateAssociatedTokenAccount(
    connection,
    trader,
    mint,
    trader.publicKey,
  );
  if ((await getAccount(connection, traderAta.address)).amount < BigInt(1000)) {
    await mintTo(connection, trader, mint, traderAta.address, trader, 10_000);
    console.log("Minted 10,000 collateral tokens to your ATA.");
  }

  const existingMarket = await connection.getAccountInfo(marketPda);
  if (existingMarket === null) {
    await program.methods
      .initializeMarket(new BN(100), new BN(50)) // index price 100, small positive funding rate
      .accounts({
        market: marketPda,
        marketAuthority: marketAuthorityPda,
        vault: vaultPda,
        mint,
        authority: trader.publicKey,
      })
      .rpc();
    console.log("Market initialized:", marketPda.toBase58());
  } else {
    console.log("Market already initialized:", marketPda.toBase58());
  }

  const [positionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("position"),
      trader.publicKey.toBuffer(),
      marketPda.toBuffer(),
    ],
    program.programId,
  );

  const existingPosition = await connection.getAccountInfo(positionPda);
  if (existingPosition === null) {
    // A modest, well-collateralized 2x position — the live-devnet
    // demo stays conservative; Hard's actual leverage/liquidation
    // stress-testing happens in the local-validator test suite.
    await program.methods
      .openPosition(new BN(500), new BN(10))
      .accounts({
        market: marketPda,
        position: positionPda,
        vault: vaultPda,
        trader: trader.publicKey,
        traderTokenAccount: traderAta.address,
      })
      .rpc();
    console.log("Position opened: collateral 500, size 10.");
  } else {
    console.log("Position already open, proceeding to settle and close it.");
  }

  console.log(
    "Waiting a few seconds before settling funding, so elapsed time is nonzero (Concept 9)...",
  );
  await sleep(5000);

  await program.methods
    .settleFunding()
    .accounts({ market: marketPda, position: positionPda })
    .rpc();
  const afterFunding = await program.account.position.fetch(positionPda);
  console.log(
    "Funding settled. Collateral after funding:",
    afterFunding.collateral.toString(),
  );

  await program.methods
    .closePosition()
    .accounts({
      market: marketPda,
      marketAuthority: marketAuthorityPda,
      position: positionPda,
      vault: vaultPda,
      trader: trader.publicKey,
      traderTokenAccount: traderAta.address,
    })
    .rpc();
  const finalBalance = await getAccount(connection, traderAta.address);
  console.log(
    "\nPosition closed. Final ATA balance:",
    finalBalance.amount.toString(),
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
