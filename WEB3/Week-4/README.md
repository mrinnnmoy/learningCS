# List of things learned.

## 1. What is a wallet.

A _"wallet"_ doesn't hold coins the way a physical wallet holds cash.

Every balance you'll ever see in a block explorer is really just an entry in the ledger, tied to a public key.

A wallet's actual job is generating and guarding the one private key that can produce valid signatures under that public key. Everything else (the nice app, the "send" button, the balance display) is a convenience layer built on top of that one responsibility.

```
What people picture a wallet holds:      What a wallet actually holds:
+------------------+                     +------------------+
| Wallet           |                     | Wallet           |
|  [coin] [coin]   |                     |  one private key |
|  [coin] [coin]   |                     |  (32 bytes)      |
+------------------+                     +------------------+
                                          "Coins" are just ledger
                                          entries under this key's
                                          matching public key.
```

Losing a wallet's private key doesn't destroy any coins directly. It destroys the only proof of authorization that lets anyone move them, which in practice has the exact same effect as losing the coins.

This is also why Week 3's `signed-log` project explicitly flagged "storing a private key as plain JSON is not how real wallets work": this week builds the parts that were missing.

---

## 2. Seed phrases. (Turning randomness into something a human can back up)

A raw Ed25519 private key is 32 bytes of essentially random data. Awkward to write down, and one mistyped hex character out of 64 silently produces a completely different, wrong key with no obvious sign anything went wrong.

A _seed phrase_ solves the human-usability half of this problem:

- instead of copying raw bytes perfectly, you write down a short sequence of ordinary words.

Words are far more forgiving of handwriting and memory errors than hex digits. A misspelled or misremembered word is usually obviously wrong, where a single wrong hex character isn't.

Feed the exact same phrase back through the same process later and you reproduce the exact same underlying bytes, the **seed**, which is what actually determines every key derived from it.

Real wallets use the **BIP-39** standard specifically:

- a fixed 2048-word list, an 11-bits-per-word packing scheme and a built-in checksum word.

> This week's code builds a genuine, working version of the same underlying idea. Bytes in, words out, words back to the identical bytes using a smaller, simplified 256-word list instead, so the mechanism stays the focus rather than exact spec compliance.

---

## 3. Hierarchical deterministic wallets. (One seed, Many accounts)

Real wallet apps let you switch between "Account 1," "Account 2" and so on, all from a single backup phrase.

That only works because of one more one-way trick layered on top of the seed itself.

Instead of generating several independent random keypairs which would each need their own separate backup, a single **master seed** is combined with an account index through a one-way function (this week: HMAC) to produce a distinct **child seed** per account.

Back up the one master phrase and every account it can ever produce is reproducible later, in the same order, from scratch.

```
masterSeed --HMAC(masterSeed, "account:0")--> childSeed0 --> keypair0 (Account #0)
masterSeed --HMAC(masterSeed, "account:1")--> childSeed1 --> keypair1 (Account #1)
masterSeed --HMAC(masterSeed, "account:2")--> childSeed2 --> keypair2 (Account #2)
```

Real HD wallets follow the **BIP-32 / BIP-44** standards specifically, using HMAC-SHA512, a "chain code" and hardened vs. non-hardened derivation paths.

> Week 12 and Week 32 cover Solana's and Ethereum's actual derivation path conventions once you're working with each chain directly. This week's version keeps the same core idea — one seed, many reproducible children. With a simplified HMAC-SHA256 scheme.

---

## 4. Password-based Encryption. (Keeping keys safe at rest)

Week 3 flagged, but deliberately didn't fix, the fact that writing a raw private key to a JSON file on disk is not how real wallets handle storage.

This week fixes it directly:

- instead of storing the key itself, you store it **encrypted**, protected by a password only you know.

Two building blocks combine to do this:

- A **key derivation function** (this week: `scrypt`) turns a human-memorable password into a fixed-length encryption key. It's deliberately slow and memory-hard to compute, which makes brute-force password guessing against a stolen file expensive.

- **Authenticated encryption** (this week: _AES-256-GCM_) doesn't just hide the private key's bytes, it also detects tampering. Decrypting with the wrong password or against a corrupted file, fails loudly and immediately instead of silently returning wrong key material.

```
password + random salt  --scrypt-->  encryption key
encryption key + random IV + private key  --AES-256-GCM-->  ciphertext + auth tag

Stored on disk: salt, IV, ciphertext, auth tag.
Never stored: the plaintext private key, or the password itself.
```

---

## 5. The wallet landscape. (Hot vs. Cold, Custodial vs. Non-Custodial)

A short vocabulary map, useful before Week 12 (Solana wallet adapters) and Week 32 (Ethereum client-side wallets) put it to practical use:

- **Hot wallet :** The private key lives on an internet-connected device (a browser extension, a phone app). Convenient, larger attack surface.

- **Cold wallet :** The private key is generated and stored on a device that's never connected to the internet (a hardware wallet, a piece of paper). Safer, less convenient.

