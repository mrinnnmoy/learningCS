# List of things learned.

## 1. The cross-chain communication problem.

Every chain this course has touched, Solana (Weeks 10-25) and Ethereum (Week 26 onward), is its own closed, self-consistent system:

- its own validators,
- its own consensus rules,
- its own finality guarantees and critically,

**no native way to observe or verify anything happening on any other chain at all**.

A Solana program can't read Ethereum state.

An Ethereum contract can't read Solana state.

Neither can even confirm the _other chain still exists_ from purely on-chain logic.

This is the entire problem a **bridge** exists to solve. Some mechanism, with its own real trust assumptions (Concept 5), has to observe an event on a source chain and cause a corresponding action on a destination chain.

Every bridge model in this week's own Contents (Concepts 2, 3, 4) is a different answer to exactly this one problem and Concept 9's entire risk catalogue traces back to some assumption in that answer turning out to be wrong.

---

## 2. The lock-and-mint bridge model.

The source chain's real asset gets **locked** (transferred into and held by a bridge contract, never destroyed) and an equivalent amount of a **wrapped** representation gets **minted** on the destination chain:

- a new,
- separate token,
- backed 1:1 by whatever's actually locked.

Reversing the flow burns the wrapped token & unlocks the original.

```
Chain A (source):  LockBox.lock(100 TOKEN)          → real TOKEN held in the LockBox, still exists
Chain B (dest):    WrappedToken.mint(user, 100)     → a NEW token, "wTOKEN," backed by that lock

Chain B (dest):    WrappedToken.burn(100)            → the wrapped supply shrinks back to 0
Chain A (source):  LockBox.unlock(user, 100)         → the ORIGINAL real TOKEN released back
```

The wrapped token's entire value proposition rests on one specific claim, that the lock genuinely happened and genuinely still holds and that whoever's authorized to trigger the corresponding mint (Concept 7) is honest and correct about it.

Easy's own assignment builds exactly this model, with the simplest possible version of that authorization, a single trusted relayer address.

---

## 3. The burn-and-mint bridge model.

Where lock-and-mint (Concept 2) treats one side as "the real asset" and the other as a derivative wrapped representation, burn-and-mint treats _both_ sides symmetrically.

Neither chain holds a permanently-locked reserve, moving the asset from A to B burns it on A and mints an equal amount on B and moving back burns on B and mints on A.

The same total supply, conceptually, split across however many chains currently hold a live minted balance, with no single chain acting as the "backing" for the others.

```
A → B:  NativeTokenA.burn(100)   →   NativeTokenB.mint(user, 100)
B → A:  NativeTokenB.burn(100)   →   NativeTokenA.mint(user, 100)
```

This genuinely requires the token's own contract on _every_ chain it lives on to grant the bridge mint/burn authority from the start, a real, up-front design decision a project has to make when the token itself is first deployed.

It isn't something that can be retrofitted onto an existing, already-deployed token the way a lock-and-mint wrapper can be bolted on after the fact.

---

## 4. Liquidity network bridges.

A genuinely different model from Concepts 2 and 3:

- no minting,
- no burning,
- no wrapped token at all.

