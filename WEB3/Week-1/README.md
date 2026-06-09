# List of things learned.

## 1. What is WEB3 & how it differs from WEB2.

Imagine every app you use today like your bank's app, Instagram, Google Docs everything is a shop where the owner keeps the ledger in a back room you never see.

You trust that the owner is writing down your balance, your posts, your edits correctly, because you have no way to check. If the owner changes the ledger, deletes your account, or the shop burns down with no backup, you have no recourse except to complain and hope.

**WEB3** is the idea of moving that ledger into the open street, written on a stone tablet that thousands of independent people around the world are simultaneously copying and checking.

Nobody owns the tablet. Anyone can read it. To write a new entry, you don't ask the shop owner for permission. You follow a public set of rules (a protocol) and enough of
the tablet-copiers agree your entry is valid before it becomes permanent.

That tablet is the **blockchain**. The "shop" is replaced by a **smart contract**, code that runs the same way for everyone, whose rules anyone can inspect ahead of time.

### WEB2 vs WEB3 (side by side).

```
WEB2 (today's internet)                 WEB3 (blockchain-based)
------------------------                ------------------------
 You                                     You
  |                                       |
  v                                       v
 Company's server  <-- single owner      Network of nodes  <-- no single owner
  |                                       |
  v                                       v
 Company's private database              Public, shared ledger (the chain)
  |                                       |
  v                                       v
 You trust the company                   You verify the rules yourself
 to be honest and stay up                (or trust math + majority consensus)
```

### Why this matters for a beginner.

Almost every confusing term you will meet in this course like "decentralized," "trustless," "on-chain," "gas" is really just a variation on one idea: _replace "trust one company" with "verify against a public, shared record that many independent parties maintain."_

Keep re-deriving definitions from that one sentence and the jargon stops being scary.

### Three words worth nailing down precisely.

These get used loosely all the time, so pin the exact meanings now:

