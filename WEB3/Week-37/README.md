# List of things learned.

## 1. Bridge contract architecture. (Source & Destination)

Week 36's own contracts, deployed twice to the same chain.

Could still, even if the assignments never did this. Technically call each other directly, same execution context, same chain.

This week's own `LockBox` (Chain A) and `WrappedToken` (Chain B) genuinely _cannot_:

- they live on two separate chains,
- with no shared address space,
- no shared execution context and
- no delegatecall or CPI (Week 28, Week 11) possible between them at all.

The entire, only channel connecting them is Concept 3's own emitted events, observed and acted on by Concept 4's own relayer.

This is the real, structural fact Week 1's own "how this course is structured" concept and Week 26's own EVM-architecture week were both building toward.

Two blockchains are two genuinely separate worlds and a bridge's own contract architecture is fundamentally about designing for that isolation, not working around it.

---

## 2. Locking assets on the source chain.

Exactly Week 36, Concept 2's own `LockBox`, deployed for real this time to Chain A specifically (anvil, port 8545) rather than alongside its own destination-side counterpart on the same chain.

```solidity
function lock(uint256 amount) external {
    token.transferFrom(msg.sender, address(this), amount);
    emit Locked(msg.sender, amount, nonce, block.chainid);   // block.chainid here is Chain A's OWN id — Concept 6
    nonce++;
}
```

Including `block.chainid` directly in the emitted event, not just relying on the relayer to already know which chain it's watching, is a small, real, easy-to-skip detail worth including deliberately.

It's the exact piece of data Concept 6's own deepened replay protection needs on the destination side, present in the log itself rather than assumed out-of-band by whatever's consuming it.

---

## 3. Emitting cross-chain events. (The entire payload that ever crosses the boundary)

Worth stating as plainly as Concept 1 did.

The emitted `Locked` event (Week 27, Concept 6) is not a notification alongside some other channel of communication, it _is_ the entire message.

Nothing else about Chain A's own state, its balances, its history, anything, is ever visible to Chain B or to the relayer watching it, except whatever fields a source contract deliberately chose to put into an event's own arguments.

This is exactly why Concept 2's own inclusion of `block.chainid` matters as much as it does.

If it weren't in the event, no amount of clever relayer code could recover it after the fact, since the relayer's only view of Chain A at all is through exactly this one channel.

---

## 4. Relayer (and oracle) service design.

The relayer is the one piece of this week's whole system that lives _outside_ any blockchain at all.

A real, standalone process, watching Chain A, deciding when it's safe to act (Concept 7), and submitting real, signed transactions on Chain B.

Worth distinguishing "relayer" from "oracle" precisely, since the syllabus itself uses both words and casual use blurs them.

An **oracle** (Week 41 covers real ones, Chainlink and Pyth, properly) feeds _external, off-chain data_ like:

- a price,
- a weather reading

and more onto a chain.

A **relayer**, this week's own subject, specifically transmits a message _between two chains_, where the "data" is itself just another chain's own on-chain event.

The two roles can overlap in a real system, but they're solving genuinely different problems.

```typescript
async function pollForLockedEvents() {
  const currentBlock = await providerA.getBlockNumber();
  const safeBlock = currentBlock - CONFIRMATIONS_REQUIRED; // Concept 7

  if (safeBlock <= lastProcessedBlock) return;

  const events = await lockBox.queryFilter(
    lockBox.filters.Locked(),
    lastProcessedBlock + 1,
    safeBlock,
  );
  for (const event of events) {
    // ... relay each one (Concept 5)
  }
  lastProcessedBlock = safeBlock;
}

setInterval(pollForLockedEvents, 5000); // POLLING — a deliberate choice, not the only option
```

This week's own relayer polls on a fixed interval, `queryFilter`-ing a specific block range each time, rather than using a live `.on(...)` subscription (Week 32, Concept 6).

A deliberate choice.

