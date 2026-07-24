# List of things learned.

## 1. Project setup. (Hardhat vs. Foundry)

Both tools solve the same problem, a reproducible project skeleton plus dependency management, from opposite directions.

- Foundry is a single Rust binary suite (`forge`/`cast`/`anvil`), no runtime dependency beyond itself;
- Hardhat is an npm package, running on Node.js, its entire plugin ecosystem distributed the normal npm way.

(Week 29, Concept 5's OpenZeppelin install already showed this same npm-vs-Foundry-remapping contrast for a single dependency, now for the whole toolchain)

|                         | Foundry                                                                                   | Hardhat 3                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                 | None — a compiled binary                                                                  | Node.js (v22.13.0+)                                                                                                                                                                |
| Scaffold command        | `forge init`                                                                              | `npx hardhat init`                                                                                                                                                                 |
| Config file             | `foundry.toml` (TOML)                                                                     | `hardhat.config.ts` (TypeScript, ES module)                                                                                                                                        |
| Dependency manager      | Git submodules (`lib/`), or npm (Hardhat 3 supports both; Foundry historically leans git) | npm (`node_modules/`)                                                                                                                                                              |
| Extending functionality | Fewer, built-in-feeling capabilities                                                      | A large plugin ecosystem, explicitly imported and listed                                                                                                                           |
| Test language           | Solidity                                                                                  | TypeScript/JavaScript by default; Solidity tests are also supported natively as of Hardhat 3, not used in this week's own assignments to keep the JS/TS-vs-Solidity contrast clean |

Neither is "the right one" in the abstract and this week's own assignments deliberately don't pick a winner.

Concept 10 (added material) covers when each one's own strengths actually matter for a real decision, once both sides have been felt directly rather than just read about.

---

## 2. Compiling contracts.

`forge build` and `npx hardhat compile` do the same job, invoking `solc` against every file under `src/`/`contracts/` respectively and writing build artifacts (ABI, bytecode, Week 26 Concept 6) to an output directory:

- `out/` for Foundry,
- `artifacts/` for Hardhat,

both git-ignored by default, both safe to delete and regenerate at any time.

```
forge build              # Foundry: out/, using the solc version pinned in foundry.toml
npx hardhat compile      # Hardhat: artifacts/, using the solc version pinned in hardhat.config.ts
```

One genuine difference worth naming:

- Hardhat 3 generates TypeScript type declarations for every compiled contract's ABI by default, so a script or test importing a contract gets full autocomplete and compile-time argument checking on its functions
- Foundry has no equivalent for its own Solidity-side tests (a Solidity test calling a wrong-typed function is caught by `solc` itself at `forge build` time instead, the same protection, arrived at through the language the tests are written in rather than a separate codegen step).

---

## 3. Local test networks. (Hardhat's built-in network vs. `anvil`)

Every previous week's local work ran against `anvil` (Week 27, Tutorial).

Hardhat ships its own equivalent, an in-memory Ethereum simulation built on EDR (Hardhat's own Rust-based execution engine, not the JS-based one older tutorials describe), reachable two ways:

- as an actual standalone JSON-RPC process via `npx hardhat node` (directly comparable to running `anvil` in its own terminal) or
- spun up in-process, ephemeral, one per test run, via `network.connect()`/`network.create()` inside a script or test.

A capability `anvil` doesn't have an equivalent for, since Foundry's own tests (Concept 4) run against `forge test`'s own separate in-memory EVM instead of `anvil` at all.

```
npx hardhat node                    # standalone, JSON-RPC — directly comparable to `anvil`
```

```typescript
import { network } from "hardhat";
const { ethers } = await network.connect(); // in-process, ephemeral — no separate command needed
```

|                  | `anvil`                                                            | `npx hardhat node`                                                              | In-process `network.connect()`                                                 |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| How it runs      | Separate process, own terminal                                     | Separate process, own terminal                                                  | Spun up inside the current script/test process                                 |
| Default accounts | 10 well-known, pre-funded (Weeks 27-29's own default keys)         | 20 well-known, pre-funded                                                       | Same 20, automatically available as signers                                    |
| Used by          | Foundry's `forge script`/`cast` this course has used since Week 27 | Hardhat scripts/tests that need a persistent, externally-reachable RPC endpoint | Hardhat tests specifically — a fresh instance per test file, no cleanup needed |

---

## 4. Writing tests. (JS/TS in Hardhat, Solidity in Foundry)

This is the week's central contrast and the one Weeks 27-29 deliberately deferred (per your own standing instruction) rather than mixing into three weeks of pure Solidity learning.

Foundry tests are Solidity itself, `forge-std`'s `Test` base contract (already installed by every `forge init` since Week 27, unused until now), assertions and cheatcodes as regular Solidity function calls, compiled and run by `forge test` against its own in-memory EVM per run.

No separate language, no serialization boundary between the contract under test and the test code itself.

```solidity
// Foundry — test/Counter.t.sol
import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
    }

    function testIncrement() public {
        counter.increment();
        assertEq(counter.getCount(), 1);
    }

    function testOnlyOwnerReverts() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert(abi.encodeWithSelector(Counter.NotOwner.selector, address(0xBEEF)));
        counter.incrementBy(5);
    }
}
```

Hardhat tests are

- TypeScript (or JavaScript),
- Mocha as the test runner (Week 1's own "toolchain anatomy" concept, now concrete: a whole separate, general-purpose JS test framework, not one built specifically for Solidity),
- Chai for assertions,
- `ethers.js` (Week 26's own setup, still the exact same library)

as the actual bridge doing every contract call across the JS-to-EVM boundary.

```typescript
// Hardhat — test/Counter.ts
import { expect } from "chai";
import { network } from "hardhat";

describe("Counter", function () {
  it("increments", async function () {
    const { ethers } = await network.connect();
    const counter = await ethers.deployContract("Counter");
    await counter.increment();
    expect(await counter.getCount()).to.equal(1n);
  });

  it("reverts for a non-owner", async function () {
    const { ethers } = await network.connect();
    const counter = await ethers.deployContract("Counter");
    const [, stranger] = await ethers.getSigners();
    await expect(counter.connect(stranger).incrementBy(5))
      .to.be.revertedWithCustomError(counter, "NotOwner")
      .withArgs(stranger.address);
  });
});
```

|                              | Foundry (Solidity tests)                                                                                  | Hardhat (JS/TS tests)                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language                     | Solidity                                                                                                  | TypeScript/JavaScript                                                                                                                              |
| Assertion style              | `assertEq`, `vm.expectRevert`, plain Solidity                                                             | Chai matchers: `.to.equal`, `.to.be.revertedWithCustomError`                                                                                       |
| Impersonating another caller | `vm.prank(address)`                                                                                       | `contract.connect(signer)`                                                                                                                         |
| Execution speed (typical)    | Very fast — no separate process, no RPC serialization                                                     | Slower per-call — real JSON-RPC round-trips even against an in-process network                                                                     |
| Where it shines              | Fast, tight feedback loops; property-based fuzzing (Week 49) written in the same language as the contract | Testing against real client libraries (`ethers`/`viem`) exactly as a frontend would use them; TypeScript's own tooling (autocomplete, refactoring) |

Neither replaces the other's own value here, exactly Concept 1's table's own point.

This week's Easy assignment writes the _same_ test coverage both ways, deliberately, to make the contrast tangible rather than theoretical.

---

## 5. Scripting deployments. (Hardhat Ignition vs. `forge script`)

Foundry's `forge script` (Week 27, Concept 14 onward) is imperative.

A Solidity script that calls `new Counter()` and whatever else, line by line, exactly what runs.

Hardhat's own deployment tool, Ignition, is declarative instead.

A _module_ describes the desired end state (which contracts, with what constructor arguments, in what dependency order) and Ignition figures out the actual transaction plan, tracks what's already been deployed and critically is safely re-runnable, picking up where a previous, interrupted run left off rather than blindly redeploying everything from scratch.

```typescript
// Hardhat — ignition/modules/Counter.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CounterModule", (m) => {
  const counter = m.contract("Counter");
  return { counter };
});
```

```
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

```solidity
// Foundry — script/Deploy.s.sol (the exact shape every previous week's Hard has already used)
import {Script, console} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract DeployCounter is Script {
    function run() external returns (Counter counter) {
        vm.startBroadcast();
        counter = new Counter();
        vm.stopBroadcast();
    }
}
```

Ignition's "safely re-runnable" property is genuinely worth naming as a real advantage over the manual `deployments/sepolia.txt`-file-existence-check pattern every previous week's Hard assignment has had to build by hand (Week 27 onward).

Ignition tracks deployment state itself, under `ignition/deployments/<chain-id>/` and running the same `ignition deploy` command twice against an already-deployed module is a safe no-op, not something the project itself has to remember to guard against.

---

## 6. Forking mainnet for testing.

Both tools can point a local network at a real chain's _current_ state and let a script or test read and interact with genuinely deployed contracts (a real Uniswap pool, a real USDC contract) without ever broadcasting a real transaction against them.

Every write happens only against the local fork's own copy of that state, discarded the moment the fork process ends.

```toml
# Foundry — foundry.toml, or passed directly as a flag
[rpc_endpoints]
mainnet = "${MAINNET_RPC_URL}"
```

```
forge script script/ReadUSDC.s.sol --fork-url mainnet
# or, for a one-off read without a script at all:
cast call 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 "totalSupply()(uint256)" --rpc-url mainnet
```

```typescript
// Hardhat — hardhat.config.ts network entry
networks: {
  hardhatMainnet: {
    type: "edr-simulated",
    chainType: "l1",
    forking: {
      url: configVariable("MAINNET_RPC_URL"),
    },
  },
},
```

A fork without an explicit block number tracks the chain's current tip each time it's created, the simplest option and what this week's own assignment uses.

Pinning to one specific historical block instead makes a test's expected values fully reproducible run after run, but genuinely requires an archive-capable RPC endpoint (most free public endpoints only serve recent state).

Worth knowing as a real, practical limit rather than an oversight if a pinned-block fork mysteriously fails against a free endpoint that works fine unpinned.

---

## 7. Gas reporting.

Both tools can report exactly how much gas each function call actually consumed, directly useful for spotting the kind of optimization opportunity Week 46 covers in depth and for catching an accidental regression before it ships.

```
forge test --gas-report
```

```
npx hardhat test --gas-stats
```

Both report per-function gas costs;

- Foundry's also shows contract deployment cost inline in the same table by default.

Neither requires installing a separate plugin anymore on either side (an older Hardhat 2 tutorial reaching for the third-party `hardhat-gas-reporter` package predates this.

Hardhat 3 ships its own gas statistics built in, the same "built-in, not bolted on" trajectory Week 29's `Pausable`/`AccessControl` took over hand-rolling the same features).

---

## 8. Debugging with console logs & traces.

Both tools let a contract print debug output _during_ execution, genuinely useful mid-transaction insight a plain revert message can't give, plus a full call-stack trace on demand for anything that reverts or behaves unexpectedly.

```solidity
// Works with EITHER toolchain, once the right import is used —
// Foundry:
import "forge-std/console.sol";
// Hardhat:
import "hardhat/console.sol";

console.log("count is now:", count);
console.log("caller:", msg.sender);
```

```
forge test -vvvv                 # Foundry: full execution trace, every call/revert in the stack
npx hardhat test --show-stack-traces   # Hardhat: full trace on a failing test
```

`console.log` here is a genuine EVM-level implementation detail worth naming rather than treating as magic.

Both libraries work by having the compiler recognize calls to a specific, hardcoded precompile-like address and intercepting them locally, in the test/simulation environment only.

This code silently does nothing at all on a real, live chain (Sepolia, mainnet), it's purely a local development aid, safe to leave in during iteration but conventionally stripped before a real deployment.

---

## 9. Verifying contracts on Etherscan.

Once a contract's deployed live (Sepolia, throughout this course; a real mainnet deployment eventually), verification submits its actual source code to Etherscan, which recompiles it and confirms the result matches the deployed bytecode exactly.

After that, anyone can read the real source directly on the block explorer instead of just the raw bytecode and interact with it through Etherscan's own UI using the verified ABI.

```
forge verify-contract <ADDRESS> src/Counter.sol:Counter \
  --chain sepolia --etherscan-api-key <ETHERSCAN_API_KEY>
```

```
npx hardhat keystore set ETHERSCAN_API_KEY
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia --verify
```

Hardhat's version folds verification directly into the same Ignition deploy command via a flag, re-running it against an already-deployed module submits the source without re-deploying (Concept 5's own "safely re-runnable" property, doing double duty here).

Foundry's is a separate, explicit step run after the fact. Both need a real Etherscan API key, free to obtain from an Etherscan account and both need the exact constructor arguments used at deploy time if the contract's constructor took any. A mismatch here is the most common reason verification fails despite deployment having genuinely succeeded.

---

## 10. Choosing between them for real, once both have actually been used.

Neither tool is strictly better.

The honest answer depends on what a given project actually needs and this week's own assignments were built specifically so that answer comes from direct experience rather than a summary table alone.

Foundry's own strengths, felt directly in Concept 4's speed comparison and every previous week's `cast`-driven Manual Test Cases:

- fast iteration,
- tests written in the same language as the contracts they test,
- no separate runtime to install.

Hardhat's own strengths, felt directly in this week's Ignition module and its TypeScript test:

- a mature plugin ecosystem,
- first-class TypeScript tooling matching what a real frontend (Week 32) will actually use,
- Ignition's declarative,
- safely-re-runnable deployment model scaling better than a growing pile of hand-written `forge script` files as a real project's contract count grows.

Plenty of real production projects, including some genuinely large ones, use both at once.

Foundry for fast unit-level Solidity tests during development, Hardhat for TypeScript-based integration tests and Ignition-managed production deployments.

Not a contradiction, just using each tool for the part of the job it's genuinely better suited to, one of the reasons this course covers both rather than picking a side.

---

## Assignment.

1. **Easy - The Same Counter, Compiled and Tested Twice.**

   **What you practice:**
   - Scaffolding a real project on both toolchains, from scratch, in the same sitting (Concepts 1, 2)
   - The same test coverage, written once in Solidity (Foundry) and once in TypeScript (Hardhat), for the same contract (Concept 4)
   - Reading and comparing each tool's own test output format directly

   **Requirements:**
   - The same `Counter` contract (owner-gated `incrementBy`, `NotOwner` custom error, `increment`/`decrement` open to anyone, `CountUnderflow` custom error) built in both `counter-foundry/src/Counter.sol` and `counter-hardhat/contracts/Counter.sol` — genuinely identical source, copy it rather than reimplementing it twice by hand.
   - Foundry side: `test/Counter.t.sol` covering initial state, an owner-only `incrementBy` success and a non-owner revert, and a `decrement`-at-zero revert.
   - Hardhat side: `test/Counter.ts` covering the identical three cases, Mocha/Chai/ethers.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
         Ran 4 tests for test/Counter.t.sol:CounterTest
         [PASS] testDecrementRevertsAtZero()
         [PASS] testInitialCountIsZero()
         [PASS] testOwnerCanIncrementBy()
         [PASS] testStrangerCannotIncrementBy()
         Suite result: ok. 4 passed; 0 failed; 0 skipped

   2. Command: npx hardhat test

       Expected output shape (Mocha's own nested, descriptive format,
       genuinely different presentation from Foundry's flat pass/fail list
       even though it's checking the identical behavior):
         Counter
           ✔ starts at zero
           ✔ lets the owner incrementBy
           ✔ reverts incrementBy for a non-owner
           ✔ reverts decrement at zero
         4 passing

   3. Command: in counter-foundry/src/Counter.sol, temporarily remove the
       `onlyOwner` modifier from `incrementBy`, then re-run:
         forge test -vv

       Expected output: `testStrangerCannotIncrementBy` FAILS — Foundry
       reports it as a straightforward failed assertion (the expected
       revert never happened). Revert the change afterward.

   4. Command: make the IDENTICAL change to
       counter-hardhat/contracts/Counter.sol (same modifier removed), then
       re-run:
         npx hardhat compile
         npx hardhat test

       Expected output: "reverts incrementBy for a non-owner" FAILS too —
       confirming both toolchains catch the exact same real bug, just
       reported through each one's own test runner's own formatting (Chai's
       assertion-style failure message vs. Foundry's). Revert the change
       afterward on this side as well, so both projects match Requirements
       again.
   ```

2. **Medium - Scripted Local Deployment and Gas Reporting, Compared Side by Side.**

   **What you practice:**
   - Foundry's `forge script` against `anvil` vs. Hardhat Ignition against `npx hardhat node` — the same deployment, two different models (Concept 5)
   - Reading each tool's own local network the same way `cast` has read `anvil` since Week 27, now compared against Hardhat's own `npx hardhat node`
   - Gas reporting on both sides, for the identical contract, checking the numbers roughly agree (Concept 7)

   **Requirements:**
   - Reuse the identical `Counter.sol` from Easy on both sides (copy it into each new project).
   - Foundry: `script/Deploy.s.sol`, same shape as every previous week's Hard.
   - Hardhat: `ignition/modules/Counter.ts`, an Ignition module deploying `Counter` with no constructor arguments.
   - Both deployed against each tool's own local network, `anvil` for Foundry, `npx hardhat node` for Hardhat.
   - A gas report captured from both: `forge test --gas-report` and `npx hardhat test --gas-stats`, using Easy's own test files as the workload being measured.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command:
         cast send <FOUNDRY_ADDRESS> "increment()" --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
           --gas-limit 100000

         cast sig "getCount()"

         cast rpc eth_call '{"to":"<FOUNDRY_ADDRESS>","data":"0xa87d942c"}' latest

       Expected output: `0x...0001` — meaning `1`, confirming the Foundry-side
       deployment onto `anvil` is a real, interactable contract, exactly
       Week 27's own Easy assignment pattern.

   2. Command:
         cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "increment()" \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
           --gas-limit 100000

         cast rpc eth_call \
           '{"to":"0x5FbDB2315678afecb367f032d93F642f64180aa3","data":"0xa87d942c"}' latest

       Expected output:
         "0x0000000000000000000000000000000000000000000000000000000000000001"

       This means `getCount()` returned `1`, confirming that `cast`
       (a Foundry tool) can interact with a contract Hardhat deployed,
       and `npx hardhat node`'s JSON-RPC endpoint on port 8545 is genuinely
       standard and tool-agnostic.

       Note: the normal `cast send` and `cast call` commands produced
       `duplicate field data` with cast 1.7.1 and Hardhat's RPC endpoint.
       Adding `--gas-limit 100000` fixed the transaction, while using
       `cast rpc eth_call` with the `getCount()` selector `0xa87d942c`
       successfully read the counter value.

       If both `anvil` and `npx hardhat node` are running at the same time,
       one of them needs a different port — stop `anvil` first, or run
       `npx hardhat node --port 8546` and adjust the RPC URL accordingly.

   3. Command: re-run both gas reports from How to Build step 3, and
       compare the reported cost of `Counter`'s own deployment and of a
       single `increment()` call between the two outputs.

       Expected output: the numbers should be close, generally within a
       small margin of each other — both tools are running the identical
       bytecode against the identical EVM semantics, any difference comes
       from measurement methodology (which exact operations each tool
       includes in "gas used"), not from the contract behaving differently
       on one toolchain versus the other.

   4. Command: re-run Hardhat's Ignition deploy a SECOND time, without
       changing anything:

         npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost

       Expected output: Ignition reports the module is already deployed
       and does NOT send a new transaction — confirming Concept 5's
       "safely re-runnable" claim directly, in contrast to Foundry's
       `forge script`, which WOULD deploy a second, independent Counter
       instance if re-run the same way without a manual guard (exactly
       the guard every previous week's Hard assignment has had to build
       by hand). No revert needed here — this is the expected, correct
       behavior, not a bug to fix.
   ```

3. **Hard - Forking Mainnet, Then Deploying and Verifying Live on Sepolia, on Both Sides.**

   **What you practice:**
   - Reading real, live mainnet contract state through a local fork, on both toolchains, without ever broadcasting a real mainnet transaction (Concept 6)
   - Reusing the Week 27 wallet across a genuinely different toolchain's own secret-storage mechanism, confirming it's still funded rather than assuming (the same discipline as every previous week's Hard)
   - Verifying a real, live Sepolia deployment on Etherscan, both ways (Concept 9)

   **Requirements:**
   - A `script/ReadUSDC.s.sol` (Foundry) and equivalent Hardhat script/test reading real USDC's `totalSupply()` on a forked mainnet, confirming it returns a large, real, non-zero number.
   - Deploy `Counter` live to Sepolia on both sides: `forge script --broadcast` (Foundry, reusing `deployerKey`) and `npx hardhat ignition deploy --network sepolia` (Hardhat, using its own keystore, `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY` set from the SAME real private key `deployerKey` holds, retrieved once from Foundry's own keystore).
   - Verify both live deployments on Sepolia Etherscan: `forge verify-contract` (Foundry) and `--verify` on the Ignition deploy command (Hardhat), both needing a real, free Etherscan API key.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge script script/ReadUSDC.s.sol --fork-url mainnet

       Expected output: a large, real number (USDC's actual current total
       supply, in its own 6-decimal units, genuinely in the billions) —
       confirming the fork genuinely reads real mainnet state, not a
       zeroed-out local placeholder.

   2. Command: npx hardhat run scripts/read-usdc.ts --network hardhatMainnet

       Expected output: the SAME real number (small differences of a few
       thousand units are possible and expected if mainnet produced a new
       block with a mint/burn between the two commands, since neither fork
       was pinned to a specific block — Concept 6's own trade-off, made
       concrete) — confirming both toolchains' forking genuinely reads the
       identical live chain, not toolchain-specific mock data.

   3. Command, after both Sepolia deployments and verifications from How
       to Build steps 3 and 5 complete:

         cast call <FOUNDRY_SEPOLIA_ADDRESS> "getCount()(uint256)" --rpc-url sepolia

       Then open both `https://sepolia.etherscan.io/address/<FOUNDRY_SEPOLIA_ADDRESS>#code`
       and `https://sepolia.etherscan.io/address/<HARDHAT_SEPOLIA_ADDRESS>#code`
       (the address Hardhat's Ignition deploy printed) in a browser.

       Expected output: `getCount()` returns `0` (freshly deployed, never
       called); BOTH Etherscan pages show a green "Contract Source Code
       Verified" indicator and the actual readable `Counter.sol` source —
       confirming verification genuinely succeeded on both toolchains, not
       just that deployment succeeded, which is a weaker claim (an
       unverified contract still deploys and runs fine, it just isn't
       readable as source on the explorer).

   4. Command: attempt to re-run Hardhat's Ignition deploy a second time:

         npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia --verify

       Expected output: Ignition reports the module already deployed and
       sends no new transaction, exactly Medium's Test Case 4 confirmed
       locally, now holding on a REAL network with REAL consequences if it
       didn't (wasted Sepolia ETH on a redundant deployment) — this is the
       expected, correct behavior. Separately, attempt the Foundry-side
       equivalent by re-running its own guarded deploy command from step 3
       without deleting deployments/sepolia.txt first: it should print
       "Already deployed" and skip, the manual guard doing by hand what
       Ignition does automatically — confirming both toolchains ultimately
       protect against the same real mistake, just via genuinely different
       mechanisms (Concept 5's own comparison, now proven under real
       conditions rather than just described).
   ```
