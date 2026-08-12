# List of things learned.

## 1. Admin key patterns.

Almost every real, deployed contract this course has built since Week 27 has had _some_ privileged address:

- `onlyOwner` (Week 27, Concept 11),
- `onlyRole` (Week 29, Concept 7)

and this week is about doing that deliberately and honestly, rather than treating "there's an admin" as a single fact to note once and move past.

The real design question worth asking of every privileged function individually, not the contract as a whole.

What, specifically, can this one address do and is that the _minimum_ power needed for its actual job?

A contract with one `onlyOwner` modifier controlling twelve unrelated functions, mint, pause, fee changes, fund sweeps, all gated by the identical single check, is a fundamentally different, riskier trust profile than twelve functions each gated by its own narrowly-scoped role (Week 29, Concept 7's own `AccessControl`, reused directly here).

The same total capability, distributed instead of concentrated, so that compromising or misusing access to one doesn't automatically grant every other.

```solidity
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
bytes32 public constant SWEEPER_ROLE = keccak256("SWEEPER_ROLE");
// three DIFFERENT roles, three DIFFERENT keyholders possible — not one all-powerful owner
```

_Who_ holds a given admin key matters as much as _what_ it can do.

An EOA (Week 26, Concept 1), a multisig (Week 36, Concept 5), or a timelock (Week 33, Concept 8; Concept 6 below) are all real options for the same role, each with a genuinely different trust profile, the exact spectrum Week 36, Concept 5 already laid out for bridges, equally applicable to any admin-controlled contract at all.

---

## 2. Pausable & Circuit-breaker patterns, deepened.

Week 29, Concept 8 already covered `Pausable`'s own mechanics.

This week's own point is _how_ to use it responsibly.

A single, contract-wide `whenNotPaused` blocking absolutely everything, including a user's own ability to exit with their own funds, is a real, meaningfully different design than a pause that blocks new activity (deposits, minting, trading) while deliberately leaving an exit path open.

Easy's own assignment builds and directly contrasts both versions, since the difference between them is precisely the line between "an emergency brake" and "a mechanism that could trap user funds," which reads identically on the page as a single modifier keyword until traced through carefully.

```solidity
// new activity — fine to block
function deposit(uint256 amount) external whenNotPaused { ... }

// a user's OWN funds — deliberately NOT gated
function emergencyWithdraw() external {
    // no whenNotPaused here at all — the whole point
}
```

The real-world "circuit breaker" this pattern is named after does exactly this same thing.

It stops new current flowing through a circuit the instant something looks wrong, but it doesn't and structurally can't, trap whatever was already safely stored on the other side of it.

---

## 3. Emergency withdrawal mechanisms. (For users & separately for admins)

Two genuinely different mechanisms travel under the same name, worth telling apart precisely rather than treating as one idea.

Concept 2's own `emergencyWithdraw`, letting a _user_ pull out their own, already-deposited funds even while paused, is close to purely protective.

It constrains what an admin's own pause can do, rather than expanding it.

A _sweep_ function, letting the _admin_ move funds (typically framed as "rescuing mistakenly-sent tokens") is a fundamentally different, much higher-trust mechanism.

The exact same function shape can rescue a user's genuine mistake, or drain the contract entirely and there is no way for on-chain logic alone to distinguish those two cases, only the admin's own honesty does.

Both belong in a real contract's Trust Assumptions Disclosure (Concept 8) explicitly and for exactly opposite reasons:

- one to reassure users it exists,
- the other to warn them plainly that it does.

---

## 4. Rate limiting on-chain.

Capping how much value can move through a specific function within a rolling or fixed time window.

Genuinely useful as a _containment_ measure.

Even a fully compromised admin key or an exploited bug (Week 31's own entire catalogue), can only drain a bounded amount before the rate limit itself blocks further damage, buying real time to notice and respond.

```solidity
function withdraw(uint256 amount) external {
    if (block.timestamp >= windowStart[msg.sender] + WINDOW) {   // a new window has started — reset
        windowStart[msg.sender] = block.timestamp;
        withdrawnToday[msg.sender] = 0;
    }
    if (withdrawnToday[msg.sender] + amount > DAILY_LIMIT) revert RateLimitExceeded();

    withdrawnToday[msg.sender] += amount;
    balances[msg.sender] -= amount;
    token.transfer(msg.sender, amount);
}
```

This specific fixed-window implementation has a real, honest edge case worth naming rather than glossing over.

A user can withdraw the full daily limit right at the very end of one window, then the full limit again the instant a new window starts a moment later.

In the worst case, close to double the "daily" limit inside a short span straddling the boundary.

A true rolling window closes this gap, at real, higher gas cost to track exactly when each past withdrawal happened rather than just one running total.

Medium's own assignment builds the simpler, fixed-window version and its own Manual Test Cases demonstrate this exact edge case directly rather than only describing it.

---

## 5. Whitelisting & Blacklisting patterns.

Structurally near-identical, a mapping checked before letting an action through, but with opposite defaults and opposite real-world implications.

A **whitelist** defaults to deny, explicitly permits specific addresses.

Easy's own `GoodVault` uses exactly this, a genuinely common, relatively uncontroversial pattern for a permissioned or compliance-gated product.

A **blacklist** defaults to allow, explicitly blocks specific addresses used by several real, major, currently-live stablecoins (worth naming factually: USDC's own real, deployed contract has exactly this kind of function, used in practice to freeze specific addresses under legal or compliance pressure).

And genuinely more controversial precisely because it means _every_ holder's funds are, in principle, freezable by one privileged address at any time, a real, meaningful trust assumption a user is implicitly accepting the moment they hold that token at all, not a hypothetical edge case.

```solidity
function _update(address from, address to, uint256 value) internal override {
    if (isBlacklisted[from] || isBlacklisted[to]) revert Blacklisted(isBlacklisted[from] ? from : to);
    super._update(from, to, value);   // Week 29, Concept 6's own hook, reused for exactly this purpose
}
```

---

## 6. Governance-gated parameters.

Some admin-controlled values, a fee rate, a rate limit's own cap (Concept 4), a whitelist's own criteria, are legitimate to let change over time, but changing _instantly_, at one privileged address's own sole discretion, is a meaningfully different trust profile than changing through a process users get real advance notice of.

Week 33, Concept 8's own `TimelockController` is the direct, reusable mechanism.

Gate a parameter-changing function behind a timelock-owned address instead of a raw EOA and every change becomes schedule-then-wait-then-execute, exactly as it already was for Week 33's own upgrade authority, applied here to an ordinary parameter rather than an entire implementation swap.

```solidity
function setFee(uint256 newFeeBps) external onlyOwner {   // `owner` is a TimelockController, not a raw EOA — Concept 1
    if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();       // a HARD cap, even governance itself can't exceed
    feeBps = newFeeBps;
}
```

Worth noting the hard cap in the snippet above as its own, separate, genuinely useful pattern.

A governance-gated parameter doesn't have to mean _unlimited_ governance power over that parameter.

`MAX_FEE_BPS` bounds what even a fully legitimate, fully transparent, correctly-timelocked governance process could ever set, a real, additional user protection layered on top of, not instead of, the timelock itself.

---

## 7. Progressive decentralization strategies.

A real, common, publicly-observable lifecycle several major, real protocols have followed openly.

Launch with a single, centralized admin key (an EOA, Concept 1), because early on, the ability to respond to a discovered bug (Week 31's whole catalogue) _fast_, without a multi-day timelock delay in the way, genuinely matters more than decentralization does.

Then,

- once the contract has run long enough to build real confidence in its own correctness,
- migrate admin control to a multisig (Week 36, Concept 5),
- then to a timelock-gated multisig (Concept 6),
- then, sometimes, eventually to full on-chain governance (Week 42) or even outright renouncing admin control entirely.

Hard's own assignment builds and tests exactly the first two stages of this real lifecycle directly, not just describes it.

The identical contract, first owned by a raw EOA, later by a real, deployed `TimelockController`, with each stage's own real, different capabilities and limits proven by running actual transactions against both.

---

## 8. Trust assumptions disclosure.

Every mechanism in Concepts 1 through 7 is a legitimate, real engineering trade-off, not inherently a red flag.

The actual problem, when one exists, is almost never the mechanism itself, it's a user having no way to know it's there at all.

A **Trust Assumptions Disclosure** (Hard's own assignment produces a real one, `TRUST_ASSUMPTIONS.md`, the same "produce a real artifact, not just discuss the idea" pattern Week 31's own `SECURITY_CHECKLIST.md` established) states plainly, for a specific, real, deployed contract.

Exactly which addresses hold exactly which privileged powers, exactly what each of those powers can and cannot do and exactly what process, if any, gates changing them.

This is the direct, practical answer to Week 33, Concept 9's own upgradability risk table, generalized beyond upgradability specifically to every admin-controlled mechanism this entire week covers.

The same information a careful user or auditor needs, written down once, honestly, rather than left to be reverse-engineered from raw Solidity source by anyone who cares enough to check.

---

## 9. Designing one contract's admin surface deliberately.

The real skill this week builds isn't recognizing any one mechanism from Concepts 2 through 6 in isolation.

It's the judgment to choose, for a specific real contract, exactly which of them earn a place in it and exactly how much power each one actually needs, rather than reflexively reaching for a single, maximally-powerful `onlyOwner` covering everything.

A well-scoped admin surface asks the same question of every privileged function individually.

- Does this need to be instant or can it tolerate a timelock's own delay (Concept 6)?

- Does this need one key or does Concept 1's own role-separation reduce the blast radius of any one key being compromised?

- Does this action affect the admin's own funds, or a user's (Concept 3)?

A contract with a dozen different, precisely-scoped answers to these questions, honestly disclosed (Concept 8), is a fundamentally more trustworthy design than one with a single, unexamined `onlyOwner` covering all twelve at once.

Even if the second one happens to be held by an equally honest, equally careful person. The design itself, not just the person behind it, is what a user is actually trusting.

---

## Assignment.

1.  **Easy - A Genuine Circuit Breaker: Pausable, Whitelisted, With a Real Exit for Users.**

    **What you practice:**
    - `Pausable` used correctly, blocking new activity while deliberately leaving a user's own exit open (Concept 2)
    - The user-emergency-withdrawal vs. admin-sweep distinction, built and contrasted directly, not just described (Concept 3)
    - A whitelist gating deposits (Concept 5)

    **Requirements:**
    - A `GoodVault is Ownable, Pausable` contract: `setWhitelisted(address, bool)` (`onlyOwner`), `deposit(uint256)` (`whenNotPaused`, reverts `NotWhitelisted()` for a non-whitelisted caller), `pause()`/`unpause()` (`onlyOwner`), and `emergencyWithdraw()` — deliberately NOT gated by `whenNotPaused` — returning the caller's own full balance.
    - A `BadVault`, identical in every respect except its own `withdraw()` IS gated `whenNotPaused` — the contrast case.
    - A test confirming `GoodVault.emergencyWithdraw()` succeeds even while paused, and confirming `BadVault.withdraw()` reverts while paused, with real funds genuinely trapped for as long as the pause lasts.

    [Solution](./Assignment/code1/)

    **Manual Test Cases.**

        ```
        1. Command: forge test -vv

            Expected output shape:
                Ran 2 tests for test/CircuitBreaker.t.sol:CircuitBreakerTest
                [PASS] testExploit_BadVaultTrapsUserFundsWhilePaused()
                [PASS] testFix_GoodVaultEmergencyWithdrawWorksWhilePaused()

        2. Command: forge test --match-test testFix_GoodVaultEmergencyWithdrawWorksWhilePaused -vvvv

            Expected output: a full trace showing `emergencyWithdraw()` executing
            successfully while `paused()` is genuinely `true` — confirming the
            absence of `whenNotPaused` on this one function is the entire
            mechanism keeping user funds reachable, not incidental to the test
            passing.

        3. Action: in src/GoodVault.sol, temporarily add `whenNotPaused` to
            `emergencyWithdraw()` (making it match BadVault's own shape), then
            re-run: forge test --match-test testFix_GoodVaultEmergencyWithdrawWorksWhilePaused -vv

            Expected output: this test now FAILS — the emergency withdrawal
            itself now reverts while paused, confirming this one modifier was
            genuinely the entire difference between GoodVault and BadVault's
            own trust profile from Concept 2, not a cosmetic naming difference.
            Revert the change afterward.

        4. Action: in src/BadVault.sol, temporarily remove `whenNotPaused`
            from `withdraw()` (making it match GoodVault's own shape), then
            re-run: forge test --match-test testExploit_BadVaultTrapsUserFundsWhilePaused -vv

            Expected output: this test now FAILS — `vm.expectRevert()` no
            longer triggers, since withdraw() now succeeds even while paused,
            confirming the ENTIRE point of this test suite was this one
            modifier's presence or absence, nothing else about the two
            contracts differs in any way that matters here. Revert the change
            afterward.
        ```

2.  **Medium - Rate-Limited Withdrawals and a Blacklist, With Honest Trade-offs.**

    **What you practice:**
    - A real, fixed-window rate limit, including its own honest boundary-straddling edge case (Concept 4)
    - A blacklist gating an ERC-20's own `_update` hook (Week 29, Concept 6), the real mechanism behind a real, currently-live stablecoin's own compliance function (Concept 5)
    - Confirming a blacklist genuinely can freeze an innocent holder's funds — a real, disclosed trust assumption, not a bug to design around

    **Requirements:**
    - A `RateLimitedVault` contract: `deposit`/`withdraw`, a `DAILY_LIMIT` of `100 ether` per caller, tracked via a fixed window (`windowStart`/`withdrawnToday` per address), reverting `RateLimitExceeded()` once a caller's own running total for the current window would exceed the cap.
    - A `BlacklistToken is ERC20, Ownable` contract: `setBlacklisted(address, bool)` (`onlyOwner`), `mint` (`onlyOwner`), and an overridden `_update` reverting `Blacklisted(address account)` if either the sender or recipient is currently blacklisted.
    - A test demonstrating the rate limit correctly blocking a withdrawal that would exceed the daily cap, and correctly allowing it again once a fresh window starts (`vm.warp`, Week 31's own pattern).
    - A test demonstrating Concept 4's own boundary edge case directly: withdrawing the full daily limit right at the end of one window, then the full limit again the instant a new window opens, confirming close to double the "daily" limit genuinely moves in a short span.
    - A test demonstrating the blacklist blocking a transfer between two otherwise-uninvolved, honest addresses the instant either one is blacklisted — the real trust assumption, made concrete rather than only described.

    [Solution](./Assignment/code2/)

    **Manual Test Cases.**

    ```
    1. Command: forge test -vv

        Expected output shape:
            Ran 3 tests for test/RateLimiting.t.sol:RateLimitingTest
            [PASS] testFix_BoundaryStraddlingEdgeCaseMovesNearlyDoubleTheLimit()
            [PASS] testFix_LimitResetsInANewWindow()
            [PASS] testFix_WithdrawalBeyondDailyLimitReverts()
            Ran 2 tests for test/Blacklist.t.sol:BlacklistTest
            [PASS] testExploit_BlacklistedSenderCannotTransferEvenToAnHonestRecipient()
            [PASS] testFix_OrdinaryTransferSucceedsWhenNeitherPartyIsBlacklisted()

    2. Command: forge test --match-test testFix_BoundaryStraddlingEdgeCaseMovesNearlyDoubleTheLimit -vvvv

        Expected output: a trace showing both 100-ether withdrawals
        succeeding, separated by only slightly more than one second of
        simulated time — confirming Concept 4's own honest limitation is
        real and reproducible, not a hypothetical caveat.

    3. Action: in src/RateLimitedVault.sol, temporarily change
        `withdrawnInWindow[msg.sender] + amount > DAILY_LIMIT` to
        `withdrawnInWindow[msg.sender] + amount > DAILY_LIMIT * 2`
        (silently doubling the real cap without changing its own name or
        documented value), then re-run:
        forge test --match-test testFix_WithdrawalBeyondDailyLimitReverts -vv

        Expected output: this test now FAILS — a withdrawal one wei over
        the DOCUMENTED `DAILY_LIMIT` no longer reverts, confirming the test
        was genuinely checking the real, disclosed limit, not just "some
        revert happens eventually." Revert the change afterward.

    4. Action: in src/BlacklistToken.sol, temporarily change `mint` to
        have no `onlyOwner` modifier at all, then re-run:
        forge test --match-test testExploit_BlacklistedSenderCannotTransferEvenToAnHonestRecipient -vv

        Expected output: this specific test still PASSES — confirming the
        blacklist mechanism (Concept 5) and the minting access control
        (Concept 1) are genuinely independent concerns, a bug in one
        doesn't mask or fix a property of the other; this is worth noticing
        as a real habit for reading any test suite, not just this one:
        a passing test here says nothing about mint's own access control,
        only about the specific behavior it actually exercises. Revert the
        change afterward regardless, since it violates this file's own
        Requirements.
    ```

3.  **Hard - Governance-Gated Parameters Across a Real Progressive Decentralization Lifecycle.**

    **What you practice:**
    - A capped, governance-gated parameter, tested against BOTH an instant EOA owner and a real, deployed `TimelockController` (Concepts 6, 7)
    - The real difference in capability and timing between "Phase 1" (centralized, fast) and "Phase 2" (timelocked, disclosed, slower) of Concept 7's own real lifecycle, proven by running actual transactions through both
    - Producing a real `TRUST_ASSUMPTIONS.md` (Concept 8), filled in against this specific contract at each phase, not left generic

    **Requirements:**
    - A `GovernedFeeContract is Ownable` contract: `feeBps` (public), `MAX_FEE_BPS = 1000` (a hard, ungovernable ceiling, Concept 6's own point), `setFee(uint256)` (`onlyOwner`, reverts `FeeTooHigh()` above the cap).
    - **Phase 1**: deployed with a raw EOA as `owner`; a test confirming `setFee` executes instantly, in one transaction, no delay.
    - **Phase 2**: `transferOwnership` to a real, deployed `TimelockController` (`@openzeppelin/contracts/governance/TimelockController.sol`, Week 33's own import path, a `2 days` minimum delay); a test confirming the EOA's OWN direct `setFee` call now reverts (ownership genuinely moved), and confirming a `schedule` → (too-early `execute` reverts) → `vm.warp` → `execute` flow succeeds, exactly Week 33's own timelock pattern, reused directly.
    - A test confirming `MAX_FEE_BPS` blocks an out-of-range fee even when proposed and correctly executed through the FULL, legitimate Phase 2 timelock flow — the hard cap holds regardless of which phase is currently active.
    - A `TRUST_ASSUMPTIONS.md`, filled in with this specific contract's own real answers at each phase.

    [Solution](./Assignment/code3/)

    **Manual Test Cases.**

    ```
    1. Command: forge test -vv

        Expected output shape:
            Ran 4 tests for test/ProgressiveDecentralization.t.sol:ProgressiveDecentralizationTest
            [PASS] testFix_HardCapHoldsEvenThroughTheFullLegitimateTimelockFlow()
            [PASS] testFix_InitialFeeAboveCapRevertsAtDeployment()
            [PASS] testFix_Phase1_EOAOwnerChangesFeeInstantly()
            [PASS] testFix_Phase2_OwnershipMovesToATimelock()

    2. Command: forge test --match-test testFix_Phase2_OwnershipMovesToATimelock -vvvv

        Expected output: a trace showing the DIRECT `setFee` call from
        `eoaOwner` reverting immediately after `transferOwnership`, then
        the full `schedule` → early-`execute`-reverts → `vm.warp` →
        `execute`-succeeds sequence — confirming Concept 7's own "same key,
        different process" claim precisely: nothing about WHO holds power
        changed, only HOW it can be used.

    3. Action: in src/GovernedFeeContract.sol, temporarily remove the
        `if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();` check from
        `setFee` entirely (leaving the constructor's own check untouched),
        then re-run:

        forge test --match-test testFix_HardCapHoldsEvenThroughTheFullLegitimateTimelockFlow -vv

        Expected output: this test now FAILS — the 15% fee change goes
        through successfully via the fully legitimate timelock flow,
        confirming the hard cap was genuinely doing real, independent work,
        not redundant with the timelock's own delay (a timelock only
        guarantees WARNING before a change, never that the change itself is
        within any particular bound). Revert the change afterward.

    4. Action: re-read Concept 8, then, in `TRUST_ASSUMPTIONS.md`, add one
        more real row to the Phase 2 table answering, in your own words:
        "If `eoaOwner`'s single key were compromised, what could the
        attacker actually do, and how much advance warning would existing
        users have before it took effect?" There's no single "correct"
        wording Foundry can check here — the point is producing an honest,
        specific answer for THIS contract, exactly Concept 8's own real
        purpose, not a generic disclaimer copied from elsewhere.
    ```
