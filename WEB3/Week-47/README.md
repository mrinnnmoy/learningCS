# List of things learned.

## 1. ZK-SNARKs vs. ZK-STARKs.

Two real, different families of zero-knowledge proof system, both letting a **prover** convince a **verifier** that a statement is true without revealing _why_ it's true.

The literal meaning of "**zero-knowledge**."

|                            | ZK-SNARK (this week's own hands-on toolchain)                                                        | ZK-STARK                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Proof size                 | Very small (a few hundred bytes, regardless of the underlying computation's own size)                | Larger — tens to hundreds of kilobytes                                                               |
| Trusted setup              | Required (Concept 2) — a real, genuine trust assumption                                              | Not required — "transparent," no secret ceremony at all                                              |
| Underlying cryptography    | Elliptic-curve pairings (Week 3's own asymmetric cryptography, at real depth)                        | Hash-based (Week 3's own hash functions) — no elliptic curves involved at all                        |
| Quantum resistance         | No — pairing-based cryptography is a known, eventual quantum-computing target                        | Yes — hash-based security holds even against a quantum adversary                                     |
| On-chain verification cost | Very cheap, historically — one fixed-cost pairing check regardless of circuit complexity (Concept 8) | Historically more expensive to verify on-chain, though this gap has narrowed with real, ongoing work |

Neither is universally better.

This week's own hands-on work uses a SNARK (Groth16, specifically) for its small proof size and cheap on-chain verification, the more approachable choice for a first, real, working pipeline.

A genuinely trust-minimized or long-term-quantum-safe design would lean STARK instead, at real cost in proof size.

---

## 2. The trusted setup concept.

A SNARK's own setup ceremony (Tutorial, step 3) generates real, secret randomness used to construct the circuit-specific proving and verification keys.

And that randomness, sometimes called "toxic waste," **must be destroyed** after use.

Whoever retains a copy of it could forge a fake, invalid proof that still verifies as genuinely valid, since they'd hold the exact secret the whole proof system's own soundness depends on nobody having.

The real defense is precisely Week 38's own Multi-Party Computation concept, applied here directly.

Many independent, mutually-distrusting participants each contribute their own randomness in sequence and as long as **even one** of them genuinely destroyed their own contribution, the combined ceremony's own toxic waste is unrecoverable by anyone.

Forging a fake proof would require _every single_ participant to have secretly colluded and retained their piece.

This week's own Tutorial ceremony has exactly one contributor (this course itself), explicitly inadequate for anything beyond learning, exactly the same honesty Week 38, Concept 9 applied to its own reconstruct-then-sign demonstration.

---

## 3. Circuit design basics.

A ZK circuit doesn't _run_ the way ordinary code does.

It defines a **relation**, a set of arithmetic constraints (equations) that a valid **witness** (a complete assignment of values to every signal in the circuit) must satisfy simultaneously.

**Signals** are a circuit's own values. Public or private inputs, outputs and intermediate values.

And **constraints** are equations relating them, each one ultimately reducible to the form `a * b = c` (an R1CS, "Rank-1 Constraint System," constraint) that the underlying proving system actually operates on.

