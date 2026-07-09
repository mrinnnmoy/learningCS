# List of things learned.

## 1. AMM Fundamentals. (constant product formula)

An **Automated Market Maker** replaces Week 11-25's implicit assumption of _"a counterparty exists"_ with a formula.

A pool holding reserve `x` of token A and reserve `y` of token B quotes a price for any trade by keeping `x * y = k` constant, `k` a fixed value that only changes when liquidity itself is added or removed (Concept 2), never by a trade alone.

A trade adding `Δx` to the pool must remove exactly enough `Δy` to keep `(x + Δx)(y - Δy) = k` true.

Which is what makes larger trades get worse prices, `Δy` isn't linear in `Δx`, it curves, the same shape as Week 6's `Option`/`Result` control flow being deterministic but not linear in its inputs.

---

## 2. Liquidity Pool basics.

A pool is, mechanically, exactly Week 19's vault pattern, twice over.

Two PDA-owned `TokenAccount`s (Week 17, Concept 3), one per side of the pair, holding the actual reserves Concept 1's formula operates on.

Anyone can deposit both tokens in the pool's current ratio and become a **liquidity provider**, earning a proportional claim on the pool's reserves (Concept 13 covers exactly how that claim is tracked) and over time, a share of every trade's fee (Concept 12).

---

## 3. Slippage & Price Impact.

Two related but distinct ideas,

- **price impact** is Concept 1's curve itself, the honest, mechanical fact that a large trade against a fixed pool moves the price against the trader, no error, no bug, just the formula.

