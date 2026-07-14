# List of things learned.

## 1. Native staking vs Liquid staking.

Delegating SOL directly to a validator (Concept 9) locks that SOL in a **stake account**, earning rewards, but entirely illiquid, it can't be transferred, traded or used anywhere else while delegated and unwinding it means waiting through a real deactivation period (Concept 5) before it's spendable again.

**Liquid staking** solves the liquidity half of that problem specifically.

Stake through a pool instead of directly and receive a freely-transferable SPL token (Week 17, Concept 1) representing your claim on the pool, tradeable, usable as DeFi collateral (Concept 6), the whole time the underlying SOL stays delegated and earning.

---

## 2. How LSTs work. (mint on stake, burn on unstake)

The mechanism is a direct extension of Week 19's staking vault pattern.

Depositing SOL into the pool mints a proportional amount of the pool's own LST token (Concept 4 covers exactly how _"proportional"_ is computed) and burning LST tokens back is how a claim on the pool is redeemed, mechanically identical to Week 22, Concept 13's LP-share pattern.

A liquid staking pool is structurally a lot closer to an AMM's liquidity pool than to Week 19's original single-asset vault.

---

## 3. Validator delegation strategies.

A liquid staking pool doesn't delegate all its SOL to one validator, doing so would concentrate Week 20-style risk (Concept 7 covers exactly what that risk is) onto a single point of failure.

Real protocols spread delegations across many validators using a defined strategy, weighting toward better uptime and lower commission, capping any single validator's share, and periodically rebalancing as validator performance changes.

A genuine off-chain (or on-chain governance-driven, Week 42) decision process this week's simplified single-pool assignment deliberately sets aside to focus on the token mechanics alone.

---

## 4. Exchange rate mechanics. (stake pool value growth)

An LST's exchange rate against SOL isn't fixed at `1:1` and doesn't need a separate update instruction the way Week 19's reward math needed `unstake` to be called.

It grows continuously and automatically, simply because validator rewards (Concept 11 covers the actual mechanism) increase the pool's total SOL while the LST token's supply stays exactly the same, unless someone stakes or unstakes.

The exchange rate at any moment is just `total_SOL_in_pool / total_LST_supply`, the same ratio-based accounting Week 22, Concept 13's LP shares already established, applied here to staking rewards instead of trading fees.

---

## 5. Unstaking & Cooldown periods.

Redeeming an LST back for SOL isn't instant on a real protocol, the underlying SOL is still delegated and undelegating it requires waiting for Solana's own stake deactivation to complete (Concept 9), typically one to a few real epochs, several real days.

This week's assignment compresses that real delay down to a few seconds for practicality (explicitly flagged as a simplification, not a claim that real cooldowns are this short), but keeps the actual mechanism, a redemption request that isn't payable until a real, on-chain-checked point in time has passed, exactly Week 23, Concept 4's subscription time-gate pattern, reused here for the opposite direction of value flow.

---

## 6. LST use in DeFi. (as collateral)

Because an LST is a liquid, freely-transferable SPL token (Concept 1) that also _grows in value on its own_ (Concept 4).

It's an unusually attractive form of collateral, a lending protocol accepting it earns its depositors the underlying staking yield on top of whatever the lending protocol itself pays, entirely passively.

This is the single biggest reason LSTs became foundational DeFi infrastructure rather than just a staking convenience, once an asset can both earn yield and serve as collateral simultaneously, it gets used as collateral everywhere the ecosystem's composability (a running theme since Week 15's CPI) allows.

---

## 7. Risks of Liquid staking. (slashing, depeg)

Two distinct failure modes worth telling apart.

**Slashing** is a validator-level risk, Solana currently doesn't slash stake for downtime the way some other chains do, but a validator could in principle be penalized for provable misbehavior and any validator a pool delegated to (Concept 3) directly reduces that pool's total value if it happens, spread across every LST holder proportionally.