Designing a circuit means expressing a real statement ("I know a value that hashes to this public number," Hard's own assignment) entirely as a system of these equations, a genuinely different mental model from writing imperative Solidity or TypeScript.

---

## 4. Circom fundamentals.

Circom is the language this week's own hands-on pipeline is built in.

**Templates** (parameterized circuit definitions, close in spirit to a Solidity contract) declare **signals** and combine them with constraints.

```circom
pragma circom 2.0.0;

template Multiplier() {
    signal input a;
    signal input b;
    signal output c;

    c <== a * b;   // Concept 4's own critical operator — see below
}

component main = Multiplier();
```

The single most important, easiest-to-get-wrong Circom-specific detail.

**`<==`** both _assigns_ a value and _adds a real constraint_ enforcing that assignment.

`c <== a * b` genuinely constrains the circuit so that `c` MUST equal `a * b` for any accepted witness.

**`<--`** only _assigns_, with **no constraint added at all**.

A circuit using `<--` where `<==` was needed compiles perfectly fine and _looks_ correct, but is genuinely **under-constrained**.

A malicious prover can supply any value at all for that signal, entirely disconnected from the values it was supposed to be derived from and still produce a proof that verifies as valid.

This is a real, historically-exploited vulnerability class in deployed ZK circuits, not a hypothetical footnote.

Easy's own assignment builds and demonstrates exactly this failure directly.

---

## 5. Noir fundamentals, in overview.

**Noir** (Aztec's own circuit language) takes a genuinely different syntactic approach from Circom's own constraint-declarative feel.

Closer to an ordinary, familiar imperative language (Rust-like), compiling down to its own intermediate representation and able to target multiple different proving backends underneath.

This week's own hands-on work commits to Circom and `snarkjs` specifically, the same "one tool built hands-on, one named and compared" pattern Week 30 used for Hardhat and Foundry.

Noir is real, genuinely used in production (Aztec's own privacy-focused rollup, among others), worth recognizing by name rather than treated as obscure.

---

## 6. zkVMs, in overview: RISC Zero, SP1.

A genuinely different, newer approach from hand-designing a circuit at all (Concepts 3, 4).

A **zkVM** (RISC Zero and SP1 both real, live, actively-developed projects) lets a developer write _ordinary code_.

Real Rust, in both cases and receive a real zero-knowledge proof that the code executed correctly, with **no manual constraint design required at all**.

This is dramatically more approachable for a working developer already comfortable with a real programming language, at a genuine, current cost.

A zkVM's own general-purpose proving is typically slower and produces a less tightly optimized proof than a hand-crafted circuit built specifically for one narrow statement (Concepts 3, 4).

The same "general and accessible" vs. "narrow and optimized" trade-off this course has drawn before (Week 44's own ERC-4337 smart accounts vs. Solana's own native flexibility comes to mind), applied here to proof generation specifically.

---

## 7. Proof generation & Verification flow.

The real, concrete pipeline every one of this week's own assignments runs, start to finish.

```
circom circuit.circom --r1cs --wasm --sym                                               # compile — Concepts 3, 4
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey                   # circuit-specific setup (Concept 2)
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey                            # (toy — one contributor, Tutorial step 4)
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

node circuit_js/generate_witness.js circuit_js/circuit.wasm input.json witness.wtns     # from REAL, PRIVATE inputs

snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json            # the actual proof
snarkjs groth16 verify verification_key.json public.json proof.json                     # OFF-chain verification
```

Every step here is real and runs locally.

Nothing about generating or verifying a proof requires a blockchain at all.

Concept 8 covers the genuinely separate, additional step of verifying the identical proof **on-chain** instead.

---

## 8. On-chain proof verification: verifier contracts.

`snarkjs` can export a real, complete, deployable Solidity contract directly from a circuit's own verification key.

Not something this week's own assignments hand-write, generated automatically from real, audited cryptographic logic.

```
snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
```

The generated contract's own `verifyProof` function performs the real elliptic-curve pairing check (Concept 1's own SNARK-specific mechanism) directly inside the EVM.

Genuinely expensive per pairing operation (Week 26, Concept 3's own gas model), but a **fixed** cost, regardless of how large or complex the underlying circuit's own statement was.

This is a SNARK's own "succinct" promise, made completely concrete.

Verifying a proof about a circuit with ten constraints and verifying a proof about one with ten million constraints costs the _same_ real gas on-chain, since the verifier never re-executes the circuit itself at all, it only checks the one, fixed-size cryptographic proof.

Medium's own assignment deploys this exact generated contract and measures this fixed cost directly.

---

## 9. Real-world ZK use cases.

**Private transactions**:

- _Tornado Cash_ : A real, historical, publicly-documented Ethereum application, used exactly this week's own kind of circuit to let a user prove they deposited funds earlier without revealing which specific deposit was theirs.

  Named here factually, as real history, not an endorsement, the same treatment this course has given other real, named historical systems.

**Private identity and credentials**: Proving a real, verifiable fact ("I am over 18," "I hold a specific, valid credential") without revealing the underlying private data itself (an exact birthdate, a full identity document).

Hard's own assignment builds a small, concrete version of exactly this shape, proving knowledge of a secret without ever revealing it.

**ZK-rollups** (Week 43, Concept 4): This week's entire pipeline is the real machinery sitting underneath that concept's own "validity proof," no longer an unexplained black box.

A real rollup's own circuit proves an entire batch of transactions was executed correctly, at a genuinely larger scale than this week's own hands-on examples, but using the identical underlying mechanism.

---

## 10. The full pipeline, from a private secret to an on-chain decision.

```
Prover (off-chain, has the real secret)         Verifier contract (on-chain)
────────────────────────────────────────         ─────────────────────────────
knows a real, PRIVATE input
(Concept 3's own witness)
        │
        ▼
compiles the circuit (Concept 4)
generates a witness
generates a real SNARK proof (Concept 7)
        │
        ▼
submits ONLY the proof + PUBLIC
signals — the private input
NEVER leaves the prover's own machine ──────►  verifyProof(proof, publicSignals)
                                                        │
                                                        ▼
                                                one fixed-cost pairing check
                                                (Concept 8) — succeeds only if
                                                a genuinely valid witness
                                                exists, without the contract
                                                ever learning what it was
                                                        │
                                                        ▼
                                                grants access / accepts the
                                                transaction / etc.
```

Hard's own assignment runs this exact diagram for real.

A genuine secret, never submitted on-chain, proven known and a real Solidity contract making a real access-control decision based purely on that proof.

---

## Assignment.

1. **Easy - Your First Circuit, End to End, and the `<==` vs. `<--` Vulnerability.**

   **What you practice:**
   - The complete circuit → setup → witness → proof → off-chain verification pipeline, for real (Concept 7)
   - `<==` vs. `<--`, and the real, concrete under-constrained-circuit vulnerability the wrong one produces (Concept 4)

   **Requirements:**
   - A `multiplier.circom` circuit: private inputs `a`, `b`; public output `c`, correctly constrained via `c <== a * b`.
   - Run the full pipeline: compile, circuit-specific setup (reusing the Tutorial's own `pot12_final.ptau`), generate a witness for real, chosen private inputs, generate a proof, and verify it off-chain — confirming a genuine success.
   - A second circuit, `broken_multiplier.circom`: identical in every other respect, but using `c <-- a * b` instead — deliberately under-constrained.
   - A demonstration that `broken_multiplier`'s own compiled circuit accepts a witness where `c` does NOT actually equal `a * b` at all, and that `snarkjs` still produces a proof that verifies as valid for this genuinely false statement — Concept 4's own real vulnerability, made concrete rather than only described.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: snarkjs groth16 verify verification_key.json public.json proof.json
         (against the CORRECT multiplier.circom, a=7, b=6)

         Expected output: "[INFO] snarkJS: OK!" — a genuine, valid proof for
         a true statement, verified successfully, confirming Concept 7's own
         full pipeline works end to end.

   2. Command: cat public.json

         Expected output: `["42"]` — the public output, `42` (7*6),
         confirming the correct circuit genuinely computed and exposed the
         real result as its own public signal.

   3. Action: manually edit witness generation for broken_multiplier so
         that `c` is supplied as `999` instead of the real product `42`
         (Circom's own witness calculator, being unconstrained here, will
         accept this without complaint) — the `generate_witness.js` script
         itself computes `c` from the circuit's own logic, so demonstrating
         this concretely requires inspecting the generated witness file
         directly, or modifying the witness calculation step to substitute
         an arbitrary value for the unconstrained signal, then running the
         remaining proof/verify steps against that tampered witness.

         Expected result: `snarkjs groth16 verify` still reports "OK!" for a
         proof built around `c = 999`, a value with NO real relationship to
         `a * b` at all — confirming Concept 4's own real claim directly: an
         under-constrained circuit's own proof system has no way to detect
         or reject this, since nothing in the circuit ever required `c` to
         actually equal `a * b` in the first place.

   4. Action: compare `multiplier.r1cs` and `broken_multiplier.r1cs`'s
         own constraint counts directly:
         snarkjs r1cs info multiplier.r1cs
         snarkjs r1cs info broken_multiplier.r1cs

         Expected output: `broken_multiplier.r1cs` reports FEWER real
         constraints than `multiplier.r1cs` — a genuine, inspectable,
         compile-time signal that something was never actually enforced,
         worth knowing to check directly on any real circuit before trusting
         it, not just something to notice after an exploit already happened.
   ```

2. **Medium - On-Chain Verification: Deploying the Real, Generated Verifier Contract.**

   **What you practice:**
   - Deploying `snarkjs`'s own real, automatically-generated Solidity verifier, not something hand-written (Concept 8)
   - Confirming a genuine proof verifies on-chain, and a tampered one is correctly rejected
   - Measuring the real, fixed gas cost of on-chain verification directly

   **Requirements:**
   - Export the real Solidity verifier from Easy's own correct `multiplier_final.zkey`.
   - A Foundry project deploying that exact, unmodified generated contract.
   - A test calling the real, generated `verifyProof` function with Easy's own real, generated proof and public signal, confirming it returns `true`.
   - A test calling the identical function with ONE digit changed in the public signal (a tampered `"41"` instead of the real `"42"`), confirming it returns `false`.
   - A test measuring the real gas cost of a successful `verifyProof` call directly.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv --gas-report

         Expected output shape:
         Ran 3 tests for test/OnChainVerification.t.sol:OnChainVerificationTest
         [PASS] testExploit_TamperedPublicSignalFailsVerification()
         [PASS] testFix_OnChainVerificationHasARealFixedGasCost()
         [PASS] testFix_RealProofVerifiesOnChain()

   2. Command: forge test --match-test testFix_RealProofVerifiesOnChain -vvvv

         Expected output: a trace showing the REAL, generated verifier
         contract's own internal elliptic-curve precompile calls (Week 26's
         own gas model, applied to genuinely specialized opcodes this course
         hasn't used before) — confirming this is real cryptographic
         verification running on-chain, not a mocked "always returns true"
         stand-in.

   3. Command: forge test --match-test testFix_OnChainVerificationHasARealFixedGasCost -vv

         Expected output: a real, printed gas number, comfortably under
         `300_000` — confirming Concept 8's own fixed-cost claim with a real
         measurement.

   4. Action: generate a proof for a COMPLETELY different circuit with
         many more constraints (any circuit from a real, public Circom
         example repository works), export ITS own calldata the same way,
         and compare its own `verifyProof` gas cost against this test's own
         number.

         Expected result: the two gas numbers are close, despite one
         circuit's own underlying computation being far larger than the
         other's — confirming Concept 8's own "succinct" claim isn't
         specific to this one, small `multiplier` example, it's a real,
         general property of Groth16 verification itself.
   ```

3. **Hard - A Private, Preimage-Based Access Control Contract, Fully On-Chain Verified.**

   **What you practice:**
   - A genuinely more realistic circuit, using `circomlib`'s own real, standard, ZK-friendly Poseidon hash template
   - A complete, real "prove you know a secret without revealing it" flow, deployed and verified on-chain (Concept 9's own private-identity use case, made concrete)
   - Replay protection (Week 36's own exact lesson) applied to a genuinely new context: preventing the identical valid proof from being reused

   **Requirements:**
   - A `preimage.circom` circuit: private input `secret`; public input `expectedHash`; a constraint using `circomlib`'s real `Poseidon` template confirming `Poseidon(secret) == expectedHash`.
   - The full pipeline (Concept 7), reusing the Tutorial's own `pot12_final.ptau`, for a real, chosen secret and its real Poseidon hash.
   - A `PrivateAccessControl` contract: holds a real, deployed `Groth16Verifier` (Medium's own pattern) and the real, public `expectedHash`; `claimAccess(proof, publicSignals, nonce)` verifies the proof against the stored `expectedHash`, reverts on an invalid proof, reverts `ProofAlreadyUsed()` if the identical `(proof hash, nonce)` combination has been submitted before, and grants a real, on-chain, per-address `hasAccess` flag only on success.
   - A test: the legitimate secret-holder's real proof grants access; the identical proof, resubmitted with the same nonce, fails; a proof generated for a DIFFERENT, wrong secret fails outright.
   - A `ZK_DESIGN_NOTES.md` arguing SNARK vs. STARK and comparing this hand-built-circuit approach against a zkVM (Concept 6), specifically for this access-control use case.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

         Expected output shape:
         Ran 3 tests for test/PrivateAccessControl.t.sol:PrivateAccessControlTest
         [PASS] testExploit_IdenticalProofCannotBeReplayed()
         [PASS] testExploit_TamperedProofFailsOutright()
         [PASS] testFix_ValidProofGrantsAccessWithoutRevealingTheSecret()

   2. Command: forge test --match-test testFix_ValidProofGrantsAccessWithoutRevealingTheSecret -vvvv

         Expected output: a trace showing `claimAccess` genuinely calling
         into the real `Groth16Verifier`, succeeding, and setting
         `hasAccess[claimant] = true` — with the real secret (`123456789`)
         appearing NOWHERE in the trace, the calldata, or any emitted event
         — confirming Concept 9's own private-identity use case directly:
         real, on-chain proof of knowledge, zero real disclosure.

   3. Command: forge test --match-test testExploit_IdenticalProofCannotBeReplayed -vvvv

         Expected output: a trace showing the second `claimAccess` call
         reverting on the `usedProofs` check, BEFORE ever reaching the real
         verifier call at all — confirming the replay guard short-circuits
         cheaply, rather than re-running an expensive cryptographic check
         only to reject the result afterward.

   4. Action: re-read Concept 2 and Concept 6, then fill in
         ZK_DESIGN_NOTES.md's own three sections with real, specific
         reasoning about `PrivateAccessControl` as it's actually built here
         — not a generic restatement of the Concept 1 comparison table.
         There's no single "correct" wording Foundry can check here; the
         point is a real, argued position, the same standard every previous
         week's own design-document deliverable has been held to.
   ```
