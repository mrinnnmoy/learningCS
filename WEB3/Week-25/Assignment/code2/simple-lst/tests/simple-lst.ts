import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import type { SimpleLst } from "../target/types/simple_lst";

describe("simple-lst", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SimpleLst as Program<SimpleLst>;
  const admin = (provider.wallet as anchor.Wallet).payer;

  it("gives a later staker fewer LST at a grown rate, and records the full grown redemption value in the unstake ticket", async () => {
    const staker1 = Keypair.generate();
    const staker2 = Keypair.generate();

    for (const kp of [staker1, staker2]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2 * LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(sig);
    }

    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool")],
      program.programId,
    );

    const [lstMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("lst-mint")],
      program.programId,
    );

    await program.methods
      .initializePool()
      .accounts({
        pool: poolPda,
        lstMint: lstMintPda,
        admin: admin.publicKey,
      })
      .rpc();

    const staker1Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      staker1,
      lstMintPda,
      staker1.publicKey,
    );

    const staker2Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      staker2,
      lstMintPda,
      staker2.publicKey,
    );

    // staker1 stakes first, at the initial 1:1 rate.
    await program.methods
      .stake(new anchor.BN(1_000_000))
      .accounts({
        pool: poolPda,
        lstMint: lstMintPda,
        staker: staker1.publicKey,
        stakerLstAccount: staker1Ata.address,
      })
      .signers([staker1])
      .rpc();

    const staker1LstBalance = (
      await getAccount(provider.connection, staker1Ata.address)
    ).amount;

    assert.equal(
      staker1LstBalance,
      BigInt(1_000_000),
      "the first staker should receive 1:1 LST on the initial deposit",
    );

    // A reward lands — Concept 11's stand-in.
    await program.methods
      .simulateRewards(new anchor.BN(500_000))
      .accounts({
        pool: poolPda,
        admin: admin.publicKey,
      })
      .rpc();

    // staker2 stakes AFTER the reward, at the now-1.5x rate.
    await program.methods
      .stake(new anchor.BN(1_500_000))
      .accounts({
        pool: poolPda,
        lstMint: lstMintPda,
        staker: staker2.publicKey,
        stakerLstAccount: staker2Ata.address,
      })
      .signers([staker2])
      .rpc();

    const staker2LstBalance = (
      await getAccount(provider.connection, staker2Ata.address)
    ).amount;

    assert.equal(
      staker2LstBalance,
      BigInt(1_000_000),
      "staker2 must receive fewer LST than lamports deposited, at the grown rate",
    );

    // staker1 requests a full unstake of their original position.
    const nonce = new anchor.BN(1);

    const [ticketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("ticket"),
        staker1.publicKey.toBuffer(),
        nonce.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    await program.methods
      .requestUnstake(nonce, new anchor.BN(1_000_000))
      .accounts({
        pool: poolPda,
        lstMint: lstMintPda,
        ticket: ticketPda,
        staker: staker1.publicKey,
        stakerLstAccount: staker1Ata.address,
      })
      .signers([staker1])
      .rpc();

    // Fetch the unstake ticket and verify the recorded redemption value.
    const ticket = await program.account.unstakeTicket.fetch(ticketPda);

    assert.equal(
      ticket.staker.toBase58(),
      staker1.publicKey.toBase58(),
      "the unstake ticket should belong to staker1",
    );

    assert.equal(
      ticket.lamportsOwed.toNumber(),
      1_500_000,
      "the unstake ticket must record the full 50%-grown redemption value",
    );

    assert.isAbove(
      ticket.readyAt.toNumber(),
      0,
      "the ticket should contain a future unlock timestamp",
    );
  });
});
