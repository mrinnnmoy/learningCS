# List of things learned.

## 1. Constant product AMM math (`x*y=k`), in full.

Week 31's own `SimplePool` (Concept 6 there) already introduced the shape, `swapAForB`/`swapBForA`, reserves multiplying to a roughly-constant `k` — this week builds the complete, real version, the same math Uniswap V2 actually runs, fee included (Concept 4 covers the fee itself).

A swap's own output amount, given an input, comes directly from holding `k = reserveIn × reserveOut` constant before and after:

```
amountOut = (reserveOut × amountIn) / (reserveIn + amountIn)     — no-fee form, Week 31's own version
```

Two things worth naming precisely that Week 31 didn't need to:

- **price impact**,
- **slippage**.

Price impact is mechanical, larger trades relative to pool depth move the price more, an unavoidable consequence of the curve's own shape, not a bug.

Slippage is what a trader actually experiences as a result, the gap between the price quoted for a tiny trade and the effective price actually paid for a real-sized one.

Genuinely different concepts a lot of casual explanations blur together but:

- price impact is a property of the _pool_,
- slippage is what it costs a specific _trade_.

```
Pool: 1000 TOKEN_A / 1000 TOKEN_B  (spot price: 1:1)

Swap 10 A in  → out ≈ 9.90 B   (effective price ≈ 0.990 B per A — mild slippage)
Swap 500 A in → out ≈ 333.3 B  (effective price ≈ 0.667 B per A — SEVERE slippage,
                                  the same pool, the same formula, just a much larger trade)
```

---

## 2. LP token mechanics.

Providing liquidity mints a receipt token.

An **LP token**, representing a proportional claim on the pool's own current reserves.

This week's own `LiquidityPool` contract, mirroring Uniswap V2's actual design exactly, IS an ERC-20 itself (Week 29, Concept 1), the LP token isn't a separate contract, it's this same pool minting and burning its own shares.

```solidity
contract LiquidityPool is ERC20 {   // the pool IS the LP token — Uniswap V2's real design
    ...
}
```

The very first deposit into an empty pool has no existing ratio to measure against, so its share count is `sqrt(amount0 × amount1)` instead and a real, deliberate detail worth knowing rather than glossing over.

Uniswap V2 permanently locks a tiny amount of that first mint, `MINIMUM_LIQUIDITY` (1000 units, sent to an unspendable address), specifically to prevent a griefing attack where a malicious first depositor could otherwise manipulate the share-price math for every depositor after them.

This week's own contract reproduces that exact defense, not just the headline formula.

---

## 3. Adding & Removing liquidity.

Every deposit _after_ the first has to respect the pool's own current ratio, receiving shares proportional to whichever of the two tokens it contributes _relatively less_ of (protecting existing LPs from a deposit that would otherwise shift the pool's own price for free):

```solidity
liquidity = min(
    (amount0 * totalSupply) / reserve0,
    (amount1 * totalSupply) / reserve1
);
```

Removing liquidity is the exact mechanical inverse.

Burn LP tokens, receive back a proportional slice of _whatever the pool currently holds_, not necessarily the same amounts originally deposited.

Concept 4 and Concept 5 are both, at their core, different ways of describing exactly why that final withdrawal amount can differ from the deposit.

```solidity
amount0 = (liquidityBurned * reserve0) / totalSupply;
amount1 = (liquidityBurned * reserve1) / totalSupply;
```

---

## 4. Fee accrual to LPs.

Every real swap (Concept 1) charges a small fee, conventionally 0.3%, taken out of the input amount _before_ the constant-product formula runs.

The fee itself is never withdrawn separately or tracked in its own ledger, it simply stays inside the pool's own reserves, permanently, growing the value backing every existing LP token without anyone needing to call a "claim fees" function at all.

```solidity
uint256 amountInWithFee = amountIn * 997;                   // 0.3% fee taken here
amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);

// reserveIn effectively grows by the FULL amountIn (fee included), reserveOut shrinks by amountOut —
// the fee portion simply never leaves, permanently raising what each existing LP share is worth
```

This is the entire economic reason liquidity provision is a real, revenue-generating activity rather than just a service and it's also exactly what Medium's own assignment measures directly.

An LP who deposits, then watches a series of _other_ people's swaps happen, then withdraws, ends up with strictly more combined value than they deposited, purely from fees, even before Concept 5's own loss mechanism is factored in at all.

---

## 5. Impermanent loss, calculated precisely.

Providing liquidity is not economically identical to simply holding the same two tokens.

The difference between "value if I'd just held" and "value I actually get back by withdrawing LP shares" is **impermanent loss** (called "impermanent" because it only becomes a _realized_ loss the moment liquidity is withdrawn at a moved price; if the price ratio fully returns to where it started before withdrawal, it fully reverses).

