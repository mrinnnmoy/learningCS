# List of things learned.

## 1. Why Token-2022 was introduced.

Week 17's Token Program has a fixed, permanent instruction set and deliberately so changing it would risk breaking every integration, wallet and exchange that has ever depended on its exact behavior, an entire ecosystem's worth of code.

That permanence is exactly what makes it trustworthy and exactly why it can never grow new features.

**Token-2022** (also called the Token Extensions Program) is not an upgrade to the original Token Program, it's a **second, separate, permanently parallel program**, with its own program ID (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`, distinct from Week 17's `TokenkegQ...`).

It starts from the exact same base account layout, the first 82 bytes of a mint account and the first 165 bytes of a token account are structurally identical to Week 17's and adds an **extensible** mechanism (Concept 2) on top for genuinely new behavior:

- transfer fees,
- non-transferable tokens,
- confidential balances

and more.

The consequence worth internalizing now are legacy SPL tokens and Token-2022 tokens exist **side by side, permanently**.

There is no flag that upgrades one into the other, Concept 9 covers exactly what a real migration involves and it isn't a button.

---

## 2. Extension architecture. (TLV & Why account sizing changes)

A Token-2022 mint or token account can carry any combination of optional **extensions**, each stored as a **TLV** block (Type, Length, Value) appended after the base data, exactly the tagged, self-describing shape Week 5's serialization work built intuition for, just applied to a variable _set_ of optional features instead of a fixed struct.

This has a direct, practical consequence.

**An account's size depends on which extensions it has**, so you can't reuse Week 17's fixed account-size assumptions.

`getMintLen([...extensionTypes])` computes the correct total size for a given set of extensions, _before_ you create the account, feeding directly into `getMinimumBalanceForRentExemption` (Week 11, Concept 7).

One more mechanical detail that matters every time this week.

**Extension initialization instructions must run before the base `createInitializeMintInstruction`**, all combined into one transaction alongside the `SystemProgram.createAccount` call.

There is no single `createMint()`-style convenience wrapper handling arbitrary extension combinations the way Week 17's did, this week's assignments compose these instructions by hand, in the correct order, every time.

---

## 3. Transfer fees Extension. (Withhold now, Harvest later)

A mint with `TransferFeeConfig` deducts a fee (in basis points, capped by a max fee) automatically on every transfer, no cooperation from the sender required.

The design is worth understanding, not just using the fee **stays inside the recipient's own token account**, as a separately-tracked "withheld" amount, rather than being routed anywhere at transfer time.

A designated authority later either:

- **`harvestWithheldTokensToMint`** : Sweeps withheld amounts from one or more token accounts back into the mint itself, or

- **`withdrawWithheldTokensFromMint`** / **`withdrawWithheldTokensFromAccounts`** : Claims withheld amounts out to a specific destination account directly.

This two-step _"withhold, then claim"_ design decouples _collecting_ a fee from _someone claiming it_, deliberately, rather than trusting the sender's own transfer instruction to correctly route funds to whatever the current fee authority happens to be.

---

## 4. Interest-bearing Tokens. (Display math, not automatic rebasing)

The `InterestBearingConfig` extension stores a rate on the mint.

Crucially, **nothing about the stored raw balance ever changes automatically**, no rebasing, no periodic on-chain update.

Instead, `amountToUiAmount` computes a **displayed**, interest-adjusted figure on demand, from the unchanged raw stored integer and elapsed time.

This is Week 17, Concept 8's decimals-are-a-display-convention idea, generalized one step further: a token can now have _two_ layers of display math (decimals, and now accrued interest) sitting on top of one still-unchanged raw `u64`.

---

## 5. Non-transferable Tokens ("soulbound").

The `NonTransferable` extension disables `transfer`/`transferChecked` outright, permanently, at the protocol level, for every account ever holding this mint.

Tokens can still be minted in and burned, but never sent anywhere once received.

This is a genuinely different guarantee from Week 17, Concept 7's freezing.

A frozen account can always be thawed later by its freeze authority, reversible by design.

A non-transferable mint has no such escape hatch, it's not _"temporarily locked,"_ it's structurally incapable of transfer, full stop.

Real use: achievements, credentials, reputation, anything that should stay permanently tied to one identity.

---

## 6. Confidential transfers (concept only).

The `ConfidentialTransfer` extension hides transfer **amounts** on-chain using ElGamal encryption and zero-knowledge range proofs, dramatically extending Week 3's cryptography foundations, letting the runtime verify a sender has sufficient balance and the transaction is valid, without revealing the actual numbers to anyone outside the two parties (and, in some real deployments, a designated auditor key, exactly how several regulated stablecoins use it today).

This stays conceptual this week, deliberately. The client-side proof-generation machinery involved is substantially more complex than anything else in this course and risky example code here would do more harm than good.

