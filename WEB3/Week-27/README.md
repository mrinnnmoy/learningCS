# List of things learned.

## 1. Contract structure.

A Solidity file's top-level unit is the `contract` keyword.

A single declaration bundling state (Concept 2), functions (Concept 4), events (Concept 6), and error types (Concept 10, 13) into one named block that compiles down to exactly one deployable bytecode blob (Week 26, Concept 6).

This is the literal, textual place where Week 26 Concept 1's _"code and storage fused at one address"_ claim becomes concrete:

- everything a contract account _is_ gets written inside this one block, there's no separate file for "the program" and

- a separate account type for "its data" the way Week 11's Solana model splits a program from the accounts it owns.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract Counter {
    // state variables (Concept 2), functions (Concept 4),
    // events (Concept 6), errors (Concept 10, 13) all live here.
}
```

The `pragma` line pins the compiler version range this file was written against, the direct source-level counterpart to `foundry.toml`'s `solc` pin from the Tutorial above.

Both exist so _"what compiled this"_ is never ambiguous, the same discipline Week 1 called pinning versions in fast-moving documentation generally.

---

## 2. State variables.

Variables declared at the contract level, outside any function, persist permanently in that contract's own storage between calls.

The Solidity-level surface of Week 26 Concept 1's _"contract accounts hold their own persistent data"_ and Week 26 Concept 2's storage-as-key-value-mapping model specifically.

This is a genuinely different persistence model than Week 11's Solana accounts:

- a contract's storage isn't a separate account someone allocates and pays rent-exemption for (Week 11, Concept 8),
- it's an intrinsic part of the contract's own address, sized dynamically as needed,
- paid for per-write in gas (Week 26, Concept 3) rather than per-byte upfront.

```solidity
contract Counter {
    address public immutable owner;  // set once, at deploy time (Concept 5)
    uint256 private count;           // mutable, persists across every call
}
```

`immutable` is a middle ground worth naming here.

Baked into the deployed bytecode itself at construction time (Concept 5), cheaper to read than ordinary storage, but still per-instance rather than shared across every deployment of the contract the way a Rust `const` (Week 6) is fixed at compile time for every use.

---

## 3. Data types & Visibility modifiers.

Solidity's primitive types, `uint256`/`int256` (and their smaller-width siblings), `address`, `bool`, `bytes32`, `string`, map roughly onto Week 6's Rust primitives but with two Ethereum-specific additions.

`address` (a 20-byte account identifier, EOA or contract, Week 26 Concept 1) and `uint256`/`int256` as the EVM's actual native word size (Week 26, Concept 2's stack works in 256-bit words natively, smaller uints get padded, not shrunk, under the hood).

Visibility is a second, separate axis, entirely orthogonal to type, four levels controlling who can read a state variable or call a function:

- `public` (auto-generates a getter, callable/readable by anyone),
- `private` (this contract only, not even inheriting contracts, Concept 11),
- `internal` (this contract and anything inheriting from it),
- `external` (functions only, callable from outside the contract exclusively).

This is Solidity's own access-control primitive, worth contrasting directly against Week 11's Solana model, which has no visibility keyword at all, every account is readable by anyone who queries it, _"privacy"_ there is achieved by what a program's own logic chooses to check (Week 11's `owner` field, Week 13's PDA-as-signer pattern), not by a compiler-enforced keyword.

|                                              | `public`                               | `private`                                                        | `internal`                         | `external`                         |
| -------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| Readable/callable from outside               | Yes                                    | No                                                               | No                                 | Yes (functions only)               |
| Visible to inheriting contracts (Concept 11) | Yes                                    | No                                                               | Yes                                | Yes                                |
| Auto-generates a getter (state variables)    | Yes                                    | No                                                               | No                                 | N/A                                |
| Closest Week 11 analogue                     | Anyone can `getAccountInfo` regardless | Enforced only by the program's own logic checking `owner`/signer | Same, no compiler-level equivalent | Same, no compiler-level equivalent |

---

## 4. Functions & Modifiers.

A function's signature declares its visibility (Concept 3), its state mutability (Concept 12 covers this properly) and optionally one or more **modifiers**.

Reusable pieces of pre/post-execution logic named and attached by identifier, with the special `_;` placeholder marking where the modified function's own body actually runs.

This is Solidity's answer to the same _"run shared logic before the real work"_ problem Week 8's derive macros solved for Rust, but simpler and function-scoped rather than compile-time codegen.

A modifier is closer to a wrapping function than a macro.

```solidity
modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner(msg.sender);  // Concept 9, Concept 13
    _;                                                       // the modified function body runs here
}