**Depeg** is a market-level risk instead, entirely independent of the underlying staking mechanics actually being fine, if an LST's secondary-market trading price (Concept 12's instant-unstake pool, or any other exchange) drifts away from its true redemption value (Concept 4's exchange rate), simply because of one-sided trading pressure, exactly Week 22, Concept 1 and 3's price-impact mechanics, applied to a token that's supposed to track SOL 1-for-1-ish rather than float freely.

---

## 8. Popular LST protocols overview. (Marinade, Jito)

Two real, widely-used Solana LST protocols, both built on the exact mechanics Concepts 1 through 7 describe, at production scale.

**Marinade** was the first major Solana liquid staking protocol, distributing delegations across a large, algorithmically-selected validator set.

**Jito** combines liquid staking with **MEV rewards** (Week 45 covers MEV properly, this is a forward reference), validators running Jito's client capture and share additional revenue beyond standard staking rewards, which Jito's own LST (`JitoSOL`) passes through to holders on top of ordinary staking yield, a real-world instance of Concept 4's exchange rate growing from more than one source at once.

---

## 9. Native Solana staking mechanics. (Stake accounts & Epoch-based activation)

Concept 1 named the alternative in passing without explaining it.

Native delegation creates a dedicated **stake account** (a native, non-SPL account type, distinct from anything Week 11 covered so far), pointed at a specific validator vote account and that delegation doesn't take effect instantly.

It **activates** at the start of the next **epoch** (Solana's roughly-two-day scheduling period, Week 10's leader schedule operates on the same cycle) and **deactivates** the same way, requested at any time but only actually completing and releasing the SOL, at the following epoch boundary.

This week's assignment doesn't implement real stake-account delegation at all, doing so genuinely requires waiting through real epochs, impractical for a course exercise and builds a simplified pool that mimics the economic mechanics (Concept 2, 4) without the real epoch-locked delegation underneath, an explicitly flagged simplification, not the real primitive.

---

## 10. Stake pool Architecture.

A real LST protocol's pool isn't one account.

It's a coordinating structure managing many individual stake accounts (Concept 9), one or more per validator in Concept 3's delegation set, plus the pool's own accounting of total value and LST supply (Concept 4).

This week's assignment collapses that entire structure down to a single `Pool` account directly holding SOL, one validator's worth of complexity standing in for what a real pool spreads across dozens, the proportional mint/burn math (Concept 2) is identical either way, only the underlying delegation fan-out is simplified away.

---

## 11. Reward compounding & Exchange-rate growth Mechanics.

Concept 4 named the ratio, this is what actually changes it.

In a real protocol, validator rewards are credited directly onto each stake account's own balance (Concept 9) by the runtime itself, automatically, no transaction required, at each epoch boundary, growing the pool's total SOL without anyone minting a single new LST token.

This week's assignment can't wait for real epochs (Concept 9 again) to demonstrate this, so it uses an explicitly-labeled `simulate_rewards` instruction instead.

An admin-only deposit directly into the pool that mimics the _effect_ of real rewards landing, without claiming to be the real mechanism, exactly the same honest-substitution pattern Week 22, Concept 14 used for its admin-set index price standing in for a real oracle.

---

## 12. Instant unstake via a secondary Liquidity pool.

Concept 5's real cooldown is a genuine wait a holder might not want.

Real LST protocols commonly offer a second, optional path.

Trade the LST directly against SOL (or another liquid asset) through an ordinary AMM pool (Week 22, Concept 1 through 3, entirely unchanged), redeeming instantly at whatever price that pool currently quotes, in exchange for accepting Concept 3's slippage and price impact instead of Concept 5's wait.

Hard's assignment builds exactly this and uses it to make Concept 7's depeg risk concrete.

If enough holders choose instant, price-impacted unstaking over the free, full-value, wait-based redemption, the AMM's price can trade measurably below the pool's own true exchange rate, a real, honestly-demonstrated depeg, not merely defined in prose.

---

## Assignment.

1. **Easy - A Liquid Staking Pool: Stake, Simulated Rewards, Cooldown-Gated Unstake.**

   **What you practice:**
   - Building a pool that mints LST tokens proportionally on stake and tracks a growing exchange rate (Concept 2, 4), using real native SOL, not an SPL vault, for the staked side
   - Manipulating a PDA-owned account's own lamport balance directly to pay out SOL, the correct pattern when the source account isn't owned by the System Program and so can't use a `system_program::transfer` CPI (new this week)
   - Confirming a redemption request genuinely can't be claimed before its cooldown elapses (Concept 5), using the same time-gate pattern Week 23 established

   **Requirements:**
   - A `Pool` PDA (seeds `["pool"]`) storing `lst_mint: Pubkey` and `rent_exempt_reserve: u64` (captured at creation, so the pool's total SOL balance minus this reserve always equals the actual staked amount, never accidentally including the account's own rent).
   - `initialize_pool(ctx)` creates the `Pool` and a PDA-controlled `lst_mint` (the `Pool` itself is the mint's authority, no separate authority PDA needed).
   - `stake(ctx, lamports)` transfers `lamports` from the staker into the pool (via `system_program::transfer`, the staker is a real system account, this direction is a normal CPI), and mints LST proportional to the _current_ exchange rate: `sqrt`-free this time, since there's only one asset, just `lamports * lst_supply / total_staked_before`, or `1:1` on the very first stake.
   - `simulate_rewards(ctx, reward_lamports)`, admin-only, deposits `reward_lamports` into the pool without minting any LST, explicitly documented as standing in for real validator rewards (Concept 11), growing the exchange rate for every existing holder.
   - `request_unstake(ctx, nonce, lst_amount)` burns `lst_amount` LST, computes the SOL owed at the _current_ exchange rate, and creates an `UnstakeTicket` PDA (seeds `["ticket", staker, nonce]`, `nonce` client-supplied so one staker can hold multiple outstanding tickets) recording the owed amount and a `ready_at` timestamp `COOLDOWN_SECONDS` in the future.
   - `claim_unstake(ctx)` requires `now >= ready_at`, pays out the recorded amount via direct lamport manipulation (not a CPI, the `Pool` isn't System-Program-owned), and closes the ticket.
   - A TypeScript client stakes, simulates a reward, stakes again (at the now-higher rate), requests an unstake, waits, and claims it, printing the exchange rate at each step.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Pool initialized: BfuUk...

           Staking 0.01 SOL...
           Exchange rate: 1.000000 SOL per LST (total staked: 10000000
           lamports, LST supply: 10000000)

           Simulating a reward of 0.001 SOL (Concept 11's honest stand-in)...
           Exchange rate: 1.100000 SOL per LST (total staked: 11000000
           lamports, LST supply: 10000000)

           Staking another 0.01 SOL at the now-higher rate...
           Received 9090909 LST for this stake (fewer than the first
           stake's amount — the rate grew).

           Requesting unstake of this stake's LST...
           Waiting for the cooldown (Concept 5, compressed to a few
           seconds for this assignment)...

           Claimed. SOL received (net of tx fees): ~0.0099999 SOL

   2. Command: verify by hand.

       The second stake received FEWER LST tokens (roughly 9,090,909)
       than the first stake's 10,000,000, for the same 0.01 SOL —
       confirming Concept 4's exchange rate genuinely grew between the
       two stakes, and that growth came entirely from
       simulate_rewards, no LST was minted for that reward deposit.

   3. Command: temporarily comment out the `await sleep(6000);` line
       and re-run (using a fresh nonce, since the prior ticket was
       already claimed).

       Expected output: claim_unstake fails with a TooEarly error —
       confirming Concept 5's cooldown gate is real and load-bearing,
       attempting to claim immediately after requesting genuinely fails,
       it isn't just a UI-level delay. Revert this change afterward.

   4. Command: verify by hand — compare the final claimed SOL amount
       against what a NAIVE 1:1 redemption (no exchange rate growth at
       all) would have paid for the same LST amount.

       The claimed amount should be noticeably MORE than a flat 1:1
       redemption of the same LST quantity would give, confirming the
       holder who staked at the higher, post-reward rate still got their
       fair, currently-correct share, not diluted by earlier stakers
       having captured all the growth already.
   ```

2. **Medium - Quantifying Exchange-Rate Growth Across Multiple Stakers.**

   **What you practice:**
   - Confirming, with exact numbers, that a staker who deposits before a simulated reward and one who deposits after receive different LST amounts for the same SOL, in exactly the ratio Concept 4's formula predicts.
   - Confirming that the redemption value calculated when requesting an unstake reflects every reward simulated while the stake was active, by verifying the amount recorded in the unstake ticket.
   - Practicing the local-validator test infrastructure correctly from the start, the same standing environment notes as every prior Medium assignment.

   **Requirements:**
   - Test-only, run via `anchor test` against a local validator (repeatable, from-genesis reserve numbers, the same reasoning as every prior test-only assignment).
   - A test has `staker1` stake `1,000,000` lamports (the very first stake, `1:1`), simulates a reward of `500,000` lamports (growing the exchange rate to `1.5`), then has `staker2` stake `1,500,000` lamports and asserts they receive exactly `1,000,000` LST, not `1,500,000`, demonstrating Concept 4's exchange-rate formula with concrete numbers.
   - The test then has `staker1` request a full unstake of their original `1,000,000` LST, fetches the created unstake ticket account, and asserts it records exactly `1,500,000` lamports owed, demonstrating that the redemption value correctly reflects the full `50%` growth earned from the simulated reward while the stake was active.
   - The cooldown and `claim_unstake()` flow are intentionally excluded from this assignment because they depend on validator time progression rather than the exchange-rate and redemption-value calculations being practiced.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: anchor test --provider.cluster localnet

       Expected output:
           simple-lst
               ✔ gives a later staker fewer LST at a grown rate, and records
               the full grown redemption value in the unstake ticket (....ms)

           1 passing

   2. Command: verify by hand.

       staker2LstBalance must equal exactly 1,000,000, not 1,500,000 —
       confirming Concept 4's formula, not a flat 1:1 mint, genuinely
       governed the second stake.

       Also verify that the fetched unstake ticket records lamportsOwed = 1,500,000,
       confirming the redemption value correctly reflects the 50% reward earned while
       staker1 was staked.

   3. Command: temporarily change the simulateRewards call's amount
       from 500_000 to 0 (skip it entirely, by commenting the call out),
       and re-run.

       Expected output: 1 failing — staker2's LST balance is now 1,500,000 instead of
       the expected 1,000,000, since with no reward simulated the exchange rate never
       left 1:1.

       The unstake ticket's lamportsOwed will likewise be 1,000,000 instead of the
       expected 1,500,000.

       This confirms both assertions genuinely depend on the simulated reward having
       occurred, rather than passing coincidentally. Revert this change afterward.

   4. Command: temporarily change staker1's unstake amount from 1_000_000 (their full
       balance) to 500_000 (half), and manually recompute the expected redemption value
       at the 1.5× exchange rate (500_000 × 1.5 = 750_000), updating the assertion on
       ticket.lamportsOwed to match.

       Expected output: still passes, with the new expected value — confirming the
       redemption-value calculation is genuinely proportional to the amount of LST being
       redeemed, rather than being a fixed value. Revert this change afterward.
   ```

3. **Hard - Instant Unstake via an AMM: Price Impact and a Real, Measured Depeg.**

   **What you practice:**
   - Reusing Week 22's constant-product AMM logic to create an instant, cooldown-free LST unstake path.
   - Comparing the AMM swap output against Easy's real LST exchange rate to measure the value lost when choosing instant unstake over the normal cooldown flow.
   - Demonstrating Concept 7's depeg risk with real numbers by showing that a large swap creates a measurable difference between AMM price and true redemption value.

   **Requirements:**
   - Reuse Week 22 Easy's constant-product AMM program logic without changing the swap formula. This assignment applies the AMM mechanics to LSTs rather than creating a new AMM design.
   - The client reads Easy's deployed `lst_mint` and `pool-info.json`, calculates the current LST exchange rate, and uses it as the AMM pool's starting fair price.
   - The client creates liquidity, performs one large instant-unstake swap, compares the AMM received amount with Easy's fair redemption value, and prints the instant amount received, the fair value, and the resulting depeg percentage.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Simple-LST fair exchange rate:
           ~1.222496 lamports/LST

           Initializing AMM pool...
           Pool initialized: FFisiom...

           Adding liquidity 1000000 LST : 1222496 token

           Instant Unstake Result:
           AMM received:                    110833
           Fair value:                      122250
           Depeg:                           9.34%

   2. Command: verify by hand.

       The AMM received amount must be LOWER than the fair redemption
       value — confirming Concept 7's depeg risk is real and measurable.
       Choosing instant unstake through the AMM costs value compared to
       waiting for Easy's normal unstake flow.

   3. Command: temporarily change the swap amount from 100_000 to
       10_000 and re-run (using a freshly initialized AMM pool if needed).

       Expected output: the depeg percentage becomes MUCH smaller —
       confirming Week 22's price impact is the reason for the loss,
       not a fixed instant-unstake penalty. A smaller swap against the
       same liquidity pool creates less price movement. Revert this
       change afterward.

   4. Command: verify by hand — compare the AMM output against what
       Easy's normal `request_unstake` + `claim_unstake` flow would
       return for the same 100,000 LST.

       Easy's cooldown path returns the full fair value from the LST
       exchange rate, while the AMM path returns less because of price
       impact. This demonstrates the real trade-off from Concept 12:
       instant liquidity provides speed, but the holder pays a measurable
       depeg cost.
   ```
