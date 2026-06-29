# List of things learned.

## 1. The SPL Token Program. (one program, every token)

> Week 11's Easy assignment already fetched this program's account info directly, `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`, `executable: true`, owned by one of the BPF Loader programs. This week is about actually using it.

Here's the architectural fact worth sitting with before anything else.

Solana has **one single Token Program**, shared by every fungible token that has ever existed on the network.

There is no _"USDC contract"_ or _"your-token contract"_ the way Ethereum's ERC-20 model works (Week 26 makes that contrast explicit, once you've seen this side first).

A _"token,"_ on Solana, isn't a program at all, it's just **data**, interpreted by this one shared program, exactly Week 11, Concept 1's _"everything is an account"_ claim, now made concrete for tokens specifically:

```
Token Program (ONE deployed program, shared by every token)
     |
     +-- interprets --> Mint accounts       (Concept 2: what IS a token type)
     |
     +-- interprets --> Token accounts      (Concept 3: who HOLDS how much of it)
```

Every instruction this week, minting, transferring, burning, freezing, is the exact same program, told which mint and which accounts to operate on.

---

## 2. Mint accounts. (What a token type actually is)

A **mint account** represents a token _type_ itself, not anyone's balance. Its data holds:

```
mint_authority:    Option<Pubkey>   -- who can mint NEW tokens (Week 11, Concept 5's
                                        first real "authority" in this course)
supply:             u64              -- current total tokens in existence
decimals:           u8               -- Concept 8, next
freeze_authority:   Option<Pubkey>   -- who can freeze a token account (Concept 7)
```

Both authorities are `Option<Pubkey>`, deliberately, a mint can be created with `freeze_authority: None`, permanently, meaning nobody, ever, can freeze any account holding this token, a real, common, and irreversible choice.

