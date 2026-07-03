import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import type { StakingProgram } from "../target/types/staking_program";

const REWARD_RATE_BPS = 1000;
const BPS_DENOMINATOR = 10_000;
const SECONDS_PER_YEAR = 31_536_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("staking-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.StakingProgram as Program<StakingProgram>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  it("rejects unstaking before unlock, then succeeds with correct reward after it", async () => {
    const [authorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("authority")],
      program.programId,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );

    const mint = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      6,
    );
    await setAuthority(
      provider.connection,
      payer,
      mint,
      payer.publicKey,
      AuthorityType.MintTokens,
      authorityPda,
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

    const stakerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      payer.publicKey,
    );
    const stakeAmount = 1000 * 10 ** 6;
    await mintTo(
      provider.connection,
      payer,
      mint,
      stakerAta.address,
      payer,
      stakeAmount,
    );

    const [positionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("position"), payer.publicKey.toBuffer()],
      program.programId,
    );

    const lockDurationSeconds = 3;
    await program.methods
      .stake(new anchor.BN(stakeAmount), new anchor.BN(lockDurationSeconds))
      .accounts({
        stakePosition: positionPda,
        staker: payer.publicKey,
        stakerTokenAccount: stakerAta.address,
        vault: vaultPda,
      })
      .rpc();

    // --- Wrong-state edge case (Concept 9): unstake before unlock. ---
    try {
      await program.methods
        .unstake()
        .accounts({
          stakePosition: positionPda,
          staker: payer.publicKey,
          stakerTokenAccount: stakerAta.address,
          vault: vaultPda,
          mint,
          authority: authorityPda,
        })
        .rpc();
      assert.fail("Expected unstake to fail while still locked");
    } catch (err) {
      assert.include(String(err), "StillLocked");
    }

    // Real-time wait — `anchor test`'s local validator clock ticks
    // in real time (unlike solana-program-test's warpable clock,
    // Week 14, Concept 9), so this test genuinely waits.
    await sleep((lockDurationSeconds + 1) * 1000);

    const beforeUnstake = await getAccount(
      provider.connection,
      stakerAta.address,
    );

    await program.methods
      .unstake()
      .accounts({
        stakePosition: positionPda,
        staker: payer.publicKey,
        stakerTokenAccount: stakerAta.address,
        vault: vaultPda,
        mint,
        authority: authorityPda,
      })
      .rpc();

    const afterUnstake = await getAccount(
      provider.connection,
      stakerAta.address,
    );
    const actualIncrease = afterUnstake.amount - beforeUnstake.amount;

    // Expected: principal back, plus roughly (lockDurationSeconds + a
    // little test overhead) worth of linear reward accrual.
    const elapsedEstimate = lockDurationSeconds + 1;
    const expectedReward =
      (BigInt(stakeAmount) *
        BigInt(REWARD_RATE_BPS) *
        BigInt(elapsedEstimate)) /
      (BigInt(BPS_DENOMINATOR) * BigInt(SECONDS_PER_YEAR));
    const expectedIncrease = BigInt(stakeAmount) + expectedReward;

    // A small tolerance for the few seconds of real-time variance
    // this test's own execution introduces.
    const tolerance = BigInt(1000);
    const difference =
      actualIncrease > expectedIncrease
        ? actualIncrease - expectedIncrease
        : expectedIncrease - actualIncrease;
    assert.isTrue(
      difference <= tolerance,
      `Reward outside tolerance: got ${actualIncrease}, expected ~${expectedIncrease}`,
    );
  });
});
