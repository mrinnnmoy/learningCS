# Tutorial: Installing Circom & snarkjs and Running a Real (Toy) Trusted Setup.

This week's own tooling is genuinely new and genuinely deep.

A circuit compiler, a proving/verification toolkit and a real, if deliberately small-scale, trusted setup ceremony (Concept 2 explains exactly why that last part matters).

## 1. Install Circom.

The circuit language this week builds with (written in Rust, building from source via `cargo` has been the long-standing, stable install path; check Circom's own current README for whether a simpler prebuilt binary exists by the time you read this):

```
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
circom --version
```

---

## 2. Install `snarkjs`.

The tool this week uses for the trusted setup ceremony, proof generation, verification and exporting a real, deployable Solidity verifier contract:

```
npm install -g snarkjs
```

---

## 3. Run a real (toy) Powers of Tau ceremony, once, reused across this week's own assignments.

This is genuinely how it works in practice.

A single Powers of Tau file can be reused by any circuit whose own constraint count fits within the size chosen here, exactly what lets Hard's own, different circuit reuse Easy's own ceremony output directly.

```
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="toy contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

---

## 4. A real, honest caution worth stating as plainly as possible.

The ceremony above has exactly **one** contributor, this course.

A real, production-grade trusted setup needs many independent, mutually-distrusting participants (Concept 2 explains precisely why) and this single-contributor version is adequate for learning, for this week's own local/testnet work and genuinely nothing more.

Never reuse this specific `pot12_final.ptau` file for anything handling real value.

---