The exact formula, in terms of `k`, the ratio of the new price to the price at deposit time:

```
IL(k) = [ 2·√k / (1 + k) ] − 1
```

| Price ratio change (`k`) | Impermanent loss |
| ------------------------ | ---------------- |
| 1.25× (25% move)         | ≈ −0.6%          |
| 1.5× (50% move)          | ≈ −2.0%          |
| 2× (100% move, doubled)  | ≈ −5.7%          |
| 3× (tripled)             | ≈ −13.4%         |
| 4× (quadrupled)          | ≈ −20.0%         |
| 5× (5x'd)                | ≈ −25.5%         |

The mechanism underneath the formula is the constant-product curve itself (Concept 1).

As one asset's real market price rises relative to the other, arbitrageurs (Week 26, Concept 3's atomicity is exactly what makes this riskless for them) trade against the pool until _its_ price matches the outside market again.

Which mechanically means the pool ends up holding _less_ of whichever asset went up and _more_ of whichever went down, relative to what a simple 50/50 hold would have kept, by construction, every single time, regardless of which direction the price moved.

Medium's own assignment computes this number directly, from a real simulated price move, and checks it against the closed-form formula above.

---

## 6. Impermanent loss vs. Volatility correlation.

The formula in Concept 5 depends on exactly one input, `k`.

The price ratio's own magnitude of change, which means IL correlates directly with how volatile a given pair actually is, not with anything else about the pool.

