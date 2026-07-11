import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import type { PaymentProcessor } from "../target/types/payment_processor";

describe("payment-processor", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .PaymentProcessor as Program<PaymentProcessor>;
  const funder = (provider.wallet as anchor.Wallet).payer;

  it("lets a zero-SOL customer pay via a relayer, rejects a duplicate pay, then refunds once and rejects a second refund", async () => {
    const customer = Keypair.generate(); // NEVER airdropped — the whole point
    const merchant = Keypair.generate();
    const relayer = Keypair.generate();
    for (const kp of [merchant, relayer]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2 * LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(sig);
    }

    const mint = await createMint(
      provider.connection,
      funder,
      funder.publicKey,
      null,
      6,
    );

    // The relayer pays for creating both parties' ATAs too —
    // Concept 12 taken all the way, the customer needs zero SOL for
    // anything at all, not even their own token account's rent.
    const customerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      relayer,
      mint,
      customer.publicKey,
    );
    const merchantAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      relayer,
      mint,
      merchant.publicKey,
    );
    await mintTo(
      provider.connection,
      funder,
      mint,
      customerAta.address,
      funder,
      1000,
    );

    const ORDER_ID = new anchor.BN(4471);
    const AMOUNT = new anchor.BN(250);
    const [paymentPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("payment"),
        merchant.publicKey.toBuffer(),
        ORDER_ID.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const balanceBefore = await provider.connection.getBalance(
      customer.publicKey,
    );
    assert.equal(
      balanceBefore,
      0,
      "customer must genuinely hold zero SOL before paying",
    );

    await program.methods
      .pay(ORDER_ID, AMOUNT)
      .accounts({
        payment: paymentPda,
        customer: customer.publicKey,
        relayer: relayer.publicKey,
        customerTokenAccount: customerAta.address,
        merchantTokenAccount: merchantAta.address,
        merchant: merchant.publicKey,
        mint,
      })
      .signers([customer, relayer])
      .rpc();

    const balanceAfter = await provider.connection.getBalance(
      customer.publicKey,
    );
    assert.equal(
      balanceAfter,
      0,
      "customer must STILL hold zero SOL after paying — the relayer covered everything",
    );

    const merchantBalance = (
      await getAccount(provider.connection, merchantAta.address)
    ).amount;
    assert.equal(merchantBalance, BigInt(250));

    // Duplicate payment for the same order_id — Concept 11.
    try {
      await program.methods
        .pay(ORDER_ID, AMOUNT)
        .accounts({
          payment: paymentPda,
          customer: customer.publicKey,
          relayer: relayer.publicKey,
          customerTokenAccount: customerAta.address,
          merchantTokenAccount: merchantAta.address,
          merchant: merchant.publicKey,
          mint,
        })
        .signers([customer, relayer])
        .rpc();
      assert.fail(
        "Expected a duplicate payment for the same order_id to be rejected",
      );
    } catch (err) {
      assert.include(String(err), "already in use");
    }

    // Refund — merchant-authorized.
    await program.methods
      .refund()
      .accounts({
        payment: paymentPda,
        merchant: merchant.publicKey,
        merchantTokenAccount: merchantAta.address,
        customerTokenAccount: customerAta.address,
      })
      .signers([merchant])
      .rpc();

    const customerBalanceAfterRefund = (
      await getAccount(provider.connection, customerAta.address)
    ).amount;
    assert.equal(
      customerBalanceAfterRefund,
      BigInt(1000),
      "customer must be made whole again after the refund",
    );

    // Duplicate refund — Concept 6.
    try {
      await program.methods
        .refund()
        .accounts({
          payment: paymentPda,
          merchant: merchant.publicKey,
          merchantTokenAccount: merchantAta.address,
          customerTokenAccount: customerAta.address,
        })
        .signers([merchant])
        .rpc();
      assert.fail("Expected a duplicate refund to be rejected");
    } catch (err) {
      assert.include(String(err), "AlreadyRefunded");
    }
  });
});
