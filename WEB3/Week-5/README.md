# List of things learned.

## 1. What is Serialization.

_Serialization_ is the process of turning an in-memory value like an object, a struct, whatever your program is holding in variables into a flat sequence of bytes that can be written to disk, sent over a network or hashed.

_Deserialization_ is the reverse, bytes back into a usable in-memory value.

```
In-memory value                     Bytes                             In-memory value
{ balance: 500,         --serialize-->  [some sequence          --deserialize-->  { balance: 500,
  owner: "Alice" }                  of raw bytes]                         owner: "Alice" }
```

### Why blockchains care about it specifically.

Ordinary web apps serialize constantly without thinking hard about it, usually to JSON.

Blockchains care much more, for a reason that connects directly back to Week 2: **hashing only produces useful, comparable results if identical logical data always serializes to the exact same bytes.**

If two honest nodes serialize the same account differently, they'll compute different hashes for it and Week 2's entire _"everyone independently verifies the same chain"_ idea falls apart.

This week is about serialization formats built with that specific requirement in mind.

---

## 2. Why JSON isn't good enough for on-chain data.

JSON is convenient for humans and APIs, but it has two properties that make it a poor fit for anything that gets hashed or stored on-chain:

- **It's self-describing :** Every single value is stored alongside its field name, every time `{"balance":500}` repeats the word `balance` in every account that has one, forever. That's wasted space multiplied by every account on the entire chain.

- **Key order isn't guaranteed to be meaningful, but it still affects the bytes.** `{"a":1,"b":2}` and `{"b":2,"a":1}` describe the identical logical data, but they're different strings, character for character. Which means they hash to completely different, unrelated values.

```
Same logical data, two valid JSON encodings:
{"owner":"Alice","balance":500}
{"balance":500,"owner":"Alice"}
                                    -->  DIFFERENT strings, DIFFERENT hashes
```

> This week's Easy assignment demonstrates exactly this problem directly, then shows the fix.

---

## 3. Borsh: A binary format built for consistency, not convenience.

**Borsh** (Binary Object Representation Serializer for Hashing) fixes both of JSON's problems by design.

It is **not self-describing**, a Borsh-encoded buffer contains no field names at all, only raw values, laid out in exactly the order a fixed schema says they should be in.

Two consequences follow directly from that:

- **Encoding is deterministic.** The schema, not the order properties happen to appear in your source code's object, decides the byte layout.

  The same logical data always produces the exact same bytes, every time, on every machine.

- **It's compact.** No field names, no punctuation, no whitespace. Just the raw bytes the values actually need.

```
Borsh encoding of { owner: "Alice", balance: 500u64 }, using schema
{ struct: { owner: 'string', balance: 'u64' } }:

[ 4 bytes: length of "Alice" ][ "Alice" as UTF-8 bytes ][ 8 bytes: 500 as little-endian u64 ]

No "owner" text anywhere in the bytes. No "balance" text anywhere in the bytes.
The SCHEMA is what tells you those 8 trailing bytes mean "balance".
```

> Solana uses Borsh natively for account data and instruction data. This is the exact format you'll be reading and writing directly once Week 10 onward puts you inside Solana's account model.

### Endianness & Alignment. (Two more things the schema fixes, not chance)
 
Two lower-level details are worth naming explicitly, both already visible in the diagram above without being called out:
 
- **Endianness** is the order individual bytes of a multi-byte number are stored in.

     `500u64` as **little-endian** stores its *least* significant byte first; **big-endian** would store its *most* significant byte first.

     Same number, different byte sequence, so a hash over it would come out completely different depending on which convention was used.

     Borsh always uses little-endian, fixed by spec, which is exactly what makes Week 1's "every honest node computes the same hash" claim actually hold across machines with different native architectures.

- **Alignment** refers to padding bytes some formats insert so multi-byte values start at convenient memory addresses (a C struct, for instance, often pads a `u8` field out to 4 or 8 bytes).

     Borsh deliberately has **no alignment padding**, fields are packed back-to-back with nothing in between, which is part of why it's compact.
     
     This matters later: Week 14's zero-copy account parsing works directly against raw memory layout, where alignment *does* apply, so you'll see the contrast firsthand once you're there.

---

## 4. Serde: The framework Borsh plugs into, once Rust arrives.

Rust doesn't start until Week 6, so this week only covers Serde conceptually. You'll write real Serde code starting next week.

**Serde** (a portmanteau of "serialize" & "deserialize") is Rust's general-purpose serialization framework.

Its key idea is a separation of concerns:

- a Rust struct implements Serde's `Serialize`/`Deserialize` traits exactly once, describing _how to walk through its own fields_ and

- that same implementation can then be paired with any number of different backend **formats** (JSON, Borsh, MessagePack and others) without changing the struct at all.

```
                    +-- serde_json  --> JSON bytes
Your Rust struct -->|
(implements Serde)  +-- borsh       --> Borsh bytes
                     |
                     +-- (any other Serde-compatible format)
```

One nuance worth knowing ahead of time, Rust's Borsh crate has historically implemented its own derive macros (`BorshSerialize`, `BorshDeserialize`) somewhat independently of Serde's own traits.

