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
import type { SubscriptionVault } from "../target/types/subscription_vault";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("subscription-vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .SubscriptionVault as Program<SubscriptionVault>;
  const subscriber = (provider.wallet as anchor.Wallet).payer;

  it("rejects an early charge, then succeeds after the period elapses, then rejects again immediately", async () => {
    const merchant = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      merchant.publicKey,
      LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSig);

    const mint = await createMint(
      provider.connection,
      subscriber,
      subscriber.publicKey,
      null,
      6,
    );
    const [subscriptionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("subscription"),
        subscriber.publicKey.toBuffer(),
        merchant.publicKey.toBuffer(),
      ],
      program.programId,
    );
    const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault-authority"),
        subscriber.publicKey.toBuffer(),
        merchant.publicKey.toBuffer(),
      ],
      program.programId,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        subscriber.publicKey.toBuffer(),
        merchant.publicKey.toBuffer(),
      ],
      program.programId,
    );

    const subscriberAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      subscriber,
      mint,
      subscriber.publicKey,
    );
    await mintTo(
      provider.connection,
      subscriber,
      mint,
      subscriberAta.address,
      subscriber,
      1000,
    );

    const PERIOD_SECONDS = 3;
    const AMOUNT_PER_PERIOD = 100;
    await program.methods
      .createSubscription(
        new anchor.BN(AMOUNT_PER_PERIOD),
        new anchor.BN(PERIOD_SECONDS),
      )
      .accounts({
        subscription: subscriptionPda,
        vaultAuthority: vaultAuthorityPda,
        vault: vaultPda,
        mint,
        subscriber: subscriber.publicKey,
        merchant: merchant.publicKey,
      })
      .rpc();

    await program.methods
      .topUp(new anchor.BN(500))
      .accounts({
        subscription: subscriptionPda,
        vault: vaultPda,
        subscriber: subscriber.publicKey,
        subscriberTokenAccount: subscriberAta.address,
      })
      .rpc();

    const merchantAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      subscriber,
      mint,
      merchant.publicKey,
    );

    // Too early — should reject.
    try {
      await program.methods
        .charge()
        .accounts({
          subscription: subscriptionPda,
          vaultAuthority: vaultAuthorityPda,
          vault: vaultPda,
          merchant: merchant.publicKey,
          merchantTokenAccount: merchantAta.address,
        })
        .signers([merchant])
        .rpc();
      assert.fail("Expected an early charge to be rejected");
    } catch (err) {
      assert.include(String(err), "TooEarly");
    }

    let charged = false;

    for (let i = 0; i < 10; i++) {
      try {
        await program.methods
          .charge()
          .accounts({
            subscription: subscriptionPda,
            vaultAuthority: vaultAuthorityPda,
            vault: vaultPda,
            merchant: merchant.publicKey,
            merchantTokenAccount: merchantAta.address,
          })
          .signers([merchant])
          .rpc();

        charged = true;
        break;
      } catch (err) {
        if (!String(err).includes("TooEarly")) {
          throw err;
        }

        await sleep(1000);
      }
    }

    assert.isTrue(charged, "Charge never became available");

    const merchantBalance = (
      await getAccount(provider.connection, merchantAta.address)
    ).amount;
    assert.equal(merchantBalance, BigInt(AMOUNT_PER_PERIOD));

    // Immediately again — rejected, next_charge_ts already advanced.
    try {
      await program.methods
        .charge()
        .accounts({
          subscription: subscriptionPda,
          vaultAuthority: vaultAuthorityPda,
          vault: vaultPda,
          merchant: merchant.publicKey,
          merchantTokenAccount: merchantAta.address,
        })
        .signers([merchant])
        .rpc();
      assert.fail("Expected an immediate second charge to be rejected");
    } catch (err) {
      assert.include(String(err), "TooEarly");
    }
  });
});
