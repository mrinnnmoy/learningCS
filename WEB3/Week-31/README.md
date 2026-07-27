# List of things learned.

## 1. Reentrancy attacks, generalized.

Week 28 (Concepts 8, 9, 11) already built and fixed the canonical single-function case.

A function sends ETH before updating its own balance and the recipient's `receive()` calls back in before that update lands.

The general form is wider than that one function, worth naming plainly rather than assuming Week 28 covered everything:

- **cross-function reentrancy**, where the re-entrant call hits a _different_ function than the one being exploited, one that reads the same not-yet-updated state and

- **read-only reentrancy**, where the re-entrant call doesn't touch the vulnerable contract's own state at all, but calls into a _third_ contract that trusts the vulnerable contract's `view` functions, reading a temporarily-inconsistent snapshot mid-attack even though nothing there technically violates CEI (Week 28, Concept 9) on its own.

Both are the same root cause as Week 28's case, external control handed to a caller before a contract's own bookkeeping is internally consistent, just not caught by checking a single function's own ordering in isolation.

---

## 2. Integer overflow/underflow & How `unchecked` can reintroduce it on purpose.

Week 27 (Concept 10) and Week 29 (Concept 9) already covered the historical SafeMath era and Solidity 0.8's own built-in checked arithmetic as the default.

The one thing neither week covered.

Solidity 0.8+ still lets a developer _opt back out_ of that protection, deliberately, for gas savings (Week 46 covers the actual savings numbers), via an `unchecked { ... }` block.

```solidity
function decrementBy(uint256 amount) external {
    unchecked {
        count -= amount;   // NO underflow check inside this block — the pre-0.8 bug, reintroduced on purpose
    }
}
```