A subscription can silently miss events during a brief disconnection, where re-polling the exact same block range on every tick is naturally, automatically resilient to exactly that, at the cost of a small, fixed latency (Week 24's own polling-vs-push distinction, now concretely felt rather than just named).

---

## 5. Minting wrapped assets on the destination chain.

Exactly Week 36, Concept 2's own `WrappedToken.mint`, called for real this time by a genuinely separate off-chain process (Concept 4) submitting a genuinely separate transaction on a genuinely separate chain, rather than a second, same-transaction contract call.

```solidity
function mint(address to, uint256 amount, uint256 sourceNonce) external {
    if (msg.sender != relayer) revert NotRelayer();
    bytes32 messageId = keccak256(abi.encode(sourceChainId, sourceLockBox, sourceNonce));   // Concept 6
    if (processedNonces[messageId]) revert AlreadyProcessed();
    processedNonces[messageId] = true;
    _mint(to, amount);
}
```

The relayer's own wallet on Chain B (Concept 4's script holds a real private key for THIS chain specifically) is what makes `msg.sender == relayer` true.

Worth noticing this is a genuinely different private key context than anything locking on Chain A needed, since Chain A and Chain B don't share account state any more than they share anything else (Concept 1).

---

## 6. Replay protection across chains, deepened from Week 36.

Week 36, Concept 9's own `processedMessages` mapping, keyed on `(recipient, amount, nonce, block.chainid, address(this))`, was already correct for that week's own single-chain simulation.

But `block.chainid` there always evaluated to the _destination's own_ chain ID, since that's the only chain the check itself ever ran on.

This week's real, two-chain setup exposes a subtler, genuinely important refinement.

The replay key needs the **source** chain's ID too, not just the destination's or an identical `LockBox` contract, redeployed to some unrelated third chain with the same nonce sequence starting from zero again, could produce a message that collides with.

And would be wrongly accepted as a valid replay-protected duplicate of a completely unrelated, legitimate one from the real source chain.

```solidity
bytes32 messageId = keccak256(abi.encode(sourceChainId, sourceLockBox, sourceNonce));
//                                        ^^^^^^^^^^^^^ the SOURCE chain's id, carried in the event
//                                                       itself (Concept 2), not assumed or reconstructed
```

`sourceLockBox`'s own address is included for exactly the same reason, one level down.

Even on the _same_ source chain, a nonce sequence is only unique per-contract, not globally.

Two different `LockBox` deployments on the identical chain would each start their own nonce at `0` independently.

---

## 7. Handling finality differences between chains.

Different chains give genuinely different guarantees about when a block, once produced, is actually safe to treat as permanent.

`anvil`'s own local chains, this week's own testing environment, are deterministic and instant by construction, no real reorg risk exists at all in ordinary use.

But Hard's own assignment uses `anvil`'s own snapshot/revert cheat RPC methods specifically to simulate exactly the scenario a real chain's own probabilistic-then-finalized model (Sepolia; mainnet, both under real proof-of-stake consensus, Week 2's own consensus concept) can genuinely produce, a block that looked real and final a moment ago, quietly gone.

A relayer that acts the instant it sees an event, with zero confirmations, risks relaying something that later turns out to have been reorged away entirely.

Concept 4's own `CONFIRMATIONS_REQUIRED` constant, subtracted from the current block height before ever querying for events, is the entire, simple mitigation.

Wait a fixed number of additional blocks past an event before treating it as safe to act on, trading a small amount of latency for real protection against exactly this.

```
cast rpc evm_snapshot --rpc-url http://127.0.0.1:8545          # remember this exact chain state
# ... some transactions happen ...
cast rpc evm_revert '["0x0"]' --rpc-url http://127.0.0.1:8545   # roll Chain A back — a simulated reorg
```

A real production bridge tunes `CONFIRMATIONS_REQUIRED` to match the specific source chain's own real finality characteristics.

A chain with fast, strong finality needs fewer.

One with slower, more probabilistic finality needs more.

A real, specific number this week's own assignments don't have to get exactly right for a real chain, since `anvil` needs none of this by default.

The mechanism, not this week's specific constant, is the actual point.

---

## 8. Testing bridge flows end-to-end.

Everything in Concepts 1 through 7 only actually proves itself once run together, for real.

Two live chains, real contracts deployed to each, a real relayer process genuinely running in its own terminal and a real transaction on one chain producing a real, observable effect on the other, entirely on its own, without a human manually triggering the second half.

