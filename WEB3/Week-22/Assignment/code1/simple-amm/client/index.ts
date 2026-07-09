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
import idl from "./simple_amm.json" with { type: "json" };

const POOL_RECORD_PATH = join(import.meta.dirname, "pool-mints.json");

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const user = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(user), {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(idl as anchor.Idl, provider);

async function main(): Promise<void> {
  let mintA: PublicKey;
  let mintB: PublicKey;
  if (existsSync(POOL_RECORD_PATH)) {
    const record = JSON.parse(readFileSync(POOL_RECORD_PATH, "utf-8"));
    mintA = new PublicKey(record.mintA);
    mintB = new PublicKey(record.mintB);
    console.log("Reusing existing mints:", mintA.toBase58(), mintB.toBase58());
  } else {
    mintA = await createMint(connection, user, user.publicKey, null, 6);
    mintB = await createMint(connection, user, user.publicKey, null, 6);
    writeFileSync(
      POOL_RECORD_PATH,
      JSON.stringify(
        { mintA: mintA.toBase58(), mintB: mintB.toBase58() },
        null,
        2,
      ),
    );
    console.log("Mints created:", mintA.toBase58(), mintB.toBase58());
  }

  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), mintA.toBuffer(), mintB.toBuffer()],
    program.programId,
  );
  const [poolAuthorityPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool-authority"), mintA.toBuffer(), mintB.toBuffer()],
    program.programId,
  );
  const [vaultA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault-a"), mintA.toBuffer(), mintB.toBuffer()],
    program.programId,
  );
  const [vaultB] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault-b"), mintA.toBuffer(), mintB.toBuffer()],
    program.programId,
  );
  const [lpMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("lp-mint"), mintA.toBuffer(), mintB.toBuffer()],
    program.programId,
  );

  const userTokenA = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    mintA,
    user.publicKey,
  );
  const userTokenB = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    mintB,
    user.publicKey,
  );

  if (
    (await getAccount(connection, userTokenA.address)).amount <
    BigInt(10_000_000)
  ) {
    await mintTo(connection, user, mintA, userTokenA.address, user, 10_000_000);
    await mintTo(connection, user, mintB, userTokenB.address, user, 10_000_000);
    console.log("Minted starting balances of A and B.");
  }

  const existingPool = await connection.getAccountInfo(poolPda);

  if (existingPool === null) {
    await program.methods
      .initializePool(30)
      .accounts({
        pool: poolPda,
        poolAuthority: poolAuthorityPda,
        vaultA,
        vaultB,
        lpMint,
        mintA,
        mintB,
        payer: user.publicKey,
      })
      .rpc();

    console.log("Pool initialized:", poolPda.toBase58());
  }

  const userLpToken = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    lpMint,
    user.publicKey,
  );

  if (existingPool === null) {
    await program.methods
      .addLiquidity(new BN(1_000_000), new BN(1_000_000))
      .accounts({
        pool: poolPda,
        poolAuthority: poolAuthorityPda,
        vaultA,
        vaultB,
        lpMint,
        user: user.publicKey,
        userTokenA: userTokenA.address,
        userTokenB: userTokenB.address,
        userLpToken: userLpToken.address,
      })
      .rpc();

    console.log("Added 1,000,000 / 1,000,000 initial liquidity.");
  } else {
    console.log("Pool already initialized:", poolPda.toBase58());
  }

  const reservesBefore = {
    a: (await getAccount(connection, vaultA)).amount,
    b: (await getAccount(connection, vaultB)).amount,
  };
  const quotedRate = Number(reservesBefore.b) / Number(reservesBefore.a);
  console.log(`\nPre-swap pool rate (B per A): ${quotedRate.toFixed(4)}`);

  const swapAmount = new BN(50_000);
  await program.methods
    .swap(swapAmount, new BN(1), true)
    .accounts({
      pool: poolPda,
      poolAuthority: poolAuthorityPda,
      vaultA,
      vaultB,
      user: user.publicKey,
      userTokenA: userTokenA.address,
      userTokenB: userTokenB.address,
    })
    .rpc();

  const reservesAfter = {
    a: (await getAccount(connection, vaultA)).amount,
    b: (await getAccount(connection, vaultB)).amount,
  };
  const actualOut = reservesBefore.b - reservesAfter.b;
  const actualRate = Number(actualOut) / Number(swapAmount);
  console.log(
    `Swapped 50,000 A. Actual rate received: ${actualRate.toFixed(4)} (Concept 3's price impact vs the quoted ${quotedRate.toFixed(4)})`,
  );

  // Deliberate slippage-protection trigger.
  try {
    await program.methods
      .swap(new BN(50_000), new BN(1_000_000), true) // demands an absurd min_amount_out
      .accounts({
        pool: poolPda,
        poolAuthority: poolAuthorityPda,
        vaultA,
        vaultB,
        user: user.publicKey,
        userTokenA: userTokenA.address,
        userTokenB: userTokenB.address,
      })
      .rpc();
    console.log("Unexpected: over-strict swap succeeded.");
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.log(
      "\nCaught expected slippage rejection:",
      reason.includes("SlippageExceeded")
        ? "SlippageExceeded, as expected."
        : reason,
    );
  }
}

main().catch((err) => {
  console.error("========== ERROR ==========");
  console.dir(err, { depth: null });
  console.error(err);
  process.exit(1);
});
