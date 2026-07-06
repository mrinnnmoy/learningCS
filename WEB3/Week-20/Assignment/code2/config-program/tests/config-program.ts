import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import type { ConfigProgram } from "../target/types/config_program";

describe("config-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ConfigProgram as Program<ConfigProgram>;
  const admin = (provider.wallet as anchor.Wallet).payer;

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId,
  );

  it("lets the real admin update the fee", async () => {
    await program.methods
      .initialize(500)
      .accounts({ config: configPda, admin: admin.publicKey })
      .rpc();

    await program.methods
      .updateFee(750)
      .accounts({ config: configPda, admin: admin.publicKey })
      .rpc();

    const config = await program.account.config.fetch(configPda);
    assert.equal(config.feeBps, 750);
  });

  it("rejects a non-admin caller — Concept 2 + Concept 3 enforced together", async () => {
    // A second, non-admin signer — legitimate here only because this
    // is a local test environment (Week 19's Assignment intro), never
    // done in a live-devnet client this course has written.
    const attacker = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      attacker.publicKey,
      LAMPORTS_PER_SOL,
    );
    await provider.connection.confirmTransaction(airdropSig);

    try {
      await program.methods
        .updateFee(9999)
        .accounts({ config: configPda, admin: attacker.publicKey })
        .signers([attacker])
        .rpc();
      assert.fail("Expected update_fee to reject a non-admin signer");
    } catch (err) {
      // has_one violations surface as a ConstraintHasOne error —
      // rejected before the instruction body ever runs.
      assert.include(String(err), "ConstraintHasOne");
    }

    const config = await program.account.config.fetch(configPda);
    assert.equal(
      config.feeBps,
      750,
      "fee must be unchanged after the rejected attempt",
    );
  });
});
