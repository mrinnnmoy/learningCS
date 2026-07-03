# List of things learned.

## 1. Staking contract Design.

A staking contract's core shape consists of a user locks tokens into a **program-controlled vault**, in exchange for rewards accruing over time.

Mechanically, this combines two things this course has already built separately. Week 14 Hard's PDA-owned vault (there, holding raw lamports) and Week 17's SPL token transfers, now the vault holds a **token account** instead, owned by a PDA (Week 13, Week 17's `allowOwnerOffCurve` pattern) and every deposit/withdrawal is a Token Program CPI (Week 15, Concept 7's `CpiContext`), not a `SystemProgram` one.

```
User's ATA  --stake()-->  Vault (PDA-owned token account)  --unstake()-->  User's ATA (principal + reward)
                                                                              |
                                                              StakePosition PDA tracks:
                                                              staker, amount, timestamps, state
```

---

## 2. Reward calculation Models.

This week builds the simplest real model:

- **fixed-rate,**
- **linear accrual**,
- `reward = staked_amount * rate * elapsed_time`.

It's worth naming the more sophisticated alternative real protocols actually use, even without building it.

A naive per-user linear model breaks down the moment a _pool's total staked amount_ changes over time, new stakers can dilute or skew rewards unfairly depending on exactly when they join.

Production staking pools typically use an **accumulator pattern** ("reward per token stored" globally, with each position tracking its own "debt" against that accumulator), which stays fair regardless of who else stakes or unstakes when.

This week's simpler model is a deliberate, honest scoping choice, exactly Week 2, Concept 5's "basic consensus, refined versions come later" pattern, applied here to reward math instead of agreement.

---

## 3. Lock-up Periods & Vesting.

A **lock-up** is a single binary gate.

Tokens can't be withdrawn until a fixed `unlock_at` timestamp, checked directly against `Clock::get()?.unix_timestamp` (Week 11, Concept 8's sysvar, finally doing real work rather than just being read and printed).

**Vesting** generalizes this into a gradual release schedule, a formula computing _how much_ is currently claimable as a function of elapsed time, rather than one all-or-nothing unlock moment (a linear vesting schedule, or a cliff followed by linear release, are both common real shapes).

This week builds the simpler lock-up; vesting is the natural next step once a lock-up's single timestamp check is understood.

---

## 4. Escrow contract Design.

The canonical pattern, party A (the **maker**) deposits an asset into a program-controlled account, declaring what they want in return and how much.

Party B (the **taker**) can fulfill the trade by depositing the requested asset and receiving the maker's deposit, **atomically**, both transfers happen inside one instruction, or neither does.

