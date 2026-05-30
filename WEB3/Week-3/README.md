# List of things learned.

## 1. Symmetric vs Asymmetric cryptography.

Cryptography for computers comes in two families and almost every confusing acronym you'll meet later (Ed25519, secp256k1, RSA) is just a specific implementation of one of these two ideas.

**Symmetric cryptography** uses one shared secret key for both locking and unlocking.

- If Alice and Bob want to exchange encrypted messages, they both need a copy of the exact same key beforehand. It's fast and simple, but it has an obvious weak point: however they first share that key, that exchange itself needs to be secure.

**Asymmetric cryptography** uses a _pair_ of mathematically-related keys instead of one shared key, a **public key**. Which is safe to hand out to literally anyone and a **private key**, which never leaves its owner.

The two keys are generated together and are mathematically linked, but knowing the public key gives you no practical way to work out the private key.

### Symmetric vs Asymmetric (side by side).

```
SYMMETRIC                              ASYMMETRIC
----------                              ----------
 One shared key                         Two linked keys per person
                                         (public + private)

 Alice  --[shared key]-->  Bob          Alice  --[Alice's private key]--> signs
 Both must already have                 Anyone --[Alice's public key]--> verifies
 the same key safely

 Problem: how do Alice and              Solves that problem: the public
 Bob agree on a shared key              key can be shouted from the
 in the first place?                    rooftops with no loss of security.
```

Blockchains overwhelmingly rely on the asymmetric family, because a public ledger has no private, pre-shared-secret channel between any two strangers.

Everything two participants know about each other is whatever's visible on the chain itself.

---

## 2. Public & Private keys. (The lock-&-key analogy that actually holds up).

Think of a public key as a slot on the front of a mailbox bolted to a public street corner:

- anyone walking by can drop a letter in &

- anyone can look at the mailbox and confirm it's really there.

The private key is the only key that opens the mailbox from the back to read what's inside and critically, nobody can work backwards.

From _"I can see the mailbox"_ to _"I know what the back-door key looks like."_

The actual math swaps the direction blockchains care about, instead of using key pairs to lock/unlock secret messages.

This course mostly uses them to **sign** and **verify**. Proving _who_ produced a piece of data, not hiding _what_ the data says.

```
Private key  ---(one-way math)-->  Public key
     ^
     |
  keep secret,                    share freely,
  never transmit                  anyone can have a copy
```

This is the same one-way shape you saw with hash functions last week (easy forward, effectively impossible backward). Just applied to keys instead of arbitrary data.

---

## 3. Digital Signatures. (Proving authorship without exposing the secret)

A digital signature answers one specific question,

**"Did the holder of this private key produce this exact piece of data?"**

It does not hide the data, a signed message is still fully readable by anyone.

That's a common beginner mix-up worth clearing up early: signing is not the same operation as encrypting.

```
Alice:  signature = sign(message, Alice's PRIVATE key)
                          |
                          v
        message + signature sent/published openly

Bob:    verify(message, signature, Alice's PUBLIC key)  -->  true or false
```

Two properties fall out of this for free:

- **Authenticity:** Only whoever holds Alice's private key could have produced a signature that verifies against Alice's public key.

- **Integrity:** The signature is mathematically tied to the exact bytes of the message. Change even one character of the message and the same signature will no longer verify.

> This week's code uses **Ed25519** signatures specifically, one particular, widely-used signature scheme, via Node's built-in `node:crypto` module. No external signing library is needed.

---

## 4. Elliptic curves. (Briefly & why different chains disagree)

The specific math that makes _"a private key produces a matching public key and the relationship can't be reversed"_ practical to compute on ordinary hardware is called **elliptic curve cryptography**.

The full mathematics of elliptic curves is out of scope for this course, what matters practically is that it's a family of curve shapes and different projects standardized on different curves:

- **Ed25519 :** The curve Solana uses for every account's keypair (relevant starting Week 10).

- **secp256k1 :** The curve Bitcoin and Ethereum use (relevant starting Week 26).

Both curves solve the identical problem (one-way key pairs, signing, verifying) with different performance and implementation tradeoffs; neither is _"more secure"_ in a way that matters for this course.

