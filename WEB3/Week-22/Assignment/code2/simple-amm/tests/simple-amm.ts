import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import type { SimpleAmm } from "../target/types/simple_amm";

describe("simple-amm", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SimpleAmm as Program<SimpleAmm>;
  const user = (provider.wallet as anchor.Wallet).payer;

  it("quantifies impermanent loss against the closed-form formula", async () => {
    const mintA = await createMint(
      provider.connection,
      user,
      user.publicKey,
      null,
      6,
    );
    const mintB = await createMint(
      provider.connection,
      user,
      user.publicKey,
      null,
      6,
    );

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
      provider.connection,
      user,
      mintA,
      user.publicKey,
    );

    const userTokenB = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      user,
      mintB,
      user.publicKey,
    );

    await mintTo(
      provider.connection,
      user,
      mintA,
      userTokenA.address,
      user,
      10_000_000,
    );
    await mintTo(
      provider.connection,
      user,
      mintB,
      userTokenB.address,
      user,
      10_000_000,
    );

    await program.methods
      .initializePool(0)
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

    const userLpToken = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      user,
      lpMint,
      user.publicKey,
    );
    const DEPOSIT_A = 1_000_000;
    const DEPOSIT_B = 1_000_000;
    await program.methods
      .addLiquidity(new anchor.BN(DEPOSIT_A), new anchor.BN(DEPOSIT_B))
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

    // A large swap, shifting the price meaningfully — Concept 7's
    // divergence has to be real for the IL formula to be meaningful.
    await program.methods
      .swap(new anchor.BN(500_000), new anchor.BN(1), true)
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

    const finalReserveA = Number(
      (await getAccount(provider.connection, vaultA)).amount,
    );
    const finalReserveB = Number(
      (await getAccount(provider.connection, vaultB)).amount,
    );
    const finalPrice = finalReserveB / finalReserveA; // B per A, after the swap

    const lpBalance = Number(
      (await getAccount(provider.connection, userLpToken.address)).amount,
    );

    // Save wallet balances BEFORE removing liquidity.
    const beforeRemoveA = Number(
      (await getAccount(provider.connection, userTokenA.address)).amount,
    );

    const beforeRemoveB = Number(
      (await getAccount(provider.connection, userTokenB.address)).amount,
    );

    await program.methods
      .removeLiquidity(new anchor.BN(lpBalance))
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

    // Wallet balances AFTER removing liquidity.
    const afterRemoveA = Number(
      (await getAccount(provider.connection, userTokenA.address)).amount,
    );

    const afterRemoveB = Number(
      (await getAccount(provider.connection, userTokenB.address)).amount,
    );

    // Tokens returned by removeLiquidity only.
    const withdrawnA = afterRemoveA - beforeRemoveA;
    const withdrawnB = afterRemoveB - beforeRemoveB;

    // Actual value, denominated in B, at the final price.
    const actualValueInB = withdrawnA * finalPrice + withdrawnB;
    // "Had I just held" baseline, same denomination, same final price.
    const holdValueInB = DEPOSIT_A * finalPrice + DEPOSIT_B;
    const actualRatio = actualValueInB / holdValueInB;

    // Closed-form: k = price ratio (final / initial, initial was 1.0 here).
    const k = finalPrice / 1.0;
    const formulaRatio = (2 * Math.sqrt(k)) / (1 + k);

    console.log(
      `Price moved from 1.0000 to ${finalPrice.toFixed(4)} (k = ${k.toFixed(4)})`,
    );
    console.log(`Actual value ratio (LP / hold):   ${actualRatio.toFixed(6)}`);
    console.log(`Closed-form IL ratio (2√k/(1+k)): ${formulaRatio.toFixed(6)}`);

    assert.approximately(
      actualRatio,
      formulaRatio,
      0.001,
      "real pool numbers must match the closed-form IL formula",
    );
    assert.isBelow(
      actualRatio,
      1.0,
      "an LP position after a real price move must be worth less than simply holding",
    );
  });
});