function incrementBy(uint256 amount) external onlyOwner {
    count += amount;
}
```

Access control expressed this way is doing, at the Solidity source level, exactly the check Week 20 named as security-critical on the Solana side under a different name, _"missing signer checks"_.

A modifier like `onlyOwner` _is_ Solidity's version of that check, made explicit and reusable rather than something to remember to inline in every function by hand.

Week 29 formalizes this exact pattern as OpenZeppelin's `Ownable`, unchanged in spirit from the modifier above.

---

## 5. Constructors.

The `constructor` keyword marks code that runs exactly once, at deployment and is never part of the contract's deployed runtime bytecode at all.

Only its one-time deployment bytecode, the closest Solidity gets to Week 15's Anchor `initialize` instruction, but genuinely simpler.

There's no separate account to allocate first the way an Anchor `#[account(init)]` constraint needs one, a contract's own storage (Concept 2) exists automatically the moment its address exists.

```solidity
constructor() {
    owner = msg.sender;  // Concept 9: whoever deploys becomes the initial owner
}
```

Worth flagging as a forward reference rather than glossing over.

Week 33 covers upgradable contracts, where a `constructor` specifically _can't_ be used the way it's used here, an `initialize` function called manually after deployment takes over instead, for reasons tied to how proxy patterns actually work, not explained here since Weeks 27-32 never touch upgradability.

---

## 6. Events & Logging.

`event` declares a typed log entry a function can `emit`, written into the transaction's receipt rather than into contract storage (Concept 2).

Dramatically cheaper to write than a storage slot (Week 26, Concept 5's `SSTORE` vs. logging opcodes) precisely because nothing on-chain ever reads a log back, the EVM can't, only off-chain clients querying transaction receipts can.

This is the direct Ethereum-side counterpart to Week 24's entire indexing unit.

An indexer or subgraph (Week 35 formalizes this properly) watches for events exactly the way Week 24's Geyser-based indexers watched for Solana account changes.

A genuinely different mechanism (events are transaction-receipt data; Solana account changes are state itself) solving the same _"let an off-chain system react to on-chain activity"_ problem.

```solidity
event CountIncreased(address indexed by, uint256 newCount);
```

- `indexed` (up to three parameters per event) makes that field efficiently filterable in a log query.

- `cast logs` and `eth_getLogs` (the JSON-RPC method underneath, Week 26 Concept 11) can search by an indexed field directly without scanning every log's full data, unindexed fields still get logged, just not efficiently searchable that way.

---

## 7. Mappings & Arrays.

`mapping(KeyType => ValueType)` is Solidity's hash-table-shaped storage type.

Conceptually the closest thing to what a Week 13 PDA achieves on Solana, deterministic lookup from a key to a value, but the mechanism is entirely different underneath.

A PDA is a real, separate account address, derived off-chain or on-chain via `findProgramAddressSync`.

A Solidity mapping is one contract's own internal storage, addressed by `keccak256(key . slot)` under the hood, never a separate account or address at all, exactly the distinction Week 26 Concept 12 already drew in the abstract, now concrete.

A mapping also can't be iterated or measured for length directly (there's no way to ask "how many keys"), which is precisely why real contracts pair a mapping with a parallel `array` tracking which keys actually exist, the pattern Medium's assignment builds deliberately.