Recognizing the shape of the idea, hidden amounts, still-verifiable validity, provable-but-private, is the goal; building one is well beyond this course's scope.

---

## 7. Metadata pointer extension.

`MetadataPointer` stores, on the mint itself, a pointer to **where** this token's name/symbol/image actually live, which can be the mint account itself (via Token-2022's own metadata extension, a separate package, `@solana/spl-token-metadata`) or an external account entirely (Week 21 previews the older, still widely-used Metaplex metadata standard, a different mechanism achieving a similar goal).

Separating _"does this token have metadata"_ from _"where exactly it lives"_ lets the actual metadata implementation evolve independently of the pointer mechanism referencing it.

---

## 8. Permanent delegate extension.

`PermanentDelegate` grants one designated pubkey the standing ability to transfer or burn tokens from **any** account holding this mint, at any time, without that account's owner's consent, permanently.

This is a real, deliberately powerful authority, used by several regulated stablecoins for compliance clawbacks (a court-ordered freeze-and-seize scenario, for instance) and it's worth being direct about the trust implication.

Holding a token with a permanent delegate means trusting that authority never to misuse it, a fundamentally different risk posture than a token with no such authority at all.

Week 20's security week returns to weighing exactly this kind of built-in, protocol-enforced power.

---

## 9. Default Account State & What "migrating" to Token-2022 actually means.

`DefaultAccountState` forces every **newly created** token account for a mint to start **frozen**, requiring the freeze authority to explicitly thaw each one before it can be used at all, real infrastructure for a _"nobody transacts until KYC'd"_ compliance gate, enforced at account-creation time rather than reactively.

And, closing the loop on Concept 1.

**Migrating** an existing legacy SPL token to Token-2022 is not a conversion, there is no instruction that reassigns a mint's program.

It means creating a **brand-new** Token-2022 mint with whichever extensions are wanted and coordinating a real distribution, an airdrop or swap mechanism, moving holders from the old mint to the new one.

Every holder, every integration, every price feed has to independently learn about and adopt the new mint.

This week's Hard assignment ends with a short written note on exactly what that would involve for a real project.

---

## Assignment.

