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

import idl from "./instant_unstake_pool.json" with { type: "json" };

function loadWallet(): Keypair {
  const path = join(homedir(), ".config", "solana", "id.json");

  const secret = Uint8Array.from(JSON.parse(readFileSync(path, "utf8")));

  return Keypair.fromSecretKey(secret);
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const user = loadWallet();

const provider = new AnchorProvider(connection, new Wallet(user), {
  commitment: "confirmed",
});

anchor.setProvider(provider);

const program = new Program(idl as anchor.Idl, provider);

async function main() {
  //
  // Load Easy Simple-LST deployment
  //

  const lstInfoPath = join(
    import.meta.dirname,
    "..",
    "..",
    "..",
    "code1",
    "simple-lst",
    "client",
    "pool-info.json",
  );

  const lstInfo = JSON.parse(readFileSync(lstInfoPath, "utf8"));

  const lstMint = new PublicKey(lstInfo.lstMint);

  const lstProgramId = new PublicKey(lstInfo.programId);

  //
  // Calculate Simple-LST exchange rate
  //

  const [lstPool] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool")],
    lstProgramId,
  );

  const poolLamports = await connection.getBalance(lstPool);

  const supply = await connection.getTokenSupply(lstMint);

  const lstSupply = Number(supply.value.amount);

  const fairRate = poolLamports / lstSupply;

  console.log(
    `Simple-LST fair exchange rate: ${fairRate.toFixed(6)} lamports/LST`,
  );

  //
  // Create fake SOL-equivalent token
  //

  const liquidityMint = await createMint(
    connection,
    user,
    user.publicKey,
    null,
    9,
  );

  console.log("Fake liquidity token:", liquidityMint.toBase58());

  //
  // AMM PDA derivation
  //

  const [pool] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool"), lstMint.toBuffer(), liquidityMint.toBuffer()],
    program.programId,
  );

  const [authority] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("pool-authority"),
      lstMint.toBuffer(),
      liquidityMint.toBuffer(),
    ],
    program.programId,
  );

  const [vaultA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault-a"), lstMint.toBuffer(), liquidityMint.toBuffer()],
    program.programId,
  );

  const [vaultB] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault-b"), lstMint.toBuffer(), liquidityMint.toBuffer()],
    program.programId,
  );

  const [lpMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("lp-mint"), lstMint.toBuffer(), liquidityMint.toBuffer()],
    program.programId,
  );

  //
  // Initialize AMM pool first
  //

  const exists = await connection.getAccountInfo(pool);

  if (!exists) {
    console.log("Initializing AMM pool...");

    await program.methods
      .initializePool(30)
      .accounts({
        pool,
        poolAuthority: authority,
        vaultA,
        vaultB,
        lpMint,
        mintA: lstMint,
        mintB: liquidityMint,
        payer: user.publicKey,
      })
      .rpc();

    console.log("Pool initialized:", pool.toBase58());
  }

  //
  // NOW LP mint exists
  //

  const userLst = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    lstMint,
    user.publicKey,
  );

  const userLiquidity = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    liquidityMint,
    user.publicKey,
  );

  const userLp = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    lpMint,
    user.publicKey,
  );

  //
  // Give user fake liquidity token
  //

  await mintTo(
    connection,
    user,
    liquidityMint,
    userLiquidity.address,
    user,
    2_000_000,
  );

  //
  // Add initial liquidity
  //

  const lstAmount = 1_000_000;

  const liquidityAmount = Math.floor(lstAmount * fairRate);

  console.log(`Adding liquidity ${lstAmount} LST : ${liquidityAmount} token`);

  await program.methods
    .addLiquidity(new BN(lstAmount), new BN(liquidityAmount))
    .accounts({
      pool,
      poolAuthority: authority,
      vaultA,
      vaultB,
      lpMint,
      user: user.publicKey,
      userTokenA: userLst.address,
      userTokenB: userLiquidity.address,
      userLpToken: userLp.address,
    })
    .rpc();

  //
  // Swap LST instantly
  //

  const before = await getAccount(connection, vaultB);

  const swapAmount = new BN(100_000);

  await program.methods
    .swap(swapAmount, new BN(1), true)
    .accounts({
      pool,
      poolAuthority: authority,
      vaultA,
      vaultB,
      user: user.publicKey,
      userTokenA: userLst.address,
      userTokenB: userLiquidity.address,
    })
    .rpc();

  const after = await getAccount(connection, vaultB);

  const received = Number(before.amount - after.amount);

  const fair = Number(swapAmount) * fairRate;

  const depeg = ((fair - received) / fair) * 100;

  console.log("\nInstant Unstake Result");
  console.log("----------------------");
  console.log("AMM received:", received);

  console.log("Fair value:", fair.toFixed(0));

  console.log("Depeg:", depeg.toFixed(2) + "%");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