Specifically so Borsh could support a couple of Borsh-only features Serde's general model doesn't have a place for.

> You'll see both patterns directly once Week 6 through Week 9 cover Rust and Week 8 covers derive macros specifically.

---

## 5. Schema evolution: The cost of not being self-describing.

Borsh's biggest strength:

- no field names,
- no self-description.

It's also exactly where its biggest practical danger lives.

Because a Borsh buffer carries no information about its own shape, **the code reading it has to already know, in advance, the exact schema that was used to write it.**

Change that schema by adding a field, removing one, reordering them, resizing one and old bytes either fail to decode or worse, decode into a wrong value with no error at all.

```
Schema V1: { owner: [u8; 32], balance: u64 }              (40 bytes)
Schema V2: { owner: [u8; 32], balance: u64, decimals: u8 } (41 bytes)

Reading a V1-encoded buffer using the V2 schema:
  - reads 32 bytes for owner:    OK, same as before
  - reads 8 bytes for balance:   OK, same as before
  - reads 1 more byte for decimals: THERE ISN'T ONE — reads whatever
    byte happens to come next (or fails, if there's nothing left)
```

JSON degrades much more gracefully here.

A JSON parser given an object with an extra or missing field usually still parses successfully, since the field names are right there in the data.

Borsh gives you speed and compactness in exchange for taking on that responsibility yourself.

> This week's Hard assignment builds a small, explicit versioning scheme to handle exactly this. The same problem Week 40 (on-chain data model design) will revisit at a much larger scale.

---

## Assignment.

1. **Easy - JSON vs Borsh : Same Data, Different Bytes.**

   **What you practice:**
   - Observing directly that JSON's byte representation depends on source key order, even when the logical data is identical
   - Using the `borsh` package's schema-based `serialize` function for the first time
   - Confirming that Borsh's byte output depends only on the schema's field order, never on the order properties happen to appear in a JS object literal
   - Reconnecting this week's material to Week 2's hashing by hashing both representations and comparing

   **Requirements:**
   - The program constructs the same logical account data (an owner string, a balance, and a boolean flag) twice, as two JS objects with their properties declared in a different order.
   - The program prints the `JSON.stringify` output of both versions and reports whether the two strings are identical.
   - The program hashes both JSON strings with SHA-256 and reports whether the two hashes are identical.
   - The program then serializes both versions using an identical Borsh schema and reports whether the two resulting byte sequences (shown as hex) are identical.
   - The program hashes both Borsh byte sequences with SHA-256 and reports whether the two hashes are identical.
   - The JSON comparison must report `false` for both the string and hash checks, and the Borsh comparison must report `true` for both — demonstrating the exact problem from Concept 2 and the exact fix from Concept 3, in one run.

   [Solution](./Assignment/code1)

   **Manual Test Cases:**

   ```
   1. Command: npx tsx compare.ts

        Expected output: Under "--- JSON ---", two different-looking JSON
        strings (one starting with {"owner":..., the other starting with
        {"isInitialized":...).

        Followed by
        "Strings identical? false" and "SHA-256 hashes identical? false".

   2. Command: same run, reading the "--- Borsh ---" section.

        Expected output: Two hex strings that are exactly identical to each
        other character for character, followed by "Bytes identical? true"
        and "SHA-256 hashes identical? true".

        Despite being produced from two objects whose properties were declared
        in a completely different order in the source code.

   3. Command: open compare.ts

        And swap the order of the three fields inside the schema object
        itself (not the AccountData objects — the schema).

        Then run npx tsx compare.ts again.

        Expected output: The Borsh hex strings from test case 2 are now
        DIFFERENT from before (though orderA and orderB still match each
        other).

        Confirming it really is the schema's field order that
        determines the byte layout, not anything about the source objects.

        Revert this change before continuing to Medium.

   4. Command: npx tsx compare.ts run twice in a row

        with no code changes in between.

        Expected output: Byte-for-byte identical output both times.

        Everything in this script is fixed data with no randomness
        involved, unlike Week 4's key-generation scripts.
   ```

