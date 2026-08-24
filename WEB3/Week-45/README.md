# List of things learned.

## 1. MEV definition & sources.

**Maximal Extractable Value (MEV)**, profit extractable by controlling a block's own transaction _ordering_, _inclusion_ or _exclusion_.

Beyond whatever a block producer already earns from ordinary fees and the block reward itself.

This is a real, structural consequence of something every chain this course has covered shares.

_Someone_ decides what order transactions land in (Week 2's own consensus concept) and whoever that someone is:

- a Solana leader,
- an Ethereum validator or

as this week's own Concepts 6-8 cover, an entire specialized industry built around exactly this decision that has real, extractable power over it.

Three genuinely distinct sources make up nearly all of it:

- **arbitrage** (Concept 2),
- **liquidations** (Concept 3) &
- **sandwiching** (Concept 4, already built twice, Weeks 31 and 34).

Worth learning to tell apart precisely, since they carry very different ethical and economic character despite all being "MEV."

---

## 2. Arbitrage as MEV.

The closest thing to _benign_ MEV is when the same asset trades at two different prices across two separate pools (Week 34's own constant-product math guarantees this happens constantly, in small amounts, as real trades shift each pool's own price independently).

An arbitrage bot buys where it's cheap and sells where it's expensive, pocketing the difference and as a direct, genuinely useful side effect, pulls both pools' own prices back toward agreement with each other.

Nobody is worse off _because_ of this specific mechanism the way a sandwich attack's own victim is (Week 34, Concept 9).

The price discrepancy already existed.

The arbitrageur's own competition to close it fastest is itself a form of MEV, but a self-correcting, broadly useful one.

Easy's own assignment builds and runs exactly this.

---

## 3. Liquidations as MEV.

Recognizable directly from Week 31 and Week 41's own lending pool work, now framed precisely as a race.

The instant a borrower's own collateral value falls below their debt (Week 31, Concept 6's own collateral math), _anyone_ can call `liquidate()`, repay part of the debt and claim a real, built-in bonus.

A genuine incentive for someone to actually do the work of watching every position and reacting the moment one becomes eligible.

