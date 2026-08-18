# List of things learned.

## 1. Multisig wallet mechanics, recapped.

Weeks 36 and 38 already built this mechanism twice, from two different angles:

- Week 36's own `MultisigBridge` (raw ECDSA signatures, verified on-chain, no separate confirmation transactions) and
- Week 38's own `SimpleMultisig` (a real `submit`/`confirm`/`execute` flow, each confirmation its own transaction).

Both are real, legitimate shapes for the identical underlying idea.

No single key can act alone.

Easy's own assignment this week places both side by side one more time, deliberately, specifically to connect them to the real, named production tools built on each shape (Concept 3).

---

## 2. Threshold signatures (M-of-N), recapped.

Week 38, Concept 2 drew the precise distinction worth recalling.

A threshold _signature_ scheme (this week, and Weeks 36/38's own multisig work) requires `M` of `N` independent, complete, individually-verifiable signatures before an action is authorized.

Genuinely different from Week 38's own Shamir's Secret Sharing, which combines `M` _pieces_ of one single, otherwise-meaningless secret.

Every multisig this course has built is the signature kind.

Each signer holds their own complete, real private key throughout, never a fragment of anyone else's.

---

## 3. Popular multisig tools. (Safe & Squads)

Worth naming two real, live, widely-used production tools directly, the same factual treatment given to Chainlink and Pyth in Week 41.

- **Safe** (formerly Gnosis Safe) is the dominant multisig on Ethereum and every EVM chain this course has touched.

  A real, audited, open-source implementation of essentially Week 38's own `SimpleMultisig` shape, securing, in aggregate, a genuinely enormous amount of real value across real DAOs, treasuries and institutional custody setups.

- **Squads** is Solana's own closest equivalent.

  Built on Solana's own account model (Week 11) rather than the EVM's, a real, live piece of infrastructure this course's own earlier Solana weeks would have reached for directly had multisig custody come up there.

Neither is built from scratch in this week's own assignments.

Easy's own contracts are simplified, educational versions of exactly what these two real tools do in production, the same relationship this course's own `MockERC20` has always had to a real, audited token implementation.

---

## 4. On-chain governance models.

Week 39, Concept 7 ended its own progressive-decentralization arc at a timelock-gated multisig.

A real, common stopping point, but not the furthest a project can go.

**On-chain governance** replaces that fixed, small, off-chain-agreed signer set with something structurally different.

Anyone holding the relevant token can propose and vote directly, on-chain, with voting power determined by how many tokens they hold (Concept 7) rather than by being one of a handful of pre-selected multisig signers.

This is the full, formalized version of Week 39's own progressive-decentralization endpoint, not a separate idea.

The same underlying question ("who can authorize a change, and how") answered by a fundamentally more open, more participatory mechanism.

---

## 5. Proposal & Voting mechanisms.

A real OpenZeppelin `Governor` proposal moves through a fixed, real lifecycle, each stage enforced directly by the contract itself, not by convention.

```
Pending → (votingDelay blocks pass) → Active → (votingPeriod blocks pass) → Succeeded / Defeated
                                                                                    │
                                                                         (if timelock-gated)
                                                                                    ▼
                                                                                 Queued
                                                                                    │
                                                                    (timelock's own delay passes)
                                                                                    ▼
                                                                                Executed
```

```solidity
uint256 proposalId = governor.propose(targets, values, calldatas, description);   // Pending
governor.castVote(proposalId, 1);                                                  // 0=Against, 1=For, 2=Abstain
governor.queue(targets, values, calldatas, descriptionHash);                       // after voting succeeds
governor.execute(targets, values, calldatas, descriptionHash);                     // after the timelock's own delay
```

`targets`/`values`/`calldatas` describe exactly which real function calls a successful proposal will execute.

A governance proposal isn't a vote on an abstract idea, it's a vote on a specific, pre-committed set of real transactions, visible to every voter before they cast a single vote.

---

## 6. Timelocks in governance.

Weeks 33 and 39 both used `TimelockController` directly.

This week wires it to a `Governor` specifically via `GovernorTimelockControl`, formalizing exactly the relationship Week 39, Concept 6 already described in the abstract.

The Governor decides _what_ should happen and _whether_ enough voters agreed.

The timelock enforces _when_ it's actually allowed to happen, a real, guaranteed delay between a vote succeeding and its own execution, giving every token holder, including ones who voted against or didn't vote at all, real advance notice before a passed proposal takes effect.

```solidity
constructor(IVotes _token, TimelockController _timelock)
    Governor("MyGovernor")
    GovernorVotes(_token)
    GovernorTimelockControl(_timelock)   // the Governor PROPOSES to the timelock; the timelock EXECUTES
{}
```

The timelock itself, once wired this way, should have the Governor as its own sole `PROPOSER_ROLE` and `EXECUTOR_ROLE` holder and its own `DEFAULT_ADMIN_ROLE` renounced entirely.

Medium's own assignment wires and tests exactly this, confirming no remaining EOA can bypass the governance process the whole system exists to enforce.

---

## 7. Token-weighted voting.

`ERC20Votes` (an extension of the plain `ERC20`, Week 29, Concept 1) tracks each holder's voting power via **checkpoints**.

A full history of balance changes over time, not just a current snapshot.

Specifically so a proposal's own voting power can be measured _as of a specific past block_ (`getVotes(account, proposalSnapshotBlock)`), not whatever a holder's balance happens to be _right now_, at the moment they cast a vote.

```solidity
function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
    super._update(from, to, value);   // ERC20Votes' own hook writes a new checkpoint on every transfer
}
```

This checkpoint-based design is precisely why Week 31's own flash-loan attack (Concept 6 there; revisited directly in Hard's own assignment this week) cannot work against a correctly-configured Governor the way it worked against `VulnerableLendingPool`.

