# List of things learned.

## 1. Restaking. (The EigenLayer model)

Every previous staking concept this course has covered (Week 25's own Solana staking and LSTs) ties one specific pool of capital to one specific job.

Securing that one chain's own consensus, earning that one chain's own reward and bearing that one chain's own slashing risk.

**Restaking** (EigenLayer's own real, live innovation on Ethereum) breaks that one-to-one link.

Capital already staked to secure Ethereum consensus, a validator's own stake or a liquid staking token representing it can be **re-staked**, extending its own existing economic security (its own real, at-risk slashing collateral) to simultaneously secure one or more genuinely separate, additional services, without locking up any new, separate capital at all.

The benefit is real, genuine capital efficiency.

The same ETH earns additional yield from additional services.

Concept 5 covers the real, honest cost this benefit doesn't erase.

---

## 2. Actively Validated Services (AVSs).

An **AVS** is exactly the kind of service Concept 1's own "additional services" refers to.

Anything needing its own real economic security or its own decentralized validation, but that would rather rent an already-large, already-trusted pool of capital (Ethereum's own restaked ETH) than bootstrap a brand-new token and validator set from scratch (Week 1's own "blockchain landscape," Week 43, Concept 10's own app-chain path — restaking is a genuine third option alongside those).

Real examples:

- oracle networks (Week 41) needing their own honest, economically-secured node operators;
- bridges (Weeks 36, 37) needing a trustworthy validator set beyond a small, fixed multisig;
- data availability layers;
- keeper networks.

Each AVS defines its own, specific rules for what counts as misbehavior.

Concept 3 covers exactly what happens when a restaker opted into one breaks them.

---

## 3. Slashing conditions in restaking.

A restaker who opts into securing a specific AVS accepts that AVS's own, additional slashing conditions on top of whatever slashing risk their underlying stake already carried from ordinary Ethereum validation.

A genuinely new, stacked risk, not a replacement for the original one.

An AVS's own slashing conditions are specific to what it actually needs from its restakers:

- A bridge-securing AVS (Week 36, Concept 9's own real incident catalogue) might slash for relaying a provably false cross-chain message.

- An oracle-securing AVS might slash for reporting a price provably inconsistent with every other honest reporter.

```solidity
function slash(address restaker, bytes32 avsId, uint256 amount) external {
    if (msg.sender != avsSlasher[avsId]) revert NotSlasher();      // ONLY that AVS's own designated slasher
    if (!optedIntoAVS[restaker][avsId]) revert NotOptedIn();          // ONLY restakers who opted into THIS AVS
    restaked[restaker] -= amount;
}
```

Easy's own assignment builds and runs exactly this.

A real slash, triggered by a real, AVS-specific condition, reducing exactly the restaker who opted in, exactly by an AVS-authorized amount.

---

## 4. Liquid restaking tokens (LRTs).

The exact structural parallel to Week 25's own Solana LSTs, one layer further up.

Just as an LST represents a liquid, tradeable claim on otherwise-locked, staked capital, an **LRT** represents a liquid, tradeable claim on _restaked_ capital.

Letting a holder keep full liquidity and tradability while their underlying ETH secures one or more AVSs and earns the associated yield.

The exchange-rate mechanism is the identical one Week 25 already covered, working in both directions.

Real staking/AVS rewards grow the underlying pool without minting new LRT shares, so each existing share becomes worth _more_ over time (Week 25's own exact growth mechanic) and a real slash (Concept 3) shrinks the underlying pool without burning any shares, so each share becomes worth _less_, the identical mechanism running in reverse.

```solidity
function redeem(uint256 shares) external returns (uint256 amount) {
    amount = (shares * totalRestaked) / totalSupply();   // the SAME formula whether totalRestaked just grew OR shrank
    _burn(msg.sender, shares);
    totalRestaked -= amount;
}
```

A real, honest consequence worth naming directly, because an LRT pools together many separate restakers' own capital under one single, shared exchange rate, a slash against the pool is **socialized pro-rata across every holder**, not charged only to whichever specific restaker's own actions actually triggered it.

A genuinely different risk profile than Easy's own per-individual-restaker model and Medium's own assignment measures this directly.

---

## 5. Shared security trade-offs and risks.

The real, honest cost side of Concept 1's own capital-efficiency benefit, worth stating as plainly as the benefit itself.

Restaking doesn't create new security out of nothing.

It stretches the _same_ underlying capital's own slashing risk across _more_ simultaneous obligations.

If a restaker opts into several AVSs at once with the identical underlying stake and more than one of them slashes around the same time, the second (and any later) AVS's own slash can only ever draw from whatever capital the _first_ slash actually left behind.

Not from the full amount that AVS itself was originally counting on.

Hard's own assignment builds and measures exactly this "cascading slash" scenario with real numbers, not just the general warning.

A second, genuinely systemic risk worth naming.

If a large fraction of Ethereum's own total staked capital ends up restaked across many popular AVSs, a bug or exploited vulnerability in just _one_ widely-used AVS's own slashing logic could trigger correlated, cascading slashing far beyond that one AVS's own intended scope.

A real, structural risk that simply didn't exist before restaking existed as a mechanism at all.

---

## 6. Restaking on Solana. (An emerging landscape)

Worth naming honestly rather than treated as equally mature.

Real, live projects are building Solana-native restaking primitives on top of Solana's own existing staking model (Week 25), extending the identical "let already-staked capital secure additional services" idea this week's own hands-on work builds for Ethereum.

As of this course's own writing, this landscape is genuinely newer and less mature than Ethereum's own EigenLayer ecosystem.

Worth watching as a real, developing area rather than assumed to already be at parity, the same honest "this is real but still evolving" treatment this course gave Solana's own restaking-adjacent shared-sequencing and based-rollup concepts back in Week 43.

---

## 7. The full restaking lifecycle, from stake to redemption.

```
Restaker                    RestakingManager / LRT              AVS's own slasher
─────────                    ────────────────────────              ────────────────────
restakes ETH (Concept 1) ──►
                              mints LRT shares at the
                              current exchange rate (Concept 4)
      │
      ▼
opts into an AVS (Concept 2) ──►
                              records the opt-in —
                              THIS AVS can now slash
                              this restaker specifically
                                                                  AVS detects real
                                                                  misbehavior (Concept 3)
                                                                            │
                              ◄─────────────────────────────────────────── slash(restaker, avsId, amount)
                              underlying capital shrinks;
                              LRT SUPPLY unchanged — every
                              holder's own share is now
                              worth less (Concept 4, 5)
      │
      ▼
redeems LRT shares ──────────►
                              pays out the NEW, LOWER
                              proportional amount — the
                              real, socialized cost of
                              Concept 5's own shared risk
```

Hard's own assignment extends this exact diagram to _multiple_ simultaneous AVSs, measuring precisely what happens when more than one of them tries to draw from the identical, shrinking pool of underlying capital.

---

## Assignment.

1. **Easy - A Minimal Restaking Manager: Opting In and a Real, AVS-Specific Slash.**

   **What you practice:**
   - Restaking real ETH and opting into a specific AVS by its own identifier (Concepts 1, 2)
   - A real slash, gated to exactly the AVS that was opted into, executed by exactly that AVS's own designated slasher (Concept 3)

   **Requirements:**
   - A `RestakingManager` contract: `registerAVS(bytes32 avsId, address slasher)`, `restake()` (payable), `optIntoAVS(bytes32 avsId)`, `slash(address restaker, bytes32 avsId, uint256 amount)` (callable only by that AVS's own registered slasher, only against a restaker who genuinely opted into that specific AVS), and `withdraw(uint256 amount)` using `.call{value: amount}("")` with a success check.
   - A test confirming a restaker's own balance reduces correctly after a legitimate slash from the AVS they opted into.
   - A test confirming an attempt to slash a restaker who never opted into that specific AVS reverts, and a test confirming an attempt to slash from an address that isn't that AVS's own registered slasher reverts.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 3 tests for test/RestakingManager.t.sol:RestakingManagerTest
           [PASS] testExploit_CannotSlashARestakerWhoNeverOptedIn()
           [PASS] testExploit_OnlyTheRegisteredSlasherCanSlash()
           [PASS] testFix_LegitimateSlashReducesExactlyTheOptedInRestaker()

   2. Command: forge test --match-test testFix_LegitimateSlashReducesExactlyTheOptedInRestaker -vvvv

       Expected output: a trace showing the slash reducing `restaked[restaker]`
       from `100 ether` to `80 ether`, and NOT touching any other restaker's
       own balance at all — confirming Concept 3's own precise scoping,
       not a blanket, contract-wide penalty.

   3. Action: register a SECOND AVS with a DIFFERENT slasher address, and
       have that second slasher attempt to slash `restaker` under the
       FIRST AVS's own `AVS_ID`.

       Expected result: reverts with `NotSlasher()` — confirming
       Concept 3's own scoping runs in both directions: an AVS's own
       slasher can only slash restakers opted into THAT specific AVS,
       AND cannot act on a DIFFERENT AVS's own behalf.

   4. Command: forge test --match-test testExploit_CannotSlashARestakerWhoNeverOptedIn -vvvv

       Expected output: a trace confirming `otherRestaker` genuinely holds
       real restaked capital (`50 ether`) at the moment the slash attempt
       reverts — confirming the failure is specifically about the missing
       opt-in (Concept 2), not simply about having no funds to slash at all.
   ```

2. **Medium - Liquid Restaking Tokens: Minting, a Real Slash and the Exchange Rate Dropping.**

   **What you practice:**
   - LRT shares minted at a real, tracked exchange rate against pooled restaked capital (Concept 4)
   - A real slash shrinking the underlying pool WITHOUT burning any shares — confirming the exchange-rate mechanism runs symmetrically in both directions from Week 25's own growth case
   - The real, socialized nature of an LRT's own slashing risk: every holder affected pro-rata, not just one party

   **Requirements:**
   - A `LiquidRestakingToken is ERC20` contract: `registerAVS(bytes32 avsId, address slasher)`, `deposit()` (payable, mints shares at the current exchange rate — `msg.value` directly for the first depositor, proportional thereafter), `redeem(uint256 shares)` (burns shares, pays out the current proportional amount via `.call{value}("")`), `slash(bytes32 avsId, uint256 amount)` (reduces `totalRestaked` only, mints/burns nothing).
   - A test: two separate depositors, at two different times but the identical exchange rate (no slash yet), confirming both receive shares proportional to what they deposited.
   - A test: a real slash occurs; confirm BOTH holders' own redeemable value drops by the identical proportional amount — the loss genuinely socialized, not charged to only one of them.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 2 tests for test/LiquidRestakingToken.t.sol:LiquidRestakingTokenTest
           [PASS] testFix_SharesMintedProportionallyAtTheCurrentRate()
           [PASS] testFix_SlashDropsTheExchangeRateForEveryHolderProportionally()

   2. Command: forge test --match-test testFix_SlashDropsTheExchangeRateForEveryHolderProportionally -vvvv

       Expected output: a trace confirming `alice.balanceOf`/`bob.balanceOf`
       (their real, ERC-20 share COUNTS) are completely unchanged by the
       slash — only `totalRestaked` moved — confirming Concept 4's own
       exact mechanism: a slash never touches share balances directly, it
       changes what the SAME share balance is worth.

   3. Action: have ONLY alice actually `redeem` her shares after the
       slash, then check what a THIRD, brand-new depositor receives for a
       fresh `100 ether` deposit afterward.

       Expected result: the new depositor receives MORE than `100 ether`
       worth of shares for their own `100 ether` deposit (since the
       post-slash exchange rate is now below 1:1, `totalRestaked` is
       smaller relative to `totalSupply`) — confirming the slash's own
       effect persists in the exchange rate itself, affecting even
       depositors who join AFTER the slash already happened, not just
       the ones who were present at the time.

   4. Action: temporarily change `slash` to also call `_burn` on some
       arbitrary holder's own shares, in addition to reducing
       `totalRestaked` (double-penalizing incorrectly), then re-run
       `testFix_SlashDropsTheExchangeRateForEveryHolderProportionally`.

       Expected output: the test now FAILS — the redeemable amounts no
       longer match the expected `80 ether` each, confirming the ORIGINAL
       design's own restraint (touch `totalRestaked` only, never burn
       shares directly) was genuinely load-bearing for the "loss
       socialized proportionally, not double-counted" property Concept 4
       depends on. Revert the change afterward.
   ```

3. **Hard - Multiple AVSs and the Real Cost of Overlapping Slashing Obligations.**

   **What you practice:**
   - Restaking the identical capital across MULTIPLE AVSs at once — Concept 1's own real capital-efficiency mechanism, built directly
   - A real, measured "cascading slash": the second AVS to slash can only ever draw from whatever the first one already left behind (Concept 5)
   - Producing a real `RESTAKING_RISK_ANALYSIS.md`, arguing the systemic risk concretely rather than generically

   **Requirements:**
   - A `MultiAVSRestaking` contract: `registerAVS(bytes32 avsId, address slasher, uint256 maxSlashBps)` (each AVS's own maximum slashable percentage, out of its restakers' own _current_ stake at the moment it slashes — not a fixed, original amount); `restake()`, `optIntoAVS(bytes32 avsId)` (callable multiple times, once per AVS, against the SAME underlying stake); `slash(address restaker, bytes32 avsId)`, computing the actual slash amount as `currentStake * maxSlashBps / 10000` at the moment it's called.
   - A test: a restaker opts into TWO separate AVSs (`AVS_A`, `AVS_B`), each independently configured for up to a `50%` maximum slash; `AVS_A` slashes first, `AVS_B` slashes second; confirm the restaker's own final remaining stake is `25%` of their original amount, not `0%` (naive "two separate 50% cuts sum to 100%") and not `50%` (naively assuming each AVS's own 50% applies independently to the original amount) — the real, compounding effect of both AVSs reading _current_, already-reduced state.
   - A test confirming the ORDER of the two slashes matters for exactly how much each individual AVS actually recovers, even though the restaker's own final remaining balance is identical either way.
   - A `RESTAKING_RISK_ANALYSIS.md`, arguing Concept 5's own systemic risk and Concept 6's own Solana comparison concretely, against this specific contract's own real numbers.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 2 tests for test/CascadingSlash.t.sol:CascadingSlashTest
           [PASS] testExploit_CascadingSlashLeavesTwentyFivePercentNotZeroOrFifty()
           [PASS] testFix_SlashOrderChangesEachAVSsOwnRecoveryButNotTheFinalTotal()

   2. Command: forge test --match-test testExploit_CascadingSlashLeavesTwentyFivePercentNotZeroOrFifty -vvvv

       Expected output: a trace showing `AVS_A`'s own slash reading
       `currentStake = 100 ether` and `AVS_B`'s own slash, moments later,
       reading `currentStake = 50 ether` — the SAME storage variable,
       genuinely different values, purely because time and one prior
       slash passed in between — confirming Concept 5's own real
       mechanism directly, not asserted.

   3. Action: register a THIRD AVS, also at `maxSlashBps = 5000`, have
       the restaker opt into it too, and slash via all three AVSs in
       sequence.

       Expected result: the restaker's own final remaining balance is
       `12.5 ether` (100 → 50 → 25 → 12.5), confirming the cascading
       effect compounds with EVERY additional AVS a restaker opts into,
       not just capped at two — a real, concrete argument for why
       Concept 5's own systemic risk grows with how many AVSs popular
       restaked capital gets spread across, not a fixed, one-time cost.

   4. Action: re-read Concept 5 and Concept 6, then fill in
       RESTAKING_RISK_ANALYSIS.md's own three sections with real, specific
       reasoning about `MultiAVSRestaking` as it's actually built here —
       not a generic restatement of the Concept 5 warning. There's no
       single "correct" wording Foundry can check here; the point is a
       real, argued position, the same standard every previous week's own
       design-document deliverable has been held to.
   ```
