# Tutorial: First-Time Solidity + Foundry Environment Setup.

This is the first week that actually writes and runs Solidity and Foundry is the project tooling from day one.

Not just as a preference between two options, but because Week 29's OpenZeppelin contracts are distributed as a Foundry-installable dependency (`forge install`) and integrate cleanly with Foundry's own remapping system.

Standing up Hardhat only from Week 30 onward, once Week 30 gives it a real, fresh, from-scratch treatment of its own, avoids ever having to migrate a dependency setup mid-arc.

Per your standing instruction, Weeks 27-29 deliberately stay at `forge build` / `forge script` level only, no `forge-std` test contracts, no `test/` folder, nothing under a `.t.sol` file.

Since testing isn't formally in scope until Foundry's own dedicated testing treatment later in this arc; every Manual Test Case below is literal, runnable CLI verification instead:

- `anvil` for a local chain,
- `forge script` to deploy to it,
- `cast send`/`cast call`/`cast logs` to interact with and inspect what actually happened.

Easy and Medium both run entirely against a local `anvil` instance using its own well-known, publicly-documented, valueless default dev accounts, seeded with 10,000 test ETH automatically, so neither needs a wallet you create, an RPC endpoint, or any real testnet ETH.

Hard is the one exception and needs your own real, first Sepolia wallet. Flagged explicitly where it comes up below.

## 1. Install Foundry.

```
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

`foundryup` always installs whatever Foundry's current stable release is.

Check what you actually landed on rather than assuming a fixed number, since Foundry ships stable updates often:

```
forge --version
cast --version
anvil --version
```

---

## 2. Confirm the Solidity compiler version.

As of this week, `0.8.36` is the latest stable release (Solidity ships frequent point releases too, so treat this as a starting pin, not a permanent one).

Foundry manages `solc` versions for you via `svm` under the hood, you don't install it separately, you pin it in `foundry.toml`:

```toml
[profile.default]
solc = "0.8.36"
src = "src"
test = "test"
```

The very first `forge build` in any project auto-downloads that exact `solc` version if it isn't cached locally already.

---

### 3. Scaffold a Foundry project.

`forge init` does for Solidity what `anchor init` (Week 15) did for an Anchor program.

And what `npm init` plus manual `tsconfig.json` did for every plain TypeScript client script since Week 12: one command, a working skeleton.

`forge-std` (the Foundry equivalent of Anchor's own test helpers) already wired in as a dependency.

```
forge init counter
cd counter
forge build
forge test
```

A fresh `forge init` ships with its own example `Counter.sol`.

A clean `forge build` confirms the whole toolchain (Foundry itself, the pinned `solc`) is working before Contents and Assignment below.

`forge init`'s scaffold also includes a `test/` folder and `forge-std` as a dependency by default. Both are left untouched and unused through Week 29, on purpose, not deleted, since Week 30 revisits testing properly and there's no benefit to fighting the default scaffold in the meantime.

---

## 4. Start a local chain for Easy and Medium.

In a separate terminal, leave this running for the rest of this week's Easy and Medium work:
 
```
anvil
```
 
This prints 10 pre-funded accounts and their private keys, well-known, publicly documented in Foundry's own docs, worth zero outside this local chain, not credentials you generate or manage yourself.

Easy and Medium both deploy to and interact with this local chain exclusively.

No wallet you create, no RPC endpoint beyond `http://127.0.0.1:8545` (anvil's default), no real ETH.

**Hard is different** and needs your own real, first Sepolia wallet, Foundry stores it as an encrypted local keystore rather than a raw private key sitting in a file, covered in Hard's own How to Build section below, not here, since Easy and Medium never touch it.

---