An attacker who flash-borrows tokens and delegates them to themselves _after_ a proposal's own voting snapshot block has already passed gains a checkpoint entry that simply doesn't exist yet at the block the proposal is actually measuring their real, historical voting power at that specific past block remains whatever it always was, regardless of what they temporarily hold in the current transaction.

---

## 8. Delegated voting.

A token holder doesn't have to vote themselves at all.

`delegate(address delegatee)` assigns one's own voting power to another address entirely, without transferring the underlying tokens or giving up ownership of them in any other way.

This solves a real, practical participation problem.

Most token holders in most real DAOs never vote directly, delegation lets an engaged, trusted party (a known community member, a specialized delegate) vote on a holder's own behalf, using that holder's own real weight, while the holder retains full economic ownership and can revoke or redirect the delegation at any time by simply calling `delegate` again.

```solidity
govToken.delegate(msg.sender);   // "self-delegate" — the most common first step; voting power is otherwise ZERO
```

A genuinely easy real mistake worth flagging directly.

**An `ERC20Votes` holder who never calls `delegate` at all, not even to themselves, has zero effective voting power**, regardless of their real token balance.

Holding tokens and having _delegated_ voting power are two separate facts the contract tracks separately, on purpose and Medium's own assignment's very first test confirms this distinction concretely.

---

## 9. Quorum & Governance attack vectors.

A **quorum** (`GovernorVotesQuorumFraction`, a percentage of total token supply, checked separately from whether a majority of _cast_ votes were in favor) exists specifically to prevent a real, easy-to-underestimate risk.

A small, coordinated minority passing a proposal not because most token holders genuinely support it, but because most holders simply didn't participate at all and a low-turnout vote counted as if silence meant consent.

Concept 7's own checkpoint mechanism already resolves the single most dangerous _manipulation_ vector, flash-loan voting.

The remaining real risks are more about _legitimate_ process failing to reflect genuine community will:

