# Gas Optimization Report (Vault).

Baseline: UnoptimizedVault. The function-level numbers below were measured from a real `forge test -vv` run. `forge snapshot` and `forge snapshot --diff` were also run to confirm that the snapshot results are stable and deterministic.

| Technique (Concept)                   | Function affected        |            Unoptimized gas |              Optimized gas |                       Real savings |
| ------------------------------------- | ------------------------ | -------------------------: | -------------------------: | ---------------------------------: |
| Struct packing (2)                    | `deposit`                |                    123,377 |                     79,678 |                43,699 gas (35.42%) |
| Custom errors (3)                     | `withdraw` (revert path) | Not independently measured | Not independently measured | Not isolated in current test suite |
| Cached length + unchecked loop (4, 7) | `totalDeposited`         |                      5,560 |                      5,161 |                    399 gas (7.18%) |
| `calldata` param (1, 7)               | `batchCheckActive`       |                     11,518 |                     11,270 |                    248 gas (2.15%) |

---

## Snapshot Stability

The following commands were run:

```
forge snapshot
```

Then, without making any source code changes:

```
forge snapshot --diff
```

The result was:

```
Total tests: 4, ↑ 0, ↓ 0, ━ 4
Overall gas change: 0 (0.000%)
```

This confirms that the snapshot mechanism is stable and deterministic when the contract code has not changed.

---

## Which single technique produced the largest real improvement, for THIS contract specifically

For this contract and these measurements, the largest observed improvement was in `deposit`.

The unoptimized version used 123,377 gas, while the optimized version used 79,678 gas.

This produced a saving of:

```
43,699 gas (35.42%)
```

The main reason is the optimized storage layout. `OptimizedVault` packs `amount`, `timestamp`, and `active` into a single storage slot, while `UnoptimizedVault` stores the values across multiple slots. The optimized version also uses a single reusable storage pointer instead of repeatedly looking up the same mapping entry.

The importance of each optimization can change depending on the expected usage of the vault. For a vault with only a few depositors, the savings from optimizing `totalDeposited` may remain relatively small. However, for a vault with hundreds or thousands of depositors, loop optimizations can become more important because the loop executes once for every depositor.

Similarly, the `calldata` improvement in `batchCheckActive` was measured using an array containing only three addresses. Larger batch arrays may increase the benefit of avoiding unnecessary memory copying.

---

## Any technique that did NOT help as much as expected

The smallest measured improvement was in `batchCheckActive`.

The unoptimized version used 11,518 gas, while the optimized version used 11,270 gas.

This produced a saving of:

```
248 gas (2.15%)
```

This demonstrates that not every gas optimization produces a large improvement in every situation. Using `calldata`, caching values, and unchecked arithmetic can reduce gas costs, but the actual benefit depends on the amount of data processed and how often the function is called.

For this specific test, the `calldata` parameter optimization produced a relatively small improvement because the batch contained only three addresses.

The `unchecked` loop optimization should also be measured independently by temporarily removing `unchecked { ++i; }` from `totalDeposited` and running:

```
forge snapshot --diff
```

This would show the specific contribution of unchecked arithmetic rather than only measuring the combined effect of cached length and unchecked increment.

Custom errors were implemented in `OptimizedVault`, but the `withdraw` revert path was not independently benchmarked in the current test suite. Therefore, no estimated gas savings are reported for custom errors. A separate revert-path gas test would be required to measure this optimization accurately.