- **Custodial :** Someone else (an exchange) holds your private key on your behalf. You're trusting them the same way Week 1 described the shop owner with the back-room ledger.

- **Non-custodial :** You hold your own private key directly; the software you're using never has access to it.

```
                CUSTODIAL                       NON-CUSTODIAL
Who holds the   a third party (an exchange)     you, directly
private key?
Trust model     "trust the company" (Week 1)    "verify the math" (Week 1)
```

Every assignment in this course, (this week included) builds only non-custodial patterns. That's the actual mechanism behind the phrase _"your keys, your coins."_

---

## Assignment.

1. **Easy - Seed Phrase Generator & Recovery.**

   **What you practice:**
   - Generating cryptographically secure random bytes with `node:crypto`
   - Building a bijective (fully reversible) mapping between raw bytes and human-readable words
   - Hand-constructing a valid Ed25519 private key from a raw 32-byte seed, using the fixed DER structure every PKCS8-wrapped Ed25519 key shares
   - Confirming, by direct comparison, that identical seeds always produce identical keypairs

   **Requirements:**
   - Running the program generates 32 bytes of fresh randomness and prints a 32-word recovery phrase built from a fixed 256-word list.
   - The program derives an Ed25519 keypair directly from those 32 bytes and prints the resulting public key as a hex string.
   - The program converts the printed phrase back into bytes and confirms the recovered bytes exactly match the original bytes.
   - The program derives a second keypair from the recovered bytes and confirms its public key exactly matches the one derived from the original bytes.
   - Running the program twice in a row produces two completely different phrases and two completely different public keys, since fresh randomness is generated on every run.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx wallet.ts

       Expected output: A block of exactly 32 space-separated words printed
       under the "recovery phrase" heading, every one of them present in
       the WORDLIST array in "wordlist.ts".

       Immediately below it, a 64-character hex string labeled as the
       derived public key.

   2. Command: same run, reading further down the output.

       Expected output: "Recovered seed matches original seed? true",
       followed by a second 64-character public key hex string, followed
       by "Matches the original public key? true".

       If either of these prints false, the bytesToPhrase/phraseToBytes
       round trip is broken — stop and compare your wordlist.ts against
       the Solution before moving on to Medium.

   3. Command: npx tsx wallet.ts

       Run twice in a row, comparing both run's full output side by side.

       Expected output: Completely different 32-word phrases and
       completely different public key hex strings between the two runs.

       confirming fresh randomness is genuinely being generated each time,
       not accidentally reused or cached.

   4. Command: manually edit one word in a copied phrase

       (e.g. Change "river" to "riverr") and in a scratch Node REPL or a
       temporary script, call phraseToBytes on the edited phrase.

       Expected output: An error is thrown containing the text '"riverr" is
       not in the wordlist, check for typos.'

       Confirming the recovery function fails loudly on a corrupted phrase
       rather than silently producing a wrong-but-valid-looking seed.
   ```

2. **Medium - Encrypted Keystore.**

   **What you practice:**
   - Deriving a fixed-length encryption key from a human password using `scrypt`
   - Authenticated encryption and decryption with AES-256-GCM, including generating and checking an authentication tag
   - Persisting encrypted secrets to disk in a structured, inspectable JSON format
   - Treating a decryption failure as an expected, cleanly-handled outcome rather than a crash

   **Requirements:**
   - Running `create <name> <password>` generates a brand new random Ed25519 keypair, encrypts the private key using a key derived from the given password, and saves the encrypted record — plus the plaintext public key, which is safe to store openly — under the given name.
   - Running `unlock <name> <password>` with the correct password decrypts the private key, reconstructs it into a usable key object, signs a fixed demo message with it, and verifies that signature against the stored public key, reporting `true`.
   - Running `unlock <name> <password>` with an incorrect password fails with a specific, readable error message rather than silently returning corrupted or wrong key material.
   - Inspecting the saved keystore file directly confirms it never contains the plaintext private key, the password, or anything the password could be trivially guessed from.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx cli.ts create alice "correct horse battery staple"

       Expected output: "Created encrypted keystore "alice"." followed by
       a PEM-formatted public key block.

       Confirm keystores/alice.json now exists and contains six fields: name,
       publicKeyPem, salt, iv, ciphertext and authTag — with salt, iv,
       ciphertext and authTag all appearing as plain hex strings, not readable text.

   2. Command: npx tsx cli.ts unlock alice "correct horse battery staple"

       Expected output: "Keystore "alice" unlocked successfully."

       Followed by "Signed and verified a demo message: true".

       Confirming the decrypted private key genuinely works for signing,
       not just that decryption ran without throwing.

   3. Command: npx tsx cli.ts unlock alice "wrong password"

       Expected output: A line starting with 'Failed to unlock "alice":'
       followed by a decryption error message (the exact wording comes
       from Node's crypto module reporting that the authentication tag
       didn't check out.

       This is AES-GCM detecting that the derived key was wrong).

       Confirm the process exits with a non-zero code via echo $?
       immediately after.

   4. Command: npx tsx cli.ts unlock bob "any password"

       (without ever having run "create bob ...").

       Expected output: 'Failed to unlock "bob": No keystore found for
       "bob".

       Run "create bob <password>" first.'

       A distinct, specific error message from test case 3's wrong-password error
       confirming "keystore doesn't exist" and "password is wrong" are reported
       differently rather than collapsed into one generic failure.

   5. Command: run npx tsx cli.ts create alice "correct horse battery staple"

       A second time, then compare keystores/alice.json before and after.

       Expected output: The file is fully overwritten with new salt, iv,
       ciphertext and authTag values.

       And a new public key, since generateKeyPairSync produces a fresh random
       keypair every call, re-running "create" for the same name does not reuse
       the old key.
   ```