2. **Medium - Account Round-Trip & Corruption.**

   **What you practice:**
   - Serializing and deserializing a struct with a fixed-length byte array field (the shape Solana account "owner" and other pubkey fields actually take)
   - Measuring exactly how compact a Borsh encoding is, in bytes
   - Directly observing the difference between "corrupted but still decodes" and "corrupted and fails to decode" for a non-self-describing format
   - Reasoning about why that difference matters more for a blockchain than for an ordinary application

   **Requirements:**
   - The program defines a schema resembling a simplified token account: a fixed 32-byte `owner` field, a `u64` `amount`, and a `u8` `decimals`.
   - The program serializes one such account, prints the resulting byte length, and confirms it matches the schema's fixed total size exactly (32 + 8 + 1 = 41 bytes).
   - The program deserializes the bytes back and confirms every field matches the original exactly.
   - The program flips a single byte inside the encoded `owner` field (without touching anything else) and deserializes the corrupted buffer, demonstrating that this specific kind of corruption decodes successfully into silently wrong data rather than raising any error.
   - The program separately truncates the encoded buffer and attempts to deserialize it, demonstrating that this specific kind of corruption does raise an error rather than decoding into a shorter, wrong value.

   [Solution](./Assignment/code2)

   **Manual test Cases.**

   ```
   1. Command: npx tsx accounts.ts

        Expected output: An "Original account" block showing a 32-number
        owner array, a bigint amount and decimals: 6.

        Immediately followed by "Encoded size: 41 bytes (expected 41)".

   2. Command: same run, reading the "Decoded account" block.

        Expected output: A decoded account whose owner array, amount and
        decimals are printed, followed by three lines all reading true.

        "Owner bytes match? true", "Amount matches? true", "Decimals match?
        true".

        Confirming a clean round trip with no corruption involved.

   3. Command: same run, reading the "Corruption 1" section.

        Expected output: "Owner bytes still match the original after
        flipping? false".

        The flipped byte changed the decoded owner value, but note there
        is no error anywhere in this section and the program continued running
        normally afterward.

        This is the core point of this assignment: a single flipped bit produced
        a different, wrong value with zero indication anything went wrong.

   4. Command: same run, reading the "Corruption 2" section.

        Expected output: "Deserialize threw an error as expected:" followed
        by some error message (the exact wording isn't important — what
        matters is that an error was thrown at all here, unlike Corruption
        1 above).

        Contrast this directly with Corruption 1: truncating bytes is detected,
        but a same-length bit flip inside a fixed field is not.

   5. Command: npx tsx accounts.ts run twice in a row.

        Expected output: Different owner byte arrays and different encoded
        hex strings between the two runs (since randomBytes(32) generates
        fresh randomness each time), but both runs' "Encoded size" lines
        read exactly "41 bytes (expected 41)".

        Confirming the size is fixed by the schema regardless of what random
        data fills it.
   ```

3. **Hard - Versioned Account Records & Migration.**

   **What you practice:**
   - Designing an explicit, minimal versioning scheme on top of a format that has no versioning built in
   - Reading a small "tag" byte to decide which of several schemas to use for the rest of a buffer, before decoding anything else
   - Writing a migration function that upgrades old-format bytes to a new format in place
   - Reasoning precisely about how a schema change affects on-disk byte size, field by field

   **Requirements:**
   - The program defines two schemas: a V1 shape (`owner`, `balance`) and a V2 shape (`owner`, `balance`, `decimals`), where V2 is V1 plus exactly one additional `u8` field.
   - Every record written to disk begins with a single version byte (`1` or `2`), followed by that version's Borsh-encoded struct — never just the raw struct bytes on their own.
   - Running `create-v1 <path>` writes a fresh, randomly-owned V1 record to the given path.
   - Running `decode <path>` reads the version byte first, then decodes the remainder using whichever schema matches that version, and works correctly for both V1 and V2 records without being told in advance which one it's looking at.
   - Running `migrate <path>` on a V1 record decodes it, adds a default `decimals` value, re-encodes it as a V2 record, and overwrites the file — after which `decode` on the same path reports it as version 2.
   - Running `migrate <path>` a second time on an already-V2 record refuses to proceed and reports a clear, specific reason, rather than silently double-migrating or corrupting the file.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx cli.ts create-v1 account.bin

        Expected output: "Wrote a V1 account record to account.bin"
        followed by an object showing a 32-number owner array and
        balance: 2500000n.

        Confirm account.bin now exists in the project folder.

   2. Command: npx tsx cli.ts decode account.bin

        Expected output: "Record at account.bin is version 1" followed by
        the same owner and balance values from test case 1.

        Exactly, since nothing has modified the file between the two commands.

   3. Command: wc -c account.bin
        (or (Get-Item account.bin).Length in PowerShell)

        Expected output: 41 — 1 version byte, plus 32 owner bytes, plus 8
        balance bytes, matching the V1_SCHEMA's fixed total size exactly.

   4. Command: npx tsx cli.ts migrate account.bin

        Expected output: "Migrated account.bin from V1 to V2 (added
        decimals: 6)."

        Followed by an object showing the same owner and
        balance values as before, plus decimals: 6.

   5. Command: npx tsx cli.ts decode account.bin
        (run immediately after test case 4).

        Expected output: "Record at account.bin is version 2" followed by
        owner, balance and decimals fields.

        The version byte on disk genuinely changed from 1 to 2 during migration
        and decode() correctly picked V2_SCHEMA in response without being told to.

   6. Command: wc -c account.bin

        Expected output: 42 — exactly one byte more than test case 3's 41,
        accounting for the new decimals: u8 field and nothing else.

   7. Command: npx tsx cli.ts migrate account.bin
        (run a second time, now that the file is already version 2).

        Expected output: "Can only migrate version 1 records, found version
        2." printed as an error and the process exits with a non-zero code
        (confirm with echo $?).

        Run wc -c account.bin once more afterward to confirm the file is still
        exactly 42 bytes — the failed second migration did not touch it.
   ```
