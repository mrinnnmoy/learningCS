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
import type { PerpMarket } from "../target/types/perp_market";

describe("perp-market", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PerpMarket as Program<PerpMarket>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  it("opens a highly-leveraged position, moves the index price against it, and lets a keeper liquidate it", async () => {
    const trader = Keypair.generate();
    const liquidator = Keypair.generate();
    for (const kp of [trader, liquidator]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2 * LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(sig);
    }

    const mint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      6,
    );
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

    await program.methods
      .initializeMarket(new anchor.BN(100), new anchor.BN(0)) // index price 100, zero funding for a clean liquidation-only test
      .accounts({
        market: marketPda,
        marketAuthority: marketAuthorityPda,
        vault: vaultPda,
        mint,
        authority: authority.publicKey,
      })
      .rpc();

    const traderAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      trader.publicKey,
    );
    await mintTo(
      provider.connection,
      authority,
      mint,
      traderAta.address,
      authority,
      1000,
    );

    const [positionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        trader.publicKey.toBuffer(),
        marketPda.toBuffer(),
      ],
      program.programId,
    );

    // 10x leverage at the max allowed: collateral 1000, size 100, price 100 -> notional 10,000 = collateral * 10.
    await program.methods
      .openPosition(new anchor.BN(1000), new anchor.BN(100))
      .accounts({
        market: marketPda,
        position: positionPda,
        vault: vaultPda,
        trader: trader.publicKey,
        traderTokenAccount: traderAta.address,
      })
      .signers([trader])
      .rpc();

    // Move the index price down — a long position now underwater.
    await program.methods
      .updateIndexPrice(new anchor.BN(94))
      .accounts({ market: marketPda, authority: authority.publicKey })
      .rpc();

    const liquidatorAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      liquidator.publicKey,
    );

    await program.methods
      .liquidate()
      .accounts({
        market: marketPda,
        marketAuthority: marketAuthorityPda,
        position: positionPda,
        vault: vaultPda,
        liquidator: liquidator.publicKey,
        liquidatorTokenAccount: liquidatorAta.address,
      })
      .signers([liquidator])
      .rpc();

    const liquidatorBalance = (
      await getAccount(provider.connection, liquidatorAta.address)
    ).amount;
    assert.isAbove(
      Number(liquidatorBalance),
      0,
      "the keeper must have received the seized collateral as a reward",
    );

    const positionAccount =
      await provider.connection.getAccountInfo(positionPda);
    assert.isNull(
      positionAccount,
      "the liquidated position account must be closed",
    );
  });

  it("rejects liquidating a healthy position", async () => {
    const trader = Keypair.generate();
    const liquidator = Keypair.generate();
    for (const kp of [trader, liquidator]) {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2 * LAMPORTS_PER_SOL,
      );
      await provider.connection.confirmTransaction(sig);
    }

    const mint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      6,
    );
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

    await program.methods
      .initializeMarket(new anchor.BN(100), new anchor.BN(0))
      .accounts({
        market: marketPda,
        marketAuthority: marketAuthorityPda,
        vault: vaultPda,
        mint,
        authority: authority.publicKey,
      })
      .rpc();

    const traderAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      trader.publicKey,
    );
    await mintTo(
      provider.connection,
      authority,
      mint,
      traderAta.address,
      authority,
      1000,
    );

    const [positionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        trader.publicKey.toBuffer(),
        marketPda.toBuffer(),
      ],
      program.programId,
    );

    // A much lighter, healthy position: collateral 1000, size 10 -> notional 1000, well under 10x.
    await program.methods
      .openPosition(new anchor.BN(1000), new anchor.BN(10))
      .accounts({
        market: marketPda,
        position: positionPda,
        vault: vaultPda,
        trader: trader.publicKey,
        traderTokenAccount: traderAta.address,
      })
      .signers([trader])
      .rpc();

    const liquidatorAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      liquidator.publicKey,
    );

    try {
      await program.methods
        .liquidate()
        .accounts({
          market: marketPda,
          marketAuthority: marketAuthorityPda,
          position: positionPda,
          vault: vaultPda,
          liquidator: liquidator.publicKey,
          liquidatorTokenAccount: liquidatorAta.address,
        })
        .signers([liquidator])
        .rpc();
      assert.fail("Expected liquidate to reject a healthy position");
    } catch (err) {
      assert.include(String(err), "NotLiquidatable");
    }
  });
});