3. **Hard - HD Vault : Multi-Account Derivation Over an Encrypted Master Seed.**

    **What you practice:**
 
    - Combining this week's two standalone mechanisms — seed phrases (Easy) and password-based encryption (Medium) — into a single coherent system
    - Applying the HD derivation idea from Concept 3 to produce many independent, reproducible accounts from one encrypted secret
    - Deriving private keys on demand, in memory, without ever persisting more than one encrypted secret to disk
    - Confirming determinism across genuinely separate process runs, not just within a single script execution

    **Requirements:**
 
    - Running `create <password>` generates a fresh 32-byte master seed, prints it once as a recovery phrase (using Easy's word list and encoding), and immediately encrypts and saves it — the raw master seed is never written to disk in plaintext at any point.
    - Running `create <password>` a second time, without deleting the existing vault file first, refuses to overwrite it rather than silently generating and saving a new, different master seed.
    - Running `accounts <password> <count>` decrypts the vault and derives and prints exactly `<count>` accounts, each with a distinct public key.
    - Running `accounts <password> <count>` again, in a completely separate process invocation, produces the exact same list of public keys as the first run, in the same order — proving the derivation is genuinely deterministic from the persisted, encrypted seed, not something regenerated randomly each run.
    - Running `sign <password> <index> "<message>"` derives only that one account's keypair in memory, signs the given message, and verifies the signature — and the public key it reports matches the corresponding entry from an `accounts` listing exactly.
    - Supplying an incorrect password to either `accounts` or `sign` fails cleanly, the same way Medium's `unlock` command does.

    *(`wordlist.ts` is copied over unchanged from the Easy assignment. It's the same 256-word encoding used for this vault's one-time backup phrase.)*

    [Solution](./Assignment/code3)

    **Manual Test Cases.**

    ```
    1. Command: npx tsx vault.ts create "correct horse battery staple"

        Expected output: "Vault created and encrypted on disk."
        
        Followed by a 32-word backup phrase, followed by a note that the
        raw seed is never stored in plaintext.
        
        Confirm vault.json now exists in the project folder and contains
        exactly four hex-string fields (salt, iv, ciphertext, authTag).
        
        No field anywhere contains the phrase's words or anything resembling
        readable key material.

    2. Command: npx tsx vault.ts create "a different password"
    
        (Run immediately after test case 1, without deleting vault.json).

        Expected output: "A vault already exists.
        
        Delete vault.json first if you want to start over."
        
        And re-opening vault.json confirms it is byte-for-byte unchanged from
        test case 1, proving the existing vault was genuinely left alone rather
        than silently overwritten.

    3. Command: npx tsx vault.ts accounts "correct horse battery staple" 3

        Expected output: three lines, "Account #0:", "Account #1:" and
        "Account #2:", each followed by a 64-character public key hex
        string.
        
        All three hex strings must be different from each other.

    4. Command: run the exact same command from test case 3 again.
    
        As a completely separate command (not by re-using any output from the
        previous run).

        Expected output: Identical to test case 3, the same three account
        indices mapped to the exact same three public keys, in the same
        order.
        
        This is the key difference from Easy's wallet.ts, where
        re-running the program produces different results each time: here,
        the master seed is persisted and decrypted fresh each run, not
        regenerated, so the accounts derived from it are stable across
        separate process invocations.

    5. Command: npx tsx vault.ts accounts "wrong password" 3

        Expected output: A line starting with "Failed to open vault:"
        followed by a decryption/authentication error.
        
        The same category of failure Medium's unlock command demonstrated,
        now reused inside a different command.

    6. Command: npx tsx vault.ts sign "correct horse battery staple" 1 "Hello from account 1"

        Expected output: "Signed with Account #1 (<hex>):" where <hex> is
        exactly the same 64-character string that test case 3 printed next
        to "Account #1:", followed by the message, a signature hex string,
        and "verified:  true".
        
        Confirming sign and accounts derive identical keys for the same index, since both
        go through the same deriveChildSeed function.
    ```