```solidity
mapping(uint256 => Task) private tasks;   // O(1) lookup by id, not iterable
uint256[] private taskIds;                 // the only way to enumerate what's in the mapping
```

|                | `mapping`                                           | Solana PDA (Week 13)                                                        |
| -------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| What it is     | Internal storage inside one contract                | A separate, real account address                                            |
| Derivation     | `keccak256(key, slot)`, purely internal             | `findProgramAddressSync(seeds, programId)`                                  |
| Iterable       | No — track keys separately (array)                  | N/A — each PDA is its own account, listed off-chain by an indexer (Week 24) |
| Existence cost | Amortized into the write's gas (Week 26, Concept 3) | Rent-exemption, paid once, upfront (Week 11)                                |

---

## 8. Structs & Enums.

`struct` groups related fields into one named type.

Exactly Week 6's Rust `struct` and `enum` defines a small closed set of named states, exactly Week 6's Rust `enum` minus the ability to carry data per-variant.

A Solidity `enum` is closer to a C-style enum (each variant is just an integer, `0`, `1`, `2`, ...) than to Rust's data-carrying enums, which is genuinely a step down in expressiveness worth naming plainly rather than glossing over.

Both compile down to fitting inside Solidity's storage slots as compactly as the compiler can manage, a struct's fields get packed together the same way Week 46 covers explicitly and in depth for gas optimization, this week just uses the default packing without hand-tuning it.

```solidity
enum Status { Open, InProgress, Done }   // internally: 0, 1, 2

struct Task {
    uint256 id;
    string description;
    address assignedTo;
    Status status;
}
```

Where Week 15's Anchor `#[derive(Accounts)]` struct describes _which accounts an instruction needs_.

A Solidity struct like `Task` above describes _a shape of data living inside one contract's own storage_ (Concept 2).

A genuinely different role even though the keyword and field-list syntax look similar on the page.

---

## 9. `msg.sender`, `msg.value`, `msg.data`.

Every function call carries an implicit `msg` object the EVM populates automatically.

