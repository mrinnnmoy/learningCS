import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import type { CounterAnchor } from "../target/types/counter_anchor";

describe("counter-anchor", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CounterAnchor as Program<CounterAnchor>;

  it("initializes and increments the counter", async () => {
    const payer = provider.wallet.publicKey;

    const [counterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter"), payer.toBuffer()],
      program.programId,
    );

    await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        payer,
      })
      .rpc();

    let state = await program.account.counterAccount.fetch(counterPda);

    assert.equal(state.count.toNumber(), 0);

    await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        payer,
      })
      .rpc();

    state = await program.account.counterAccount.fetch(counterPda);

    assert.equal(state.count.toNumber(), 1);
  });
});
