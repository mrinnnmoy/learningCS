# Restaking Risk Analysis. (MultiAVSRestaking)

## The cascading slash, quantified

In this `MultiAVSRestaking` contract, the same underlying stake can be used to back multiple AVSs at the same time. The important detail is that each AVS does not calculate its slash from the restaker's original stake. Instead, `slash()` reads:

```solidity
uint256 currentStake = restaked[restaker];
amountSlashed = (currentStake * avsMaxSlashBps[avsId]) / 10000;
```

This means every slash is calculated from whatever stake actually remains at the moment the slash is executed.

In the test, the restaker starts with `100 ether` and opts into two AVSs:

- `AVS_A` can slash up to 50%.
- `AVS_B` can slash up to 50%.
- Both AVSs are backed by the same `100 ether`.

When `AVS_A` slashes first, the current stake is `100 ether`.

```text
100 ether × 50% = 50 ether slashed
```

The remaining stake becomes:

```text
100 ether - 50 ether = 50 ether
```

When `AVS_B` slashes afterwards, it does not see the original `100 ether`. The first slash has already reduced the shared `restaked[restaker]` value to `50 ether`.

Therefore, `AVS_B` calculates:

```text
50 ether × 50% = 25 ether slashed
```

The final remaining stake is:

```text
50 ether - 25 ether = 25 ether
```

The complete cascading result is therefore:

```text
100 ether → 50 ether → 25 ether
```

This is mathematically the expected result of two sequential percentage-of-current-balance slashes:

```text
100 × 0.5 × 0.5 = 25 ether
```

The final balance is not `0 ether` because the two AVSs are not each taking a fixed `50 ether` amount from the original stake. The second AVS only has access to what remains after the first slash.

The final balance is also not `50 ether` because the second AVS still has a valid slashing right and can apply its configured 50% maximum to the remaining stake.

Therefore, the result of `25 ether` is not a bug that should be patched. It is the correct and expected economic behavior of this contract because multiple AVSs share one stake balance and each slash is calculated from the current state.

The `forge test -vvvv` trace directly confirms this behavior. The first slash removes `50 ether` and leaves `50 ether`, while the second slash removes `25 ether` and leaves `25 ether`. Both AVSs use the same underlying `restaked[restaker]` storage, but they observe different values because the first slash changes the state before the second slash executes.

---

## Who bears the risk when an AVS ends up under-recovered

The second test demonstrates another important consequence of shared restaked capital: the order of slashes determines which AVS receives more of the available stake.

If `AVS_A` slashes first:

```text
AVS_A recovers: 50 ether
AVS_B recovers: 25 ether
Restaker remains with: 25 ether
```

If the order is reversed and `AVS_B` slashes first:

```text
AVS_B recovers: 50 ether
AVS_A recovers: 25 ether
Restaker remains with: 25 ether
```

The restaker's final balance is identical in both cases, but the recovery amount of each AVS changes.

This creates a real first-come, first-served risk. An AVS configured with a maximum slash of 50% cannot assume that it will always be able to recover 50% of the restaker's original stake. It can only recover 50% of the stake that still exists when its own slash transaction executes.

The AVS that slashes second is therefore exposed to under-recovery caused by obligations that it did not directly create. Another AVS may already have consumed part of the same shared collateral.

This is a risk that an AVS should consider when deciding whether to accept restakers who also secure other AVSs. The more AVSs sharing the same capital, the weaker any individual AVS's guarantee becomes during a situation where multiple slashing events happen.

Ideally, an AVS would want to know how many other AVSs a restaker has opted into and what maximum slashing obligations those AVSs have.

The current `MultiAVSRestaking` contract does not provide enough information for this directly. It exposes:

```solidity
mapping(address => mapping(bytes32 => bool)) public optedIntoAVS;
```

This allows someone to check whether a specific restaker opted into one specific AVS, but it does not provide a list of all AVSs that the restaker has joined.

A more complete design could maintain additional state such as:

- A list of AVSs each restaker has opted into.
- The number of active AVS obligations.
- The maximum slash percentage associated with each active AVS.
- The total potential overlapping slash exposure of the restaker.

However, even knowing all of this information would not completely eliminate the risk. Multiple AVSs could still compete for the same capital if they all have valid slashing claims at approximately the same time.

The key systemic issue is therefore not simply that an AVS lacks information. The deeper problem is that the same capital is being used to provide security guarantees to multiple independent systems simultaneously.

Capital efficiency increases because one `100 ether` stake can support multiple AVSs, but the total economic guarantees can overlap. During normal operation this is efficient. During correlated failures, however, multiple AVSs may attempt to slash the same shrinking pool of collateral.

---

## Concept 6, How would this look different on Solana

A Solana-native restaking design could structure this state differently because Solana programs can maintain arbitrary custom state in accounts and Program Derived Addresses (PDAs).

Instead of storing one shared value like:

```solidity
mapping(address => uint256) public restaked;
```

a Solana implementation could maintain separate PDA-tracked records for each restaker and AVS relationship.

For example, a restaker with `100` units of stake could explicitly reserve amounts for different AVSs:

```text
Total stake: 100

Reserved for AVS_A: 50
Reserved for AVS_B: 50
```

A slash against `AVS_A` could then affect only the amount specifically reserved for `AVS_A`, rather than reducing one global balance that every AVS reads.

This could prevent the exact cascading behavior shown by this Solidity contract. If each AVS has an explicitly tracked reservation, one AVS cannot unexpectedly reduce another AVS's recorded allocation.

However, this approach creates a trade-off.

If the same `100` units of capital are explicitly divided between AVSs, then the protocol loses part of the capital-efficiency benefit of restaking. The restaker can no longer claim that the full `100` units simultaneously provide a full `100` units of slashable security to every AVS.

For example:

```text
Without reservations:

100 units may back AVS_A
100 units may also back AVS_B

Total apparent security promises: 200 units
Actual underlying capital: 100 units
```

With explicit reservations:

```text
50 units reserved for AVS_A
50 units reserved for AVS_B

Total security promises: 100 units
Actual underlying capital: 100 units
```

The second model provides clearer guarantees and reduces overlapping claims, but it reduces the capital reuse that makes restaking economically attractive.

Therefore, Solana's account model and PDAs can provide a more explicit structural way to track per-AVS allocations, reservations, and obligations. A Solana program could design its state so that each AVS has a specific amount of collateral assigned to it.

However, Solana cannot eliminate the fundamental economic tension by itself.

If a protocol intentionally allows the same capital to secure multiple independent AVSs, then multiple slash claims still exist against the same underlying economic value. Whether the state is stored in Solidity mappings on Ethereum or PDAs and accounts on Solana, the protocol must decide how overlapping claims are handled.

The systemic risk comes from the economic reuse of capital, not from the specific blockchain storage model.

This contract demonstrates that risk concretely. With two AVSs, each configured to slash 50% of the current balance:

```text
100 → 50 → 25
```

If a third AVS is added with the same 50% maximum slash:

```text
100 → 50 → 25 → 12.5
```

Every additional AVS that successfully slashes compounds the reduction in the shared stake.

This means the risk grows as popular restaked capital is spread across more AVSs. The cost is not a single fixed reduction caused by opting into one additional AVS. Instead, the number of potentially competing slash obligations increases with every AVS that shares the same underlying capital.

`MultiAVSRestaking` therefore demonstrates the central systemic trade-off of restaking: the same capital can provide greater capital efficiency by supporting multiple AVSs during normal operation, but during cascading or correlated failures, those same AVSs compete for one shared and continuously shrinking pool of collateral.
