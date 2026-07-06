import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import type { PerUserVault } from "../target/types/per_user_vault";

describe("per-user-vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PerUserVault as Program<PerUserVault>;
  const userA = (provider.wallet as anchor.Wallet).payer;

  it("gives two different owners distinct vault addresses — no seed collision", async () => {
    const userB = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      userB.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSig);

    const mint = await createMint(
      provider.connection,
      userA,
      userA.publicKey,
      null,
      6,
    );

    const [vaultA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), userA.publicKey.toBuffer()],
      program.programId,
    );
    const [vaultAuthorityA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault-authority"), userA.publicKey.toBuffer()],
      program.programId,
    );
    const [vaultB] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), userB.publicKey.toBuffer()],
      program.programId,
    );
    const [vaultAuthorityB] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault-authority"), userB.publicKey.toBuffer()],
      program.programId,
    );

    assert.notEqual(
      vaultA.toBase58(),
      vaultB.toBase58(),
      "distinct owners must get distinct vault addresses",
    );

    await program.methods
      .initializeVault()
      .accounts({
        vault: vaultA,
        vaultAuthority: vaultAuthorityA,
        mint,
        owner: userA.publicKey,
      })
      .rpc();

    await program.methods
      .initializeVault()
      .accounts({
        vault: vaultB,
        vaultAuthority: vaultAuthorityB,
        mint,
        owner: userB.publicKey,
      })
      .signers([userB])
      .rpc();

    const vaultAInfo = await getAccount(provider.connection, vaultA);
    const vaultBInfo = await getAccount(provider.connection, vaultB);
    assert.equal(vaultAInfo.amount, BigInt(0));
    assert.equal(vaultBInfo.amount, BigInt(0));
  });

  it("rejects an arbitrary program substituted for token_program", async () => {
    // A fresh owner, distinct from Test 1's userA — avoids colliding
    // with the vault Test 1 already created, since both tests share
    // the same local validator state within one anchor test run.
    const testOwner = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      testOwner.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSig);

    const mint = await createMint(
      provider.connection,
      userA,
      userA.publicKey,
      null,
      6,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), testOwner.publicKey.toBuffer()],
      program.programId,
    );
    const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault-authority"), testOwner.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .initializeVault()
      .accounts({
        vault: vaultPda,
        vaultAuthority: vaultAuthorityPda,
        mint,
        owner: testOwner.publicKey,
      })
      .signers([testOwner])
      .rpc();

    const ownerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      userA,
      mint,
      testOwner.publicKey,
    );
    await mintTo(
      provider.connection,
      userA,
      mint,
      ownerAta.address,
      userA,
      1000,
    );
    await program.methods
      .deposit(new anchor.BN(500))
      .accounts({
        vault: vaultPda,
        owner: testOwner.publicKey,
        ownerTokenAccount: ownerAta.address,
        tokenProgram: anchor.web3.TOKEN_PROGRAM_ID,
      })
      .signers([testOwner])
      .rpc();

    // Substitute the System Program's address where the real Token
    // Program belongs. Program<'info, Token> must reject this before
    // the transfer logic ever runs.
    try {
      await program.methods
        .withdraw(new anchor.BN(100))
        .accounts({
          vault: vaultPda,
          vaultAuthority: vaultAuthorityPda,
          owner: testOwner.publicKey,
          ownerTokenAccount: ownerAta.address,
          tokenProgram: SystemProgram.programId,
        })
        .signers([testOwner])
        .rpc();
      assert.fail("Expected withdraw to reject a non-Token-Program substitute");
    } catch (err) {
      assert.include(String(err), "InvalidProgramId");
    }

    const vaultInfo = await getAccount(provider.connection, vaultPda);
    assert.equal(
      vaultInfo.amount,
      BigInt(500),
      "balance must be unchanged after the rejected substitution",
    );
  });
});