> This week's assignments use Ed25519 throughout, both because it's what Solana (this course's first deep-dive chain) uses, and because Node's built-in crypto module supports it with a notably simpler API than secp256k1.

---

## 5. Signed transactions. (Where this plugs into last week's blockchain)

Last week's mini blockchain simulator had a real gap, worth naming directly:

- nothing stopped anyone from writing `"Alice pays Bob 5 coins"` into a block's `data` field, whether or not Alice actually agreed to it.

Hashing and chaining only protect data from being _silently altered after the fact_, they say nothing about who was allowed to write it in the first place.

This week's addition closes that gap, every entry now has to carry a signature that only the real author's private key could have produced and anyone re-verifying the chain checks that signature using the author's public key.

> This week's Hard assignment builds exactly that, a hash-chained ledger (Week 2's idea) where every block must _also_ be validly signed by an authorized key (this week's idea) before it's accepted.

---

## Assignment.

1. **Easy - Key Pair & Signature CLI.**

   **What you practice:**
   - Generating an Ed25519 keypair with `node:crypto`
   - Signing a message with a private key and verifying it with a public key
   - Understanding, through direct experiment, exactly what makes a signature fail — a wrong key vs. a changed message
   - Exporting keys to PEM format, the standard text representation for cryptographic keys

   **Requirements:**
   - Running the program generates a fresh Ed25519 keypair and prints both keys in PEM format, clearly labeling which one is safe to share.
   - The program signs a fixed sample message and prints the signature as a hex string.
   - The program verifies that signature three times, printing the boolean result of each: once correctly (real message, real public key), once against a different person's public key, and once against a tampered version of the message.
   - Only the first of those three verification attempts prints `true`; the other two print `false`.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx signer.ts

       Expected output: two PEM blocks printed near the top of the output,
       each beginning with a line like "-----BEGIN PUBLIC KEY-----" or
       "-----BEGIN PRIVATE KEY-----" respectively, followed by several
       lines of base64-looking text, followed by a matching "-----END..."
       line.

       These confirm the keypair generated and exported correctly.

   2. Command: same run, reading further down the output.

       Expected output: exactly three verification lines, in this order:
           - "...original message: true"
           - "...DIFFERENT public key (Mallory's): false"
           - "...TAMPERED message: false"

       If any of the last two print "true", something is wrong with how
       the signature or keys are being generated or compared, stop and
       re-check signer.ts against the Solution before continuing to Medium.

   3. Command: npx tsx signer.ts run twice in a row.

       Expected output: the PEM key blocks and the signature hex are
       completely different between the two runs, because a brand new
       random keypair is generated each time the script starts.

       This is the opposite of Week 2's Manual Test Case 3, where hashes
       were expected to be identical across runs here, difference across
       runs is the correct behaviour, not a bug.
   ```

2. **Medium - Signed Message Log.**

   **What you practice:**
   - Persisting generated keypairs to disk as named, reusable identities
   - Building a multi-command CLI where state (identities, log entries) accumulates across separate invocations rather than existing only for one run
   - Embedding a public key directly alongside data it doesn't own but needs to be checked against
   - Verifying an entire collection of independently-signed entries and reporting per-entry, not just overall, results

   **Requirements:**
   - Running `identity create <name>` generates a new Ed25519 identity and saves it under that name so it can be reused in later commands, without needing to be regenerated.
   - Running `append <name> "<message>"` signs the message using the named identity's saved private key and appends a new entry — containing the author's name, their public key, the message, and the signature — to a shared log file.
   - Running `verify` reads every entry in the log and, for each one independently, reports whether its signature is valid for its own embedded message and public key.
   - An entry whose message was manually edited on disk after being appended (without also updating its signature) is reported as invalid by `verify`, while every other untouched entry in the same log still reports valid.
   - Running `verify` on a log containing entries from multiple different identities correctly verifies each entry against its own author's public key, not against a single global key.

   _(`keys/` and `data/` start out empty and are created automatically the first time you run a command that needs them. They don't need to be created by hand.)_

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx log.ts identity create alice
               npx tsx log.ts identity create bob

       Expected output: each command prints "Created identity "<name>"."
       followed by a PEM-formatted public key block.

       After running both, confirm two files now exist: keys/alice.json
       and keys/bob.json each containing a "name", "publicKeyPem" and
       "privateKeyPem" field.

   2. Command: run the three "append" commands from How to Build Step 6,
   in the exact order given. Then run,

                npx tsx log.ts verify

       Expected output: three lines, one per entry, each ending in "VALID"
        — the first and third attributed to "alice", the second to "bob".

        The final line reads "Overall log valid? true".

   3. Command: open data/log.json

        Change only the "message" field of the entry authored by "bob"
        (leave every other field, especially "signature", untouched),
        save, then run

                npx tsx log.ts verify (again).

        Expected output: exactly one line now reads "INVALID" — the "bob"
        entry, since its signature was computed over the original message
        text and no longer matches the edited text.

        Both "alice" entries still print "VALID" and the final summary line
        now reads "Overall log valid? false".

        Confirming verification is per-entry, not an all-or-nothing check that
        would hide which entry broke.

   4. Command: npx tsx log.ts append carol "Carol was never created"

        (without first running "identity create carol").

        Expected output: The program throws and prints an error message
        containing the text 'No identity found for "carol".

        Run "identity create carol" first.'

        Confirming a helpful, specific error rather than a raw stack trace or a silent failure.
   ```

3. **Hard - Signed & Hash-Chained Ledger.**

   **What you practice:**
   - Combining Week 2's hash-chaining with this week's digital signatures into a single validation pipeline
   - Designing and enforcing an authorization rule (a registry of trusted public keys) on top of pure cryptographic validity
   - Reasoning about _why_ a validly-signed piece of data can still be rejected (wrong signer) versus _how_ a signature binds to specific bytes (replay across blocks)
   - Writing multiple independent, clearly-labeled attack demonstrations against your own validation logic

   **Requirements:**
   - Every block carries an index, timestamp, data payload, link to the previous block's hash, the public key of whoever signed it, and a signature.
   - A block is only accepted as valid if all of the following are simultaneously true: its stored hash matches a hash recomputed from its own contents, its `previousHash` correctly matches the prior block's hash, its signer's public key appears in an explicit registry of authorized keys, and its signature is cryptographically valid for its own hash under that public key.
   - The program demonstrates a chain built by two different authorized signers, alternating, and confirms it is valid.
   - The program demonstrates, as three separate, clearly-labeled scenarios, three different ways a ledger can become invalid — each printing a distinct, specific reason for the failure (not a generic "invalid" with no explanation).
   - One of those three scenarios must involve a signature that is cryptographically genuine (produced by a real private key) but is being reused in a context it wasn't created for — showing that "the signature is real" and "the signature is valid for this specific data" are not the same claim.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx cli.ts

       Expected output: the first two lines of output confirm a 3-block
       ledger was built and report "Ledger valid? true".

       Since every block in it is correctly hash-linked and signed by one of the two
       registered validators.

   2. Command: same run, reading the "Attempt 1" section.

       Expected output: "Valid? false — Block #1: stored hash does not
       match its recomputed contents".

       This is the same failure mode as Week 2's tampering demo, changing data without
       updating the hash that supposedly describes it.

   3. Command: same run, reading the "Attempt 2" section.

       Expected output: "Valid? false — Block #3: signed by a public key
       that is not in the registry".

       Note specifically that this block's signature IS genuinely valid, the outsider
       really did sign it with their own real private key.

       But it's rejected anyway, because being a real signature and being an authorized
       signature are different, independently-checked requirements.

   4. Command: same run, reading the "Attempt 3" section.

       Expected output: "Valid? false — Block #2: signature does not match
       the block's hash".

       The signature copied onto Block #2 was produced by validator-1 signing
       Block #0's hash, not Block #2's.

       Since a signature is only valid for the exact bytes it was created for, a
       perfectly genuine signature from a perfectly authorized key still
       fails once it's attached to different data than what it signed.

   5. Command: run npx tsx cli.ts a second time, immediately after the
               first and compare both runs' output side by side.

       Expected output: all four boolean/reason lines described above
       appear identically in both runs (all the same true/false values and
       reason text).

       Even though the underlying keys, hashes and signatures are completely different
       random values each time, confirming the validation LOGIC is deterministic even
       though the cryptographic MATERIAL it operates on isn't.
   ```