This is a genuinely different kind of verification from every previous week's own `forge test` suite.

A unit test proves a contract's own logic is correct in isolation (this week's own contracts still get exactly that, in Easy and Hard's own test files, reusing `vm.sign` exactly as Week 36 did), but only a real, live, multi-process run proves the _system_, contracts plus relayer plus two genuinely separate chains, actually works end to end.

Which is exactly why this week's own Manual Test Cases are, more than any previous week's, literal, step-by-step, multi-terminal instructions rather than a single command's worth of output.

---

## 9. The full lifecycle of one cross-chain transfer, start to finish.

```
Chain A                          Relayer (off-chain)                    Chain B
────────                          ────────────────────                   ────────
user calls lock(100)
  │
  ▼
LockBox emits
Locked(user, 100, nonce, 31337)
  │
  │            ◄── polls Chain A every 5s (Concept 4) ──┤
  │                waits for CONFIRMATIONS_REQUIRED       │
  │                more blocks (Concept 7)                │
  │                                                         │
  │                sees the event, safely confirmed          │
  │                                                            ▼
  │                                              calls WrappedToken.mint(
  │                                                user, 100, nonce
  │                                              )
  │                                                            │
  │                                                            ▼
  │                                              messageId checked against
  │                                              processedNonces (Concept 6)
  │                                                            │
  │                                                            ▼
  │                                              real wTOKEN minted to user
```

Every concept this week is one arrow or one box in this exact diagram.

Worth returning to directly while working through the assignments below, each of which builds and runs a real, working piece of it.

---

## Assignment.

