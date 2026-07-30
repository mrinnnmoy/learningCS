# List of things learned.

## 1. Why contracts need upgradability.

A deployed contract's bytecode (Week 26, Concept 6) is permanent.

There's no way to edit a live contract's own logic directly, ever, full stop.

That's a genuine, deliberate feature for a lot of what this course has built (Week 27's `immutable` owner, Week 29's fixed ERC-20 rules), the whole reason "code is law" is a meaningful claim at all.

But it's a real cost too.

A discovered bug (Week 31's entire catalogue), a genuinely new requirement or an evolving standard all become permanently baked in otherwise, with the only fallback being a full redeploy and a manual, error-prone migration of every user's own state to the new address.

Upgradability trades away some of that permanence, deliberately, in exchange for being able to fix or evolve logic in place, at the same address, without migrating anyone.

Concept 9 covers exactly what that trade costs in practice, not free by any means.

---

## 2. Proxy pattern basics.

The mechanism is exactly Week 28, Concept 6's `delegatecall`, used deliberately this time rather than just demonstrated.

A lightweight **proxy** contract holds all the real, persistent state and forwards every call it receives to a separate **implementation** contract via `delegatecall`, running the implementation's _code_ against the proxy's own _storage_ (Week 28's exact mechanism).

Upgrading means pointing the proxy at a _new_ implementation address, the proxy's own address and everything users have ever interacted with, never changes.

```solidity
fallback() external payable {
    (bool ok, bytes memory result) = implementation.delegatecall(msg.data);
    // ... return result, or revert
}
```

Week 28, Concept 6 already flagged the danger in this exact shape.

If `implementation` is stored in an ordinary state variable, it can collide with whatever slot the implementation's _own_ code expects to find its state in (Week 27, Concept 2's slot ordering).

The real fix, used throughout this week's own tooling:

- **ERC-1967**, a standard that stores the implementation address (and, for Concept 3's pattern, the admin address) at specific, deliberately-obscure storage slots, computed as `bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)`.

A slot number astronomically unlikely to ever be the same one an implementation's own ordinary state variables would occupy, sidestepping the collision problem structurally rather than trusting careful manual layout matching (Week 28's own Medium assignment) to hold forever across every future upgrade.

---

## 3. The Transparent Proxy pattern.

A **Transparent Proxy** solves a second, more subtle risk the basic mechanism (Concept 2) doesn't.

What happens if the proxy's own admin functions (like "upgrade to a new implementation") happen to share a function selector (Week 26, Concept 6) with something the implementation itself defines, a **selector clash**.

Genuinely possible by coincidence given how large the space of possible function names is relative to a 4-byte selector.

The fix is routing by _caller_.

If the caller is the proxy's own designated admin, admin functions run directly on the proxy.

Any other caller's call always forwards to the implementation via `delegatecall`, even if by pure coincidence its selector matches an admin function's own.

The admin can never accidentally reach the implementation's own logic and nobody else can ever reach the proxy's own admin functions, regardless of what selectors collide.

```solidity
address proxy = Upgrades.deployTransparentProxy(
    "VaultV1.sol",
    initialOwner,                                              // becomes the ProxyAdmin's own owner
    abi.encodeCall(VaultV1.initialize, (initialOwner))          // Concept 6 — replaces a constructor
);
```

This deploys three real contracts behind the scenes, not one:

- the proxy itself,
- a separate `ProxyAdmin` contract (the actual thing that owns upgrade rights, itself owned by `initialOwner`) and
- the `VaultV1` implementation (worth knowing the shape exists).

Since Easy's own Manual Test Cases inspect all three independently rather than treating "the proxy" as one opaque thing.

---

## 4. The UUPS proxy pattern.

**UUPS** (Universal Upgradeable Proxy Standard) moves the upgrade logic itself _into the implementation contract_, rather than the proxy or a separate admin contract (Concept 3).

The proxy becomes genuinely minimal, just the `delegatecall` forwarding logic and the ERC-1967 slots, cheaper to deploy since less code lives at the proxy's own address.

```solidity
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract VaultV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    // deliberately empty body — onlyOwner IS the entire access check; the base contract
    // calls this hook internally before letting an upgrade through at all
}
```

The real trade-off worth naming plainly, because the upgrade mechanism lives in the implementation itself.

`_authorizeUpgrade` has to be correctly included and correctly access-controlled in _every single_ future implementation version.

Forgetting it, or getting its access control wrong, in some future V2 doesn't just fail to upgrade, it can permanently strip the _ability_ to ever upgrade again, since there's no separate admin contract (Concept 3's own safety net) to fall back on.

Medium's own assignment builds a real UUPS upgrade from V1 to V2, hands-on.

---

## 5. Storage layout & collisions, for real this time.

Week 27 (Concept 2) and Week 28 (Concept 6) both already covered why storage slot _ordering_ matters.

This week's actual stakes are higher, because an upgrade doesn't just need one implementation's layout to be internally consistent.

It needs _every future version_ to remain layout-compatible with every version before it, forever or existing users' own already-stored data reads back as garbage the instant an incompatible upgrade lands.

```solidity
// V1
contract VaultV1 {
    uint256 public balance;      // slot 0
    address public owner;        // slot 1
}

// V2 — SAFE: only appends new state AFTER everything that already existed
contract VaultV2 {
    uint256 public balance;      // slot 0 — unchanged
    address public owner;        // slot 1 — unchanged
    uint256 public lastUpdated;  // slot 2 — NEW, appended at the end
}

// V2 — UNSAFE: inserts a new variable in the middle, shifting everything after it
contract VaultV2Bad {
    uint256 public balance;      // slot 0 — unchanged
    uint256 public newFee;       // slot 1 — NEW, but INSERTED, not appended
    address public owner;        // slot 2 now — but existing storage still holds the OLD owner
                                  // value at slot 1, which THIS version reads as newFee instead
}
```

The rule is simple to state and easy to violate by accident in a real, growing codebase.

Only ever _append_ new state variables, never insert, reorder, resize, or delete existing ones.

`Upgrades.upgradeProxy` (Tutorial, step 2) checks exactly this automatically, comparing the new implementation's own compiled `storageLayout` (the `extra_output` enabled in the Tutorial) against a reference version and refuses to proceed if they're incompatible.

Medium's own assignment deliberately triggers this rejection once, to see it catch a real mistake rather than only reading about it.

A related, more advanced pattern worth knowing exists.

**namespaced storage** (ERC-7201), which stores each contract's own state at a hashed, dedicated region of storage entirely, sidestepping ordering concerns altogether rather than just disciplining around them.

Not used in this week's own assignments, since OpenZeppelin's own base contracts (`OwnableUpgradeable`, `UUPSUpgradeable`) already use it internally, transparently, without this week's own code needing to think about it directly.

---

## 6. Initializer functions vs. constructors. (Week 27's own deferred question, answered)

Week 27, Concept 5 flagged this directly and deferred it.

A `constructor` runs exactly once, at deployment and is never part of a contract's _deployed runtime bytecode_ at all, which is exactly the problem for a proxy (Concept 2), since the constructor would run against the _implementation's own_ storage at the moment the implementation itself is deployed, not the proxy's storage, the opposite of what's needed.

The fix is an ordinary function, conventionally named `initialize`, called once, manually, immediately after the proxy is deployed and pointed at that implementation.

`abi.encodeCall(VaultV1.initialize, (...))`, passed as the `initializerData` argument every deployment in this week's own Contents has already shown, is exactly what triggers that call, atomically, in the same transaction that deploys the proxy itself.

```solidity
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VaultV1 is Initializable {
    address public owner;

    function initialize(address _owner) public initializer {   // `initializer` — Initializable's own guard
        owner = _owner;
    }

    constructor() {
        _disableInitializers();   // Concept 9's own risk, addressed directly — see below
    }
}
```

`Initializable`'s `initializer` modifier is the guard Week 31, Concept 3's "unprotected initializer" vulnerability needs specifically.

It reverts if `initialize` has already been called once, closing exactly the exploit Week 31's Easy assignment built and fixed by removing the separate function entirely.

Here, a separate initializer genuinely has to exist (a proxy structurally can't use a real constructor for its own state), so the guard, not the function's absence, is what has to hold.

The `constructor` shown above calling `_disableInitializers()` addresses a different, related risk directly. It prevents the _implementation contract itself_ (deployed once, at its own separate address, never meant to be called directly by end users) from ever being initialized on its own.

Hard's own assignment demonstrates exactly why that matters when it's missing.

---

## 7. The Diamond pattern (multi-facet proxies), in overview.

Where UUPS and Transparent proxies (Concepts 3, 4) each point at exactly _one_ implementation at a time.

The **Diamond pattern** (EIP-2535) lets a single proxy route different function selectors to _different_ implementation contracts, called **facets**.

Maintained and upgraded independently of one another, genuinely useful for a large, complex system that's outgrown a single implementation contract's own practical size limits (Solidity has a real, hard 24KB deployed-bytecode ceiling per contract, a Diamond's whole reason for existing is working around exactly that ceiling for a system that needs more logic than one implementation can hold).

At real, corresponding cost, a Diamond's own selector-to-facet routing table becomes a genuinely more complex thing to reason about and audit than "the proxy points at one implementation," worth knowing the trade-off exists rather than reaching for by default.

This week's own assignments stay with UUPS and Transparent, the same "overview, not hands-on" treatment Week 29 gave ERC-1155 and Week 32 gave WalletConnect.

A Diamond's own real complexity deserves more room than fits honestly alongside everything else this week already covers.

---

## 8. Upgrade governance & Timelocks.

Concepts 3 and 4 both establish _who_ can authorize an upgrade.

An address, checked via `onlyOwner` or the ProxyAdmin's own ownership, but say nothing about _how safely_ that address should be allowed to act.

A single EOA (Week 26, Concept 1) with unilateral upgrade rights is a single point of failure with an enormous blast radius, whoever holds that one key can push arbitrary new logic, instantly, to every single user of the contract, with zero warning.

A **timelock** (OpenZeppelin's own `TimelockController`, used directly in Hard's own assignment, not hand-rolled) fixes the "instant" part specifically.

An upgrade has to be _scheduled_ first, then a mandatory delay has to pass, then it can finally be _executed_ — giving users a real, guaranteed window to notice a pending change and exit before it lands.

Turning "the admin can silently rug everyone right now" into "the admin can announce a change that everyone gets real advance notice of."

A **multisig** (Week 42 covers this properly) addresses a different part of the same risk, requiring several independent keyholders to agree rather than trusting a single one.

The two combine naturally and often do in real, production systems.

A multisig proposes and confirms, a timelock enforces the delay regardless of how quickly the multisig itself agreed.

---

## 9. Risks of upgradable contracts.

Concepts 1 through 8 build toward being able to state this precisely rather than vaguely.

Upgradability doesn't just add a feature, it changes the entire trust model a user is implicitly accepting the moment they interact with a contract at all.

| Risk                                    | Mechanism                                                                                                                                                                                                                                                                      | Mitigated by                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| The "immutable" promise is simply false | Anything a proxy's admin decides to ship next, including logic that behaves nothing like what was originally audited, can land at the same trusted address                                                                                                                     | Timelocks + multisig (Concept 8) — advance notice and no single point of failure, not a technical prevention                                        |
| Storage collision on upgrade            | An incompatible new implementation silently corrupts existing users' own stored data (Concept 5)                                                                                                                                                                               | Automated storage-layout validation (Tutorial, `Upgrades.upgradeProxy`'s own default checks)                                                        |
| Admin key compromise                    | Whoever controls the upgrade-authority address can push ANY logic at all — a full, instant takeover, worse than most single-function exploits from Week 31's own catalogue, since it isn't limited to one function's own bug                                                   | Timelock + multisig (Concept 8), hardware/cold storage for the key itself                                                                           |
| Uninitialized implementation contract   | The implementation contract, deployed separately at its own address (Concept 2), is itself a real, callable contract — if nobody ever calls `initialize` on it directly, an attacker can, becoming ITS "owner" even though ordinary users only ever interact through the proxy | `_disableInitializers()` in the implementation's own constructor (Concept 6) — Hard's own assignment demonstrates the attack directly, then the fix |
| Function selector clashes               | A proxy's own admin function and an implementation function sharing a 4-byte selector by coincidence (Concept 3)                                                                                                                                                               | The Transparent Proxy pattern's caller-based routing, or UUPS's own minimal proxy having no admin functions to clash with at all                    |

None of this is a reason to avoid upgradability outright. Plenty of real, high-value production systems use it deliberately and safely.

It's a reason to treat "this contract is upgradable" as a real, disclosed fact a user should be able to know and weigh, the same way this table itself exists to be weighed rather than assumed away.

---

## 10. Choosing a pattern for a real project.

No proxy pattern from Concepts 3, 4 and 7 is universally "the right one," and the honest answer, same shape as Week 30, Concept 10's own tooling comparison, depends on what a specific project actually needs.

- Transparent Proxy (Concept 3), the safest default for a small-to-medium contract where the extra ProxyAdmin deployment's own gas cost genuinely doesn't matter and where "the admin logic lives somewhere structurally separate from the implementation" is worth the small overhead on its own merits.

- UUPS (Concept 4), the right choice when deployment gas genuinely matters (a factory deploying many identical proxies, for instance) and the team is confident every future implementation will correctly include and gate `_authorizeUpgrade`. A real, ongoing discipline requirement, not a one-time setup cost. Diamond (Concept 7): reached for specifically once a single implementation contract's own logic has outgrown the 24KB bytecode ceiling, rarely earlier, given the real complexity cost.

- Governance (Concept 8) is orthogonal to all three, whichever pattern gets chosen, the question of who can trigger an upgrade and how much warning users get before it lands, matters regardless of which underlying delegatecall mechanism is doing the forwarding.

---

## Assignment.

1. **Easy - A Naive Proxy's Storage Collision, Then a Real Transparent Proxy That Doesn't Have One.**

   **What you practice:**
   - Building a hand-rolled proxy one more time, deliberately, to trigger Week 28's exact storage collision live (Concept 2)
   - Deploying a real, ERC-1967-compliant Transparent Proxy via the Foundry Upgrades plugin, and confirming it doesn't have the same problem (Concepts 2, 3)
   - `initialize` replacing a constructor, for real, for the first time (Concept 6)

   **Requirements:**
   - A `NaiveImplementation` contract: `address public owner;` at slot 0, `uint256 public balance;` at slot 1, a `setOwner(address)` function.
   - A `NaiveProxy` contract: `address public implementation;` at slot 0 (deliberately colliding with `NaiveImplementation`'s own `owner` slot — Week 28's exact mistake, reintroduced on purpose), forwarding everything else via `delegatecall`.
   - A test proving the collision: calling `setOwner` through `NaiveProxy` corrupts `NaiveProxy`'s own `implementation` slot, since both land at slot 0.
   - A `VaultV1` contract (`Initializable`, `OwnableUpgradeable`): `uint256 public balance;`, `initialize(address _owner)` setting up ownership, `deposit()` (payable, increments `balance`).
   - The identical scenario, this time deployed as a real Transparent Proxy via `Upgrades.deployTransparentProxy`, proving the ERC-1967 slot the implementation address actually lives at never collides with `VaultV1`'s own `balance`.

   [Solution](./Assignment/code1/)

   **Final Output.**

   ```
   mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-33/Assignment/code1/upgrade-easy$ forge test -vv --force
   [⠒] Compiling...
   [⠢] Compiling 60 files with Solc 0.8.36
   [⠢] Solc 0.8.36 finished in 3.99s
   Compiler run successful with warnings:

   Ran 1 test for test/NaiveProxyCollision.t.sol:NaiveProxyCollisionTest
   [PASS] testExploit_SetOwnerCorruptsProxysOwnImplementationSlot() (gas: 341808)
   Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 20.05ms (2.37ms CPU time)

   Ran 1 test for test/TransparentProxySafety.t.sol:TransparentProxySafetyTest
   [PASS] testFix_RealProxyStorageNeverCollidesWithImplementationSlot() (gas: 14134701)
   Logs:
   npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

   Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 3.89s (3.87s CPU time)

   Ran 2 test suites in 3.91s (3.91s CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
   ```

2. **Medium - Upgrading a UUPS Proxy from V1 to V2, Safely and Unsafely.**

   **What you practice:**
   - A real UUPS proxy deployment and a real, validated upgrade to a new implementation version (Concept 4)
   - Appending new state safely, and watching the plugin's own validation reject an unsafe, layout-breaking version (Concept 5)
   - `_authorizeUpgrade`'s own access control, felt directly by attempting an upgrade from a non-owner account

   **Requirements:**
   - `VaultV1` (reused from Easy, `UUPSUpgradeable` added this time): `balance`, `deposit()`, and `_authorizeUpgrade` gated `onlyOwner`.
   - `VaultV2`: identical to `VaultV1`, plus a new `uint256 public lastDepositTimestamp;` **appended after** `balance` (Concept 5's safe shape), and a `deposit()` override that also records `block.timestamp`; annotated `/// @custom:oz-upgrades-from VaultV1` so the plugin knows what to validate it against.
   - `VaultV2Bad`: identical to `VaultV2`, except `lastDepositTimestamp` is declared **before** `balance` instead of after — Concept 5's unsafe shape, deliberately, to trigger the plugin's own rejection.
   - A test upgrading a deployed `VaultV1` proxy to `VaultV2`, confirming `balance` survives the upgrade untouched and the new field works.
   - A test attempting the identical upgrade to `VaultV2Bad`, confirming the plugin's own validation rejects it before it can ever reach the chain.

   [Solution](./Assignment/code2/)

   **Final Output.**

   ```
   mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-33/Assignment/code2/upgrade-medium$ forge test -vv --force
   [⠊] Compiling...
   [⠆] Compiling 62 files with Solc 0.8.36
   [⠒] Solc 0.8.36 finished in 3.20s
   Compiler run successful!

   Ran 3 tests for test/UUPSUpgrade.t.sol:UUPSUpgradeTest
   [PASS] testExploit_UnsafeLayoutChangeIsRejectedByValidation() (gas: 18489057)
   Logs:
   npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

   [PASS] testFix_NonOwnerCannotAuthorizeAnUpgrade() (gas: 14624871)
   Logs:
   npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

   [PASS] testFix_SafeUpgradePreservesStateAndAddsNewField() (gas: 48395292)
   Logs:
   npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0
   npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

   Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 8.02s (16.78s CPU time)

   Ran 1 test suite in 8.02s (8.02s CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
   ```

3. **Hard - Timelocked Upgrade Governance and the Uninitialized-Implementation Attack.**

   **What you practice:**
   - Gating a UUPS proxy's upgrade authority behind a real `TimelockController`, not a raw EOA (Concept 8)
   - Confirming an upgrade genuinely cannot be executed before its delay has passed, using `vm.warp` exactly Week 31's own timestamp-manipulation pattern (Concept 8)
   - The uninitialized-implementation attack, demonstrated directly against a version that forgot `_disableInitializers()`, then confirmed fixed against one that has it (Concepts 6, 9)

   **Requirements:**
   - `VaultV1` and `VaultV2` reused from Medium, unchanged.
   - A UUPS proxy deployed with a real `TimelockController` (OpenZeppelin's own, `@openzeppelin/contracts/governance/TimelockController.sol` — note this one comes from the NON-upgradeable package, Week 29's own install, since the timelock itself doesn't need to be upgradable) as its owner, with a minimum delay of `2 days`.
   - A test confirming `TimelockController.execute(...)` for a scheduled upgrade reverts if attempted before the delay has passed, then succeeds once `vm.warp` advances past it.
   - A separate `VulnerableImplementation` contract: identical to `VaultV1` in spirit, but its constructor does NOT call `_disableInitializers()` — deployed on its own (not behind any proxy), then `initialize`d directly by an attacker, demonstrating it becomes a real, callable, attacker-owned contract in its own right.
   - A `SafeImplementation` contract: identical, but with `_disableInitializers()` correctly present, confirming the identical direct-initialize attempt reverts.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge clean && forge test -vv --force

    Expected output shape:
        Ran 2 tests for test/UninitializedImplementation.t.sol:UninitializedImplementationTest
        [PASS] testExploit_AttackerInitializesTheRawImplementationDirectly()
        [PASS] testFix_DisableInitializersPreventsTheIdenticalAttack()
        Ran 1 test for test/TimelockedUpgrade.t.sol:TimelockedUpgradeTest
        [PASS] testFix_UpgradeCannotExecuteBeforeTheDelayHasPassed()

   2. Command: forge test --match-test testExploit_AttackerInitializes -vvvv

    Expected output: a full trace showing the attacker's own address
    directly calling `initialize` on `VulnerableImplementation`'s own
    deployed address, succeeding — confirming Concept 9's own risk
    isn't theoretical: this exact contract, deployed exactly the way
    `Upgrades.deployUUPSProxy` deploys every implementation under the
    hood, really is independently callable and independently ownable
    by anyone who notices before the real deployer does.

   3. Command: in src/SafeImplementation.sol, temporarily remove the
    `constructor` entirely (deleting the `_disableInitializers()` call
    along with it — making it identical in shape to
    VulnerableImplementation), then re-run:
        forge test --match-test testFix_DisableInitializersPreventsTheIdenticalAttack -vv

    Expected output: this test now FAILS — the `vm.expectRevert()`
    never triggers, because the attacker's `initialize` call now
    succeeds instead of reverting, confirming the constructor's single
    line was the entire mechanism this whole assignment's "fix" rested
    on, not incidental to it passing before. Revert the change
    afterward.

   4. Command: re-run the full suite once more to confirm everything is
    back to its Requirements-matching state after Test Case 3's
    temporary change:
        forge clean && forge test -vv --force

    Expected output: all tests pass again, matching Manual Test Case 1's
    own output exactly.
   ```