- `msg.sender` (the address that directly called this function, an EOA or another contract, Week 26 Concept 1),
- `msg.value` (however much ETH, in wei, Week 26 Concept 10, was sent along with this call, always `0` unless the function is `payable`, Concept 12) and
- `msg.data` (the raw calldata bytes, Week 26 Concept 6's ABI-encoded selector plus arguments).

`msg.sender` specifically is the single most load-bearing three words in this entire week, it's what every `onlyOwner`-style modifier (Concept 4) actually checks, the direct Solidity-side equivalent of Week 11's `is_signer` account flag and the exact check Week 20 flagged as commonly missing on the Solana side.

```
Wallet 0xAB... calls Counter.incrementBy(5)
  msg.sender = 0xAB...           (who's calling)
  msg.value  = 0                 (no ETH attached — incrementBy isn't payable)
  msg.data   = 0x1003e2d2...     (the encoded selector + "5")
```

Worth naming as a subtlety, not a caveat to skip.

If contract A calls contract B, inside B's code `msg.sender` is A's address, not the original human wallet that started the whole chain, `tx.origin` exists for that instead and is deliberately not covered here, Week 31 explains exactly why using `tx.origin` for access control is a real, named vulnerability class rather than a convenient shortcut.

---

## 10. Error handling (`require`, `revert`, `assert`).

Three ways to abort execution and undo every state change made so far in the current transaction, all gas already spent up to that point still consumed (Week 26, Concept 3's exact rule).

`require(condition, "message")` checks a condition and reverts with a string reason if false, meant for input validation and access control, the everyday case.

`revert("message")` aborts unconditionally, useful when the failure logic is more complex than one boolean check.

`assert(condition)` is meant only for conditions that should be _mathematically impossible_ to fail.

An `assert` failing is meant to signal a genuine bug in the contract itself, not bad user input, historically consumed all remaining gas rather than refunding it (current Solidity no longer does this by default, but the semantic distinction, _"this should never happen"_ vs. _"this input is invalid"_, still matters and still shapes which one to reach for).

```solidity
require(count > 0, "count is already zero");   // input/state validation
revert("unreachable state reached");            // unconditional abort
assert(count <= type(uint256).max);             // "this can never actually fail"
```

Concept 13, immediately following, covers custom errors, the modern replacement for string-message `require`/`revert` in almost all new code, string messages are shown here first because they're what every Solidity tutorial and most existing deployed code still use, worth being able to read even once you stop writing them yourself.

---

## 11. Inheritance basics.

`contract Child is Parent` gives `Child` every one of `Parent`'s `public` and `internal` members (Concept 3) directly.

True single (and multiple) inheritance, genuinely different from Week 7's Rust traits, which give you shared _behavior_ a type opts into implementing, not shared _state_ a type automatically receives.

A Solidity contract's storage layout (Concept 2) is a real, physical concern here in a way a Rust trait's is not.

`Child`'s own state variables are laid out in storage _after_ everything it inherits, order matters and Week 33 covers exactly why storage layout ordering becomes a genuinely dangerous concern once upgradability enters the picture.

Not explained further here since this week's contracts are never upgraded after deployment.

```solidity
abstract contract Ownable {
    address public owner;
    modifier onlyOwner() { ... }
}

contract TaskRegistry is Ownable {
    // inherits `owner` (Concept 2) and `onlyOwner` (Concept 4) directly,
    // as if they'd been written inside TaskRegistry itself
}
```

Week 29 builds on this concept directly and immediately.

Rather than hand-rolling an `Ownable` base contract (as this week's Medium assignment does, deliberately, to see the mechanism once before relying on a library), it swaps in OpenZeppelin's own audited `Ownable`, unchanged in the underlying inheritance mechanic, just a trusted, battle-tested implementation instead of a homemade one.

---

## 12. Function state mutability. (`view`, `pure` & a first mention of `payable`)

Every function additionally declares how it relates to state.

A plain function can read and write storage (Concept 2) and calls that alter it.

`view` promises to only _read_ state, never write it, enforced by the compiler, callable off-chain for free (no gas, no transaction) since nothing needs to be recorded on-chain.

`pure` promises to touch _no_ state at all, not even reading it, a function of its arguments alone.

`payable` is the fourth marker, allowing a function to receive ETH via `msg.value` (Concept 9) and is deliberately only named here, not used.

Week 28's entire subject is `payable` functions and ETH transfer mechanics properly, this week's assignments accept no ETH at all, every function here is either ordinary, `view` or `pure`.

```solidity
function getCount() external view returns (uint256) { return count; }        // reads state, writes nothing
function double(uint256 x) external pure returns (uint256) { return x * 2; } // touches no state at all
```

|                              | Plain | `view` | `pure` | `payable` (Week 28) |
| ---------------------------- | ----- | ------ | ------ | ------------------- |
| Can read state               | Yes   | Yes    | No     | Yes                 |
| Can write state              | Yes   | No     | No     | Yes                 |
| Can receive ETH              | No    | No     | No     | Yes                 |
| Callable for free, off-chain | No    | Yes    | Yes    | No                  |

---

## 13. Custom errors. (the modern replacement for string `require`/`revert`)

Since Solidity 0.8.4, `error` declares a named.

Optionally-parameterized error type, `revert`ed with `revert CustomError(arg1, arg2)` instead of a string message, encoded far more cheaply (an error's 4-byte selector, Week 26 Concept 6's exact ABI-selector mechanism, plus its ABI-encoded arguments, versus a full string stored in the deployed bytecode and copied into every revert) and structured rather than just human-readable text a client has to parse.

This week's assignments use custom errors throughout for exactly this reason, not string `require` messages, even though Concept 10 introduced strings first for readability.

Week 46 covers the gas-cost difference between the two approaches numerically and in depth, this week just adopts the modern convention directly.

```solidity
error NotOwner(address caller);
...
if (msg.sender != owner) revert NotOwner(msg.sender);
```

A test framework (Concept 14) can assert on a specific custom error and its exact arguments.

`vm.expectRevert(abi.encodeWithSelector(NotOwner.selector, stranger))`, something a plain string message only allows by exact, brittle text match.

---

## 14. Foundry project anatomy & The compile/test/deploy lifecycle.

A `forge init` project's shape,

- `src/` for contracts,
- `test/` for Solidity test contracts,
- `script/` for deployment scripts,
- `foundry.toml` for configuration (the `solc` pin from the Tutorial lives here)

is the direct Foundry-side counterpart to Week 15's Anchor project structure.

But with one foundational difference worth naming plainly.

Anchor's tests are written in TypeScript against a running local validator (Week 15's own testing framework, formalized further in Week 16).

Foundry's tests are written _in Solidity itself_, compiled and run directly against an in-memory EVM `forge test` spins up per run, no separate validator process, no RPC round-trip at all, dramatically faster for exactly that reason.

- `forge build` compiles,
- `forge test` compiles and runs every function in `test/`

Prefixed `test` (the naming convention `forge` looks for) against a fresh EVM state each time and `forge script` (Hard's assignment uses this) executes a Solidity script against a real or simulated chain, optionally broadcasting real transactions with `--broadcast`.

The mechanism that actually deploys a contract for real, against a local `anvil` chain for Easy & Medium and against real Sepolia for Hard.

```
counter/
├── foundry.toml
├── src/
│   └── Counter.sol
├── test/              # left as forge init's own default scaffold, unused through Week 29
└── script/
    └── Deploy.s.sol
```

Client-side interaction with a deployed contract (calling it from outside Solidity entirely) isn't covered by Foundry's own `forge`/`script` layer at all.

That's what `cast` (this week's own assignments) and `ethers`/`viem` (Week 26's `ethers` setup, formalized properly for this purpose in Week 32) are for, mirroring how Week 16 formalized `@coral-xyz/anchor` client usage well after Week 12 first introduced `@solana/web3.js`.

---

## Assignment.

1. **Easy - Contract Anatomy: A Configurable Counter.**

   **What you practice:**
   - Contract structure, state variables, and `immutable` (Concepts 1, 2)
   - Visibility modifiers and a custom access-control `modifier` built from `msg.sender` (Concepts 3, 4, 9)
   - A constructor setting an owner at deploy time (Concept 5)
   - Events, emitted on every state change (Concept 6)
   - Custom errors instead of string `require` messages (Concept 10, 13)
   - `view` functions and the `forge build` / `forge script` / `cast` workflow, deliberately without `forge test` this week (Concepts 12, 14)

   **Requirements:**
   - A `Counter` contract with an `owner` set once, in the constructor, to whoever deploys it, stored `immutable`.
   - A private `uint256 count`, readable only through an external `view` function `getCount()`.
   - `increment()`, callable by _anyone_, adds `1`, emits `CountIncreased(address indexed by, uint256 newCount)`.
   - `incrementBy(uint256 amount)`, callable by the owner _only_ (via an `onlyOwner` modifier), adds `amount`, emits the same event.
   - `decrement()`, callable by anyone, subtracts `1`, but reverts with a custom error `CountUnderflow()` if `count` is already `0`; emits `CountDecreased(address indexed by, uint256 newCount)` on success.
   - Calling `incrementBy` from any non-owner address reverts with a custom error `NotOwner(address caller)`, carrying the caller's own address as its argument.
   - A `script/Deploy.s.sol` that deploys `Counter` and logs its address, run against local `anvil` (Tutorial, step 4).

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: Run command "anvil" on one terminal and try this commands in another
        terminal simultaneously while terminal 1 runs,


       cast send <ADDRESS> "increment()" --rpc-url http://127.0.0.1:8545 \
       --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       cast call <ADDRESS> "getCount()(uint256)" --rpc-url http://127.0.0.1:8545

        Expected output: the second command returns `1` — confirming
        increment() genuinely works when called by the stranger account,
        not just the owner (Requirements: "callable by anyone").

   2. Command:
       cast send <ADDRESS> "incrementBy(uint256)" 5 --rpc-url http://127.0.0.1:8545 \
       --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

        Expected output: the transaction reverts. Running it with
        `cast call` instead of `cast send` first (a free, read-only
        simulation) shows the decoded reason directly:
            cast call <ADDRESS> "incrementBy(uint256)" 5 --rpc-url http://127.0.0.1:8545 \
            --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        → reverts with `NotOwner(0x70997970C51812dc3A010C7d01b50e0d17dc79C8)`,
        confirming the custom error carries the actual caller's address
        (Concept 13), not just an unlabeled generic revert.

   3. Command: in src/Counter.sol, temporarily remove the `onlyOwner`
        modifier from `incrementBy` (change `external onlyOwner` to just
        `external`), then rebuild and redeploy fresh:
            forge build

            forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
            --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast

            (note the NEW address this prints, call it <ADDRESS2>)

            cast send <ADDRESS2> "incrementBy(uint256)" 5 --rpc-url http://127.0.0.1:8545 \
            --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

            cast call <ADDRESS2> "getCount()(uint256)" --rpc-url http://127.0.0.1:8545

        Expected output: the stranger's `incrementBy` call now SUCCEEDS and
        `getCount()` returns `5` — confirming the `onlyOwner` modifier was
        the entire mechanism enforcing Concept 4 and Concept 9's
        access-control claim on the original deployment, not incidental to
        it working before. Revert the source change afterward; <ADDRESS2>
        was only ever a throwaway local deployment, safe to abandon.

   4. Command: in src/Counter.sol, temporarily change `if (count == 0)` to
        `if (count == 999999)` inside decrement(), rebuild, redeploy fresh
        the same way as Test Case 3, then:

            cast send <ADDRESS3> "decrement()" --rpc-url http://127.0.0.1:8545 \
            --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

            cast call <ADDRESS3> "getCount()(uint256)" --rpc-url http://127.0.0.1:8545

        Expected output: the `cast send` still reverts — Solidity 0.8.x's
        own built-in checked arithmetic (Concept 10's `assert`-territory
        backstop, "this should never happen") catches the underflow on the
        `count -= 1` line regardless — but decoding the revert reason now
        shows a generic `Panic(0x11)` ("arithmetic underflow"), not the
        informative `CountUnderflow()` custom error the working version
        produced in Test Case 2. This still confirms the guard is
        load-bearing, just for legibility rather than safety here
        specifically: without it, a caller (or Week 32's client code) learns
        only that *something* underflowed, not what state that means or
        which check they hit. Revert the source change afterward.
   ```

2. **Medium - A Struct/Enum/Mapping Task Registry with Inherited Access Control.**

   **What you practice:**
   - Structs and enums modeling a real, multi-field record (Concept 8)
   - A `mapping` paired with a parallel array for enumeration (Concept 7)
   - Inheritance: a hand-rolled `Ownable` base contract, extended by `TaskRegistry` (Concept 11)
   - A second, different access-control shape: "owner or the specifically-assigned address" rather than Easy's "owner only" (Concepts 4, 9)
   - Custom errors for both "not found" and "not authorized" failure modes (Concept 13)

   **Requirements:**
   - An abstract `Ownable` base contract: public `owner`, an `onlyOwner` modifier, a constructor taking the initial owner, and a `transferOwnership(address newOwner)` function, owner-only, emitting `OwnerChanged(address indexed previousOwner, address indexed newOwner)`.
   - A `TaskRegistry is Ownable` contract with an `enum Status { Open, InProgress, Done }` and a `struct Task { uint256 id; string description; address assignedTo; Status status; }`.
   - `createTask(string calldata description)`, owner-only, assigns the next sequential `id` starting at `0`, stores the task with `assignedTo == address(0)` and `status == Status.Open`, appends the id to an enumerable array, emits `TaskCreated(uint256 indexed id, string description)`, and returns the new id.
   - `assignTask(uint256 id, address to)`, owner-only, reverts `TaskNotFound(uint256 id)` for an unknown id, otherwise sets `assignedTo` and emits `TaskAssigned(uint256 indexed id, address indexed to)`.
   - `updateStatus(uint256 id, Status newStatus)`, callable by _either_ the task's current `assignedTo` _or_ the owner, reverts `TaskNotFound` for an unknown id and `NotAssignee(address caller)` for anyone else, emits `StatusUpdated(uint256 indexed id, Status newStatus)`.
   - `getTask(uint256 id)` (view, reverts `TaskNotFound` for an unknown id) and `getAllTaskIds()` (view, returns the full array of created ids).

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: (while running "anvil" command in a simultaneous terminal)

       cast send <ADDRESS> "createTask(string)" "Write Week 27 README" \
       --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

       cast call <ADDRESS> "getAllTaskIds()(uint256[])" --rpc-url http://127.0.0.1:8545

       Expected output: `[0]` — confirming createTask assigned sequential
       id 0 and appended it to the enumerable array (Concept 7).

   2. Command:
       cast send <ADDRESS> "assignTask(uint256,address)" 0 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
       --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

       cast send <ADDRESS> "updateStatus(uint256,uint8)" 0 1 \
       --rpc-url http://127.0.0.1:8545 \
       --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       cast call <ADDRESS> "getTask(uint256)((uint256,string,address,uint8))" 0 \
       --rpc-url http://127.0.0.1:8545

       Expected output: the task's status field is `1` (`Status.InProgress`)
       — confirming updateStatus succeeded when called by the assignee
       specifically (Account 1's own key), a genuinely different address
       from the owner who deployed and created the task, exercising
       Concept 4's "owner OR assignee" check from the assignee's side.

   3. Command:
       cast call <ADDRESS> "updateStatus(uint256,uint8)" 0 2 \
       --rpc-url http://127.0.0.1:8545 \
       --from 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

       Expected output: reverts, decodable as
       `NotAssignee(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC)` —
       confirming the stranger (neither owner nor assignee) is genuinely
       blocked, via a free `cast call` simulation rather than spending gas
       on a doomed real transaction.

   4. Command: in src/TaskRegistry.sol, temporarily change
       `if (msg.sender != task.assignedTo && msg.sender != owner)` to
       `if (false)` (removing the access check entirely), rebuild, and
       redeploy fresh the same way as How to Build step 4 (note the NEW
       address, <ADDRESS2>), then:
           cast send <ADDRESS2> "createTask(string)" "test task" --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast send <ADDRESS2> "updateStatus(uint256,uint8)" 0 2 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365

       Expected output: the stranger's updateStatus call now SUCCEEDS —
       confirming that one condition was the entire mechanism enforcing
       Concept 9's access control here, exactly the same load-bearing
       pattern Easy's Test Case 3 demonstrated for a single-owner check,
       now for a two-party one. Revert the source change afterward;
       <ADDRESS2> was only ever a throwaway local deployment, safe to
       abandon.
   ```

3. **Hard - Deploying TaskRegistry to Sepolia and Verifying It Live.**

   **This assignment reuses Medium's `TaskRegistry` and `Ownable` contracts, not a re-implementation of them.**

   The exact expected relationship:
   - this project's `src/` is a copy of Medium's `task-registry/src/` (contract logic byte-for-byte unchanged,
   - only a `script/Deploy.s.sol` and Foundry's `[rpc_endpoints]` config get added on top)

   **What you practice:**
   - The Foundry deploy lifecycle: the same `forge script` with `--broadcast` Easy and Medium already used against local `anvil`, now pointed at a real chain for the first time (Concept 14)
   - Concept 1's claim made completely concrete: this deployment turns a real Sepolia address into a real contract account (Week 26, Concept 1), inspectable exactly the way Week 26's Easy assignment inspected an existing one
   - Reading back real, persisted on-chain state and a real emitted event (Concepts 6, 7) via `cast call` and `cast logs`, rather than an in-memory test assertion
   - `msg.sender` (Concept 9) in a genuinely live context: your own real wallet's address becomes `TaskRegistry`'s real `owner`

   **Requirements:**
   - A `script/Deploy.s.sol` Foundry script that deploys `TaskRegistry` and logs its deployed address.
   - Deployment happens via `forge script --broadcast` against Sepolia, signed by your own real wallet, imported as an encrypted local keystore (never a raw private key in a file or on the command line).
   - The deployed address gets saved to `deployments/sepolia.txt`, and the script (or your own check before running it) treats that file's presence as "already deployed", so a second, accidental run doesn't waste testnet ETH redeploying — this is genuinely worth doing rather than skipping, deployment is exactly the kind of slow-to-redo, real-cost step your own environment-tracking rules call out.
   - After deployment, one real task gets created via `cast send`, then read back via `cast call`, and its `TaskCreated` event gets confirmed via `cast logs` against the real chain.

   [Solution](./Assignment/code3/)

   **Manual Test Cases:**

   ```text
   1. Command:
           forge script script/Deploy.s.sol \
           --rpc-url sepolia \
           --account deployerKey \
           --broadcast

       Expected output: a real broadcast transaction, a real deployed
       address printed by the script's console.log, and — critically,
       distinguishing this from every Easy/Medium deployment — that address
       is still there if you look it up on a Sepolia block explorer minutes
       or days later, because it's a real, persisted contract account
       (Week 26, Concept 1), not a throwaway local `anvil` chain that
       resets the moment that terminal closes.

   2. Command:
           cast send <ADDRESS> "createTask(string)" "Ship Week 27" \
           --rpc-url sepolia \
           --account deployerKey

           cast call <ADDRESS> \
           "getTask(uint256)((uint256,string,address,uint8))" \
           0 \
           --rpc-url sepolia

       Expected output: the second command returns the exact tuple

           (0, "Ship Week 27", 0x0000000000000000000000000000000000000000, 0)

       — id 0, the description you actually sent, an unassigned address,
       and Status.Open (0) — confirming the state written by the first
       command genuinely persisted on a real chain in between the two
       separate commands, not just within one script's execution.

   3. Command:
           cast logs \
           --rpc-url sepolia \
           --address <ADDRESS> \
           --from-block <DEPLOYMENT_BLOCK>

       (Optionally narrow the search further with `--to-block` if using a
       public RPC provider that limits log-query ranges.)

       Expected output: at least one `TaskCreated` event appears in the
       returned logs, confirming that the event emitted by
       `createTask(string)` was permanently recorded on-chain alongside the
       state update (Concepts 6 and 7). Unlike `anvil`, many public Sepolia
       RPC providers reject unbounded log searches, so querying from the
       deployment block (or another recent block) is expected practice.

   4. Command:

           test -f deployments/sepolia.txt && \
           echo "Already deployed:" && \
           cat deployments/sepolia.txt

       Expected output: if `deployments/sepolia.txt` already exists, the
       saved deployment address is printed and no second deployment is
       performed. This confirms the persistence guard works and prevents
       accidentally deploying multiple copies of the same contract (and
       spending additional Sepolia ETH) during repeated runs of the
       assignment.
   ```
