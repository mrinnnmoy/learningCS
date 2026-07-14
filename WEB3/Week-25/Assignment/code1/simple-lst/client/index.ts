import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import * as anchor from "@anchor-lang/core";
import BN from "bn.js";
import { AnchorProvider, Program, Wallet } from "@anchor-lang/core";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token";
import idl from "./simple_lst.json" with { type: "json" };

const POOL_INFO_PATH = join(import.meta.dirname, "pool-info.json");

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const staker = loadLocalWallet();
const provider = new AnchorProvider(connection, new Wallet(staker), {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const program = new Program(idl as anchor.Idl, provider);

async function printExchangeRate(
  poolPda: PublicKey,
  lstMint: PublicKey,
): Promise<void> {
  const poolBalance = await connection.getBalance(poolPda);
  const pool = await program.account.pool.fetch(poolPda);
  const totalStaked = poolBalance - Number(pool.rentExemptReserve);
  const mintInfo = await connection.getTokenSupply(lstMint);
  const supply = Number(mintInfo.value.amount);
  const rate = supply === 0 ? 1 : totalStaked / supply;
  console.log(
    `  Exchange rate: ${rate.toFixed(6)} SOL per LST (total staked: ${totalStaked} lamports, LST supply: ${supply})`,
  );
}

async function main(): Promise<void> {
  const [poolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pool")],
    program.programId,
  );
  const [lstMintPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lst-mint")],
    program.programId,
  );

  const existingPool = await connection.getAccountInfo(poolPda);
  if (existingPool === null) {
    await program.methods
      .initializePool()
      .accounts({ pool: poolPda, lstMint: lstMintPda, admin: staker.publicKey })
      .rpc();
    console.log("Pool initialized:", poolPda.toBase58());
    writeFileSync(
      POOL_INFO_PATH,
      JSON.stringify(
        {
          programId: program.programId.toBase58(),
          lstMint: lstMintPda.toBase58(),
        },
        null,
        2,
      ),
    );
  } else {
    console.log("Pool already initialized:", poolPda.toBase58());
    if (!existsSync(POOL_INFO_PATH)) {
      writeFileSync(
        POOL_INFO_PATH,
        JSON.stringify(
          {
            programId: program.programId.toBase58(),
            lstMint: lstMintPda.toBase58(),
          },
          null,
          2,
        ),
      );
    }
  }

  const stakerLstAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    staker,
    lstMintPda,
    staker.publicKey,
  );

  console.log("\nStaking 0.01 SOL...");
  await program.methods
    .stake(new BN(0.01 * LAMPORTS_PER_SOL))
    .accounts({
      pool: poolPda,
      lstMint: lstMintPda,
      staker: staker.publicKey,
      stakerLstAccount: stakerLstAccount.address,
    })
    .rpc();
  await printExchangeRate(poolPda, lstMintPda);

  console.log(
    "\nSimulating a reward of 0.001 SOL (Concept 11's honest stand-in)...",
  );
  await program.methods
    .simulateRewards(new BN(0.001 * LAMPORTS_PER_SOL))
    .accounts({ pool: poolPda, admin: staker.publicKey })
    .rpc();
  await printExchangeRate(poolPda, lstMintPda);

  console.log("\nStaking another 0.01 SOL at the now-higher rate...");
  const lstBalanceBefore = (
    await getAccount(connection, stakerLstAccount.address)
  ).amount;
  await program.methods
    .stake(new BN(0.01 * LAMPORTS_PER_SOL))
    .accounts({
      pool: poolPda,
      lstMint: lstMintPda,
      staker: staker.publicKey,
      stakerLstAccount: stakerLstAccount.address,
    })
    .rpc();
  const lstBalanceAfter = (
    await getAccount(connection, stakerLstAccount.address)
  ).amount;
  console.log(
    `  Received ${lstBalanceAfter - lstBalanceBefore} LST for this stake (fewer than the first stake's amount — the rate grew).`,
  );

  const nonce = new BN(Date.now());
  const [ticketPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      staker.publicKey.toBuffer(),
      nonce.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );
  const unstakeAmount = new BN((lstBalanceAfter - lstBalanceBefore).toString());
  console.log("\nRequesting unstake of this stake's LST...");
  await program.methods
    .requestUnstake(nonce, unstakeAmount)
    .accounts({
      pool: poolPda,
      lstMint: lstMintPda,
      ticket: ticketPda,
      staker: staker.publicKey,
      stakerLstAccount: stakerLstAccount.address,
    })
    .rpc();

  console.log(
    "Waiting for the cooldown (Concept 5, compressed to a few seconds for this assignment)...",
  );
  await sleep(6000);

  const balanceBeforeClaim = await connection.getBalance(staker.publicKey);
  await program.methods
    .claimUnstake()
    .accounts({ pool: poolPda, ticket: ticketPda, staker: staker.publicKey })
    .rpc();
  const balanceAfterClaim = await connection.getBalance(staker.publicKey);
  console.log(
    `\nClaimed. SOL received (net of tx fees): ~${(balanceAfterClaim - balanceBeforeClaim) / LAMPORTS_PER_SOL} SOL`,
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