- **Quorum failure** (Hard's own assignment demonstrates a proposal failing despite unanimous support among the few who actually voted, simply because too few voted at all) and

- **proposal spam** (`proposalThreshold`, a minimum token balance required just to _create_ a proposal in the first place, defends against a low-balance address flooding the system with proposals nobody asked for, forcing real voters to continuously review and reject noise).

---

## 10. The full lifecycle of one real governance proposal, start to finish.

```
Token holders               Governor                    Timelock                  Treasury
──────────────               ────────                    ────────                  ────────
delegate() (Concept 8)
    │
    ▼
                          propose(...)  ──────► Pending
                                                    │
                                          (votingDelay blocks — Concept 5)
                                                    ▼
                                                 Active
castVote() ───────────────────────────►    (tallied against Concept 7's
                                             own historical checkpoints,
                                             Concept 9's own quorum checked)
                                                    │
                                          (votingPeriod blocks pass)
                                                    ▼
                                               Succeeded
                                                    │
                                              queue(...)  ─────────►  scheduled,
                                                                       Concept 6's
                                                                       own delay begins
                                                                            │
                                                                   (timelock delay passes)
                                                                            ▼
                                              execute(...) ─────────►  executed  ──────►  real funds
                                                                                            actually move
```

Medium's own assignment builds and runs this exact sequence, for real, against a real `Treasury` contract only the timelock itself can ever move funds out of every concept above is one real, tested step in it, not a separate fact to memorize in isolation.

---

## Assignment.

1. **Easy - Threshold Signatures, Two Ways: On-Chain Confirmations vs. Off-Chain Aggregated Signatures.**

   **What you practice:**
   - Week 38's own `SimpleMultisig` (Safe's own real shape: separate, on-chain confirmation transactions) and Week 36's own raw-ECDSA multisig pattern (Squads-adjacent: signatures collected and verified together, off-chain until the final submission) placed side by side, deliberately (Concepts 1, 2, 3)
   - The real, practical trade-off between them: gas cost and on-chain visibility per confirmation vs. a single combined submission

   **Requirements:**
   - An `OnChainMultisig` contract: `submit`/`confirm`/`execute`, `M`-of-`N` owners — Week 38's own `SimpleMultisig`, reused directly.
   - An `OffChainMultisig` contract: `executeWithSignatures(address to, uint256 value, bytes calldata data, uint256 nonce, bytes[] calldata signatures)`, recovering each signer via `ECDSA.recover` (Week 36's own pattern), requiring `threshold` distinct valid owner signatures, replay-protected via a `nonce`.
   - A test measuring and comparing the real gas cost of reaching the identical `2`-of-`3` threshold both ways: `OnChainMultisig`'s own `submit`+2×`confirm`+`execute` (four transactions) vs. `OffChainMultisig`'s own single `executeWithSignatures` call (one transaction, two signatures collected off-chain beforehand).

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv --gas-report

       Expected output: both real gas numbers print, `OffChainMultisig`'s
       own single-transaction total meaningfully lower than
       `OnChainMultisig`'s own four-transaction total — confirming Safe's
       own real trade-off (more transparency, more transactions) against
       a raw signature-aggregation scheme's own trade-off (fewer
       transactions, signatures collected off-chain first) directly,
       with real numbers, not just Concept 1's own description.

   2. Command: forge test --match-test testFix_BothReachTheIdenticalTwoOfThreeThreshold -vvvv

       Expected output: a trace showing BOTH paths genuinely require two
       distinct real owners' worth of authorization before `recipient`
       receives any ETH at all — confirming the two contracts reach the
       identical security guarantee via genuinely different mechanisms,
       not that one is "less secure" for being cheaper.

   3. Action: in the test, attempt `offChain.executeWithSignatures` a
       SECOND time with the exact same `nonce` (0) and a freshly re-signed
       pair of signatures.

       Expected result: reverts with `NonceAlreadyUsed()` — confirming
       Week 36's own replay-protection lesson holds here too, for a
       general-purpose multisig, not just a bridge message.

   4. Action: attempt `onChain.execute(txId)` with only ONE confirmation
       collected instead of two.

       Expected result: reverts with `InsufficientConfirmations()` —
       confirming both contracts genuinely enforce the SAME `2`-of-`3`
       threshold, just through different mechanisms, exactly Test Case 2's
       own point, now shown failing correctly on the on-chain side too.
   ```

2. **Medium - A Real Governance Token, a Real Governor and the Full Propose→Vote→Queue→Execute Lifecycle.**

   **What you practice:**
   - `ERC20Votes` and delegation, including the "held but never delegated means zero voting power" trap named directly in Concept 8
   - Wiring a real `Governor` to a real `TimelockController`, with the timelock's own admin renounced (Concept 6)
   - Running Concept 10's own full lifecycle diagram for real, moving real ETH out of a real `Treasury`

   **Requirements:**
   - A `GovToken is ERC20, ERC20Permit, ERC20Votes` contract, minting an initial supply to the deployer.
   - A `Treasury` contract: holds ETH, `release(address payable to, uint256 amount)` callable ONLY by its own configured `timelock` address.
   - A `MyGovernor` contract: `Governor`, `GovernorSettings` (`votingDelay = 1` block, `votingPeriod = 50` blocks — deliberately short for fast local testing, real production Governors use days), `GovernorCountingSimple`, `GovernorVotes`, `GovernorVotesQuorumFraction(4)`, `GovernorTimelockControl`.
   - A `TimelockController` with a `2 days` delay, the `Governor`'s own address as its sole proposer and executor, `DEFAULT_ADMIN_ROLE` explicitly renounced after wiring (no EOA left holding it).
   - A test confirming a holder with tokens but no delegation has zero `getVotes`; confirming self-delegation fixes this.
   - A test running the FULL lifecycle: propose a `Treasury.release` call, vote it through with enough delegated support to clear both quorum and a majority, advance past `votingPeriod`, `queue`, advance past the timelock's own delay, `execute`, and confirm the real ETH actually moved.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
         Ran 2 tests for test/GovernanceLifecycle.t.sol:GovernanceLifecycleTest
         [PASS] testFix_FullLifecycleMovesRealFundsFromTreasury()
         [PASS] testFix_UndelegatedHolderHasZeroVotingPowerUntilSelfDelegating()

   2. Command: forge test --match-test testFix_FullLifecycleMovesRealFundsFromTreasury -vvvv

       Expected output: a full trace showing every stage of Concept 10's
       own diagram running for real — propose, vote, queue (which itself
       calls into the real, deployed `TimelockController`), the delay,
       then execute — ending in a real `Treasury.release` call succeeding.

   3. Action: in the second test, attempt to call
       `treasury.release(payable(recipient), 1 ether)` DIRECTLY, from this
       test contract itself, at any point before the full governance flow
       completes.

       Expected result: reverts with `NotTimelock()` — confirming the
       ENTIRE governance apparatus (Governor, voting, queueing, the delay)
       is genuinely the only path to moving Treasury funds, not a
       convenience layer sitting alongside a still-open direct path.

   4. Action: in the second test, attempt `governor.execute(...)`
       immediately after `governor.queue(...)`, WITHOUT the
       `vm.warp(block.timestamp + TIMELOCK_DELAY + 1);` line.

       Expected result: reverts — confirming the timelock's own real delay
       is genuinely enforced by the deployed `TimelockController` itself,
       the same "schedule → too-early execute reverts → warp → succeeds"
       pattern Weeks 33 and 39 already established, now reached through a
       real Governor's own `queue`/`execute` calls rather than calling
       `schedule`/`execute` on the timelock directly.
   ```