Independent liquidity providers pre-fund a real pool of the real asset on _each_ chain a project wants to bridge between (Week 34's own LP mechanics, reused directly at the mechanism level, different purpose).

A user deposits into the source chain's own pool and a relayer (Concept 7) triggers a payout from the _destination_ chain's own, separately-funded pool, out of real, already-existing liquidity, not a freshly minted token.

```solidity
function release(address recipient, uint256 amount) external {
    uint256 fee = (amount * FEE_BPS) / 10000;                                       // LPs earn a fee, Week 34's own model, reused
    uint256 payout = amount - fee;
    if (payout > token.balanceOf(address(this))) revert InsufficientLiquidity();   // a REAL, structural risk
    token.transfer(recipient, payout);
}
```

The real, structural trade-off worth naming directly.

A liquidity network bridge never has a "wrong asset" risk the way a wrapped token can (Concept 9's own catalogue includes exactly that failure mode), but it has a genuinely different one instead.

If a destination pool's own liquidity runs low relative to demand crossing in that direction, transfers simply can't complete until it's rebalanced, a real, observable limit lock-and-mint and burn-and-mint don't share, since neither of those needs a pre-funded destination-side balance at all.

---

## 5. Trusted vs. Trustless bridges. (A spectrum, not a binary)

Every bridge model from Concepts 2 through 4 still needs _something_ to decide when a source-chain event is real and trigger the corresponding destination-chain action.

The real, meaningful question is _what_ that something is and how much independent trust it requires.

|                           | Mechanism                                                                                                                   | Trust required                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single trusted relayer    | One EOA (or one server) watches and signs                                                                                   | Total, a single compromised key is a total, silent failure                                                                                                    |
| Multisig / federation     | M-of-N independent relayers must agree (Concept 7; Medium's own assignment)                                                 | Distributed, requires compromising a threshold, not just one, but still a fixed, known, off-chain set                                                         |
| Light client verification | The destination chain's own contract cryptographically verifies the source chain's own consensus proof directly (Concept 6) | Minimal, no off-chain party needs to be trusted at all, only the source chain's own validators, the same trust a _user_ already places in that chain directly |

This is a real spectrum, not a clean binary the way "trusted" vs. "trustless" sounds.

Medium's own move from Easy's single relayer to an M-of-N multisig is a genuine, meaningful step along it, not yet reaching the far end Concept 6 describes.

---

## 6. Light client verification bridges, in overview.

The trust-minimized end of Concept 5's spectrum.

Rather than trusting a fixed, external set of relayers to correctly report what happened on a source chain, a light client bridge has the _destination chain's own smart contract_ directly verify a cryptographic proof of the source chain's own consensus (a Merkle proof against a block header, checked against that chain's own validator signatures).

The destination contract effectively runs a minimal, on-chain "light client" of the source chain itself, the same _concept_ a light wallet client uses to trust a blockchain without running a full node, applied here contract-to-chain rather than client-to-chain.

This is genuinely difficult to implement correctly and genuinely expensive to run on-chain (verifying another chain's own consensus proof, in Solidity, against real gas costs), which is exactly why most bridges in production today, including this week's own hands-on assignments, still lean on Concept 5's trusted or federated models instead.

Worth understanding as the real state of the art and the direction serious bridge research keeps pushing toward, not built hands-on this week, the same "overview, not hands-on" treatment Week 29 gave ERC-1155 and Week 33 gave the Diamond pattern.

---

## 7. Validator & relayer roles.

The entity actually watching a source chain and triggering the corresponding destination-chain action is doing work genuinely similar to Week 35's own subgraph indexer (watching for events, Week 35 Concept 5), with one real, load-bearing difference.

An indexer only ever _reads_ and stores what it observes.

A relayer _acts_ on it, submitting a real transaction on a different chain entirely, carrying real, direct financial consequences if it acts on something false or gets tricked into acting twice (Concept 9's own replay-attack case study, Hard's own assignment).

"Validator" and "relayer" are sometimes used interchangeably in casual bridge writing, worth distinguishing precisely.

A relayer _transmits_ a message and its proof from one chain to another.

A validator is specifically one of the parties whose _signature or attestation_ makes that message trustworthy in the first place (Concept 5's multisig row).

A bridge can have relayers that aren't themselves validators, simply forwarding already-signed messages on validators' own behalf.

---

## 8. Message-passing protocols, in overview.

Every model in Concepts 2 through 4 is specifically about moving a _token_.

Real, production cross-chain infrastructure (LayerZero, Axelar, Chainlink's CCIP, among others, real, existing protocols worth recognizing by name) generalizes the identical underlying mechanism (an event on a source chain, verified somehow, triggering an action on a destination chain) to carry **arbitrary data**, not just a token balance:

- A cross-chain function call,
- a cross-chain governance vote,
- a cross-chain NFT mint

triggered by a source-chain event that has nothing to do with tokens at all.

A token bridge, structurally, is simply a message-passing bridge whose payload happens to always be "mint/release this amount to this address".

Worth recognizing that a "bridge" and a "generic messaging protocol" aren't two separate things, one is a specific application built on top of the other's own general capability, not built hands-on this week for the same reason Concept 6 stays at overview level.

The general version is a genuinely large, separate topic on its own.

---

## 9. Bridge risks & Historical exploits.

Bridges have been, in dollar terms, among the single most exploited category of smart contract infrastructure in this industry's own history.

Worth knowing a few real, well-documented incidents by name, factually, not to reconstruct them, but because the same handful of root causes recur constantly:

| Incident (real, public history) | Root cause, in one line                                                                                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ronin Bridge (2022, ~$625M)     | A compromised set of validator private keys (Concept 5's own "trust the relayer set" risk, realized directly)                                                                                                                 |
| Wormhole (2022, ~$325M)         | A signature verification bypass, a forged message accepted as if genuinely signed                                                                                                                                             |
| Nomad (2022, ~$190M)            | A broken message-verification initialization that accepted ANY message as valid, including replayed ones (Concept 9's own case study, Hard's assignment, is a small, safe, self-contained version of exactly this root cause) |
| Poly Network (2021, ~$611M)     | Arbitrary cross-chain call execution with insufficient authorization checks on WHO could trigger it                                                                                                                           |

The common thread worth stating plainly.

Almost none of these were flaws in the underlying blockchains themselves (Week 2's own consensus, Week 26's own EVM).

Every one was a flaw in the bridge's own verification logic, exactly the layer Concepts 2 through 8 this week just built up piece by piece.

Hard's own assignment builds and fixes a small, real, self-contained version of Nomad's own root cause directly.

A bridge message with no replay protection at all, replayable indefinitely, then the fix.

---

## 10. Choosing a bridge model for a real use case.

No model from Concepts 2 through 6 is universally correct.

The same "no universally right answer" shape Week 30 and Week 33 both already established for their own respective comparisons.

- **Lock-and-mint** (Concept 2): The natural fit for bridging an asset that already exists and is already valuable on one specific "home" chain, without needing to touch that asset's own original contract at all.

- **Burn-and-mint** (Concept 3): The right choice for a token designed multi-chain from day one, where no single chain is meant to be the canonical "real" one.

- **Liquidity network** (Concept 4): Favored specifically when users want to receive the exact, real, canonical asset on the destination side, not a wrapped derivative and are willing to accept Concept 4's own liquidity-depth limit in exchange.

- **Trust model** (Concept 5): A real, separate axis from all three, layered on top of whichever movement model gets chosen.

A project bridging billions in real value has very different requirements here than a testnet demo does and Week 37's own bridge-building week picks up specifically where this week's own conceptual foundation leaves off, building one of these models for real, across two genuinely separate chains.

---

## Assignment.

1. **Easy - A Lock-and-Mint Bridge with a Single Trusted Relayer.**

   **What you practice:**
   - The lock-and-mint model itself: a real token locked on one side, a wrapped token minted on the other (Concept 2)
   - A relayer's own role, made concrete: observing a `Locked` event and triggering the corresponding mint (Concept 7)
   - The full round trip: lock → mint → burn → unlock

   **Requirements:**
   - A `MockERC20` (the same test-fixture pattern from Weeks 31 and 34, flagged identically) representing the real, source-chain asset.
   - A `LockBox` contract: `lock(uint256 amount)` transfers the real token in and emits `Locked(address indexed user, uint256 amount, uint256 nonce)`; `unlock(address user, uint256 amount)`, `onlyRelayer`, releases real tokens back out.
   - A `WrappedToken` contract (a second, separate ERC20): `mint(address to, uint256 amount)` and `burn(uint256 amount)`, both `onlyRelayer`-gated for minting (burning is caller-initiated, by whoever holds the wrapped tokens).
   - A single, trusted `relayer` address, set at deployment on both contracts, standing in for a real off-chain process this week's own simulation doesn't build.
   - A test running the full round trip: lock real tokens, relayer mints wrapped tokens, burn the wrapped tokens, relayer unlocks the real ones back — confirming the user ends up with exactly what they started with, and that at every intermediate step exactly one side's own balance reflects the current state correctly.

   [Solution](./Assignment/code1/)

   **Final Output.**

   ```
   forge test -vv
   [⠊] Compiling...
   No files changed, compilation skipped

   Ran 2 tests for test/LockAndMint.t.sol:LockAndMintTest
   [PASS] testFix_OnlyRelayerCanMintOrUnlock() (gas: 19159)
   [PASS] testFullRoundTrip_LockMintBurnUnlock() (gas: 135087)
   Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.84ms (609.87µs CPU time)

   Ran 1 test suite in 9.86ms (1.84ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
   ```

2. **Medium - Burn-and-Mint, Gated by an M-of-N Multisig Relayer Set.**

   **What you practice:**
   - The symmetric burn-and-mint model, contrasted directly against Easy's asymmetric lock-and-mint (Concept 3)
   - Real ECDSA signature verification (`ECDSA.recover`, `MessageHashUtils`), Week 3's own digital signatures made concrete in Solidity for the first time this course
   - Moving along Concept 5's own trust spectrum: an M-of-N multisig relayer set instead of Easy's single trusted address

   **Requirements:**
   - Two `NativeToken` contracts (`NativeTokenA`, `NativeTokenB` — identical code, deployed twice, representing the same logical asset native to two different chains), each with `mint`/`burn` gated to their own bridge contract only.
   - A `MultisigBridge` contract (deployed once per "side," same code both times): holds a fixed list of relayer addresses and a `threshold`; `mintWithSignatures(address recipient, uint256 amount, uint256 nonce, bytes[] calldata signatures)` recovers each signature's own signer via `ECDSA.recover`, rejects any signer not in the relayer list or any duplicate signer within the same call, and requires at least `threshold` distinct valid signatures before minting.
   - `mintWithSignatures` also tracks `processedMessages` (keyed by a hash of `recipient`, `amount`, `nonce`, `block.chainid`, and the bridge's own address) and reverts `MessageAlreadyProcessed()` on any repeat — Concept 9's own defense, built in from the start here rather than added later.
   - A test confirming a message signed by fewer than `threshold` relayers is rejected, one signed by exactly `threshold` distinct relayers succeeds, and a repeated identical message (even with fresh, re-collected signatures) still reverts.

   [Solution](./Assignment/code2/)

   **Final Output.**

   ```
   forge test -vv
   [⠊] Compiling...
   No files changed, compilation skipped

   Ran 3 tests for test/BurnAndMintMultisig.t.sol:BurnAndMintMultisigTest
   [PASS] testFix_ExactlyThresholdDistinctSignaturesSucceeds() (gas: 121110)
   [PASS] testFix_FewerThanThresholdSignaturesReverts() (gas: 31681)
   [PASS] testFix_RepeatedMessageRevertsEvenWithFreshSignatures() (gas: 129565)
   Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 2.69ms (2.82ms CPU time)

   Ran 1 test suite in 10.51ms (2.69ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
   ```

3. **Hard - A Liquidity Network Bridge and a Self-Contained Replay-Attack Case Study.**

   **What you practice:**
   - The liquidity network model, no minting or burning anywhere, contrasted directly against Easy and Medium (Concept 4)
   - A small, safe, self-contained reproduction of Nomad's own real root cause (Concept 9): a bridge receiver with NO replay protection at all, exploited, then fixed
   - Reading Medium's own `processedMessages` defense as something that was actually load-bearing, not decorative, by seeing what breaks the instant it's missing

   **Requirements:**
   - A `LiquidityBridgePool` contract (deployed twice, representing each "side"): `addLiquidity(uint256 amount)`, `deposit(uint256 amount, uint256 destinationChainId, address recipient)` (emits `Deposited`, moves real tokens into the SOURCE side's own pool), `release(address recipient, uint256 amount)` charging a `FEE_BPS = 30` (0.3%, Week 34's own fee convention) fee out of the DESTINATION side's own pre-funded liquidity, reverting `InsufficientLiquidity()` if the destination pool can't cover the payout.
   - A `VulnerableBridgeReceiver` contract: `mintWithSignature(address recipient, uint256 amount, uint256 nonce, bytes calldata signature)`, checks the signature is genuinely from the configured `relayer` via `ECDSA.recover`, but has **no replay protection of any kind** — deliberately, Nomad's own real root cause, reproduced safely and locally.
   - A `FixedBridgeReceiver`: identical, but with `processedMessages` tracking added, exactly Medium's own already-correct pattern.
   - A test demonstrating the exact same, single valid signature successfully minting TWICE against `VulnerableBridgeReceiver` (the exploit, made concrete), and a second test confirming the identical replay attempt fails against `FixedBridgeReceiver`.
   - A test demonstrating `release()` reverting `InsufficientLiquidity()` when a destination pool's own balance can't cover a requested payout, Concept 4's own real, structural risk, made concrete rather than only described.

   [Solution](./Assignment/code3/)

   **Final Output.**

   ```
   forge test -vv
   [⠊] Compiling...
   No files changed, compilation skipped

   Ran 2 tests for test/LiquidityNetworkBridge.t.sol:LiquidityNetworkBridgeTest
   [PASS] testExploit_InsufficientDestinationLiquidityReverts() (gas: 18011)
   [PASS] testFix_DepositAndReleaseMovesRealTokensNoMinting() (gas: 197871)
   Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.81ms (579.95µs CPU time)

   Ran 2 tests for test/ReplayAttack.t.sol:ReplayAttackTest
   [PASS] testExploit_SameSignatureMintsTwiceAgainstVulnerableReceiver() (gas: 580938)
   [PASS] testFix_IdenticalReplayFailsAgainstFixedReceiver() (gas: 667023)
   Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.87ms (2.04ms CPU time)

   Ran 2 test suites in 9.87ms (3.68ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
   ```