- **Slippage** is the _gap_ between the price a trader expected when submitting a transaction and the price they actually got by the time it executed, caused by other transactions landing first (Week 2's mempool, Concept 5) and shifting the reserves out from under them.

A `min_amount_out` parameter, checked on-chain before the swap completes, is how a trade protects itself against slippage exceeding what the trader is willing to accept, exactly the same defensive-check discipline Week 20 built an entire week around, just applied to price rather than account ownership.

Week 45 covers, later, exactly how an attacker can deliberately manufacture slippage against a victim, this week only covers defending against it.

---

## 4. DLMM (Dynamic Liquidity Market Maker) concept.

Concept 1's constant-product curve spreads liquidity thin, evenly across every possible price from zero to infinity, most of which a real trading pair will never actually trade near.

A **DLMM** instead organizes liquidity into discrete, adjacent price **bins**, each bin behaving like its own small constant-sum (not product) market within a narrow price band.

And a **variable fee** that automatically rises during high volatility (rapid price movement across bins) and falls during calm, quiet trading.

The "dynamic" name refers specifically to this fee adjustment, not to the bin structure itself, which is fixed once created.

---

## 5. CLMM (Concentrated Liquidity Market Maker) concept.

A different solution to the same _"liquidity spread too thin"_ problem Concept 4 addresses.

Rather than bins,

- A **CLMM** lets each liquidity provider choose their own price _range_ to concentrate their capital within (Concept 6's ticks define the boundaries), earning fees only while the current price sits inside their chosen range, and earning nothing while it's outside.

The upside is capital efficiency, a provider willing to closely manage a narrow range earns far more fee income per dollar deposited than Concept 1's spread-everywhere approach.

The downside is Concept 7's impermanent loss risk concentrates right along with the capital.

---

## 6. Tick-based Liquidity ranges.

The actual mechanism Concept 5's ranges are built from.

Price space is divided into discrete **ticks** and a liquidity provider's position is defined by a `[tick_lower, tick_upper)` range, not a continuous price.

Each tick tracks how much liquidity newly becomes active or inactive as the current price crosses it, so a swap moving the price across several ticks has to update each one in sequence.

A real computational cost a plain constant-product pool (Concept 1) never pays and part of why CLMMs are meaningfully more complex programs to write correctly than the AMM this week's assignments actually implement.

---

## 7. Impermanent loss mechanics.

The real cost liquidity providers accept in exchange for Concept 2's fee income.

If the price of the two pooled assets diverges after a deposit, Concept 1's formula has _already rebalanced the pool's reserves_ by the time a provider withdraws, holding relatively more of whichever asset became relatively cheaper.

The loss is called _"impermanent"_ because it only becomes real, realized, the moment liquidity is actually withdrawn at a different price ratio than it was deposited at.

If the price ratio returns to where it started, the loss vanishes entirely.

Medium's assignment computes this directly from real on-chain numbers rather than the closed-form formula alone.

Week 34 revisits this exact mechanic later, on the EVM side, once Solidity (Week 27) is in place, this week is the first, Solana-side introduction to it.

---

## 8. Perpetual Future basics.

A **perpetual future** (_"perp"_) is a derivative contract with no expiry date, tracking an underlying asset's price without ever requiring the holder to actually own that asset.

A trader posts **collateral** (Concept 10) and opens a **position**, a directional bet (long or short) sized in units of the underlying and the position's value moves with Concept 14's price feed rather than with any actual token changing hands.

Since there's no expiry to force convergence between the perp's price and the real spot price the way a traditional dated future has, Concept 9's funding rate exists specifically to keep the two tethered together indefinitely instead.

---

## 9. Funding rates.

A periodic payment, typically every hour on real venues, this week's assignment settles it whenever `settle_funding` is called instead, exchanged directly between long and short position holders, no protocol fee involved.

When perpetual demand skews long (Concept 8's perp price trading above the real spot price), longs pay shorts, pulling the perp's price back down toward spot.

When it skews short, the payment flips direction.

Mechanically, this is Week 19's reward-accrual pattern turned into a _cost_ rather than a payout, `elapsed_time × rate`, computed with the exact same `checked_mul`/`checked_div` discipline (Week 6, Week 20's Concept 6) that computed Week 19's staking rewards.

---

## 10. Leverage & Liquidation mechanics.

**Leverage** lets a trader open a position larger than their posted collateral alone could safely support.

A `10x` leveraged position controls ten times the collateral's value in the underlying asset.

This amplifies both gains and losses identically, and it introduces a hard constraint a program has to enforce explicitly (Week 20's audit-checklist discipline, applied here).

If losses ever erode a position's collateral below some **maintenance margin** threshold, the position must be forcibly closed, **liquidated**, before losses could exceed the collateral actually posted and leave the protocol holding bad debt.

Concept 15 covers who actually performs this closure, and what happens to what's left.

---

## 11. Order books vs AMMs on-chain.

A traditional **order book** matches discrete buy and sell orders directly against each other at whatever price both sides agree to.

The mechanism nearly all traditional exchanges use and the mechanism most EVM DEXs (Week 26 onward) explicitly moved away from in favor of Concept 1's AMM model, since maintaining a fully on-chain order book, with its constant cancellations and updates, is expensive in gas (Week 26, Concept 3) in a way a stateless pricing formula simply isn't.

Solana's much lower per-transaction cost (Week 10) makes on-chain order books genuinely viable here in a way they mostly aren't on Ethereum L1, several real Solana DEXs use one instead of an AMM entirely, a design trade-off worth recognizing exists, even though this week's assignments build the AMM side of it.

---

## 12. Swap fees & LP fee accrual.

Every real swap (Concept 1) charges a small fee, typically a few tenths of a percent, taken out of the trader's input amount _before_ the constant-product formula runs.

And left behind in the pool's reserves rather than transferred out.

Since Concept 13's LP shares represent a proportional claim on whatever the pool currently holds, that retained fee is never distributed as a separate payment, it simply makes the pool's total reserves larger, which makes every existing LP share worth a little more the moment the swap lands.

This is the entire mechanism by which Concept 2's _"LPs earn a share of every trade's fee"_ claim actually happens, mechanically, on-chain.

---

## 13. LP shares (pool tokens) as an Accounting mechanism.

A pool can't just track _"Alice deposited 40% of the pool"_ as a stored percentage, percentages don't survive further deposits and withdrawals by other providers cleanly.

Instead, a pool mints its own SPL token (Week 17, Concept 1's `Mint`, PDA-controlled the same way Week 19's staking rewards mint was) representing shares, an LP token.

The very first deposit sets an initial supply (this week's assignments use `sqrt(amount_a * amount_b)`, a standard choice that makes the LP token's initial value independent of which specific ratio the first deposit happened to use).

Every deposit after that mints new LP tokens proportional to the _existing_ supply and reserves and burning LP tokens back is precisely how Concept 7's impermanent loss becomes real, realized, at withdrawal.

---

## 14. Mark price vs Index price & Funding settlement mechanics.

Concept 8's perp position needs _some_ number to value itself against and real venues actually track two, deliberately kept separate.

- The **index price** (a reference value derived from real spot markets elsewhere, Week 41's oracles are the real-world mechanism for this, not yet covered at this point in the course).

- The **mark price** (the perp's own, potentially-diverging trading price, whose gap from the index price is exactly what Concept 9's funding rate exists to close).

This week's Hard assignment collapses that distinction deliberately.

An `update_index_price` instruction, admin-only, stands in for a real oracle feed, an honest, explicitly-flagged simplification, not a claim that any real protocol should ever let a single admin key set its own price feed.

---

## 15. Liquidation engines & Insurance funds.

Concept 10 established _that_ a breached maintenance margin must trigger liquidation.

The remaining question is _who_ performs that liquidation and what happens to whatever collateral is left.

Real protocols run a network of independent **keepers**, bots incentivized by a reward (typically a cut of the seized collateral) to watch every open position and liquidate the moment margin is breached and route the remainder of severely underwater positions into a shared **insurance fund**.

This **insurance fund** absorbs losses the position's own collateral couldn't cover, socializing that tail risk across the whole protocol rather than any single keeper.

This week's Hard assignment implements the keeper mechanism directly (any signer can call `liquidate`, earning the seized collateral as their reward) but deliberately skips the separate insurance fund, a real, explicitly-flagged scope cut, not an oversight, keeping the assignment to a single vault account rather than two.

---

## Assignment.

1. **Easy - A Constant-Product AMM Pool: Liquidity, Swaps and Slippage Protection.**

   **What you practice:**
   - Building a two-token constant-product AMM with PDA-owned vaults, an LP mint, and swap fees.
   - Observing price impact by comparing the quoted and actual swap rates.
   - Using `min_amount_out` to protect against slippage.
   - Using the current Anchor TypeScript client with automatic PDA account resolution.
   - Setting up a TypeScript 7 + Anchor development environment.

   **Requirements:**
   - Create a `Pool` PDA (seeds `["pool", mint_a, mint_b]`) storing the token mints, LP mint, fee, and using PDA-owned vaults and an LP mint.
   - `initialize_pool(ctx, fee_bps)` creates the pool and all required accounts.
   - `add_liquidity(ctx, amount_a, amount_b)` deposits tokens and mints LP tokens.
   - `remove_liquidity(ctx, lp_amount)` burns LP tokens and returns the user's share of both tokens.
   - `swap(ctx, amount_in, min_amount_out, a_to_b)` performs a constant-product swap, applies the fee, and rejects trades that exceed the user's slippage limit.
   - Write a TypeScript client that initializes the pool, adds liquidity, performs a successful swap, then verifies that a second swap fails because of slippage protection.
   - Create the user's LP token account after the pool has been initialized.
   - Use Anchor's generated client with automatic PDA resolution (or `accountsPartial()` where required).
   - Configure the project with the required TypeScript dependencies and a `tsconfig.json` so it compiles without errors.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Mints created: 6nBWg... 9pQr...
           Minted starting balances of A and B.
           Pool initialized: BfuUk...
           Added 1,000,000 / 1,000,000 initial liquidity.

           Pre-swap pool rate (B per A): 1.0000
           Swapped 50,000 A. Actual rate received: 0.9524 (Concept 3's
           price impact vs the quoted 1.0000)

           Caught expected slippage rejection: SlippageExceeded, as expected.

   2. Command: verify by hand.

       The actual rate received must be LOWER than the quoted rate for an
       a_to_b swap (more A relative to B pushes B's price down) — confirming
       Concept 1's curve, not a flat-rate exchange, actually executed.

   3. Command: run npx tsx index.ts a second time.

       Expected output: "Reusing existing mints," "Pool already
       initialized," then the swap steps proceed against the pool's
       ALREADY-SHIFTED reserves from Run 1 — confirming the pool's state
       genuinely persists and compounds across runs, not resetting.

   4. Command: temporarily change the fee_bps argument in
       initializePool from 30 to 0, delete pool-mints.json, and re-run.

       Expected output: the "actual rate received" is slightly BETTER
       (closer to the quoted rate) than Run 1's — confirming Concept 12's
       fee genuinely widens the gap between quoted and actual rate, it
       isn't just Concept 1's curve alone causing the whole difference.

       Revert this change afterward and delete pool-mints.json once more.
   ```

2. **Medium - Quantifying Impermanent Loss From Real Pool Numbers.**

   **What you practice:**
   - Reusing the `simple-amm` program in an Anchor test.
   - Measuring impermanent loss using both real pool data and the `2√k / (1 + k)` formula.
   - Running repeatable tests on a fresh local validator.
   - Using the current Anchor TypeScript client and debugging with real on-chain values.

   **Requirements:**
   - Run the project using `anchor test` on a local validator.
   - Configure `Anchor.toml` for local testing.
   - Set up the required TypeScript dependencies and a compatible `tsconfig.json`.
   - Write a test that adds liquidity, performs a large swap, and removes all liquidity.
   - Create the LP token account after `initialize_pool()` completes.
   - Use Anchor's generated client with automatic PDA resolution (or `accountsPartial()` where required).
   - Compare the LP's final value with the value of simply holding the original tokens.
   - Compute the theoretical impermanent loss formula and verify it matches the on-chain result within a small tolerance.
   - Print the pool reserves, withdrawn amounts, final price, actual LP value ratio, and theoretical ratio during the test.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: anchor test

       Expected output:
           simple-amm
           Price moved from 1.0000 to 0.XXXX (k = 0.XXXX)
           Actual value ratio (LP / hold):   0.99XXXX
           Closed-form IL ratio (2√k/(1+k)): 0.99XXXX
           ✔ quantifies impermanent loss against the closed-form formula (....ms)

           1 passing

   2. Command: verify by hand.

       The two printed ratios should match to within the test's 0.001
       tolerance — confirming Concept 7's textbook formula genuinely
       describes what a real, on-chain constant-product pool does, not
       just an idealized approximation of it.

   3. Command: temporarily change the swap amount from 500_000 to
       5_000 (a much smaller price move), and re-run.

       Expected output: BOTH ratios move much closer to 1.0 (less loss)
       — confirming Concept 7's core claim directly: impermanent loss
       scales with how much the price actually diverges, a small price
       move causes proportionally small loss, not a fixed penalty.
       Revert this change afterward.

   4. Command: temporarily change initializePool's fee argument from 0
       back to 30 (Easy's normal fee), and re-run.

       Expected output: actualRatio now measurably EXCEEDS formulaRatio
       (the assert.approximately may even fail, intentionally, for this
       test only) — confirming Concept 12's fee income is a real,
       separate effect on top of Concept 7's loss, not already baked
       into the closed-form IL formula, which assumes a zero-fee pool.

       Revert this change afterward so the test passes normally again.
   ```

3. **Hard - A Perpetual Futures Market: Leverage, Funding and Liquidation.**

   **What you practice:**
   - Building a perpetual futures market with leverage, funding payments, and liquidation.
   - Managing collateral using a PDA-owned vault.
   - Separating the normal trading flow (Devnet client) from liquidation testing (Anchor tests on Localnet).
   - Using the current Anchor TypeScript client with automatic PDA account resolution.
   - Building, testing, and deploying an updated on-chain program.

   **Requirements:**
   - Create a `Market` PDA with an authority, index price, funding rate, and collateral vault.
   - `initialize_market()` creates the market, and `update_index_price()` allows only the market authority to update the price.
   - `open_position()` creates a leveraged position and rejects positions that exceed the maximum allowed leverage.
   - `settle_funding()` updates a position's collateral based on the funding rate and elapsed time.
   - `close_position()` settles funding, calculates profit or loss, returns the remaining collateral, and closes the position.
   - `liquidate()` allows any signer to liquidate positions that fall below the maintenance margin and rewards the liquidator with the remaining collateral.
   - Write a Devnet client that initializes a market, opens a position, settles funding, and closes the position.
   - Write an Anchor test on Localnet that opens a highly leveraged position, moves the market price against it, and verifies that an independent liquidator can successfully liquidate the position.
   - Configure the client for Devnet and the tests for Localnet.
   - Rebuild and redeploy the program after changing the on-chain code so the deployed program and generated IDL stay in sync.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: anchor test --provider.cluster localnet (Rust tests)

       Expected output:
           perp-market
           ✔ opens a highly-leveraged position, moves the index price
               against it, and lets a keeper liquidate it (....ms)
           ✔ rejects liquidating a healthy position (....ms)

           2 passing

   2. Command: npx tsx index.ts (live client)

       Expected output shape (first run):
           Mint created: 6nBWg...
           Minted 10,000 collateral tokens to your ATA.
           Market initialized: BfuUk...
           Position opened: collateral 500, size 10.
           Waiting a few seconds before settling funding, so elapsed time
           is nonzero (Concept 9)...
           Funding settled. Collateral after funding: 499

           Position closed. Final ATA balance: 9999

   3. Command: verify by hand.

       Test 1's liquidator token balance must be greater than 0 — the
       keeper genuinely received the seized 10x-leveraged position's
       collateral, confirming Concept 15's reward mechanism actually
       moved real tokens, not just closed an account. Test 2's healthy
       position must be REJECTED for the exact opposite reason,
       confirming the maintenance-margin check discriminates correctly
       between the two cases rather than always succeeding or failing.

   4. Command: in perp-market/programs/perp-market/src/lib.rs,
       temporarily remove the leverage check from open_position:

               let notional = ...;
               let max_notional = ...;
               require!(notional <= max_notional, PerpError::ExcessiveLeverage);

       rebuild, and add a new test opening a position at, say, 50x
       leverage (collateral 100, size 50, price 100 -> notional 5000).

       Expected output: the position opens successfully where it should
       have been rejected — confirming Concept 10's leverage cap is a
       real, load-bearing check, not a formality, without it a trader
       could open a position with essentially no real collateral backing
       it, exactly the "bad debt" risk Concept 10 and Concept 15 both
       warned about. Revert this change afterward and remove the
       temporary test.
   ```