A stablecoin/stablecoin pair (Week 23's own stablecoin payment rails context), where both assets are pegged near the same value and `k` rarely strays far from `1`, experiences IL so small it's often genuinely negligible next to Concept 4's own fee income.

A highly volatile pair, a new token against ETH, say, can swing `k` far enough to make IL the single dominant factor in an LP's overall return, sometimes larger than all the fees earned put together.

This is exactly why real, sophisticated LPs actively choose which pools to provide liquidity to based on volatility expectations, not just headline fee tier or trading volume alone.

The two numbers (fee income and IL) have to be weighed against each other, not read in isolation and this week's own Medium assignment computes both from the same simulated scenario specifically to make that comparison concrete rather than abstract.

---

## 7. Concentrated liquidity, in overview.

Everything in Concepts 1 through 6 assumes liquidity spread uniformly across the _entire_ possible price curve, from zero to infinity.

Genuinely wasteful for a pair that, in practice, almost always trades within a narrow band (a stablecoin pair rarely straying far from 1:1, for instance).

**Concentrated liquidity** (Uniswap V3's own real innovation) lets an LP deposit into a chosen price _range_ instead of the full curve, using far more capital-efficient "ticks" to track exactly where liquidity is actually active at any given price.

Genuinely higher fee income per dollar deposited _within_ that range, at a real, corresponding cost.

Liquidity outside the chosen range earns nothing at all until the price moves back into it, and IL (Concept 5) is measurably amplified relative to a full-range position at the identical price move, since a concentrated position behaves, mathematically, like a smaller, more sensitive slice of the same curve.

This week's own assignments stay with the full-range, Uniswap-V2-style model throughout, the same "overview, not hands-on" treatment Week 29 gave ERC-1155 and Week 33 gave the Diamond pattern. Concentrated liquidity's own tick-management logic is a genuinely large, separate topic on its own.

---

## 8. Yield farming. (in overview & in practice)

**Yield farming** layers a second reward on top of everything in Concepts 1 through 6.

Stake the LP token itself (Concept 2) into a separate rewards contract and earn a _third_, usually project-specific, token over time, on top of whatever swap fees the underlying pool position is already earning.

Hard's own assignment builds a minimal, real version of this hands-on.

Deliberately simplified from how a real, large farm actually accounts for rewards and flagged plainly rather than presented as production-ready.

A real farm (the "MasterChef" pattern, extremely widely copied across real DeFi) tracks one shared `accRewardPerShare` value across every staker, so the total reward rate paid out stays fixed regardless of how many people are staking.

This week's own version gives each staker an independent, uncapped rate instead, correct and genuinely functional for demonstrating the _mechanism_ (stake, accrue, claim, unstake), but not how a real farm would actually cap its own total emissions.

```solidity
function pendingReward(address user) public view returns (uint256) {
    uint256 elapsed = block.timestamp - lastUpdateTime[user];
    return staked[user] * rewardRatePerSecond * elapsed / 1e18;   // SIMPLIFIED — see Concept 8's own note above
}
```

---

## 9. Pool exploits. (sandwich attacks)

Week 31, Concept 4 already named the general shape.

This week builds the concrete AMM version directly.

An attacker watching the mempool (Week 31's own term) for a pending, large swap can insert two transactions of their own around it.

Buy the same asset _just before_ the victim's swap executes (pushing the pool's own price up ahead of it, via Concept 1's own mechanics), let the victim's trade execute at that now-worse price, then immediately sell back _just after_ (Week 26, Concept 3's atomicity guaranteeing all three land, or none do, within the attacker's own control of transaction ordering via gas price).

```
Pool before:  1000 A / 1000 B  (1:1)

1. Attacker buys 200 A worth of B  → pool shifts, B now costs MORE A than before
2. VICTIM's swap executes at this worse price — gets less B than they would have at the original 1:1
3. Attacker sells back                        → pool shifts back toward 1:1, attacker pockets the difference
```

The victim's own real loss here is, precisely, the slippage Concept 1 already named.

A sandwich attack is simply an attacker _deliberately manufacturing_ slippage against one specific victim's own trade, rather than slippage arising from ordinary trade size alone.

---

## 10. Slippage protection. (`minAmountOut` & `deadline`)

The defense against Concept 9 is structural, not detection-based.

Every swap accepts a caller-specified minimum acceptable output and reverts outright rather than executing at a worse price than the caller was willing to accept.

```solidity
function swap(uint256 amountIn, uint256 minAmountOut, uint256 deadline) external returns (uint256 amountOut) {
    if (block.timestamp > deadline) revert Expired();              // Week 31, Concept 9's own timestamp caution,
                                                                  // used defensively here rather than exploited
    amountOut = ...;                                             // Concept 1's own formula
    if (amountOut < minAmountOut) revert SlippageExceeded();    // the ENTIRE sandwich defense, one comparison
}
```

A `deadline` parameter closes a related, separate gap.

Without one, a swap transaction sitting unusually long in the mempool (Week 31, Concept 4) before finally being mined could execute against a price that's drifted far from what the caller originally intended, with no attacker even required.

`minAmountOut` alone doesn't fully cover that case if the caller computed it against a stale price in the first place.

Hard's own assignment runs the identical sandwich attack from Concept 9 twice:

- once against a victim swap with `minAmountOut = 0` (succeeds, profitably, exactly as described above),
- once with a realistic `minAmountOut` set (the victim's own transaction reverts instead of executing at a manipulated price — protected, even though "protected" here means the trade doesn't happen at all rather than happening safely, a real, honest trade-off worth noticing directly).

---

## Assignment.

1. **Easy - Constant Product Math, LP Tokens and Adding/Removing Liquidity.**

   **What you practice:**
   - The constant-product formula and price impact, felt directly across a range of trade sizes (Concept 1)
   - LP token minting, including the first-depositor `MINIMUM_LIQUIDITY` lock (Concept 2)
   - Proportional, ratio-respecting subsequent deposits, and withdrawal as the exact mechanical inverse (Concept 3)

   **Requirements:**
   - A `MockERC20` (identical in spirit to Week 31's own, mint/transfer/approve/transferFrom only, flagged clearly as a test fixture) for two pool tokens.
   - A `LiquidityPool is ERC20` contract (OpenZeppelin's real `ERC20`, Week 29): `addLiquidity(uint256 amount0, uint256 amount1, uint256 minLiquidity)`, `removeLiquidity(uint256 liquidity, uint256 minAmount0, uint256 minAmount1)`, public `reserve0`/`reserve1`.
   - The first deposit into an empty pool mints `sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY` to the depositor and permanently locks `MINIMUM_LIQUIDITY` (1000) to `address(0xdead)`.
   - Every subsequent deposit mints shares via the proportional, ratio-respecting formula from Concept 3, reverting `InsufficientLiquidityMinted()` if the result is `0` or below the caller's own `minLiquidity`.
   - `removeLiquidity` burns the caller's LP tokens and returns a proportional share of current reserves, reverting `SlippageExceeded()` if either returned amount is below the caller's specified minimum.

   [Solution](./Assignment/code1/)

   **Final Output.**

   ```
   mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-34/Assignment/code1/liquidity-easy$ forge test -vv
   [⠊] Compiling...
   No files changed, compilation skipped

   Ran 4 tests for test/LiquidityBasics.t.sol:LiquidityBasicsTest
   [PASS] testFirstDepositMintsSqrtMinusMinimumLiquidity() (gas: 302466)
   [PASS] testInvariantRoughlyHoldsWithNoSwaps() (gas: 300827)
   [PASS] testRemoveLiquidityReturnsProportionalShare() (gas: 343304)
   [PASS] testSecondDepositRespectsExistingRatio() (gas: 409916)
   Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 2.07ms (2.34ms CPU time)

   Ran 1 test suite in 10.03ms (2.07ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
   ```

2. **Medium - Fee Accrual and a Real Impermanent Loss Calculation.**

   **What you practice:**
   - Adding the real, fee-charging `swap()` function, and confirming fees genuinely grow an LP's own redeemable value over time (Concept 4)
   - Computing impermanent loss directly, from a real simulated price move, and checking it against Concept 5's own closed-form formula
   - Seeing Concept 6's volatility correlation directly, by comparing a small price move against a large one in the same test suite

   **Requirements:**
   - Add `swap(uint256 amount0In, uint256 amount1In, uint256 minAmountOut, uint256 deadline)` to `LiquidityPool` (reused from Easy), charging a 0.3% fee (`997`/`1000`, Concept 4's own numbers) and reverting `Expired()` past the deadline, `SlippageExceeded()` below `minAmountOut`.
   - A test depositing liquidity, running several large swaps from a _different_ address, then withdrawing and confirming the combined redeemed value exceeds the original deposit's own combined value, purely from accrued fees.
   - A test computing impermanent loss directly: deposit liquidity at a 1:1 ratio, move the pool's own price via swaps to a known new ratio, compute "value if I'd just held" vs. "value from withdrawing LP shares right now," and confirm the percentage difference matches Concept 5's own formula within a small tolerance.
   - A second IL test at a much larger price move, confirming the loss percentage is meaningfully larger, Concept 6's own correlation made concrete rather than just asserted.

   [Solution](./Assignment/code2/)

   **Final Output.**

   ```
   mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-34/Assignment/code2/liquidity-medium$ forge test -vv
   [⠊] Compiling...
   No files changed, compilation skipped

   Ran 3 tests for test/FeesAndImpermanentLoss.t.sol:FeesAndImpermanentLossTest
   [PASS] testFix_FeesGrowLPsRedeemableValueOverTime() (gas: 574503)
   [PASS] testFix_ImpermanentLossMatchesTheClosedFormFormula() (gas: 424286)
   [PASS] testFix_LargerPriceMoveProducesLargerImpermanentLoss() (gas: 1971118)
   Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 1.60ms (1.86ms CPU time)

   Ran 1 test suite in 8.76ms (1.60ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
   ```

3. **Hard - A Sandwich Attack, Slippage Protection as the Fix and Minimal Yield Farming.**

   **What you practice:**
   - Building and running a real sandwich attack against an undefended swap, then confirming the identical attack fails once the victim uses `minAmountOut` correctly (Concepts 9, 10)
   - A minimal yield farming contract: stake LP tokens, accrue a second reward token over time, claim, unstake (Concept 8) — with its own real simplification flagged directly, not silently

   **Requirements:**
   - Reuse `LiquidityPool` and `MockERC20` from Medium, unchanged.
   - A `SandwichAttacker` contract: `frontRun(uint256 amountIn)` swaps token0 for token1; `backRun()` swaps whatever token1 balance it's holding back for token0 — two separate, explicit calls (the attacker's own two "sandwich" transactions), not one bundled function, so a test can interleave the victim's own transaction between them exactly the way a real mempool ordering would.
   - A test demonstrating the full sandwich against a victim swap called with `minAmountOut = 0`: front-run, victim swap, back-run, confirming the attacker's own token0 balance increased (a real, quantified profit) and the victim received measurably less token1 than an unsandwiched swap would have.
   - The identical sequence, but the victim's own swap call now uses a `minAmountOut` computed from the pre-attack price with a small, realistic tolerance: confirming the victim's transaction reverts with `SlippageExceeded()` instead of executing at the manipulated price — protected, at the cost of the trade simply not happening this time.
   - An `LPStaking` contract: `stake(uint256 amount)`, `unstake(uint256 amount)`, `claim()`, `pendingReward(address user) view`, using the simplified per-user reward-rate model from Concept 8, with that simplification noted in the contract's own comments, not just this README's.
   - A test staking LP tokens, warping time forward (`vm.warp`, Week 31's own pattern), and confirming `claim()` pays out the exact reward the simplified formula predicts.

   [Solution](./Assignment/code3/)

   **Final Output.**

   ```
   mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-34/Assignment/code3/liquidity-hard$ forge test -vv
   [⠊] Compiling...
   No files changed, compilation skipped

   Ran 1 test for test/YieldFarming.t.sol:YieldFarmingTest
   [PASS] testFix_ClaimPaysExactlyTheSimplifiedFormulaPredicts() (gas: 137816)
   Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.44ms (322.10µs CPU time)

   Ran 2 tests for test/SandwichAttack.t.sol:SandwichAttackTest
   [PASS] testExploit_SandwichProfitsAgainstUnprotectedVictimSwap() (gas: 466787)
   [PASS] testFix_RealisticMinAmountOutMakesTheSandwichRevertInstead() (gas: 428785)
   Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 2.04ms (700.45µs CPU time)

   Ran 2 test suites in 11.34ms (3.48ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
   ```