1. **Easy - Deploying Real Contracts to Two Real, Separate Chains.**

   **What you practice:**
   - Confirming two `anvil` instances are genuinely separate chains, not just two ports (Concept 1)
   - Deploying `LockBox` to Chain A and `WrappedToken` to Chain B, each configured with the OTHER chain's own real identifying information (Concept 6's own `sourceChainId`/`sourceLockBox`)
   - Contract-level correctness via `forge test`, reused directly from Week 36's own pattern

   **Requirements:**
   - A `MockERC20` and `LockBox` (Week 36's own shape, with `block.chainid` added to the `Locked` event per Concept 2), deployed to Chain A only.
   - A `WrappedToken` (Week 36's own shape, with `sourceChainId`/`sourceLockBox`-aware replay protection per Concept 6), deployed to Chain B only, constructed with Chain A's own real chain ID (`31337`) and `LockBox`'s own real, just-deployed address.
   - A `forge test` suite confirming `WrappedToken.mint` correctly accepts a well-formed message and rejects an exact replay, using `vm.sign` exactly Week 36's own pattern (this part runs against a single, ordinary local Foundry test EVM — completely appropriate for unit-testing one contract's own logic in isolation, distinct from the live, two-chain deployment above).

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command (from a terminal, against BOTH chains separately):
         cast call <LOCKBOX_ADDRESS> "token()(address)" --rpc-url http://127.0.0.1:8545
         cast call <WRAPPEDTOKEN_ADDRESS> "sourceChainId()(uint256)" --rpc-url http://127.0.0.1:8546

       Expected output: the first returns the real MockERC20 address on
       Chain A; the second returns `31337` — confirming WrappedToken,
       deployed on CHAIN B, correctly knows Chain A's own real chain ID,
       not its own (`31338`) — the exact cross-chain awareness Concept 6
       depends on.

   2. Command:
         cast balance <YOUR_ADDRESS> --rpc-url http://127.0.0.1:8545
         cast balance <YOUR_ADDRESS> --rpc-url http://127.0.0.1:8546

       Expected output: two DIFFERENT balances (both chains started with
       the same default funded accounts, but Chain A has already spent gas
       deploying MockERC20+LockBox while Chain B has only deployed
       WrappedToken) — confirming directly, numerically, that these are
       two genuinely separate chains with genuinely separate state, not
       one chain viewed through two ports.

   3. Command: forge test -vv

       Expected output:
         Ran 2 tests for test/WrappedTokenReplayProtection.t.sol:WrappedTokenReplayProtectionTest
         [PASS] testFix_IdenticalNonceRevertsOnReplay()
         [PASS] testFix_ValidMintSucceedsOnce()

   4. Action: attempt to call `mint` directly via `cast send` from a
       NON-relayer account against the live Chain B deployment:
         cast send <WRAPPEDTOKEN_ADDRESS> "mint(address,uint256,uint256)" <YOUR_ADDRESS> 100000000000000000000 0 \
           --rpc-url http://127.0.0.1:8546 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       Expected result: reverts with `NotRelayer()` — confirming the LIVE
       deployment enforces the exact same access control the unit test
       already confirmed in isolation, closing the loop between Test
       Case 3's own unit test and a real, live transaction.
   ```

2. **Medium - A Real Relayer Service, Watching Chain A, Minting on Chain B.**

   **What you practice:**
   - Building and running the actual relayer service from Concept 4, for real, as its own long-running process
   - Polling with a confirmations safety margin, rather than an instant, unconfirmed reaction (Concepts 4, 7)
   - Watching one full lock → relay → mint cycle happen live, entirely on its own, once the relayer is running

   **Requirements:**
   - Reuse Easy's own two live deployments (`LockBox` on Chain A, `WrappedToken` on Chain B) — no redeploy needed.
   - A `relayer.ts` script: polls Chain A every 5 seconds, waits for `CONFIRMATIONS_REQUIRED = 3` additional blocks past any `Locked` event before treating it as safe (Concept 7), calls `WrappedToken.mint(user, amount, nonce)` on Chain B for each newly-confirmed event, and tracks `lastProcessedBlock` in memory so it never re-processes the same range twice.
   - The script logs clearly, at each step: what it saw on Chain A, when it decided an event was safely confirmed, and the resulting Chain B transaction hash once relayed.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Action: with the relayer running in its own terminal (How to
       Build, step 3), watch its own log output for about 15-20 seconds
       with no other activity.

       Expected result: repeated `[relayer] nothing new and confirmed
       yet` lines, roughly every 5 seconds — confirming the poll loop
       itself is genuinely alive and running, Concept 4's own polling
       design made visible.

   2. Action, from a SEPARATE terminal, lock real tokens on Chain A:
         cast send <MOCKERC20_ADDRESS> "approve(address,uint256)" <LOCKBOX_ADDRESS> 100000000000000000000 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
         cast send <LOCKBOX_ADDRESS> "lock(uint256)" 100000000000000000000 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

       Then watch the relayer's own terminal, without touching it at all.

       Expected result: within roughly 5-20 seconds (one poll cycle, plus
       however long it takes `anvil` to naturally produce 3 more confirming
       blocks — `anvil`'s own default block time may need a few more
       `cast send`/`cast rpc anvil_mine` calls against Chain A to actually
       advance if it's configured for on-demand rather than interval
       mining), the relayer's own log shows the event being found, then a
       real Chain B transaction hash — entirely on its own, no human
       triggering the second half of the flow.

   3. Command, once the relayer's log shows a successful mint:
         cast call <WRAPPEDTOKEN_ADDRESS> "balanceOf(address)(uint256)" <YOUR_ADDRESS> --rpc-url http://127.0.0.1:8546

       Expected output: `100000000000000000000` — confirming the real,
       live mint on Chain B genuinely happened, independently verified
       from a terminal that has nothing to do with the relayer process
       itself.

   4. Action: stop the relayer process (Ctrl+C), lock a SECOND amount on
       Chain A while it's down, wait about 20 seconds, then restart it
       (`npx tsx src/relayer.ts` again, a fresh process with
       `lastProcessedBlock` reset to `0`).

       Expected result: the relayer picks up and relays the second lock
       event on its very first poll after restarting — confirming the
       system tolerates the relayer itself going down temporarily, a real,
       practical property worth confirming directly rather than assuming;
       note plainly that resetting `lastProcessedBlock` to `0` on every
       restart means it will also re-scan (harmlessly, since `WrappedToken`
       already marked the earlier nonce as processed — Concept 6's own
       defense doing double duty here) every block from the very start each
       time, a real, honest limitation of this simplified script worth
       noticing rather than presenting as production-ready.
   ```

3. **Hard - Replay Protection Across a Simulated Reorg and a Full Bidirectional Round Trip.**

   **What you practice:**
   - Simulating a real reorg on Chain A using `anvil`'s own snapshot/revert cheat methods, and confirming a relayer with a real confirmations margin never acts on the event that gets rolled back (Concept 7)
   - Extending the relayer to watch Chain B for burns and relay them back to Chain A, completing Concept 9's own full round-trip diagram for real
   - A genuinely malicious attempt: manually crafting and submitting a `mint` call that copies a real, already-relayed message's exact parameters, confirming it fails against the live deployment, not just in a unit test

   **Requirements:**
   - Extend `relayer.ts` (Medium's own script) with a second poll loop, watching `WrappedToken`'s own `Transfer` events specifically where `to == address(0)` (a burn, Week 28, Concept 3's own `address(0)` convention) on Chain B, calling `LockBox.unlock(user, amount)` on Chain A in response — the reverse half of Concept 9's own diagram.
   - A demonstrated reorg: snapshot Chain A, lock tokens, confirm the relayer has NOT yet acted (fewer than `CONFIRMATIONS_REQUIRED` blocks have passed), revert Chain A back to the snapshot, confirm the `lock()` transaction and its event are now genuinely gone, and confirm the relayer correctly never mints for it at all.
   - A test (real, live, via `cast send`, not a unit test) attempting to replay an already-successfully-relayed mint's exact `(user, amount, nonce)` triple directly against the live `WrappedToken` deployment, confirming it reverts `AlreadyProcessed()`.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command — snapshot, then lock, WITHOUT waiting for confirmations:
         cast rpc evm_snapshot --rpc-url http://127.0.0.1:8545
         (note the returned snapshot ID, e.g. "0x1")
         cast send <MOCKERC20_ADDRESS> "approve(address,uint256)" <LOCKBOX_ADDRESS> 50000000000000000000 \
           --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
         cast send <LOCKBOX_ADDRESS> "lock(uint256)" 50000000000000000000 \
           --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

       Immediately check the relayer's own log (within a few seconds,
       well under the time 3 confirming blocks would need to accumulate).

       Expected result: the relayer has NOT yet relayed this lock — it's
       still within `CONFIRMATIONS_REQUIRED`'s own safety window
       (Concept 7), exactly the state the next step depends on.

   2. Command — revert Chain A back to the snapshot, simulating a reorg
       that erases the lock entirely:
         cast rpc evm_revert '["0x1"]' --rpc-url http://127.0.0.1:8545

       Expected result: querying Chain A for that transaction hash now
       returns nothing at all — it genuinely never happened, from the
       chain's own current point of view. Let the relayer continue running
       for another 30-60 seconds.

   3. Action: check the relayer's own log output, and independently
       confirm on Chain B:
         cast call <WRAPPEDTOKEN_ADDRESS> "balanceOf(address)(uint256)" <YOUR_ADDRESS> --rpc-url http://127.0.0.1:8546

       Expected result: no mint for this specific reorged-away lock ever
       appears in the relayer's own log, and the Chain B balance never
       reflects it — confirming Concept 7's own confirmations margin
       genuinely did its job: had `CONFIRMATIONS_REQUIRED` been `0`, the
       relayer could plausibly have already relayed a lock that, moments
       later, turned out to have never really happened.

   4. Command — attempt a direct replay against the live deployment,
       copying an EARLIER, already-successfully-relayed mint's exact
       parameters from Medium's own Test Case 2 (the real user address,
       real amount, real nonce that already succeeded there):
         cast send <WRAPPEDTOKEN_ADDRESS> "mint(address,uint256,uint256)" <SAME_USER> <SAME_AMOUNT> <SAME_NONCE> \
           --rpc-url http://127.0.0.1:8546 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

       Expected result: reverts with `AlreadyProcessed()` — confirming
       Concept 6's own replay protection holds against a real, live,
       deliberately-repeated transaction, not just Easy's own isolated
       unit test of the identical mechanism.
   ```
