import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";
import type { EscrowProgram } from "../target/types/escrow_program";

describe("escrow-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.EscrowProgram as Program<EscrowProgram>;
  const maker = (provider.wallet as anchor.Wallet).payer;

  it("completes a full two-party trade", async () => {
    // A second signer, legitimate HERE ONLY because this is a local
    // test environment (this week's Assignment intro) — never done
    // in any live-devnet client this course has written.
    const taker = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      taker.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSig);

    const mintA = await createMint(
      provider.connection,
      maker,
      maker.publicKey,
      null,
      6,
    );
    const mintB = await createMint(
      provider.connection,
      maker,
      maker.publicKey,
      null,
      6,
    );

    const makerAtaA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      maker,
      mintA,
      maker.publicKey,
    );
    const makerAtaB = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      maker,
      mintB,
      maker.publicKey,
    );
    const takerAtaA = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      taker,
      mintA,
      taker.publicKey,
    );
    const takerAtaB = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      taker,
      mintB,
      taker.publicKey,
    );

    await mintTo(
      provider.connection,
      maker,
      mintA,
      makerAtaA.address,
      maker,
      1000 * 10 ** 6,
    );
    await mintTo(
      provider.connection,
      maker,
      mintB,
      takerAtaB.address,
      maker,
      1000 * 10 ** 6,
    );

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), maker.publicKey.toBuffer()],
      program.programId,
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow-vault"), maker.publicKey.toBuffer()],
      program.programId,
    );
    const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow-vault-authority"), maker.publicKey.toBuffer()],
      program.programId,
    );

    const amountA = 100 * 10 ** 6;
    const amountB = 50 * 10 ** 6;

    await program.methods
      .make(new anchor.BN(amountA), new anchor.BN(amountB))
      .accounts({
        escrow: escrowPda,
        vault: vaultPda,
        vaultAuthority: vaultAuthorityPda,
        maker: maker.publicKey,
        makerTokenA: makerAtaA.address,
        mintA,
        mintB,
      })
      .rpc();

    await program.methods
      .take()
      .accounts({
        escrow: escrowPda,
        vault: vaultPda,
        vaultAuthority: vaultAuthorityPda,
        taker: taker.publicKey,
        takerTokenA: takerAtaA.address,
        takerTokenB: takerAtaB.address,
        makerTokenB: makerAtaB.address,
      })
      .signers([taker])
      .rpc();

    const takerAtaAFinal = await getAccount(
      provider.connection,
      takerAtaA.address,
    );
    const makerAtaBFinal = await getAccount(
      provider.connection,
      makerAtaB.address,
    );
    assert.equal(takerAtaAFinal.amount.toString(), amountA.toString());
    assert.equal(makerAtaBFinal.amount.toString(), amountB.toString());

    const escrowFinal = await program.account.escrowState.fetch(escrowPda);
    assert.deepEqual(escrowFinal.state, { fulfilled: {} });
  });
});