3. **Hard - Governance Attack Vectors: Flash-Loan Voting, Quorum Failure and Proposal Spam.**

   **What you practice:**
   - Proving Concept 7's own checkpoint-based defense against flash-loan voting directly, closing the loop with Week 31 one more time
   - A real proposal failing despite unanimous support among actual voters, purely from insufficient quorum (Concept 9)
   - `proposalThreshold` blocking a low-balance address from spamming a proposal (Concept 9)

   **Requirements:**
   - Reuse `GovToken`, `Treasury`, and `MyGovernor` from Medium, with `MyGovernor`'s own `GovernorSettings` proposal threshold raised to a real, non-zero value for this assignment specifically (`1000 ether`, requiring a meaningful real stake to propose at all).
   - A test: create a proposal; AFTER its snapshot block has passed, mint and self-delegate a large amount of tokens to an attacker address within the SAME test (simulating a flash loan's temporary balance); confirm the attacker's own `castVote` weight, read via the proposal's own historical snapshot, is `0`, not the large flash-loaned amount.
   - A test: a small minority of total supply (well under the 4% quorum) votes unanimously `For`; after the voting period ends, confirm `governor.state(proposalId)` is `Defeated`, not `Succeeded`, despite zero `Against` votes.
   - A test: an address holding fewer tokens than the raised `proposalThreshold` attempts `propose()`, confirming it reverts.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
         Ran 3 tests for test/GovernanceAttacks.t.sol:GovernanceAttacksTest
         [PASS] testExploit_LowBalanceAddressCannotProposeAtAll()
         [PASS] testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed()
         [PASS] testFix_UnanimousSupportStillFailsWithoutQuorum()

   2. Command: forge test --match-test testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed -vvvv

       Expected output: a trace showing the attacker's own `castVote` call
       succeeding (it doesn't revert — voting itself is permissionless),
       but `proposalVotes`'s own `forVotes` staying at `0` — confirming
       the defense isn't "attackers can't vote," it's "an attacker's vote
       simply carries the weight they ACTUALLY had at the real snapshot
       block," exactly Concept 7's own precise claim, not a looser
       approximation of it.

   3. Action: in `testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed`,
       move the `token.mint`/`delegate` block to BEFORE the
       `vm.roll(block.number + governor.votingDelay() + 1);` line instead
       of after (simulating an attacker who acquires and delegates tokens
       BEFORE the snapshot block, a real, legitimate purchase rather than
       a same-block flash loan), then re-run.

       Expected result: `forVotes` is now `10_000_000 ether` — confirming
       directly that the defense is specifically about WHEN voting power
       was acquired relative to the snapshot, not a blanket rule against
       large or recent acquisitions; genuinely holding tokens before the
       snapshot block counts normally, exactly as it should. Revert the
       change afterward so the file matches Requirements again.

   4. Command: forge test --match-test testFix_UnanimousSupportStillFailsWithoutQuorum -vvvv

       Expected output: a trace confirming only ONE address ever called
       `castVote` at all, and that single vote was genuinely "For" — yet
       `state(proposalId)` resolves to `Defeated`, confirming quorum is
       checked as a real, separate condition from "did a majority of
       actual votes support it," exactly Concept 9's own point, proven
       rather than only described.
   ```
