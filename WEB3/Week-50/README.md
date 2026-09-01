# List of things learned.

## 1. Running an RPC node. (light vs. full vs. archive)

Every previous week's own `cast`/`forge` command has quietly depended on someone else running one of these.

- A **full node** stores and verifies the entire current chain state, typically pruning older historical state to keep its own storage requirements manageable.
- An **archive node** keeps every single historical state, forever. The specific, real requirement Week 30, Concept 6's own mainnet forking depends on, since reconstructing state at an arbitrary past block needs exactly this.
- A **light client** trusts a full node for most data, independently verifying only block headers itself.

Genuinely the same underlying idea Week 36, Concept 6's own light-client bridge used to describe trust-minimized cross-chain verification, here applied to trusting a single chain's own current state rather than a different chain's.

---

## 2. Running a validator. (Solana & Ethereum basics)

An Ethereum validator stakes a real 32 ETH (or participates via a pooled staking service), attests to and occasionally proposes blocks and carries genuine, real slashing risk for misbehavior.

The exact same base-layer role Week 48's entire restaking arc builds _on top of_, not a separate concept.

A Solana validator (Week 10's own Sealevel architecture) has no fixed minimum stake requirement in the identical way, casts votes on the chain's own history via a vote account and faces meaningfully higher real hardware demands given Solana's own much higher raw throughput design.

A real, honest difference in operational cost between the two chains this course has covered, not just a difference in software.

---

## 3. CI/CD pipelines for contract deployment.

Week 49, Concept 7 already built a real CI workflow running this course's own test suite on every push.

This week adds the genuinely important, separate half.

**Deployment** should never happen automatically on every push the way testing does.

A real pipeline keeps these two jobs deliberately separate, gated differently.

```yaml
name: Foundry CI/CD

on:
  push:
    branches: [main] # tests run on every push to main
    tags: ["v*"] # DEPLOYMENT only runs on an explicit, deliberate version tag — same trigger, gated below

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: foundry-rs/foundry-toolchain@v1
      - run: forge test -vvv

  deploy:
    if: startsWith(github.ref, 'refs/tags/v') # NEVER runs on an ordinary push — Concept 3's own real point
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: foundry-rs/foundry-toolchain@v1
      - run: forge script script/Deploy.s.sol --rpc-url ${{ secrets.SEPOLIA_RPC_URL }} --private-key ${{ secrets.DEPLOYER_PRIVATE_KEY }} --broadcast
```

`secrets.DEPLOYER_PRIVATE_KEY` (a real GitHub Actions Secret, configured in the repository's own settings, never committed to source at all) is the CI-native version of every previous week's own local `deployerKey` keystore.

Concept 7 covers the real, further-hardened alternatives a genuine production pipeline reaches for instead of a raw secret string even here.

---

## 4. Deployment verification and reproducible builds.

Week 27 and Week 30 already built real Etherscan verification (`forge verify-contract`).

This week adds the concept underneath why it's trustworthy at all.

A **reproducible build** means two independent parties, building from the identical source code with the identical, precisely-pinned compiler version and optimizer settings, get **byte-for-byte identical bytecode**.

The actual property that makes "verified source code matches deployed bytecode" a meaningful, checkable claim rather than an assertion to simply trust.

```
forge clean && forge build
shasum -a 256 out/Counter.sol/Counter.json > build1.hash

forge clean && forge build
shasum -a 256 out/Counter.sol/Counter.json > build2.hash

diff build1.hash build2.hash   # IDENTICAL hashes — a real, reproducible build
```

Easy's own assignment runs exactly this, confirming two independent local builds of the identical, pinned source genuinely produce identical output.

The concrete, checkable foundation every previous week's own verified-contract badge on Etherscan has quietly rested on.

---

## 5. Monitoring on-chain activity. (alerts & dashboards)

Every real, live contract needs a real, ongoing answer to "did something unusual just happen".

Week 35's own subgraph indexing answers "what happened, historically, queryable on demand".

This week's own monitoring answers the different, more urgent question of "alert someone the moment something specific and security-relevant occurs."

A real monitoring script (Week 37's own polling pattern, reused for a genuinely new purpose) watches for exactly the kinds of events a real incident response plan (Concept 6) would need to react to immediately:

- an admin function called,
- a pause triggered,
- a withdrawal above a real,

meaningful threshold.

```typescript
contract.on("Paused", () => {
  sendAlert(`🚨 Contract paused at ${new Date().toISOString()}`); // Concept 6's own plan starts HERE
});

contract.on("Withdrawn", (to, amount) => {
  if (amount > LARGE_WITHDRAWAL_THRESHOLD) {
    sendAlert(`⚠️ Large withdrawal: ${amount} to ${to}`);
  }
});
```

Hard's own assignment builds and runs exactly this, firing a real, structured alert the instant a real, security-relevant event occurs on a real, deployed contract.

---

## 6. Incident response planning for exploits.

Every mechanism Week 31's entire security catalogue and Week 39's own circuit-breaker pattern built exists to be _used_ the moment something actually goes wrong.

An incident response plan is the real, written, decided-in-advance answer to exactly which mechanism gets triggered, by whom, in what order, the instant Concept 5's own monitoring fires a real alert.

Deciding this calmly, in advance, is categorically different from improvising it during an actual, live incident, with real funds actively at risk and real time pressure distorting judgment.

Hard's own assignment produces a real `INCIDENT_RESPONSE_PLAN.md`, tied to a specific, real contract's own actual emergency mechanisms.

Week 39's own `pause()` and `emergencyWithdraw()`, not generic, unattached advice.

---

## 7. Key management in production. (KMS and HSM concepts)

Week 27's own `cast wallet import` (a locally-encrypted keystore) has been this entire course's own dev-grade key management practice since it was first introduced.

Genuinely appropriate for learning, genuinely inadequate for real, high-value production use, worth stating as plainly as Week 38, Concept 9 stated its own reconstruct-then-sign limitation.

- A **KMS** (Key Management Service, AWS KMS and Google Cloud KMS both real, widely-used, cloud-hosted options) lets a service request a signature over an API call without the underlying private key material ever leaving the KMS's own hardware-backed environment at all.

- An **HSM** (Hardware Security Module) is the identical idea in physical form. A genuinely tamper-resistant device holding the key, signing on request, refusing to ever export the raw key itself under any circumstance.

Week 38's own MPC-based key management (Concept 1 through 9 there) is a real, genuinely different third option, distributing trust across multiple parties rather than concentrating it in one hardware boundary.

All three are real, legitimate production answers to the identical underlying problem Week 27's own local keystore only ever solved at dev-grade.

---

## 8. Multi-environment configuration management.

A real, common, entirely avoidable mistake: a hardcoded Sepolia contract address or RPC URL accidentally reused in a script actually meant to target mainnet.

Foundry's own **profile** system (`[profile.NAME]` sections in `foundry.toml`) is the direct, real fix, keeping every environment's own configuration cleanly separated and selected explicitly rather than assumed.

```toml
[profile.devnet]
eth_rpc_url = "http://127.0.0.1:8545"

[profile.sepolia]
eth_rpc_url = "${SEPOLIA_RPC_URL}"

[profile.mainnet]
eth_rpc_url = "${MAINNET_RPC_URL}"
```

```
FOUNDRY_PROFILE=sepolia forge script script/Deploy.s.sol --broadcast
```

Easy's own assignment confirms directly that switching `FOUNDRY_PROFILE` genuinely changes which endpoint a script actually targets, rather than trusting the separation exists just because the config file looks organized.

---

## 9. The full path from a merged pull request to a monitored, incident-ready deployment.

```
Pull request merged to main
        │
        ▼
CI runs the FULL test suite (Week 49's own fuzz/invariant suites, Concept 3)
        │
        ▼
A deliberate, explicit version tag is pushed ── ONLY then does deployment trigger (Concept 3)
        │
        ▼
CI deploys using a SECRET, never-committed key (Concept 3, 7)
        │
        ▼
The deployed bytecode is verified against a REPRODUCIBLE build (Concept 4)
        │
        ▼
A real monitoring script starts watching the live contract (Concept 5)
        │
        ▼
┌─────────────────────────┐
│ Everything looks normal │ ──► ongoing, unattended operation
└─────────────────────────┘
        │
        ▼ (a real alert fires)
The incident response plan (Concept 6) is executed —
NOT improvised — using the contract's own real,
pre-built emergency mechanisms (Week 39)
```

Hard's own assignment builds and runs the bottom half of this exact diagram for real.

A real alert, firing from a real, watched contract, answered by a real, pre-written plan rather than improvisation.

---

## Assignment.

1. **Easy - Multi-Environment Config and a Real Reproducible Build Check.**

   **What you practice:**
   - Foundry's own profile system, genuinely separating devnet/testnet/mainnet configuration (Concept 8)
   - Confirming a real, pinned build is genuinely reproducible, byte-for-byte, across two independent local builds (Concept 4)

   **Requirements:**
   - A `foundry.toml` with three real, distinct profiles: `devnet` (pointed at `http://127.0.0.1:8545`), `sepolia` (pointed at `${SEPOLIA_RPC_URL}`), `mainnet` (pointed at `${MAINNET_RPC_URL}`) — each with its own solc pin, identical across all three (`0.8.36`), since the COMPILER version staying fixed regardless of target network is exactly what Concept 4's own reproducibility depends on.
   - A test confirming `forge config --json` reports a genuinely different `eth_rpc_url` depending on which `FOUNDRY_PROFILE` environment variable is set at the time.
   - A real reproducible-build check: build the identical `Counter.sol` (Week 27's own contract) twice, with a `forge clean` in between, and confirm the two resulting build artifacts' own bytecode hashes match exactly.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command:
         FOUNDRY_PROFILE=devnet forge config --json | grep eth_rpc_url
         FOUNDRY_PROFILE=sepolia forge config --json | grep eth_rpc_url

         Expected output: two genuinely DIFFERENT URLs printed — confirming
         Concept 8's own claim directly: the profile actually selected which
         endpoint Foundry resolves, not just cosmetic separation in the file.

   2. Command: diff build1.hash build2.hash

         Expected output: no output at all — an empty diff, meaning the two
         independently-built artifact hashes are IDENTICAL, confirming
         Concept 4's own reproducibility claim with a real, checkable result.

   3. Action: change the solc pin under `[profile.mainnet]` specifically
         to a DIFFERENT patch version (e.g. `0.8.35`) while leaving
         `[profile.default]` at `0.8.36`, then run:
         FOUNDRY_PROFILE=mainnet forge build
         shasum -a 256 out/Counter.sol/Counter.json

         Expected output: a DIFFERENT hash than build1.hash/build2.hash —
         confirming directly that even a single patch-version compiler
         difference breaks Concept 4's own reproducibility guarantee
         entirely, exactly why pinning the identical version across every
         environment, not just within one, genuinely matters. Revert the
         version change afterward.

   4. Command: attempt to deploy using the `mainnet` profile without
         `MAINNET_RPC_URL` ever having been exported in the shell:
         FOUNDRY_PROFILE=mainnet forge script script/Deploy.s.sol --broadcast

         Expected output: a clear connection/configuration error rather than
         silently falling back to some other endpoint — confirming
         Concept 8's own separation fails LOUDLY and safely when
         misconfigured, rather than quietly reusing a different
         environment's own settings by accident.
   ```

2. **Medium - A Real CI/CD Pipeline: Test Always, Deploy Only Deliberately.**

   **What you practice:**
   - Extending Week 49's own real GitHub Actions workflow with a genuinely separate deployment job (Concept 3)
   - GitHub Secrets, holding a real deployment key and RPC URL that never appear in source at all

   **Requirements:**
   - A `.github/workflows/ci-cd.yml`: a `test` job running on every push to `main` (Week 49's own exact pattern, reused); a separate `deploy` job, gated with `if: startsWith(github.ref, 'refs/tags/v')`, depending on `test` passing first (`needs: test`), using `${{ secrets.SEPOLIA_RPC_URL }}` and `${{ secrets.DEPLOYER_PRIVATE_KEY }}` — never a literal key or URL anywhere in the file.
   - A written confirmation, in the workflow file's own comments, of exactly which real GitHub repository settings (Settings → Secrets and variables → Actions) need those two secret names configured before this workflow can actually run its own deploy job for real.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Action: push a normal commit to main.

         Expected result: in the real repository's own Actions tab, only the
         `test` job runs — the `deploy` job shows as skipped, confirming
         Concept 3's own gating condition correctly excludes an ordinary push.

   2. Action: push a real, tagged release (`git tag v1.0.0 && git push
      origin v1.0.0`).

         Expected result: BOTH jobs run this time, `deploy` only starting
         after `test` genuinely finishes and passes — confirming `needs: test`
         is real and load-bearing, not just documentation.

   3. Action: open the `deploy` job's own real logs in the Actions tab
         after a successful run.

         Expected result: no real private key or RPC URL ever appears in the
         visible log output, even though the deployment genuinely used both
         — GitHub Actions automatically masks a registered secret's own
         literal value anywhere it would otherwise appear in logs,
         confirming Concept 3's own "never committed, never exposed" claim
         holds even during a real, live run, not just in the source file.

   4. Action: temporarily remove `needs: test` from the `deploy` job,
         then push a commit that DELIBERATELY breaks a test, immediately
         followed by a new version tag.

         Expected result: the `deploy` job now runs and attempts a real
         deployment DESPITE the test suite failing — confirming `needs: test`
         was genuinely the only thing preventing a broken build from ever
         reaching a real deployment. Revert this change immediately
         afterward; this specific state should never be pushed for real.
   ```

3. **Hard - Monitoring, Alerting and a Real Incident Response Plan.**

   **What you practice:**
   - A real, running monitoring script watching a real, deployed contract for security-relevant events (Concept 5)
   - A real, written incident response plan, tied to a specific contract's own actual emergency mechanisms, not generic advice (Concept 6)
   - Comparing dev-grade, MPC, and KMS/HSM key management concretely for one real admin key (Concept 7)

   **Requirements:**
   - Reuse Week 39's own `GoodVault` (`Pausable`, `emergencyWithdraw`, owner-gated `pause`/`unpause`), deployed fresh to `anvil`.
   - A `monitor.ts` script: watches for `Paused` events, and for any `Withdrawn`-equivalent event above a configured large-amount threshold, firing a structured, clearly-formatted alert to the console the instant either occurs.
   - A live demonstration: trigger a real pause on the deployed contract from a separate terminal while `monitor.ts` is running, and confirm the alert fires within one poll cycle.
   - An `INCIDENT_RESPONSE_PLAN.md`, written against `GoodVault` specifically: what a real alert from `monitor.ts` should trigger, in what order, referencing `GoodVault`'s own real, actual functions by name.
   - A `KEY_MANAGEMENT_NOTES.md`, comparing `cast wallet` (dev-grade), an MPC-based approach (Week 38), and a cloud KMS, specifically for `GoodVault`'s own real owner key.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Action: with monitor.ts running in its own terminal, trigger a real
         pause from a separate terminal (How to Build, step 5).

         Expected result: within one poll cycle, monitor.ts's own terminal
         prints a real, structured alert, including the real address that
         called `pause()` — confirming Concept 5's own claim directly: a
         real, running script noticing a real, security-relevant event
         without a human watching Etherscan by hand.

   2. Action: while still paused, from a third terminal, confirm
         `emergencyWithdraw()` genuinely still works (Week 39's own real
         design, referenced in INCIDENT_RESPONSE_PLAN.md's own Step 4):

         cast send <GOODVAULT_ADDRESS> "emergencyWithdraw()" --rpc-url http://127.0.0.1:8545 \
            --private-key <A_WHITELISTED_DEPOSITOR_KEY>

         Expected result: succeeds, even while paused — confirming the
         incident plan's own Step 4 is describing a REAL, currently-true
         property of the deployed contract, not an assumption.

   3. Action: call `unpause()` from the SAME admin key, and confirm
         monitor.ts fires a second, distinct alert for the `Unpaused` event.

         Expected result: a second, clearly different alert prints,
         confirming the monitor distinguishes between the two related but
         operationally distinct events, exactly INCIDENT_RESPONSE_PLAN.md's
         own Step 2 note about confirming an unpause was genuinely expected
         before assuming normal operation.

   4. Action: fill in INCIDENT_RESPONSE_PLAN.md and KEY_MANAGEMENT_NOTES.md
         with real, specific answers for GoodVault as it's actually deployed
         in this assignment — not generic security advice copied from
         elsewhere. There's no single "correct" wording Foundry can check
         here; the point is a real, argued, contract-specific plan, the same
         standard every previous week's own design-document deliverable has
         been held to.
   ```