This atomicity is the entire point: it's Week 2's **trustless** concept (Concept 1's definition, "the rules are enforced by code and math, not a promise") made fully concrete, neither party ever needs to trust the other's intentions, the program's own logic makes a half-completed trade structurally impossible.

---

## 5. Multi-party fund Holding.

An escrow's vault genuinely holds funds that **neither party unilaterally controls** once deposited, a real difference from staking's Concept 1 pattern, where only the depositor themselves ever has a claim on their own position.

Only the program's own logic, following its own rules (fulfilled by a taker, or cancelled by the maker, Concept 7), decides when the held funds move, and to whom, exactly Week 14, Concept 6's `invoke_signed` pattern, now protecting two distinct parties' claims on the same account instead of one.

---

## 6. Timelocks.

Concept 3's lock-up generalizes directly.

Any logic gating an action behind _"not before timestamp T."_ For escrow specifically, a timelock can protect the _maker_, allowing them to reclaim their deposit if no taker fulfills the trade within some window, so funds can never be permanently stuck waiting for a counterparty who never shows up.

This week's escrow keeps cancellation available at any time before fulfillment (Concept 7) rather than adding a second timestamp gate, deliberately, to keep the state machine (Concept 8) small enough to reason about completely; a real production escrow often layers both.

---

## 7. Cancel/refund Logic.

The maker's escape hatch.

Before any taker fulfills the trade, the maker can cancel and reclaim their deposit.

This is where Concept 8's state machine stops being an abstraction and starts being load-bearing.

Without tracking whether an escrow has _already_ been fulfilled or cancelled, a maker could cancel an escrow a taker just fulfilled moments earlier (or vice versa), a genuine double-spend-shaped bug, not a hypothetical one.

Every instruction this week checks the current state explicitly before proceeding, exactly the pattern Concept 8 names directly.

---

## 8. State machine Design for Contracts.

Formalizing what's been implicit in every account this week.

A `StakePosition` and an `EscrowState` each have a distinct **lifecycle**, a fixed set of valid states and only certain valid transitions between them.

```
StakePosition:  Active -----unstake()-----> Withdrawn    (terminal)

EscrowState:    Open --take()-----> Fulfilled            (terminal)
                Open --cancel()---> Cancelled            (terminal)
```

Representing this as a Rust `enum` (Week 6, Concept 5) rather than, say, a loose combination of booleans, makes invalid states structurally harder to represent at all, and every instruction's `require!` check against the current state (Concept 7) is what makes invalid _transitions_ actually impossible to execute, not merely inconvenient.

This is a real, general design principle, not specific to staking or escrow: model the states explicitly, then let the type system and your own constraint checks do the enforcement work.

---

## 9. Testing Staking/Escrow Flows.

Week 14 and Week 15 both drew a line between fast, local testing and slower, real-cluster testing.

This week's contracts are genuinely **stateful and multi-instruction**, which means a good test suite has to cover more than the happy path, it has to exercise the state machine's _edges_ directly.

Unstaking before unlock, taking an already-fulfilled or already-cancelled escrow, cancelling something already taken.

This week's Medium and Hard assignments both deliberately trigger these wrong-state cases and confirm they fail cleanly, not just that the happy path succeeds.

---

## Assignment.

1. **Easy - The Staking Program: Vault Setup, Stake and a Locked Position.**

   **What you practice:**
   - Building an Anchor staking program with a global, program-controlled vault and mint authority PDA, and a per-user `StakePosition` PDA tracking amount, timestamps, and state
   - Transferring a mint's authority (Week 11, Concept 5's "authority can be reassigned" claim, executed) from your own wallet to the program's own PDA, so the program itself can mint rewards later
   - Observing a freshly-created stake position's lock-up state directly, confirming it genuinely can't be withdrawn yet

   **Requirements:**
   - A `StakePosition` account (`staker`, `amount`, `deposited_at`, `unlock_at`, `state: PositionState { Active, Withdrawn }`).
   - `initialize_vault` creates the program's global vault token account (seeds `["vault"]`) and establishes the `["authority"]` PDA as both its owner and (client-side, via `setAuthority`) the mint's `mintAuthority`.
   - `stake(amount, lock_duration_seconds)` transfers `amount` from the staker's ATA into the vault, and creates a `StakePosition` PDA (seeds `["position", staker_pubkey]`) recording the deposit and unlock timestamp.
   - A TypeScript client creates a mint, transfers its authority to the program's PDA, initializes the vault, then stakes a real amount with a short lock duration, printing the resulting position's fields.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Mint created: 8pQrW...
           Mint authority transferred to program PDA: 3nKzT...

           Vault initialized: 6yTzP...
           Minted 1000 tokens to your ATA (for staking).

           Staked. Signature: 5f3G...

           Position:
           Amount:    100000000
           State:     { active: {} }
           Unlock at: 2026-...T...Z (about 60 seconds from now)

   2. Command: verify by hand.

       Unlock at should be roughly 60 seconds after the moment you ran
       the script — confirming unlock_at was computed from the LIVE
       Clock sysvar timestamp at stake time (Concept 3), not a
       client-supplied one the program simply trusted.

   3. Command: attempt to run index.ts a second time immediately,
       without modifying anything.

       Expected output: an error at the stake_position init step,
       reporting the account already exists — confirming Stake's `init`
       constraint genuinely prevents creating a second position for the
       same staker while the first is still Active (Concept 8's state
       machine, enforced at the account level itself).

   4. Command: temporarily change `require!(amount > 0, StakingError::ZeroAmount);`
       to remove this line entirely from the Rust program, then run

           anchor build.

       Expected output: this still compiles fine — the check is a
       program-level safety net Anchor doesn't add for you automatically,
       exactly Week 14's broader "the compiler can't catch domain logic
       mistakes" lesson, still true even with Anchor's other safety
       defaults layered on top.

       Revert this change afterward.
   ```

2. **Medium - Testing the Full Stake → Unstake Lifecycle with `anchor test`.**

   **What you practice:**
   - Writing an Anchor test exercising a complete, time-sensitive lifecycle: stake with a short lock, confirm early unstake fails, wait for real elapsed time, confirm unstake then succeeds
   - Verifying the reward calculation (Concept 2) against the exact formula the program implements, rather than just checking the balance changed at all
   - Recognizing, directly, why this kind of test is easier to write against `solana-program-test`'s clock-warping (Week 14, Concept 9) than against `anchor test`'s real-time local validator clock, even while using the latter here

   **Requirements:**
   - Extends Easy's existing `staking-program` project (this assignment adds to that workspace).
   - A test stakes a small amount with a `3`-second lock duration, then immediately attempts `unstake`, asserting it fails with `StillLocked`.
   - The test then waits (real time, at least `4` seconds) and calls `unstake` again, asserting it now succeeds.
   - The test computes the expected reward using Concept 2's exact formula and asserts the staker's post-unstake balance matches principal + that computed reward, within a small tolerance for the few seconds of real-time variance involved.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: anchor test

       Expected output: the test takes noticeably longer than Easy's
       assignment did (the real sleep), then:
           staking-program
           ✓ rejects unstaking before unlock, then succeeds with correct
               reward after it (....ms)

           1 passing

   2. Command: verify by hand.

       Both assertions inside the single it() block must genuinely both
       run — the early failure catch AND the later success-with-correct-
       reward check. If you comment out the sleep() call and re-run, the
       test should fail at the SECOND unstake call instead (still locked,
       Concept 6), confirming the wait is actually load-bearing, not
       decorative.

   3. Command: temporarily change REWARD_RATE_BPS at the top of the test
       file from 1000 to 2000 (doubling the test's own EXPECTED reward
       calculation, without touching the program's actual rate), then

           re-run anchor test.

       Expected output: 1 failing, with the tolerance assertion reporting
       the actual reward was far outside the (now wrong) expected range —
       confirming this test genuinely checks the reward MATH, not just
       "some balance increase happened." Revert this change afterward.

   4. Command: temporarily change the program's REWARD_RATE_BPS
       constant in src/lib.rs (not the test file) from 1000 to 0,

           run anchor build,
           then re-run anchor test.

       Expected output: 1 failing, for the same reason as Test 3, but
       this time because the PROGRAM's actual behavior changed —
       confirming the test would catch a real regression in the deployed
       contract's reward logic, not just a mistake in the test's own
       arithmetic.

       Revert this change afterward.
   ```