This is authentically useful MEV (an under-collateralized position left unliquidated is a real, growing risk to a lending protocol's own solvency) and it's also a genuine _race_.

Multiple searchers watching the identical opportunity, only the first one included actually gets paid, every other identical attempt simply fails harmlessly once the position is no longer eligible.

Easy's own assignment runs this race directly, two searchers, one winner.

---

## 4. Sandwiching, placed correctly in the taxonomy.

Week 31, Concept 4 and Week 34, Concepts 9-10 already built and defended against this exact attack in full.

Worth revisiting here only to place it precisely.

Sandwiching is the one source of the three that is _purely_ extractive, manufacturing a worse price for a specific, identified victim rather than correcting a pre-existing inefficiency (Concept 2) or protecting a protocol's own solvency (Concept 3).

Nothing new to build here this week.

Medium's own assignment instead builds the genuinely new structural defense, Concept 9's own batch auction, rather than rebuilding an attack this course has already demonstrated twice.

---

## 5. Mempool visibility & front-running, the shared root cause.

Every one of Concepts 2 through 4 depends on the identical underlying condition Week 31, Concept 4 already named.

Ethereum's own public mempool (Week 2, Concept 6) is genuinely public.

Any node, including one run purely for this purpose, can watch every pending transaction before it's mined.

**Front-running** is the general pattern (react to a pending transaction before it lands).

Sandwiching (Concept 4) is a specific, two-sided instance of it.

Arbitrage (Concept 2) and liquidation-racing (Concept 3) are both, at root, the identical "see something valuable pending, act on it first" behavior aimed at a self-correcting or protocol-protecting opportunity instead of a specific victim.

---

## 6. Proposer-Builder Separation (PBS), in overview.

As MEV extraction became sophisticated enough to be worth real, specialized engineering effort, Ethereum's own block production genuinely split into two separate roles.

A **proposer** (the validator whose turn it is, Week 2's own consensus) no longer constructs its own block's transaction ordering by hand.

Instead, specialized **builders** (Concept 7) compete to construct the single _most valuable_ possible block, including whatever MEV they can extract from careful ordering, and submit a bid for the right to have their block chosen.

The proposer's own job shrinks to something almost mechanical.

Pick whichever builder bid the most, without even seeing the block's own full contents first (a blind auction, Concept 7 covers exactly how that's made trustworthy).

A real, live, currently-true description of how a large fraction of real Ethereum blocks actually get built today, not a hypothetical architecture.

---

## 7. Block builders & relays. (MEV-Boost)

**MEV-Boost** is real, live, widely-adopted software letting a validator outsource Concept 6's own block-construction step entirely to an open builder marketplace.

A **relay** sits between builders and proposers as a trusted intermediary, solving a real, specific trust problem PBS's own blind auction creates.

A builder has to reveal its full, valuable block _before_ being paid for it, but a dishonest proposer could otherwise just steal that block's own contents (the ordering, the captured MEV) without ever paying the winning bid.

A relay verifies a builder's bid'd block is genuinely valid and genuinely pays what was promised, holds it until payment is confirmed and only then reveals the full contents to the proposer.

Flashbots is the single most well-known real, named operator running both relay and builder infrastructure at real, meaningful scale.

---

## 8. Private mempools and RPC endpoints. (Flashbots Protect)

A genuinely different, user-facing defense from anything Concept 9 builds at the contract level.

**Flashbots Protect** and similar private RPC endpoints, let a user submit a transaction directly to a builder or relay, bypassing Week 31, Concept 4's own public mempool entirely.

A sandwich bot (Concept 4) watching the public mempool simply never sees the transaction at all before it's already mined, since it was never broadcast there in the first place.

This is a real, currently-usable protection requiring zero contract changes whatsoever.

A user adopts it by changing which RPC endpoint their own wallet points at, nothing more, genuinely the lowest-friction defense against sandwiching available today, worth knowing exists even though this week's own hands-on assignments build contract-level defenses instead (Concept 9).

Since a wallet-level RPC choice isn't something a Foundry test can meaningfully demonstrate.

---

## 9. MEV protection design patterns for contracts.

Week 31's own commit-reveal (Concept 4 there) and Week 34's own `minAmountOut`/`deadline` (Concept 10 there) are both real.

Already-built defenses this course has covered in full, worth naming one more, genuinely new pattern this week:

- The **batch auction**.

Rather than executing each swap individually, in whatever order they happen to arrive (Concept 5's own root vulnerability), a batch auction collects many trade _intents_ over a short window, then executes all of them together at **one single, uniform clearing price**, computed from the batch's own aggregate supply and demand.

```solidity
function submitIntent(uint256 amountIn, bool aToB) external {
    // stores the intent — does NOT execute yet, and does NOT reveal enough to sandwich individually
}

function settleBatch() external {
    // computes ONE clearing price from every intent submitted this window,
    // executes them ALL at that identical price — submission ORDER genuinely doesn't matter at all
}
```

Medium's own assignment builds and directly proves this last claim.

Within one batch, an intent submitted first and one submitted last settle at the _identical_ price, a real, structural elimination of ordering advantage within the batch, rather than a probabilistic deterrent the way `minAmountOut` (a real, useful, but different kind of defense) is.

---

## 10. Just-in-time (JIT) liquidity.

A genuinely distinct MEV source, structurally different from Concepts 2 through 4 and directly buildable using Week 34's own `LiquidityPool` completely unchanged.

The "attack" here isn't a bug in the pool's own logic at all, it's an emergent consequence of how pro-rata fee-sharing (Week 34, Concept 4) interacts with mempool visibility (Concept 5).

A sophisticated LP watches for a large pending swap, deposits a _huge_ amount of liquidity into the relevant pool an instant before it lands (diluting every existing LP's own share of the pool), lets the large trade execute (its own swap fee now splits pro-rata across the pool's own current, JIT-inflated share distribution), then withdraws that same huge liquidity immediately afterward.

Capturing the overwhelming majority of that one large trade's own fee, while an honest, continuously-present LP's own real, ongoing liquidity gets diluted out of most of the fee they otherwise would have earned.

Hard's own assignment measures this directly.

The identical honest LP, the identical large trade, meaningfully less fee income the moment a JIT LP is present.

---

## 11. MEV on Solana. (Jito and bundles)

Solana's own architecture (Week 10's own Sealevel parallel execution, no traditional shared mempool the way Ethereum has one, pending transactions stream directly toward whichever validator is the _current leader_) makes MEV look genuinely different in practice, not absent.

**Jito** is real, live Solana infrastructure. A modified validator client plus a "block engine" providing Solana's own close analogue to Flashbots' own bundles (Concept 7).

A **bundle** is an atomic, strictly-ordered group of transactions submitted together, guaranteed to execute in that exact order or not execute at all, paired with a **tip** (a direct payment to the current leader, functionally similar to Concept 6's own builder bid) for prioritizing that bundle.

The underlying economic forces (Concepts 2-4, 10) are identical across both chains.

But what genuinely differs is the infrastructure shape extraction and protection both have to work within, a direct, concrete consequence of the two chains' own different consensus and transaction-propagation architectures, covered all the way back in Weeks 2 and 10.

---

## 12. The full anatomy of one block: where extraction and protection each intervene.

```
User's wallet                Public mempool          Builder (Concept 7)        Relay          Proposer
──────────────                ──────────────           ────────────────────       ──────          ─────────
sends an ordinary tx ────────►
  (sandwichable — Concept 4,      │
   watched by searchers —         │
   Concept 5)                     ▼
                              searcher bots watch,
                              race (Concepts 2, 3),
                              or sandwich (Concept 4)
                                                     ◄── every pending tx,
                                                          own + searchers',
                                                          competes for the
                                                          MOST VALUABLE
                                                          block ordering
                                                                              verifies the bid,
                                                                              holds payment ──►  picks highest
                                                                                                  bid, blind
                                                                                                  (Concept 6)

sends via Flashbots Protect ─────────────────────────► (bypasses the public
  (Concept 8 — never enters          mempool ENTIRELY —
   the public mempool at all)         searchers never see it)

submits a batch-auction
intent instead (Concept 9) ──► settles at ONE clearing
                                 price — ordering, even
                                 within the public
                                 mempool, no longer
                                 matters at all
```

Every previous concept this week is one box or one arrow in this exact diagram.

Worth returning to directly once Easy, Medium, and Hard have each built one real, concrete piece of it.

---

## Assignment.

1. **Easy - Arbitrage and a Liquidation Race, Two Necessary Forms of MEV.**

   **What you practice:**
   - A real arbitrage bot profiting from a genuine price discrepancy between two pools, and correcting it in the process (Concept 2)
   - A real liquidation race: two searchers, one winning, one failing harmlessly (Concept 3)

   **Requirements:**
   - Two `LiquidityPool` instances (Week 34's own, unchanged) for the identical token pair, deliberately seeded at two different prices.
   - An `Arbitrageur` contract: `executeArbitrage(cheapPool, expensivePool, tokenA, tokenB, amountIn)`, buying on the cheap pool and selling on the expensive one, returning the real profit.
   - A `SimpleLendingPool` contract: `depositCollateral`, `borrow`, an owner-settable `collateralPrice` (simulating an oracle, Week 41), `isLiquidatable(address)`, and `liquidate(address user, uint256 repayAmount)` paying a real `5%` bonus in seized collateral.
   - A test confirming the arbitrage genuinely profits and genuinely moves both pools' own prices closer together.
   - A test: drop `collateralPrice` until a borrower becomes liquidatable; two separate searcher addresses both attempt `liquidate()` on the identical position; the first succeeds and earns the bonus; the second, submitted right after, reverts, since the position is no longer eligible.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 1 test for test/Arbitrage.t.sol:ArbitrageTest
           [PASS] testFix_ArbitrageProfitsAndNarrowsThePriceGap()
           Ran 1 test for test/LiquidationRace.t.sol:LiquidationRaceTest
           [PASS] testFix_FirstSearcherWinsSecondFailsHarmlessly()

   2. Command: forge test --match-test testFix_FirstSearcherWinsSecondFailsHarmlessly -vvvv

       Expected output: a trace showing searcher1's own `liquidate` call
       succeeding, genuinely transferring bonus collateral, followed by
       searcher2's own IDENTICAL call reverting with `NotLiquidatable` —
       confirming Concept 3's own race is real: being first, not being
       correct, is what determines the winner, since both searchers'
       transactions were equally valid the moment they were BOTH pending.

   3. Action: reverse the order — call `searcher2`'s own liquidation
       FIRST instead, then `searcher1`'s identical attempt second.

       Expected result: searcher2 now succeeds and searcher1 now fails —
       confirming this is genuinely a race with no inherent "correct"
       winner, purely whoever lands first, exactly Concept 5's own point
       about mempool visibility rewarding speed, not correctness.

   4. Command: in ArbitrageTest, temporarily seed BOTH pools at the
       identical 1000/1000 ratio (no price gap at all) instead of the
       deliberately different ones, then re-run
       testFix_ArbitrageProfitsAndNarrowsThePriceGap.

       Expected output: `profit` is now `0` (or negative, i.e. a loss after
       fees, correctly clamped to `0` by the contract's own
       `tokenAReceived > amountIn` check) — confirming Concept 2's own
       arbitrage profit genuinely depends on a REAL price discrepancy
       existing in the first place, not something that appears out of
       nowhere. Revert the change afterward.
   ```

2. **Medium - A Batch Auction: Proving Transaction Order Genuinely Doesn't Matter.**

   **What you practice:**
   - Building Concept 9's own genuinely new structural defense, distinct from Week 31/34's own already-built commit-reveal and slippage protection
   - Proving, directly, that submission ORDER within a batch has zero effect on the price any participant receives

   **Requirements:**
   - A `BatchAuction` contract: `submitBuyIntent(uint256 amountIn)`/`submitSellIntent(uint256 amountIn)`, storing intents without executing them; `settleBatch()`, computing ONE uniform clearing price from the batch's own total buy and sell volume (a simple, transparent model: clearing price = total sell volume / total buy volume, in the batch's own two-token terms), then executing every stored intent at that identical price.
   - A test submitting several buy and sell intents in one specific order, calling `settleBatch()`, and recording each participant's own resulting execution price.
   - A second test submitting the SAME intents in a DIFFERENT order, settling, and confirming every participant receives the IDENTICAL price as the first test — order genuinely doesn't matter.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output:
           Ran 1 test for test/BatchAuction.t.sol:BatchAuctionTest
           [PASS] testFix_SubmissionOrderDoesNotAffectTheClearingPrice()

   2. Command: forge test --match-test testFix_SubmissionOrderDoesNotAffectTheClearingPrice -vvvv

       Expected output: a trace showing both batches computing the
       IDENTICAL `totalBuyVolume`/`totalSellVolume` pair, regardless of
       which order the three intents were submitted in — confirming the
       clearing price genuinely depends only on the batch's own aggregate
       totals, never on arrival order.

   3. Action: temporarily add a FOURTH intent (a small additional buy
       from a new address) to ONLY `auctionA`'s own batch (not `auctionB`'s),
       then re-run.

       Expected output: the test now FAILS — `aliceReceivedOrderA` and
       `aliceReceivedOrderB` genuinely diverge, confirming the equality
       Test Case 1 confirmed wasn't a coincidence of these SPECIFIC three
       intents, it depends on the two batches' own aggregate totals
       actually matching. Revert the added intent afterward.

   4. Action: attempt to call `settleBatch()` a second time on the same
       `auctionA` instance.

       Expected result: reverts (`"already settled"`) — confirming a batch
       is a genuine, one-time event, not something that could be
       manipulated by settling it multiple times with different orderings
       to search for a more favorable outcome.
   ```

3. **Hard - JIT Liquidity: Measuring the Real Harm to an Honest LP.**

   **What you practice:**
   - Building Concept 10's own JIT liquidity "attack" using Week 34's `LiquidityPool` completely unchanged — confirming directly that this isn't a bug being exploited, it's an emergent, structural consequence of the pool's own honest, correct fee-sharing logic
   - Measuring the real difference in an honest LP's own fee income, with and without a JIT LP present for the identical large trade

   **Requirements:**
   - Reuse Week 34's `LiquidityPool` and `MockERC20`, unchanged.
   - A test, **without** any JIT activity: an honest LP deposits liquidity, a large trade executes, the honest LP withdraws and their combined redeemed value is recorded.
   - A second test, **with** JIT activity: the identical honest LP deposits the identical amount; immediately before the identical large trade, a separate JIT LP deposits a very large amount of liquidity; the trade executes; the JIT LP immediately withdraws every share they just minted; only then does the honest LP withdraw.
   - An assertion confirming the honest LP's own combined redeemed value is measurably LOWER in the JIT scenario than in the baseline scenario, for the identical trade — the real harm, made concrete rather than only described.
   - A separate assertion confirming the JIT LP's own combined position, after their full deposit-then-withdraw round trip, is genuinely worth MORE than what they put in — confirming they profited, not merely broke even.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 2 tests for test/JITLiquidity.t.sol:JITLiquidityTest
           [PASS] testExploit_JITLiquidityCapturesMostOfTheFeeInstead()
           [PASS] testFix_BaselineHonestLPCapturesTheFullFee()

   2. Command: forge test -vv (read the console output printed by both
       tests directly, side by side)

       Expected output: the baseline test's own `honestLP redeemed` total
       is meaningfully HIGHER than the JIT test's own `honestLP redeemed`
       total, for the IDENTICAL 500-ether trade — confirming Concept 10's
       own real, measured harm directly, not as an assumption.

   3. Command: forge test --match-test testExploit_JITLiquidityCapturesMostOfTheFeeInstead -vvvv

       Expected output: a trace confirming the JIT LP's own `addLiquidity`,
       the trade, and the JIT LP's own `removeLiquidity` all happen BEFORE
       the honest LP ever withdraws — the exact real sequencing (deposit,
       let one trade happen, withdraw immediately) that makes this a JIT
       attack specifically, rather than ordinary, honest, continuous
       liquidity provision.

   4. Action: in `testExploit_JITLiquidityCapturesMostOfTheFeeInstead`,
       temporarily have the JIT LP's own `removeLiquidity` call happen
       BEFORE `_runLargeTrade(pool)` instead of after (withdrawing before
       the trade they were supposedly trying to capture fees from), then
       re-run.

       Expected result: the JIT LP's own withdrawn amount now roughly
       equals what they deposited (no profit at all — `assertGt(jitWithdrawn,
       jitDeposited)` should now fail), and the honest LP's own final
       redeemed amount returns to roughly the BASELINE test's own result —
       confirming the JIT LP's entire profit genuinely depended on being
       present AT THE MOMENT the large trade executed, not merely on
       having deposited a large amount at some point. Revert the change
       afterward.
   ```
