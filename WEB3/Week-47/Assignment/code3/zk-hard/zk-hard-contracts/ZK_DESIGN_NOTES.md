# ZK Design Notes — PrivateAccessControl

## SNARK vs. STARK, for THIS specific use case

For this `PrivateAccessControl` use case, I would choose a SNARK, specifically Groth16, over a STARK.

The main reason is that this contract is designed to perform verification directly on-chain. A user occasionally submits a proof to prove that they know a private secret whose Poseidon hash matches the `expectedHash` stored by the contract. The important cost is therefore the cost of verification on Ethereum, not the cost of generating the proof.

Groth16 is a good fit because verification has a relatively small and fixed on-chain cost. In this project, the generated Solidity verifier uses Ethereum's elliptic-curve precompiles such as `ecmul`, `ecadd`, and `ecpairing`. The underlying circuit contains hundreds of constraints for the Poseidon computation, but the verifier only checks a compact Groth16 proof on-chain.

A STARK would have an important advantage: it does not require the same kind of trusted setup ceremony required by Groth16. However, STARK proofs are generally larger and verification is more expensive to perform directly on-chain. For an access-control contract where verification happens on Ethereum, the cheap and bounded verification cost of a SNARK is more useful.

Therefore, for this specific project, the trade-off is:

- **Groth16 SNARK:** smaller proof and efficient on-chain verification, but requires a trusted setup.
- **STARK:** avoids the trusted setup assumption, but generally produces larger proofs and has a less convenient on-chain verification cost.

Because this application is an on-chain access-control gate rather than a system requiring extremely frequent proof generation or transparent setup above all else, Groth16 is the better fit for the small circuit built here.

However, this conclusion depends on using a trustworthy production ceremony. The toy ceremony used in this assignment would not be sufficient for a real production access-control system.

---

## Hand-built Circom circuit vs. a zkVM (Concept 6), for THIS use case

For this specific access-control problem, a hand-built Circom circuit is a better choice than a zkVM.

The statement being proven is very small and narrowly defined:

> The prover knows a private `secret` such that `Poseidon(secret) == expectedHash`.

The circuit only needs to perform one Poseidon hash computation and constrain its result against a public value. Because the computation is small and well understood, writing a specialized Circom circuit gives direct control over the constraints and keeps the proving statement focused.

Using a zkVM for this particular computation would add abstraction that is not really necessary. A zkVM would allow the developer to write ordinary code, for example in Rust, and have that computation proved automatically. This becomes extremely useful when the computation contains complicated control flow, many branches, large existing codebases, or algorithms that would be difficult and time-consuming to manually convert into arithmetic constraints.

For a single Poseidon hash comparison, however, the benefits of a zkVM are less important. A specialized circuit is simpler to audit because the exact statement being proved is visible directly in the circuit:

```circom
hasher.inputs[0] <== secret;
expectedHash === hasher.out;
```

The hand-built circuit also uses `circomlib`'s standard Poseidon implementation rather than implementing the hash function manually. This provides a useful balance: the application-specific statement is small and easy to inspect, while the cryptographic hash implementation itself comes from an established Circom library.

The trade-off would change if this access-control system became significantly more complicated. For example, a zkVM could become more attractive if the proof needed to demonstrate:

- multiple authentication rules,
- complicated conditional authorization logic,
- verification of existing application code,
- membership in large data structures,
- multiple external computations,
- complex loops or branching,
- or an entire existing program written in a conventional programming language.

At that point, manually designing and maintaining arithmetic constraints could become more difficult than using a zkVM.

For the current system, though, the statement is sufficiently small that a specialized Circom circuit is the more direct and efficient design.

---

## The real trust assumption a user of THIS contract is accepting

A user of this contract is not only trusting the Solidity code and the Groth16 verifier. They are also implicitly trusting the setup process used to generate the proving and verification keys.

This project used a Groth16 circuit-specific setup based on `pot12_final.ptau`, followed by a circuit-specific contribution. Groth16 requires setup material containing randomness that must be handled securely. If the secret "toxic waste" from the setup process were retained by a malicious participant, the security guarantees of the proving system could potentially be compromised.

For this assignment, the setup was intentionally a learning exercise. The contribution was made locally using a simple entropy input, which is sufficient for understanding the mechanics of the Groth16 pipeline but should not be considered a production-grade trusted setup.

Therefore, the real trust assumption in this project is:

> The setup process used for this learning project must be trusted for the proofs to have the intended security properties.

That assumption is acceptable for a local educational assignment because the purpose is to understand the complete pipeline:

1. Compile the Circom circuit.
2. Generate an R1CS constraint system.
3. Perform a Groth16 setup.
4. Generate a witness.
5. Produce a proof.
6. Verify the proof off-chain.
7. Export the Solidity verifier.
8. Verify the proof on-chain.

It would not be appropriate to deploy this exact proving system for a real production access-control application.

A production deployment should instead use a setup with stronger trust guarantees, such as a properly conducted multi-party ceremony. In a multi-party ceremony, security can be preserved as long as at least one participant correctly destroys their secret contribution. This greatly reduces the trust placed in any individual participant compared with a single-contributor setup.

The Solidity verifier also represents a fixed verification key generated for one exact circuit. If the circuit changes, the proving key and verification key must be regenerated, and the deployed verifier would need to be updated or replaced accordingly.

For a real production system, I would therefore require:

- a professionally conducted multi-party trusted setup,
- independent review of the Circom circuit,
- verification that the generated Solidity verifier matches the intended circuit,
- review of the access-control contract and replay-protection logic,
- secure handling of private secrets by users,
- and a carefully planned process for changing or upgrading the circuit.

The important lesson from this project is that zero-knowledge privacy does not remove all trust assumptions. Instead, it moves some security assumptions into the correctness of the circuit, the proving system, the setup ceremony, and the smart contract that decides what to do after a proof is successfully verified.

For this educational implementation, those assumptions are acceptable and the system successfully demonstrates the intended privacy property: a user can prove knowledge of the private secret without placing that secret in the contract calldata, transaction trace, contract storage, or public proof signals.