Creating a mint means creating a fresh account (Week 14's `create_account` pattern, wrapped here inside a single client helper) owned by the Token Program, shaped exactly like this.

---

## 3. Token Accounts & Associated Token Accounts (ATAs).

A **token account** holds a _balance_ of one specific mint, for one specific owner:

```
mint:    Pubkey   -- which token type
owner:   Pubkey   -- whose balance this is
amount:  u64       -- the actual balance, in raw base units (Concept 8)
```

Nothing in the Token Program stops a wallet from having _multiple_ token accounts for the same mint, which raises an obvious question.

If you're told "send USDC to this wallet," which of its possibly-several USDC accounts is _the_ one?

The **Associated Token Account (ATA)** answers this by removing the ambiguity entirely, it's a **PDA** (Week 13, in full), deterministically derived from `[owner, TOKEN_PROGRAM_ID, mint]` against a separate Associated Token Account program.

Every wallet has _exactly one_ canonical ATA per mint, computable by anyone, without asking the chain, Week 13, Concept 4's determinism, finally paying off in a real, everyday tool rather than a course exercise.

---

## 4. Minting tokens.

`mintTo` increases a mint's `supply` and credits a destination token account and it's authorized exactly the way Week 11, Concept 5 described.

Not by the destination account's owner, but by whoever holds the **mint authority** pubkey stored inside the mint account itself.

Mint that authority to `null` at creation (or transfer it away later) and no one, including the original creator, can ever mint more of that token again, a real, on-chain, irreversible supply cap.

---

## 5. Transferring tokens.

`transfer` moves balance between two token accounts of the _same_ mint, authorized by the source account's owner.

Conceptually this is the same idea as Week 14's `SystemProgram.transfer`, moving value from one place to another, but mechanically unrelated.

Lamports live directly on an account's own balance field (Week 11, Concept 2); token balances live inside Token-Program-owned account _data_, read and written entirely through this program's own instructions.

---

## 6. Burning tokens.

`burn` permanently destroys tokens from a token account, decreasing the mint's total `supply` in the process, authorized by the token account's owner.

This is genuinely irreversible, Week 2's immutability theme, applied here to a token's total supply rather than to chain history.

---

## 7. Freezing & Thawing Accounts.

A **separate** authority from mint authority, the mint's `freeze_authority`, can freeze one specific token account, blocking every transfer and burn from it until explicitly thawed.

This is Week 11, Concept 5's point about a resource having multiple, independently-assignable authorities, made concrete.

The same mint can have one pubkey allowed to create new supply and an entirely different pubkey allowed to freeze individual holders' balances, real infrastructure for regulated or compliance-sensitive tokens.

This week's Hard assignment freezes an account, confirms a transfer genuinely fails against it, then thaws it and confirms the identical transfer now succeeds.

---

## 8. Decimals & Supply. (The same pattern Week 10 already taught)

Every raw amount the Token Program ever works with, `supply`, an account's `amount`, is a plain `u64` integer, with no fractional component at the protocol level.

**Decimals** (a fixed `u8` on the mint) is purely a _display_ convention: a token with `decimals: 6` and a raw balance of `1_000_000` represents "1.000000" in human terms.

This is precisely Week 10, Concept 8's lamports-to-SOL relationship (1 SOL = 10^9 lamports), generalized:

- `human_amount = raw_amount / 10^decimals`,

for whatever decimals a given mint declares.

---

## 9. Multisig token authorities & The `spl-token` CLI.

The Token Program natively supports an **M-of-N multisig** account type, `createMultisig`, which can be set _as_ a mint's mint authority or freeze authority in place of a single pubkey, requiring `M` of `N` designated signers to co-sign any privileged action using it.

This is a genuinely different authorization shape from every prior week's single-wallet signing and Week 42 returns to multisig and governance in much more depth.

This week's Hard assignment builds the smallest possible real version of it.

The `spl-token` CLI is the command-line equivalent of everything this week's TypeScript client does:

```
spl-token create-token
spl-token create-account <MINT>
spl-token mint <MINT> <AMOUNT>
spl-token transfer <MINT> <AMOUNT> <RECIPIENT>
spl-token balance <MINT>
spl-token supply <MINT>
spl-token account-info <MINT>
```

Genuinely useful for two things: quick one-off operations without writing a script, and independently verifying a TypeScript client's on-chain result against a completely separate tool, exactly the "trust but verify" habit this week's Hard assignment closes with.

---

## Assignment.

1. **Easy - Creating a Mint, an ATA & Minting Tokens.**

   **What you practice:**
   - Creating a real mint account (Concept 2), with your own wallet as both mint authority and freeze authority
   - Deriving and creating your wallet's Associated Token Account for that mint (Concept 3), without computing the PDA by hand, `getOrCreateAssociatedTokenAccount` does it internally
   - Reading a mint's supply/decimals and a token account's balance, printing both the raw `u64` and the human-readable, decimals-adjusted value (Concept 8)

   **Requirements:**
   - Creates a mint with `6` decimals, your wallet as `mintAuthority`, and your wallet as `freezeAuthority`.
   - Creates (or fetches, if it already exists) your wallet's ATA for that mint.
   - Mints `1000` tokens (as a raw amount accounting for 6 decimals) to that ATA.
   - Prints the mint's raw supply and decimals-adjusted supply, and the ATA's raw balance and decimals-adjusted balance.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Mint created: 8pQrW...
           Your ATA: 3nKzT...

           Minted. Signature: 5f3G...

           Supply (raw):    1000000000
           Supply (human): 1000

           ATA balance (raw):    1000000000
           ATA balance (human): 1000

   2. Command: verify by hand.

       Supply and ATA balance must read IDENTICAL numbers — this is a
       brand-new mint, so every token in existence is the one you just
       minted, entirely into your own account.

       Raw / 10^6 must equal the human figure exactly
       (1000000000 / 1000000 = 1000).

   3. Command: apply How to Build Step 6 (verify with the spl-token
        CLI), then compare its output to index.ts's printed values by hand.

       Expected outcome: identical numbers from two completely
       independent tools — the TypeScript client and the official CLI
       both reading the exact same on-chain account data, confirming
       neither is showing you a cached or locally-computed value.

   4. Command: temporarily change `const decimals = 6;` to
        `const decimals = "6";` (a string instead of a number), then run

            npx tsc --noEmit.

       Expected output: a type error, reporting that a string isn't
       assignable to createMint's expected numeric decimals parameter —
       confirming @solana/spl-token's own types catch this before you'd
       ever see a confusing on-chain failure instead.

       Revert this change afterward.
   ```

2. **Medium - Transferring & Burning, via a PDA-Owned Vault Token Account.**

   **What you practice:**
   - Deriving a second token account owner as a **PDA** (Week 13), rather than needing a second real wallet, since receiving a transfer never requires the recipient to sign anything
   - Using `allowOwnerOffCurve: true` on `getOrCreateAssociatedTokenAccount`, and understanding exactly why an ATA function needs that flag for a PDA owner (Week 13, Concept 2)
   - Transferring tokens between two real, on-chain token accounts, then permanently burning some, and confirming supply itself dropped, not just your own balance

   **Requirements:**
   - Reuses Easy's mint address and ATA.
   - Derives a PDA (seeds: `["token-vault", your_wallet_pubkey]`, against the Memo Program's real address, used only as a realistic `programId`, exactly Week 13's pattern) to serve as a second token account's owner.
   - Creates that PDA-owned ATA with `allowOwnerOffCurve: true`.
   - Transfers `100` tokens from your primary ATA to the PDA-owned ATA, printing both balances afterward.
   - Burns `50` tokens from your primary ATA, printing your balance and the mint's total supply afterward, confirming supply actually decreased.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (assuming Easy's script left you with 1000
       tokens beforehand):
           Vault owner PDA (no private key, Week 13): 6yTzP...
           Vault ATA: 9mLkR...

           Transferred. Signature: 4hRt...
           Primary ATA balance: 900000000
           Vault ATA balance:   100000000

           Burned. Signature: 8kNw...
           Primary ATA balance after burn: 850000000
           Mint supply after burn:         950000000

   2. Command: verify by hand.

       900000000 + 100000000 = 1000000000, the exact starting total —
       confirming the transfer moved value, it didn't create or destroy
       any. After the burn, supply dropped by exactly 50000000 (from
       1000000000 to 950000000) — a genuine reduction in total tokens in
       existence, not just a balance moved somewhere else.

   3. Command: re-run npx tsx index.ts a second time, unchanged.

       Expected output: balances continue from where the first run left
       them (Primary: 850000000 -> transfer 100000000 out -> 750000000,
       then burn 50000000 -> 700000000), confirming both accounts and the
       mint's supply persist correctly across separate script runs.

   4. Command: temporarily remove the `true` (allowOwnerOffCurve)
       argument from the vaultAta getOrCreateAssociatedTokenAccount call,
       then run

           npx tsx index.ts.

       Expected output: an error at that call, refusing to proceed
       because the owner (vaultOwnerPda) is off-curve and the function
       wasn't explicitly told that's intentional — confirming this flag
       is a genuine safety check, not decoration, exactly the off-curve
       distinction Week 13, Concept 2 built the entire PDA mechanism
       around.

       Revert this change afterward.
   ```

3. **Hard - Freeze/Thaw, a 1-of-1 Multisig Authority & CLI Verification.**

   **What you practice:**
   - Freezing a real token account, confirming a transfer against it genuinely fails, thawing it, and confirming the identical transfer then succeeds, both outcomes observed directly rather than assumed
   - Building a real `createMultisig` account and setting it as a mint's authority, understanding exactly which part of Concept 9's pattern this course's single-real-wallet constraint can and can't demonstrate
   - Cross-verifying everything this script did against the independent `spl-token` CLI, this week's version of "trust but verify"

   **Requirements:**
   - Reuses Medium's vault ATA (PDA-owned) as the account to freeze and thaw.
   - Freezes it, attempts a transfer into it, catches and prints the failure, thaws it, then successfully repeats the identical transfer, printing that success too.
   - Creates a `1`-of-`1` multisig (your wallet as the sole designated signer), explicitly noting in a comment why this demonstrates the _structure_ of multisig authorization rather than genuine multi-party approval, which would need a second real signer outside this course's scope.
   - Creates a **second**, separate mint with that multisig account as its `mintAuthority`, and mints tokens through it, passing the multisig's underlying signer(s) explicitly.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Frozen vault ATA. Signature: 3fRt...

           Transfer into frozen account correctly failed:
               ...Account is frozen...

           Thawed vault ATA. Signature: 7kMp...
           Transfer after thawing succeeded. Signature: 2nQw...

           Multisig account (1-of-1): 5xVb...
           New mint with multisig mint_authority: 9dLk...
           Minted via multisig authority. Signature: 6yTz...

   2. Command: verify the freeze/thaw invariant by hand.

       Both outcomes must be OBSERVED, not assumed: the first transfer
       attempt must genuinely fail while frozen (a caught error, not a
       silently-skipped one), and the second, identical transfer must
       genuinely succeed after thawing — confirming freeze/thaw actually
       changes what the Token Program will allow, not just a cosmetic
       account field.

   3. Command: apply How to Build Step 5 (verify the vault ATA's final
       state with spl-token account-info), then compare to the script's
       own behavior.

       Expected outcome: State: Initialized, matching that the LAST
       operation on this account was a successful thaw+transfer, not a
       freeze — an independent tool confirming the same end state the
       TypeScript client left behind.

   4. Command: temporarily change `const multisig = await createMultisig(connection,
       payer, [payer.publicKey], 1);` to use `2` instead of `1` as the
       threshold (still only one signer in the array), then re-run

           npx tsx index.ts.

       Expected output: the createMultisig call itself may succeed (a
       2-of-1 multisig is a nonsensical but not always rejected
       configuration depending on the exact validation), but the
       subsequent mintTo call, passing only [payer] as multiSigners, will
       fail, since two signatures are now required and only one was
       provided — confirming the M-of-N threshold is a real, enforced
       requirement at the point of USE, not just at creation.

       Revert this change afterward.
   ```