3. **Hard - An Escrow Contract: Cancel Live, Full Trade Locally.**

   **What you practice:**
   - Building a complete Anchor escrow program with `make`, `take`, and `cancel`, each guarded by an explicit `EscrowStatus` state check (Concept 8)
   - Demonstrating the maker's own cancel/refund path (Concept 7) live, on devnet, with your real wallet, no second party needed
   - Demonstrating the _full_ two-party trade (`make` then `take`) in an Anchor test, where a second, local-only signer is legitimate, exactly this week's Assignment intro explained

   **Requirements:**
   - An `EscrowState` account (`maker`, `mint_a`, `mint_b`, `amount_a`, `amount_b`, `state: EscrowStatus { Open, Fulfilled, Cancelled }`).
   - `make(amount_a, amount_b)` transfers `amount_a` of `mint_a` from the maker into a vault (PDA-owned, seeds `["escrow-vault", maker_pubkey]`), and creates an `EscrowState` PDA (seeds `["escrow", maker_pubkey]`) recording the trade terms.
   - `take()` requires `state == Open`, transfers `amount_b` of `mint_b` from the taker to the maker, and `amount_a` from the vault to the taker (via `CpiContext::new_with_signer`, the vault's PDA authority), then sets `state = Fulfilled`.
   - `cancel()` requires `state == Open` **and** the signer is the original maker, returns `amount_a` from the vault to the maker, and sets `state = Cancelled`.
   - A live TypeScript client creates two mints, makes an escrow offering `mint_a` for `mint_b`, then immediately cancels it, printing the vault balance before and after to confirm the refund.
   - An Anchor test performs a full `make` → `take` cycle between two distinct signers (one the test's own funded payer, one a second, test-generated `Keypair`, legitimate here per this week's Assignment intro), asserting both parties end up holding the token they wanted.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: anchor test --skip-deploy (Rust test, two-party flow)

       Expected output:
           escrow-program
           ✓ completes a full two-party trade (....ms)

           1 passing

   2. Command: npx tsx index.ts (live client, maker-only flow)

       Expected output shape:
           Mint A (offered): 8pQrW...
           Mint B (wanted):   3nKzT...

           Made escrow (offering 100 A for 50 B). Signature: 5f3G...
           Vault balance right after making: 100000000

           Cancelled. Signature: 2kLp...
           Vault balance after cancelling: 0

   3. Command: verify both by hand.

       In the Rust test: the taker's mint_a balance must equal exactly
       amountA, and the maker's mint_b balance must equal exactly
       amountB — a genuine two-sided trade, not one party just receiving
       a gift. In the live client: the vault balance goes from
       100000000 to 0 exactly, and no state remains claiming otherwise.

   4. Command: in the live client, comment out the cancel() call
       entirely and run npx tsx index.ts a second time.

       Expected output: an error at the escrow account's init step (the
       PDA already exists, in the Open state from the prior run) —
       confirming a maker genuinely cannot make a second escrow while
       their first one is still open, exactly Concept 8's state machine,
       enforced the same way Easy's stake_position was. Revert this
       change afterward, and re-run once normally to leave the account
       in a clean, cancelled state again.
   ```
