# Tutorial: Installing the Real ERC-4337 Reference Contracts.

This week's contracts talk directly to a real, live, canonical infrastructure contract already deployed on Sepolia and every major EVM chain. Not something this course deploys itself.

## 1. Install the official ERC-4337 reference contracts.

Pinned to a specific release for stability, the same discipline Week 29's own OpenZeppelin install established:

```
forge install eth-infinitism/account-abstraction@v0.8.0 --no-commit
echo 'account-abstraction/=lib/account-abstraction/contracts/' >> remappings.txt
```

---

## 2. Note the real, canonical EntryPoint address.

Deployed via `CREATE2` through a deterministic factory, meaning it lands at the _identical_ address on Ethereum mainnet, Sepolia and essentially every EVM chain that supports it at all:

```
EntryPoint v0.8: 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108
```

This is real, live, production infrastructure other real wallets already use.

This week's own assignments deploy fresh smart account contracts, but every one of them talks to this exact same, already-deployed `EntryPoint`.

---

## 3. A real, genuinely important detail: Testing against it locally requires forking Sepolia.

Exactly Week 30, Concept 6's own forking pattern, reused for a new purpose.

A plain, unforked `forge test` runs against a fresh, empty local EVM with _nothing_ deployed at the `EntryPoint`'s own address.

Forking is what makes its real, live bytecode actually present during a test.

```solidity
function setUp() public {
    vm.createSelectFork(vm.rpcUrl("sepolia"));   // makes the REAL EntryPoint's real bytecode available locally
    entryPoint = IEntryPoint(0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108);
    // ... deploy this week's own new contracts on top of that real, forked state
}
```

---

## 4. A real, honest caution worth stating plainly.

Matching this course's own treatment of a few other genuinely finicky integrations (Week 41's `MockPyth`, Week 42's `Governor` override boilerplate).

ERC-4337's own `PackedUserOperation` struct and `IAccount` interface are real, current, best-effort code here, but this is real, actively-evolving infrastructure (v0.8 shipped new fields for EIP-7702 support only recently).

If a struct field or function signature doesn't match your exact installed version, that mismatch is the single most likely thing to need a small correction against the current package.

---