1. **Easy - A Transfer-Fee Token: Withhold, Harvest, Withdraw.**

   **What you practice:**
   - Composing a Token-2022 mint creation transaction by hand: `getMintLen`, extension-init-before-mint-init ordering, and the one unavoidable fresh mint keypair
   - Transferring with `transferCheckedWithFee` and observing the fee sitting, withheld, inside the recipient's own account rather than routed anywhere automatically
   - Harvesting and then withdrawing that withheld fee, Concept 3's two-step design, executed rather than just described

   **Requirements:**
   - Creates a Token-2022 mint (`6` decimals) with the `TransferFeeConfig` extension, `1%` fee, `1` token max fee.
   - Mints `1000` tokens to your own ATA (Token-2022 ATA, using `TOKEN_2022_PROGRAM_ID` throughout, not Week 17's program ID).
   - Transfers `100` tokens to a PDA-owned vault ATA (Week 13/17's exact pattern, no throwaway keypair for the recipient), via `transferCheckedWithFee`.
   - Reads the withheld fee sitting in the vault account, harvests it to the mint, then withdraws it back to your own ATA, printing each step.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Token-2022 mint created (1% transfer fee): 8pQrW...
           Minted 1000 tokens to your ATA.

           Transferred 100 tokens (fee withheld). Signature: 5f3G...
           Withheld fee sitting in the vault account: 1000000

           Harvested withheld fees to the mint. Signature: 2kLp...
           Withdrew harvested fees to your ATA. Signature: 8kNw...

   2. Command: verify by hand.

       100 tokens at 1% = 1 token exactly = 1000000 raw units at 6
       decimals — matching the printed withheld amount exactly.

       This also happens to equal the configured max fee cap, worth noticing:
       at exactly 100 tokens transferred, the percentage fee and the cap
       land on the same number by design of this example's chosen amounts.

   3. Command: Apply How to Build Step 5 (spl-token display) &  compare
       its reported TransferFeeConfig values to what index.ts configured.

       Expected outcome: identical 1% / 1 token max fee, confirmed by a
       completely separate tool reading the same on-chain extension data.

   4. Command: temporarily change `const feeBasisPoints = 100;` to
       `const feeBasisPoints = "100";` (a string), then run

           npx tsc --noEmit.

       Expected output: a type error, reporting that a string isn't
       assignable to createInitializeTransferFeeConfigInstruction's
       expected numeric parameter — confirming the extension-specific
       instruction builders are typed just as strictly as Week 17's core
       functions.

       Revert this change afterward.
   ```

2. **Medium - A Soulbound Credential: Non-Transferable + Permanent Delegate + Metadata.**

   **What you practice:**
   - Combining three extensions in one mint (`NonTransferable`, `PermanentDelegate`, `MetadataPointer`), and initializing real on-chain metadata content via the separate `@solana/spl-token-metadata` package
   - Confirming a transfer against a non-transferable mint genuinely fails, not just reading that it should (Concept 5)
   - Using the permanent delegate authority to burn tokens directly from a holder's account (Concept 8), with an honest note on what this course's single-real-wallet constraint can and can't fully demonstrate about "without the holder's consent"

   **Requirements:**
   - Creates a Token-2022 mint (`0` decimals, a whole, indivisible credential) with `NonTransferable`, `PermanentDelegate` (your wallet), and `MetadataPointer` (pointing at the mint account itself) extensions, plus real metadata (name, symbol, uri) via `@solana/spl-token-metadata`'s `createInitializeInstruction`.
   - Mints exactly `1` credential to your own ATA.
   - Attempts a transfer to a second, PDA-owned ATA, catches and prints the expected failure.
   - Burns the credential directly via the permanent delegate authority, printing the result, with a comment explaining this course's constraint means the "delegate" and the "holder" are necessarily the same real wallet here.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Soulbound credential mint created: 4mNpQ...
           Minted 1 credential to your ATA: 9pLmQ...

           Transfer correctly failed (NonTransferable):
               ...

           Revoked (burned via permanent delegate authority). Signature: 7hRt...

   2. Command: verify by hand.

       The transfer attempt MUST fail — this is Concept 5's entire point,
       made directly observable, not a hypothetical.

       A mint without the NonTransferable extension would have let this
       exact call succeed.

   3. Command: Apply How to Build Step 5 (spl-token display) and
       confirm NonTransferable and PermanentDelegate both appear in the
       listed extensions, matching what index.ts configured.

   4. Command: temporarily remove
       createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID)
       from the transaction entirely, then re-run npx tsx index.ts (this
       creates a genuinely different mint, since mint creation only
       happens once per run).

       Expected output: the transfer attempt now SUCCEEDS instead of
       failing — confirming the extension itself, not some other part of
       the code, is what enforces non-transferability.

       Revert this change afterward.
   ```

3. **Hard - Compliance-Gated & Interest-Bearing: Default Account State, `amountToUiAmount` & a Migration Note.**

   **What you practice:**
   - Confirming a brand-new token account starts genuinely frozen, purely because of a mint-level setting, before anyone has taken any freeze action on that specific account
   - Reading an interest-adjusted display amount (`amountToUiAmount`) alongside the unchanged raw stored balance, and understanding exactly which one is "real"
   - Writing a short, concrete migration note, translating Concept 9's abstract "no automatic upgrade path" claim into an actual list of what a real project would need to do

   **Requirements:**
   - Creates a Token-2022 mint (`6` decimals) with `DefaultAccountState` (frozen) and `InterestBearingConfig` (a `5%` illustrative rate) extensions.
   - Creates your ATA for it, and immediately checks (and prints) its frozen state, **before** any explicit freeze/thaw call has been made on that specific account.
   - Attempts to mint into it while frozen, catches and prints the expected failure, thaws it, mints successfully, and prints both the raw stored balance and the `amountToUiAmount`-computed display value.
   - Writes a short `MIGRATION.md` (or a comment block at the top of `index.ts`) listing concretely what a real project holding an existing legacy SPL token would need to do to move to Token-2022, informed by Concept 9, not just restating it.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Compliance-gated, interest-bearing mint created: 6yTzP...

           New ATA state immediately after creation: Frozen

           Mint into frozen account correctly failed: ...

           Thawed ATA (e.g. after a real project's KYC step). Signature: 4hRt...
           Minted 1000 tokens after thawing.

           Raw stored balance:        1000000000
           Interest-adjusted display: 1000.xxxxx

   2. Command: verify by hand.

       "Frozen" must be reported BEFORE any explicit freeze call in this
       script's own code touched this specific account — this is
       Concept 9's actual point: DefaultAccountState is a MINT-level
       setting applied automatically at account-creation time, not
       something this script requested per-account.

   3. Command: verify the interest-adjusted figure.

       The interest-adjusted display should be greater than or equal to
       the raw stored balance's decimals-adjusted value (1000) — small
       or even negligible right after minting, since almost no time has
       elapsed yet, but strictly present as a SEPARATE computed value,
       not identical to the raw figure by coincidence.

   4. Command: read MIGRATION.md (How to Build Step 6) against Concept
       9's text, and confirm every claim you wrote maps to something
       concrete: an actual step a real team would take, not a
       restatement of "there's no automatic migration."

       Expected outcome: a short, genuinely actionable list — new mint
       creation, holder balance re-issuance, and downstream integration
       updates are the three load-bearing items; if your note only
       restates that migration is hard without naming what specifically
       has to happen, revise it before considering this test passed.
   ```