`unchecked` is legitimate and common in real, audited code, specifically in places a developer can _prove_ an overflow is mathematically impossible given the surrounding logic (a loop counter bounded by an array's own known length, for instance).

The vulnerability isn't the keyword itself, it's using it somewhere that proof doesn't actually hold, silently reintroducing Week 27 Concept 10's exact original bug inside one narrow block a reviewer has to specifically double-check rather than trust by default the way ordinary arithmetic can be trusted since 0.8.

---

## 3. Access control vulnerabilities. (Generalized, including the `tx.origin` case Week 28 deferred)

Weeks 27, 29 built `onlyOwner`/`onlyRole` correctly from the start.

The vulnerability class is what happens when one is missing, wrong or checks the wrong thing entirely.

The specific case Week 28 (Concept 9) named and deliberately deferred:

- checking `tx.origin` instead of `msg.sender` for authorization.

```solidity
// VULNERABLE — never do this
function withdrawAll() external {
    require(tx.origin == owner, "not owner");   // checks who STARTED the whole call chain
    payable(msg.sender).transfer(address(this).balance);
}
```

`tx.origin` is always the original externally-owned account (Week 26, Concept 1) that kicked off the entire transaction, unchanged no matter how many contracts it passes through (Week 28, Concept 7's own point about `msg.sender` changing per-hop, `tx.origin` deliberately doesn't).

So if the real owner is ever tricked into calling _any_ malicious contract, even for something totally unrelated, that malicious contract can turn around and call the vulnerable one and `tx.origin` still reads as the real owner, `require`ing right through a check that looks correct on the page.

A second, genuinely common real-world case, distinct from a wrong-check.

An **unprotected initializer**, an `initialize(address owner)`-style function (Week 27, Concept 5's constructor-replacement pattern, needed once Week 33's upgradability arrives) with no access control and no "already initialized" guard at all, callable by anyone, at any time, to simply claim ownership outright.

Easy's own assignment builds and fixes exactly this.

---

## 4. Front-running & MEV, in overview.

Before a submitted transaction is actually mined, it sits visible in the **mempool** (Week 2, Concept 6's own term, revisited here specifically for its security implications), readable by anyone running a node, including automated bots.

A transaction whose outcome depends on being first, revealing a valuable secret, or executing at a specific price, is exploitable purely from that visibility.

A bot can read a pending transaction's calldata, construct its own copy and pay a higher gas price to get mined first, _"front-running"_ the original.

A specific, extremely common shape of this against AMM swaps (Concept 6 below) is the **sandwich attack**.

A bot spots a pending large swap, buys the same asset just before it (pushing the price up ahead of the victim), lets the victim's own swap execute at that now-worse price, then immediately sells back after, pocketing the difference the victim's own trade paid for.

The general defense is **commit-reveal**.

Submit a hash of an answer/bid/action first, reveal the real value only in a second, later transaction, so there's nothing valuable to copy out of the first transaction's own calldata.

Week 45 covers the wider MEV picture this belongs to in depth (block builders, private mempools, Flashbots). This week's own Medium assignment builds and tests a commit-reveal fix hands-on, without needing a live, multi-party mempool race to prove the mechanism works.

---

## 5. Flash loan attacks.

A flash loan is an uncollateralized loan that's only possible because of Week 26 Concept 3's own atomicity guarantee: borrow any amount, with zero collateral, as long as it's repaid.

Plus, usually, a small fee before the _same transaction_ ends.

If it isn't, the entire transaction, loan included, reverts as if it never happened.

This is genuinely useful for legitimate purposes (arbitrage, collateral swaps, self-liquidation) precisely because it removes the capital barrier that would otherwise gate them and that exact same removed barrier is what makes flash loans a real attack tool.

An attacker with no capital of their own can temporarily command a position large enough to meaningfully move a thinly-liquid market (Concept 6 next), execute an exploit against a contract that trusts that market's price and walk away with the difference, all inside one transaction, all without ever risking their own funds beyond gas.

---

## 6. Oracle manipulation attacks.

Any contract that needs to know an asset's real-world or market price needs an **oracle**, something feeding that price on-chain (Week 41 covers real oracle designs, Chainlink and Pyth, in depth).

And the single most common, most exploited design mistake is using an AMM pool's own _spot_ price, computed directly from its current reserves, as if it were that trustworthy external price.

```solidity
// VULNERABLE price source — a naive AMM's own spot price, read directly:
function spotPriceBPerA() external view returns (uint256) {
    return (reserveB * 1e18) / reserveA;   // manipulable within a SINGLE transaction (Concept 5)
}
```

Because a pool's reserves are just its own contract storage (Week 27, Concept 2) and a flash loan (Concept 5) can temporarily swap an enormous amount through that same pool inside one transaction.

An attacker can swing this "price" wildly, use it against a _different_ contract that trusts it (Hard's own `VulnerableLendingPool`) and swap back before the transaction ends.

The pool's real, longer-term price is never actually threatened, only the single, manipulable instant a naive reader trusted.

The standard mitigation is a **TWAP** (time-weighted average price), averaged over many blocks rather than read from one instant, genuinely expensive to manipulate since it would require sustaining a manipulated price across many separate transactions and blocks, not just one.

A simpler, blunter mitigation, the one Hard's own fixed version uses, is not deriving price from a manipulable on-chain pool at all, using an external, off-chain-fed oracle (Week 41) instead.

---

## 7. Denial of service (DoS) patterns.

Several genuinely different mechanisms all end in the same place, a contract becoming permanently or temporarily unusable for some or all users, without any funds necessarily being stolen at all.

| Pattern                         | Mechanism                                                                                                                                                                                                                                        | Typical fix                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unexpected revert in a loop     | A contract pushes payments to a list of addresses in one loop (Week 28, Concept 2); ONE malicious recipient's `receive()` always reverts, blocking the entire loop, and every other legitimate recipient along with it                           | **Pull over push**: let each recipient withdraw their own funds individually, in their own separate transaction, rather than the contract pushing to everyone in one shared loop |
| Unbounded gas / block gas limit | A loop's length grows with user-controlled input (an ever-growing array of depositors, say) until iterating it costs more gas than a block can hold at all, permanently un-callable                                                              | Bound loop length explicitly, or restructure to a pull-based/paginated pattern that never needs to iterate the whole set in one call                                             |
| Owner-dependent liveness        | A contract requires a specific privileged address (Week 27, Concept 11; Week 29, Concept 7) to call some function for the system to keep functioning at all, and that address becomes unavailable (lost key, compromised, deliberately withheld) | Time-locked fallback logic, multisig (Week 42) rather than a single EOA, or a permissionless path for the specific function that's actually safe to open up                      |

Easy's own assignment builds and fixes the first row directly, the most common of the three in practice and the most directly traceable to a specific line of code, exactly the kind of concrete "break it, then fix it, then test both" pattern this course has used since Week 27.

---

## 8. Delegatecall vulnerabilities.

Week 28 (Concept 6) already covered the mechanism:

- `delegatecall` runs the target's code in the _caller's_ own storage context.

The security consequence, not fully drawn out there.

If the target address a contract `delegatecall`s into is itself a _mutable_ state variable, an attacker who can somehow get that variable changed to point at their own malicious contract gains the ability to run arbitrary code with full write access to the caller's own storage, including _"depending on layout"_ the caller's own `owner` variable (Week 27, Concept 11) or any other sensitive slot.

```solidity
address public implementation;   // if this is ever attacker-settable, EVERYTHING below is compromised

fallback() external payable {
    (bool ok, ) = implementation.delegatecall(msg.data);   // attacker's code, caller's storage
    require(ok);
}
```

This exact shape, an implementation address a proxy delegatecalls into, is precisely Week 33's upgradability mechanism, which is exactly why this concept matters directly for a course that's about to build one.

The 2017 Parity multisig incident, real, well-documented history, worth knowing by name rather than reconstructing here, stemmed from a library contract reachable via `delegatecall` that itself could be triggered to self-destruct, permanently freezing every wallet that delegatecalled into it a vulnerability class this exact mechanism enables, not a one-off bug specific to that one codebase.

---

## 9. Timestamp dependence.

`block.timestamp` is set by whoever proposes a block (a validator, under Ethereum's current proof-of-stake consensus), not by some independent, trustworthy clock.

Real consensus rules bound how far it's allowed to drift from actual wall-clock time and from the previous block's own timestamp, but within that narrow, legal window, a validator has some genuine influence over the exact value.

A contract using `block.timestamp` as a source of randomness (a "coin flip," a lottery's own winner selection) is vulnerable on two separate fronts worth naming separately.

The validator-influence angle just described and usually the more practical one.

The fact that `block.timestamp` is a public value anyone can read from the _pending_ block before it's finalized, meaning any outcome computed purely from it is predictable or checkable-then-abandoned-if-unfavorable, by literally anyone watching, not just a validator with special access.

```
Real, wall-clock time drift allowed by consensus:      a few seconds, bounded
Solana's own block.timestamp equivalent (Week 11):     the Clock sysvar, supplied by the leader validator
                                                          for that slot — a genuinely different mechanism
                                                          (no PoS timestamp-drift rule the same way),
                                                          but the SAME underlying lesson: it's supplied by
                                                          whoever's currently producing blocks, not external
```

Medium's own assignment builds a naive timestamp-based lottery and demonstrates the manipulation directly, using Foundry's own `vm.warp` cheatcode to simulate exactly the kind of value a validator could plausibly have chosen instead.

---

## 10. Audit tools. (Slither and Mythril)

Both look for exactly the vulnerability classes Concepts 1 through 9 just described, mechanically, before a human reviewer even opens the code, but by genuinely different methods.

|                           | Slither                                                                                          | Mythril                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Method                    | Static analysis — pattern-matches against a large, maintained catalogue of known-bad code shapes | Symbolic execution — actually explores the contract's possible execution paths looking for reachable bad states |
| Speed                     | Fast, seconds for most projects                                                                  | Slow, can take minutes per contract                                                                             |
| Setup                     | `uv tool install slither-analyzer`, works against a Foundry/Hardhat project directly             | More involved (a Rust nightly toolchain historically required), genuinely more setup friction                   |
| Typical use               | A fast first pass, every commit, in CI                                                           | A deeper, occasional pass on specific, higher-risk contracts before a real audit or mainnet deploy              |
| False positives/negatives | Some of both — a fast pattern match isn't proof, just a strong hint                              | Fewer false positives on what it does explore, but can miss paths its own exploration budget doesn't reach      |

```
slither .
```

Neither tool replaces a human security review and neither is a substitute for the other.

- Slither's speed makes it the right thing to run constantly, on every change.

- Mythril's depth makes it worth reaching for specifically on the highest-stakes contracts before they matter for real, an explicit trade-off rather than a strict "better" and "worse."

---

## 11. Security best-practice checklists.

Everything in Concepts 1 through 10 compresses into a short, concrete set of review questions, worth having written down and actually run through before any contract goes live, rather than trusted to memory in the moment:

- Does every state-changing external call follow Checks-Effects-Interactions (Week 28, Concept 9) and is a reentrancy guard (Week 28, Concept 11) applied anywhere CEI alone feels fragile to maintain?

- Does every `unchecked` block (Concept 2) carry a comment proving why overflow is actually impossible there?

- Does every privileged function have the _right_ check — `msg.sender`, never `tx.origin` (Concept 3) and is every initializer either constructor-only or explicitly guarded against being called twice?

- Does anything depend on `block.timestamp` (Concept 9) for a purpose where predictability or narrow validator influence actually matters?

- Does any price-dependent logic read a manipulable single-transaction source (Concept 6) rather than a TWAP or external oracle?

- Does any loop iterate over a list an attacker (or just an unexpectedly large legitimate use) could grow without bound (Concept 7), or push funds to addresses that might deliberately revert?

- Is every `delegatecall` target (Concept 8) either a compile-time constant or protected by the same access control rigor as the most sensitive function in the whole contract?

- Has Slither (Concept 10) actually been run, and every finding either fixed or explicitly, knowingly accepted with a written reason, not just silently ignored?

Hard's own assignment produces exactly this list, filled in against the specific contracts built this week, as a real, committed `SECURITY_CHECKLIST.md`, not left as an abstract exercise.

---

## 12. Composing vulnerabilities. (How real exploits chain several of these at once)

Almost no real, large exploit is just one item from this catalogue in isolation.

The pattern this week's own Hard assignment builds, a flash loan (Concept 5) funding an oracle manipulation (Concept 6) against a lending contract that trusts a manipulable price, is close to a textbook shape of real, historical DeFi exploits worth knowing existed (Harvest Finance and Cheese Bank, among several others, both lost real funds to close variants of exactly this chain).

Not because this course is reconstructing either specific incident, but because the underlying combination, cheap temporary capital plus a price source that trusts a single transaction, recurs constantly once you know to look for the shape rather than memorizing one instance of it.

The practical lesson for the checklist above:

- reviewing each function in isolation against Concepts 1-9 individually is necessary but not sufficient

- the review question worth adding on top is "if an attacker could temporarily control an enormous, uncollateralized amount of any token this contract touches, for exactly one transaction, does anything here still hold?"

---

## Assignment.

1.  **Easy - An Unprotected Initializer and a Denial-of-Service Refund Loop.**

    **What you practice:**
    - The unprotected-initializer access control bug, built, exploited, and fixed (Concept 3)
    - The push-payment DoS pattern, built, exploited, and fixed with pull-over-push (Concept 7)
    - Writing exploit proof-of-concept tests directly in `forge-std`, for the first time this course doing so deliberately to demonstrate an attack rather than just confirming correct behavior

    **Requirements:**
    - A `VulnerableVault` contract with an `initialize(address _owner)` function, no access control and no "already initialized" guard at all, setting a public `owner` variable; a `withdraw()` function, `onlyOwner`-gated (reading the same `owner` variable), sending the full contract balance to the caller.
    - A `FixedVault` contract, identical in spirit, but `owner` is set once, in the constructor, exactly Week 27, Concept 5's pattern — no separate `initialize` function exists at all.
    - A `VulnerableAuction` contract: `bid()` (payable), tracking the current highest bidder and refunding the _previous_ highest bidder by pushing ETH to them directly, inline, inside the same `bid()` call, before accepting the new bid.
    - A `FixedAuction` contract: identical bidding logic, but refunds go into a `pendingReturns` mapping instead of being pushed immediately; a separate `withdrawRefund()` function lets each outbid bidder pull their own refund independently.

    [Solution](./Assignment/code1/)

    **Final Output.**

    ```
    mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-31/Assignment/code1/security-easy$ forge test -vv
    [⠒] Compiling...
    No files changed, compilation skipped

    Ran 2 tests for test/AuctionSecurity.t.sol:AuctionSecurityTest
    [PASS] testExploit_RevertingBidderBlocksAllFutureBids() (gas: 349908)
    [PASS] testFix_RevertingBidderCannotBlockFutureBids() (gas: 507544)
    Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 2.07ms (1.28ms CPU time)

    Ran 2 tests for test/VaultSecurity.t.sol:VaultSecurityTest
    [PASS] testExploit_AnyoneCanClaimUnprotectedVault() (gas: 267820)
    [PASS] testFix_ConstructorOnlyOwnerCannotBeReclaimed() (gas: 169300)
    Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 2.07ms (930.07µs CPU time)

    Ran 2 test suites in 203.39ms (4.14ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
    ```

2.  **Medium - Timestamp-Dependent Randomness and Front-Runnable Reveals.**

    **What you practice:**
    - Manipulating `block.timestamp` directly via `vm.warp`, demonstrating exactly the kind of value a validator could plausibly have chosen (Concept 9)
    - A naive "answer directly" pattern's front-running vulnerability, and the commit-reveal fix, tested end to end (Concept 4)

    **Requirements:**
    - A `VulnerableLottery` contract: `enter()` (payable, fixed 1 ETH entry), `drawWinner()` computing a "random" outcome as `uint256(keccak256(abi.encode(block.timestamp))) % players.length` and paying that player the full pot.
    - A `VulnerableGuessTheNumber` contract: `guess(uint256 answer)` (payable, fixed 1 ETH entry) comparing `answer` directly against a stored secret number, paying the full pot to whoever guesses correctly first.
    - A `CommitRevealGuess` contract: `commit(bytes32 hashedGuess)` stores `keccak256(abi.encodePacked(guess, salt, msg.sender))`; a separate `reveal(uint256 guess, bytes32 salt)`, callable only after commits close, checks the hash matches and pays out only on a correct, matching reveal.

    [Solution](./Assignment/code2/)

    **Final Output.**

    ```
    mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-31/Assignment/code2/security-medium$ forge test -vv
    [⠒] Compiling...
    No files changed, compilation skipped

    Ran 1 test for test/LotterySecurity.t.sol:LotterySecurityTest
    [PASS] testExploit_TimestampChoosesPredictableWinner() (gas: 410936)
    Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.41ms (674.71µs CPU time)

    Ran 2 tests for test/FrontRunningSecurity.t.sol:FrontRunningSecurityTest
    [PASS] testExploit_AnswerVisibleInCalldataCanBeCopied() (gas: 181170)
    [PASS] testFix_CommitRevealHidesTheAnswerUntilItsUseless() (gas: 427285)
    Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 2.51ms (1.09ms CPU time)

    Ran 2 test suites in 24.36ms (4.93ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
    ```

3.  **Hard - A Flash Loan + Oracle Manipulation Attack, a Real Fix, a Slither Pass, and a Written Checklist.**

    **What you practice:**
    - Building and running a real, composed exploit (Concept 12): a flash loan (Concept 5) funding an oracle manipulation (Concept 6) against a naive lending contract
    - Fixing it with an external, non-manipulable price source, and confirming the identical attack fails
    - Running Slither (Concept 10) against this week's entire body of work, vulnerable contracts included on purpose, and reading its output critically rather than treating it as either infallible or worthless
    - Producing a real `SECURITY_CHECKLIST.md` (Concept 11), filled in specifically against what was actually built this week, not left abstract

    **Requirements:**
    - A minimal `MockERC20` (mint/transfer/approve/transferFrom only — flagged clearly in its own comments as an insecure, open-mint TEST FIXTURE, never a real token) and a `SimplePool` (naive constant-product AMM, `swapAForB`/`swapBForA`, and a `spotPriceBPerA()` reading current reserves directly — Concept 6's own vulnerable shape).
    - A `FlashLoanProvider`: `flashLoan(uint256 amount, address borrower, bytes calldata data)`, transfers `amount` to `borrower`, calls `borrower.onFlashLoan(amount, data)`, then reverts the whole transaction with `RepaymentFailed()` if its own token balance hasn't been fully restored by the time that call returns.
    - A `VulnerableLendingPool`: `depositCollateral`/`borrow`, valuing a caller's deposited collateral using `SimplePool.spotPriceBPerA()` directly, with no TWAP, no LTV buffer, no external oracle at all.
    - A `TrustedOracle` (owner-set price, no connection to any pool's reserves) and a `GuardedLendingPool`, identical to the vulnerable one except it prices collateral through `TrustedOracle` instead.
    - A `FlashLoanAttacker` contract executing the full chain: deposit a small amount of real collateral, flash-borrow a large amount of the borrow token, dump it into `SimplePool` to spike the collateral token's spot price, borrow far more than the real collateral is worth from `VulnerableLendingPool`, repay the flash loan out of the proceeds, and walk away with the rest.
    - Both an exploit test (succeeds against `VulnerableLendingPool`) and a fix test (the identical attack, run against `GuardedLendingPool`, fails to profit).
    - A Slither pass across the whole `security-hard/` project, and a written `SECURITY_CHECKLIST.md` filling in Concept 11's own checklist against these specific contracts.

    [Solution](./Assignment/code3/)

    **Manual Test Cases.**

    ```
    1. Command: forge test -vv

        Expected output shape:
            Ran 2 tests for test/FlashLoanOracleAttack.t.sol:FlashLoanOracleAttackTest
            [PASS] testExploit_FlashLoanOracleManipulationDrainsVulnerablePool()
            [PASS] testFix_IdenticalAttackRevertsEntirelyAgainstGuardedPool()
            Suite result: ok. 2 passed; 0 failed; 0 skipped

        Both tests PASSING is the correct, expected state here — the first
        passes because the exploit's own assertion (`assertGt`, a large
        profit) holds; the second passes because it explicitly expects the
        attack's own call to revert (`vm.expectRevert`), and it genuinely
        does — GuardedLendingPool's own `require` rejects the wildly
        oversized borrow request outright, reverting the entire attack
        transaction, not just trimming the attacker's profit down.

    2. Command: forge test --match-test testExploit -vvvv

        Expected output: a full trace showing the flash loan, the
        `swapBForA` call spiking `spotPriceBPerA()`, and the subsequent
        `borrow()` call succeeding for an amount far exceeding the real
        10 tokenA collateral's honest value — the manipulation, made
        visible step by step, not just asserted as a final number.

    3. Command: in src/VulnerableLendingPool.sol, temporarily copy its
        exact logic into a new pretend "fix" that just adds a flat 50%
        haircut to the collateral value (`collateralValue / 2`) rather than
        changing the price source at all, point a fresh
        FlashLoanAttacker-driven test at it (same setUp pattern as
        testExploit), and check whether `tokenB.balanceOf(attackerOwner)`
        still exceeds `50_000 ether` afterward.

        Expected output: it still does — a flat haircut on a manipulated
        price is still a haircut on a manipulated price; the pool's spot
        price can be pushed arbitrarily high given a large enough flash
        loan, so any fixed percentage discount off it is still exploitable
        given enough capital, confirming Concept 6's real point directly:
        the fix has to be changing the price SOURCE itself (Concept 6's
        TWAP/external-oracle point), not adjusting the manipulable number.
        This file was a throwaway scratch test, not part of Requirements —
        delete it afterward, GuardedLendingPool remains the actual Solution.

    4. Command: slither . (from security-hard/'s own root)

        Expected output: findings against MockERC20's open `mint()`
        (expected, accepted per the checklist above), and likely findings
        against VulnerableLendingPool and/or SimplePool touching on
        arbitrary-send or unchecked-transfer-return patterns — read each
        one and decide, explicitly, fixed-or-accepted, exactly the checklist
        item this Manual Test Case exists to actually exercise, not just
        describe. Exact detector names and finding counts will vary by the
        Slither version installed — the discipline of triaging every single
        line, not the specific text, is Concept 10's real point.
    ```