- **Centralized:** One party controls the system and can unilaterally change or halt it (your bank, Instagram's servers).

- **Decentralized:** Control is spread across many independent parties, none of whom can unilaterally change or halt the system alone.

- **Trustless:** You don't need to trust any single party's honesty, because the rules are enforced by public code and math instead of a promise. Note this doesn't mean "no trust anywhere" — you're still trusting the protocol's code is correct and that enough of the network is honest, just not trusting one company.

It is worth being honest about the tradeoffs, since this course will not pretend blockchains are strictly better than normal databases:

- **Slower and more expensive** than a company's private database, because thousands of computers redundantly do the same work instead of one server doing it once.

- **Public by default.** Great for transparency, bad if you wanted privacy. As most blockchain data is visible to anyone who looks.

- **Irreversible by design.** There is no "contact support to undo my transaction" button. This is a feature for censorship-resistance and a serious risk for user error, which is why Week 20 and Week 31 (program/contract security) exist.

- **Genuinely better** when you need: money or assets that no single party can freeze or reverse, code whose rules are provably fixed and public, or coordination between parties who don't trust each other.

---

## 2. The Blockchain Landscape. (Chains, Layers & Where this course goes)

Think of blockchains the way you'd think of operating systems.

There isn't _"one blockchain"_ any more than there is _"one OS"_.

There's a family of them (Bitcoin-like, Ethereum-like, Solana-like), each with different design philosophies and on top of the big ones there are _"layers"_ the way Android sits on top of Linux.

A few vocabulary anchors you'll hear constantly:

- **Layer 1 (L1):** A blockchain with its own independent network of validators/miners securing it directly like _Bitcoin_, _Ethereum_, _Solana_.

- **Layer 2 (L2):** A system that processes transactions off the main chain for speed/cost, then periodically settles a summary back onto an L1 for security like _Arbitrum_ or _Base_ sit on top of _Ethereum_.

- **Consensus:** The rulebook + process the network uses to agree on what the _"one true"_ next entry on the ledger is, without a central referee.

- **Node:** One computer running the blockchain's software, holding a copy of the ledger and enforcing the rules.

- **Smart contract / program:** Code deployed to a chain that runs identically for everyone who calls it. Ethereum calls these _"smart contracts"_. Solana calls them _"programs"_, same concept, different name.

### This course's roadmap, at a glance:

```
Phase 0 — Foundations (Weeks 1-9)
  Orientation -> blockchain basics -> cryptography -> wallets
  -> serialization -> Rust (fundamentals, advanced, macros, lifetimes)
  Purpose: build the shared vocabulary and the language (Rust) you need
  before touching a specific chain.

Phase 1 — Solana track (Weeks 10-25)
  Architecture -> jargon -> client-side -> PDAs -> native contracts
  -> Anchor -> JS clients -> SPL tokens -> Token-2022 -> staking/escrow
  -> security -> compressed NFTs -> DeFi -> payments -> indexing -> LSTs
  Purpose: go deep on one high-performance, Rust-based L1 end-to-end.

Phase 2 — Ethereum / EVM track (Weeks 26-37)
  Ethereum & EVM -> Solidity -> payable/fallback/CCIs -> ERC standards
  -> Hardhat/Foundry -> security -> wallet adapters -> upgradability
  -> liquidity pools -> indexing (The Graph) -> bridges (theory + build)
  Purpose: see the same core ideas (accounts, state, tokens, security)
  expressed in the older, most widely-adopted smart contract ecosystem —
  and notice what's the same vs. genuinely different from Solana.

Phase 3 — Cross-cutting advanced topics (Weeks 38-42)
  MPC & Shamir's Secret Sharing -> partially centralized contracts
  -> on-chain data modeling -> oracles -> multisig & governance
  Purpose: topics that apply across chains — how real production systems
  manage keys, bring in real-world data, and share control safely.

Phase 4 — Emerging & advanced topics (Weeks 43-51)
  L2s/rollups -> account abstraction -> MEV -> gas optimization
  -> practical ZK -> restaking -> formal verification/testing
  -> Web3 devops -> landscape beyond Solana/EVM
  Purpose: round out the picture with what's actively shaping the
  ecosystem right now, and give enough context to evaluate new
  primitives that show up after this course ends.
```

### Why Solana before Ethereum?

This is a deliberate curriculum choice worth naming:

- Solana forces you to learn Rust and think carefully about low-level account/memory models early,

- which makes the higher-level, more forgiving Solidity/EVM model (Phase 2) feel easier by comparison rather than harder.

You are climbing the steeper hill first on purpose.

---

## 3. Anatomy of a WEB3 developer's toolchain.

A carpenter's workshop has general-purpose tools (hammer, tape measure) and specialty tools bought only once you start a specific kind of project (a lathe for chair legs). Your Web3 toolchain works the same way:

- some tools you need for almost any software project &
- some you'll only install once a specific week calls for them.

```
General-purpose tools (needed from Week 1)
+-------------------------------------------------------------+
| git      -- version control, tracks every change you make   |
| node/npm -- JavaScript runtime + package manager, used for  |
|             tooling, scripts, and later, chain clients       |
+-------------------------------------------------------------+

Chain-specific tools (installed when the relevant week arrives)
+-------------------------------------------------------------+
| rustc/cargo   -- Rust compiler + package manager (Week 6+)  |
| solana-cli    -- talk to Solana clusters (Week 10+)         |
| anchor        -- Solana smart contract framework (Week 15+) |
| foundry/      -- Ethereum dev environments (Week 30+)       |
|  hardhat                                                     |
+-------------------------------------------------------------+
```

A core discipline this course will drill into you from day one is to **verify your tools are present and know their versions before you start building**, not after something breaks mysteriously.

That is the entire point of this week's assignments: before you write a single line of blockchain code, you build the habit (and a reusable tool) for checking _"is my environment actually ready?"_

---

## 4. How this 42-week course is structured & How to use each week's README.

Each week's README (like this one) is self-contained and always follows the same shape:

```
+---------------------------------------------------+
| Concept sections (## 1, ## 2, ...)                 |
|   plain-English explanation -> diagram (if spatial) |
|   -> code examples with WHY comments -> summary    |
+---------------------------------------------------+
| Assignment section                                 |
|   Easy   (1-2 hrs)  -> Medium (3-5 hrs)  -> Hard   |
|   (full day) -- all three share one running theme  |
+---------------------------------------------------+
```

A few operating notes for how you should actually work through these:

- **Type the code, don't paste it.** The solutions are written out in full (never truncated) so you can check your own work against them, not so you can skip writing it yourself. You learn least from code you never typed.

- **Do the assignments in order.** Easy sets up scaffolding that Medium extends and Medium sets up scaffolding that Hard extends. This is true for every week in the course, including this one.

- **Run the manual test cases exactly as written.** They exist so you can tell, without guessing, whether your solution actually works.

---

## 5. Reading fast-moving documentation & pinning versions.

A cookbook recipe written five years ago for "the latest oven" is dangerous if ovens have changed since. Web3 tooling, especially chain CLIs, SDKs and frameworks moves fast and a
tutorial that was correct six months ago can silently be wrong today (a flag renamed, a default changed, a package split in two).

The professional habit that protects you: **always pin and record the exact versions you used** and prefer official docs over blog posts or old tutorials when the two disagree. This week's Solution sections model that habit, each one states the exact tool versions used at the top, the same way you should in your own projects.

```
Bad habit:                          Good habit:
"npm install some-package"          "npm install some-package@4.2.1"
(works today, breaks in 6 months    (reproducible: anyone, any time,
 when a new major version ships     gets the exact same behaviour you
 with breaking changes)             tested against)
```

---

## 6. Block Explorers, Networks & Faucets. (How you'll actually poke at a chain)

If a blockchain is the public ledger, a **block explorer** is the website that lets you read that ledger without downloading and parsing raw blocks yourself.

The same way a bank's online statement lets you see your transactions without reading the bank's internal database directly.

- **Solana:** Solscan, Solana Explorer.
- **Ethereum & most EVM chains:** Etherscan (and chain-specific forks like Arbiscan, Basescan).

You'll use these constantly from Week 10 onward to confirm _"did my transaction actually do what I expected,"_ instead of just trusting your code silently worked.

### Networks: Mainnet, Testnet, Devnet & Localnet.
 
Every chain you'll touch in this course has multiple parallel networks and mixing them up is one of the most common beginner mistakes (deploying to the wrong one, or funding a wallet on the wrong network and wondering where the money went):
 
```
localnet   -- runs entirely on your own machine, instant, free, resets whenever you want
   |          use for: fast iteration while writing a program/contract
   v
devnet     -- a shared public test network, free test tokens via a faucet
   |          use for: testing against real network conditions before it matters
   v
testnet    -- a shared public network meant to mirror mainnet more closely
   |          use for: final rehearsal, closer to production conditions
   v
mainnet    -- the real network, real assets, real value, mistakes cost real money
```
 
- Solana's public test networks are literally called `devnet` and `testnet`.

- Ethereum's most commonly used public test network today is `Sepolia`.

The core idea, disposable money on a copy of the network, is identical either way.

### Faucets. (Where your test money comes from)
 
A **faucet** is a free service that drips a small amount of test-network tokens into your wallet so you can pay gas/fees while testing, without ever touching real money.

You'll use one the moment you send your first devnet/testnet transaction (starting Week 12 for Solana, Week 32 for Ethereum).
 
A couple of habits worth building now:

- Faucet tokens have **zero real-world value**, never confuse a devnet balance with a real one.

- Faucets are rate-limited on purpose. If you're testing heavily, keep a couple of funded test wallets around instead of re-requesting constantly.

---

## Assignment.

1. **Easy - Toolchain Doctor.**

   **What you practice:**
   - Running external commands from Node.js and capturing their output
   - Basic error handling for "command not found" vs. "command failed"
   - Formatting a readable command-line report
   - Using a script's process exit code to signal pass/fail to the caller

   **Requirements:**
   - Running `node check.js` prints a report listing each tool checked (`git`, `node`, `npm`, `rustc`, `cargo`) with either its detected version or a clear "not found" status.
   - Tools that are expected later in the course (`rustc`, `cargo`) but not needed yet are reported as informational, not treated as failures.
   - Tools needed immediately (`git`, `node`, `npm`) cause the script to exit with a non-zero exit code if missing, so it can be used in automation later.
   - The report is legible: aligned columns, not a raw dump of command output.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command:

       `node check.js` (with git, node and npm all installed, Rust not installed).

        Expected output: a report showing `[ OK ]` lines for `git`, `node` and `npm` each with a real version string next to them and `[ -- ]` lines for `rustc` and `cargo` saying "not installed yet".

        The script prints "All required tools are present." and the terminal prompt returns immediately (exit code 0).

        Confirm the exit code with `echo $?` (macOS/Linux) or `echo $LASTEXITCODE` (PowerShell) right after, it must print `0`.

   2. Command: temporarily rename your git executable so it can't be found (or run in an environment without git), then run `node check.js`.

        **Expected output:** a `[FAIL]` line for `git` reading "not found (required now)", followed by a message like "1 required tool(s) missing.

        Install them before continuing." Run `echo $?` immediately after, it must print `1`, not `0`.

   3. Command:

        `node check.js` twice in a row with no changes to your system in between.

        Expected output: byte-for-byte identical output both times.

        This confirms the script is deterministic and has no hidden state. An important property for a tool you'll be trusting for the next 41 weeks.
   ```

2. **Medium - Progress Tracker CLI.**

   **What you practice:**
   - Reading and writing JSON to disk as a simple persistence layer
   - Building a multi-command CLI (subcommands, not just one behaviour)
   - Parsing `process.argv` by hand (before you reach for a CLI framework)
   - Designing a small on-disk data format that's easy to extend later

   **Requirements:**
   - Running `node kit.js doctor` reproduces the exact behaviour of Week 1's Easy assignment (the toolchain check), reusing that logic rather than duplicating it.
   - Running `node kit.js track done 1` marks week 1 as completed and persists that to a local JSON file.
   - Running `node kit.js track list` prints every week from 1 to 42, with a checkbox-style marker showing which are done and which aren't.
   - Running `node kit.js track list` before any weeks are marked done shows all 42 weeks as not-done — the tracker must work correctly on a totally fresh checkout, not assume prior state exists.
   - Marking the same week done twice does not create duplicate entries or corrupt the JSON file.
   - An unrecognized command (e.g. `node kit.js bogus`) prints a usage message listing the valid commands instead of crashing with a raw stack trace.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command:

       `node kit.js track list` immediately after cloning/

        creating the project (with the seed `progress.json` from above in place).

        Expected output: 42 lines, `Week 01` through `Week 42`, every one marked `[ ]` (not done).

   2. Command: `node kit.js track done 1`.

        Expected output: exactly the line `Marked week 1 as done.`.

        Then open `data/progress.json` in a text editor and confirm the entry for key `"1"` is now `true` and every other key is still `false`.

   3. Command:

       `node kit.js track done 1` a second time (repeat the exact same command).

        Expected output: the same `Marked week 1 as done.` message, no error. Open `data/progress.json` again — it must still contain exactly 42 keys (not 43), confirming no duplicate entry was created.

   4. Command:

       `node kit.js track list` after step 3.

        Expected output: identical to test case 1 except the line for `Week 01` now shows `[x]` instead of `[ ]`; all other 41 lines unchanged.

   5. Command:

       `node kit.js track done 99`.

        Expected output: the error message

        `Week must be between 1 and 42, got 99.` printed to stderr and the process exits with a non-zero code (verify with `echo $?`).

   6. Command:

       `node kit.js bogus`.

        Expected output: the usage block listing the three valid command forms, no raw JavaScript stack trace should appear anywhere in the output.

   7. Command:

       `node kit.js doctor`.

        Expected output: byte-for-byte the same report format as Easy's `check.js` produced in its own Manual Test Case 1 — confirming the logic was genuinely reused, not reimplemented differently.
   ```

3. **Hard - Local Progress Dashboard.**

   **What you practice:**
   - Building a minimal HTTP server with zero external frameworks
   - Designing a small JSON API (routes, methods, status codes)
   - Serving a static HTML/CSS/JS frontend from that same server
   - Wiring a browser frontend to a backend API with `fetch` and handling
     both success and error responses
   - Reusing backend logic (the doctor + progress modules) across two very
     different interfaces: a CLI (Medium) and now a web UI (Hard)

   **Requirements:**
   - Running `node server.js` starts a local web server and prints the URL
     to open.
   - Visiting that URL in a browser shows a dashboard listing all 42 weeks,
     each with a checkbox reflecting its current completion state.
   - Clicking a checkbox marks that week done (or not-done) and this is
     visible immediately in the UI, without a full page reload.
   - Refreshing the page shows the same state you last set — state must
     persist across a full page reload, not just live in memory in the
     browser tab.
   - The dashboard includes a "Run Toolchain Doctor" button that shows the
     same tool-check results as the CLI's `doctor` command, formatted for
     the web page (not just a raw text dump).
   - If the server is stopped and restarted, previously saved progress is
     still there — state lives in the same `data/progress.json` file the
     Medium assignment used, not anywhere that resets on restart.

   _(This extends the exact same `web3-orientation-kit/` project from the Medium assignment — `kit.js`, `lib/doctor.js`, `lib/progress.js` and `data/progress.json` are unchanged and reused as-is. Only `server.js` and the new `public/` folder are added below.)_

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: `node server.js`.

       Expected output: terminal prints

       `Web3 Orientation Kit dashboard running at:` followed by `http://localhost:4242` and the process keeps running (does not exit).

   2. Action: open `http://localhost:4242` in a browser.

       Expected behaviour: the page loads showing the title "Web3 Orientation Kit", a "Run Toolchain Doctor" button and a grid of 42 checkboxes labeled "Week 01" through "Week 42".

       If you completed Medium's test cases in the same `data/` folder, Week 01 should already appear checked; otherwise all 42 should be unchecked.

   3. Action: click the checkbox next to "Week 05".

       Expected behaviour: the checkbox visually becomes checked immediately, with no full-page reload.

       (Watch the browser tab's favicon/spinner, it should not flicker as it would on a reload).

   4. Action: reload the browser page (F5 / Cmd+R) after step 3.

       Expected behaviour: "Week 05" is still shown as checked after the reload — proving the state came from the server/disk, not from in-memory JavaScript state that a reload would have wiped.

   5. Action: stop the server (Ctrl+C in the terminal).

       Then run `node server.js` again and reload the browser page.

       Expected behaviour: "Week 05" (and "Week 01" if applicable) are still checked — proving persistence survives a full server restart, because state lives in `data/progress.json` on disk, not in the server process's memory.

   6. Action: click "Run Toolchain Doctor".

       Expected behaviour: the button briefly shows "Checking..." and becomes disabled, then re-enables and shows a monospaced report below it listing `git`, `node`, `npm`, `rustc`, and `cargo` with `[ OK ]`, `[FAIL]`, or `[ -- ]` markers — matching the same underlying data the CLI's `node kit.js doctor` command shows, just rendered for the web.

   7. Command: with the server still running, in a second terminal.

       Run `curl -X POST http://localhost:4242/api/progress/99`.

       Expected output: an HTTP 400 response with JSON body `{"error":"Invalid week: 99"}` — confirming the API validates input even when called directly, not only when driven through the UI.
   ```
