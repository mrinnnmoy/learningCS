# List of things learned.

## 1. Ethereum Account model. (EOA vs. contract accounts)

Ethereum has exactly two kinds of account and every address is one or the other, permanently.

An **EOA** (Externally Owned Account) is controlled by a private key, exactly Week 4's wallet model and can only do two things:

- hold a balance and
- send transactions.

A **contract account** has no private key at all, controlled entirely by its own deployed code (Week 27 onward writes this code) and can hold a balance, store its own persistent data and execute logic when called.

But can never initiate a transaction on its own, only ever respond to one.

Concept 12 draws this comparison out against Solana's account model directly, worth reading once both sides exist to compare.

|                            | EOA                                      | Contract Account                               |
| -------------------------- | ---------------------------------------- | ---------------------------------------------- |
| Controlled by              | A private key (Week 4)                   | Its own deployed code, no key at all           |
| Can hold a balance         | Yes                                      | Yes                                            |
| Has bytecode               | No — `eth_getCode` always returns `"0x"` | Yes — its actual, executable logic             |
| Can initiate a transaction | Yes                                      | No — can only respond when called              |
| Nonce means                | Transactions sent                        | Contracts created _by_ this contract           |
| Created by                 | Generating a keypair (off-chain, free)   | A deployment transaction (on-chain, costs gas) |

---

## 2. EVM Architecture overview.

The **EVM** (Ethereum Virtual Machine) is a stack-based virtual machine where every full node runs an identical copy of, executing one **opcode** (Concept 5) at a time against a small working stack, a byte-addressable temporary **memory** and each contract's own persistent **storage** (conceptually similar to Week 11's Solana account data, but structured as a giant key-value mapping rather than a flat byte array).

Every node computing the exact same result from the exact same inputs, deterministically, is what lets the network agree on state without trusting any single party, the same core requirement Week 2's consensus concepts established generally, met here by a completely different execution model than Solana's Sealevel (Week 10).

Concretely, computing `2 + 3` is genuinely this mechanical, stack in, stack out:

```
PUSH1 0x02   ; stack: [2]
PUSH1 0x03   ; stack: [2, 3]
ADD          ; pops both, pushes their sum — stack: [5]
```

Every Solidity expression Week 27 onward writes eventually compiles down to sequences like this one, `2 + 3` in Solidity and the three lines above are the same operation, just at two different levels of abstraction.

---

## 3. Gas & Gas Price mechanics.

Every opcode (Concept 5) has a fixed, published cost in **gas**.

A unit of computational work, entirely separate from ETH itself.

A transaction sets a `gasLimit` (the most gas it's willing to consume) and pays for the gas it actually uses at whatever the current gas price is (Concept 4 covers how that price is actually set).

If execution would exceed the limit, it reverts, but the gas already consumed up to that point is still paid, exactly the mechanism that prevents an infinite loop from running forever for free.

This is Ethereum's answer to Week 11's rent, a different problem (paying for _computation_, not _storage duration_), solved with a different mechanism entirely.

The actual charge, stripped down to its core:

```
fee_paid = gas_used × gas_price
```

- `gas_used` can never exceed `gasLimit`;
- `gas_price` is exactly what Concept 4 splits into two separately-controlled parts.

---

## 4. EIP-1559 fee model.

Since 2021, a transaction's total fee splits into two parts.

- A **base fee**, set automatically by the protocol itself based on how full the _previous_ block was (rising when blocks run over 50% full, falling when they run under) and burned entirely, permanently removed from supply rather than paid to anyone.

- A **priority fee** (a "tip"), set by the sender, paid directly to whichever validator includes the transaction.

The base fee removes most of the old first-price-auction guesswork Concept 3's simpler model required, while the priority fee is still a real, sender-chosen incentive, Medium's assignment computes both halves from real, current block data.

```
total_fee_per_gas = base_fee (burned)  +  priority_fee (paid to the validator)
actual_charge     = min(maxFeePerGas, base_fee + maxPriorityFeePerGas) × gas_used
```

A transaction sets `maxFeePerGas` as a ceiling, never a guarantee it'll actually pay that much, whatever the real `base_fee` turns out to be at inclusion time is what's actually used.

| Field                  | Set by                                                          | Where it goes                                                  |
| ---------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| `baseFeePerGas`        | The protocol, automatically, from the previous block's fullness | Burned                                                         |
| `maxPriorityFeePerGas` | The sender                                                      | The validator, as a tip                                        |
| `maxFeePerGas`         | The sender                                                      | A ceiling; `base_fee + priority_fee` is refunded back if lower |

---

## 5. Opcodes basics.

The actual instruction set Concept 2's virtual machine executes, roughly 140 of them.

Each one byte, `ADD`, `PUSH1`, `SSTORE`, `CALL` and so on, each with its own fixed gas cost (Concept 3) reflecting roughly how expensive that operation actually is to execute and verify across every node on the network, storage operations (`SSTORE`) cost dramatically more than arithmetic (`ADD`), for exactly that reason.

Hard's assignment disassembles a handful of real bytes from a real deployed contract directly against this instruction set, this week's only genuinely low-level concept and the only place raw bytecode gets touched by hand.

| Opcode   | Byte   | Roughly does             | Gas cost                 |
| -------- | ------ | ------------------------ | ------------------------ |
| `ADD`    | `0x01` | Pop 2, push their sum    | 3                        |
| `MSTORE` | `0x52` | Write 32 bytes to memory | 3                        |
| `SLOAD`  | `0x54` | Read a storage slot      | 100-2100 (cold vs. warm) |
| `SSTORE` | `0x55` | Write a storage slot     | up to 20,000             |

`SSTORE` costing thousands of times more than `ADD` isn't a rough analogy, it's the literal, published cost and it's the entire reason Week 46's gas-optimization techniques exist, minimizing storage writes specifically.

---

## 6. Bytecode & ABI.

**Bytecode** is Concept 5's opcodes, compiled and concatenated into the raw bytes actually stored at a contract's address and executed by the EVM, what `eth_getCode` (Concept 11) returns.

The **ABI** (Application Binary Interface) is a separate, human-readable JSON specification describing a contract's functions, their names, parameter types and return types, letting a client encode a function call into the specific 4-byte selector plus encoded arguments the bytecode expects to receive and decode whatever comes back.

Bytecode is what actually runs.

The ABI is the translation layer between that raw byte format and anything a person or a client library can read, Hard's assignment works with both, deliberately, to keep them from blurring into one idea.

An ABI fragment for one function looks like this:

```json
{
  "name": "transfer",
  "type": "function",
  "inputs": [
    { "name": "to", "type": "address" },
    { "name": "amount", "type": "uint256" }
  ]
}
```

Encoded into actual calldata, that same call becomes:

```
0xa9059cbb000000000000000000000000000000000000000000000000000000000000de...
  \______/ \______________________________________________________________/
  4-byte      the "to" and "amount" arguments, each padded to 32 bytes
  selector    (Keccak-256 hash of "transfer(address,uint256)", truncated)
```

The bytecode never sees `"transfer"` as a word, only that 4-byte selector, the ABI's JSON description exists purely so a client knows which selector to produce.

---

## 7. Nonces on Ethereum.

Every EOA (Concept 1) has its own nonce.

A simple incrementing counter of how many transactions it has ever sent and every new transaction must use the _next_ unused value, in strict order, no gaps, no skips.

This exists specifically to prevent transaction replay (the same signed transaction being submitted twice) and to guarantee ordering.

A sender's own transactions can never be reordered relative to each other, the exact problem Week 3's digital signatures alone don't solve on their own, a valid signature says _"I authorized this,"_ not _"I authorized this exactly once, in this position."_

```
Wallet 0xAB...: nonce 0 → tx A (sent first, mines first)
                nonce 1 → tx B (can't be mined before tx A, even if broadcast earlier)
                nonce 1 → tx C (a genuine replacement for tx B, same nonce, higher fee)
                nonce 3 → tx D (STUCK — nonce 2 was never sent, no gap allowed)
```

---

## 8. Block structure on Ethereum.

A block bundles an ordered list of transactions together with a header, the header's fields include, among others, the block number, the previous block's hash (Week 2's "block to chain" chaining, the same idea, a different chain).

The `baseFeePerGas` Concept 4 depends on, a timestamp and a `gasUsed`/`gasLimit` pair capping how much total computation the block can contain.

Easy and Medium's assignments both read real header fields directly, this is the actual shape of the data those calls return, not an abstraction over it:

```json
{
  "number": 7234891,
  "parentHash": "0x8f3a...",
  "timestamp": 1751234567,
  "baseFeePerGas": "843215602",
  "gasUsed": "4213092",
  "gasLimit": "30000000",
  "transactions": ["0x5f3g...", "0x2k9p...", "..."]
}
```

---

## 9. Ethereum client types. (execution vs. consensus layer)

Since 2022's Merge, running a full Ethereum node actually means running two separate pieces of software together:

- An **execution client** (Geth, Nethermind, Reth, and others), which runs the EVM (Concept 2) and processes transactions.

- A **consensus client** (Prysm, Lighthouse, and others), which handles proof-of-stake block proposal and finality, roughly analogous in spirit to Week 10's leader schedule, on a completely different consensus mechanism.

Every RPC call this week's assignments make (Concept 11) is served by the execution-client half specifically, the consensus layer isn't something a typical dApp client ever talks to directly.

|                      | Execution client                            | Consensus client                                |
| -------------------- | ------------------------------------------- | ----------------------------------------------- |
| Examples             | Geth, Nethermind, Reth                      | Prysm, Lighthouse, Teku                         |
| Runs                 | The EVM (Concept 2), processes transactions | Proof-of-stake voting, block proposal, finality |
| Serves               | Every `eth_*` JSON-RPC call (Concept 11)    | Not directly used by typical dApp clients       |
| Roughly analogous to | —                                           | Week 10's leader schedule, different consensus  |

---

## 10. Wei, Gwei & ETH. (unit conversion mechanics)

Every value the EVM itself actually works with, balances, gas prices, transferred amounts, is denominated in **wei**, the smallest unit.

`10^18` wei to one ETH, chosen specifically so ordinary values never need fractional amounts at the protocol level, exactly Week 17's mint `decimals` field solving the identical problem on Solana.

**Gwei** (`10^9` wei, one billionth of an ETH) is a human-convenience unit almost exclusively used for gas prices specifically, because raw wei gas prices are unwieldy to read.

Every assignment this week converts explicitly and deliberately between these units rather than leaving a raw wei figure to be misread as ETH, the single most common beginner mistake this concept exists to prevent.

| Unit | In wei                                | Typically used for                                         |
| ---- | ------------------------------------- | ---------------------------------------------------------- |
| wei  | `1`                                   | What the protocol itself actually stores and computes with |
| gwei | `1,000,000,000` (`10^9`)              | Gas prices, human-readable                                 |
| ETH  | `1,000,000,000,000,000,000` (`10^18`) | Balances, amounts, human-readable                          |

```typescript
ethers.formatEther(1500000000000000000n); // "1.5"   (wei -> ETH)
ethers.parseEther("1.5"); // 1500000000000000000n   (ETH -> wei)
ethers.formatUnits(843215602n, "gwei"); // "0.843215602"   (wei -> gwei)
```

---

## 11. JSON-RPC. (How a client actually talks to Ethereum)

Every one of this week's calls,

- `getBalance`,
- `getBlock`,
- `getCode`

is ethers.js's own wrapper around a raw **JSON-RPC** request.

A simple, textual `{"method": "eth_getBalance", "params": [...]}` POST body sent to Concept 9's execution client over HTTP (or a websocket, for subscriptions).

This is a meaningfully different client-server relationship than Week 12's `@solana/web3.js`, functionally similar in spirit (a library wrapping raw RPC calls).

But Ethereum's JSON-RPC method surface (`eth_*` methods, an actual published specification) is the direct EVM-side equivalent of Solana's own RPC methods, worth recognizing as the same _category_ of thing under a different name and shape, not an entirely foreign concept.

What `provider.getBalance(address)` actually sends over the wire:

```json
// Request
{ "jsonrpc": "2.0", "id": 1, "method": "eth_getBalance", "params": ["0xdE...", "latest"] }

// Response
{ "jsonrpc": "2.0", "id": 1, "result": "0x1bc16d674ec80000" }
```

The result comes back as a raw hex string, ethers.js's job is entirely this.

Build requests like the one above and parse hex results like `0x1bc16d674ec80000` back into a usable `BigInt` (`2000000000000000000n`, 2 ETH in wei), before your code ever sees it.

---

## 12. Comparing Ethereum's account model to Solana's.

Worth stating plainly, once both sides actually exist to compare.

- Solana's single account type (Week 11) holds arbitrary program-owned data directly and is billed rent for existing;

- Ethereum's two account types (Concept 1) split that same role, an EOA can only hold a balance and sign, a contract account holds both code and its own storage together at one address, more like a Solana program and its own accounts being fused into a single address.

- Solana's PDAs (Week 13) have no real Ethereum equivalent, a contract's storage is simply addressed by whatever the contract's own logic maps its `mapping`/`address` keys to, an internal implementation detail rather than a protocol-level derived-address primitive.

- Neither model is _"simpler,"_ they made different foundational trade-offs, worth keeping explicit while this course spends the next twenty-some weeks almost entirely on the Ethereum side of that comparison.

|                      | Solana (Weeks 10-25)                                     | Ethereum                                                                          |
| -------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Account types        | One (Week 11), owner field decides its role              | Two: EOA and Contract Account (Concept 1)                                         |
| Code and data        | Separate accounts (a program, plus the accounts it owns) | Fused at one address (a contract holds both)                                      |
| Storage shape        | Flat byte array per account                              | A `mapping`-style key-value store per contract                                    |
| Derived addresses    | PDAs (Week 13), a protocol-level primitive               | None — a contract's own logic decides how it maps keys                            |
| Paying for existence | Rent-exemption (Week 11, Concept 8), one-time            | No direct equivalent — gas (Concept 3) pays for computation, not storage duration |
| Execution model      | Sealevel, parallel (Week 10)                             | Stack-based EVM, one opcode at a time (Concept 2)                                 |
| Client RPC           | Solana's own JSON-RPC methods                            | Ethereum's `eth_*` JSON-RPC methods (Concept 11) — same category, different spec  |

---

## Assignment.

1. **Easy - EOA vs. Contract Account: Inspecting the Account Model Directly.**

   **What you practice:**
   - Fetching a real address's balance, nonce, and bytecode via JSON-RPC (Concept 7, 10, 11), and using the presence or absence of bytecode to tell an EOA from a contract account (Concept 1) programmatically, not just by reputation
   - Converting a raw wei balance into a human-readable ETH figure explicitly (Concept 10)
   - Directly observing Concept 1's hard rule: a contract account's nonce means something different from an EOA's (contract creation count, not transaction count), worth confirming with real data rather than assuming

   **Requirements:**
   - A script accepts two addresses: one known EOA (any real wallet address) and one known contract (Sepolia's WETH contract, `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`, works well, or any other verified Sepolia contract you prefer).
   - For each address, fetch and print: balance (in both wei and ETH), transaction count (`getTransactionCount`), and bytecode length in bytes (`getCode`, then report `0` for an EOA, whose code is always exactly `"0x"`).
   - Based purely on the fetched bytecode length (not a hardcoded assumption about which address is which), the script prints a clear `EOA` or `Contract Account` label for each address.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
         A real EOA (replace with any wallet address you like)
           Address: 0x0000000000000000000000000000000000dEaD
           Balance:  ... wei (... ETH)
           Nonce:    0
           Code:     0 bytes
           Kind:     EOA

         Sepolia WETH (a real, verified contract)
           Address: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
           Balance:  ... wei (... ETH)
           Nonce:    1
           Code:     ... bytes (a real, non-zero number)
           Kind:     Contract Account

   2. Command: verify by hand.

       The WETH address's Code line must show a substantial byte count
       (real deployed contracts are typically hundreds to low thousands
       of bytes), and its Kind must read "Contract Account" — confirming
       the classification came from the ACTUAL fetched bytecode length,
       not a hardcoded label.

   3. Command: replace the EOA address in ADDRESSES_TO_INSPECT with
       your own real wallet address (from any prior week, or a fresh one
       you generate for reading only), and re-run.

       Expected output: still classified "EOA," with 0 bytes of code —
       confirming the classification logic itself is address-agnostic,
       it works because it actually inspects bytecode length, not
       because the two example addresses were special-cased.

   4. Command: temporarily change `codeLengthBytes === 0` to
       `codeLengthBytes === 999999` (an unreachable condition), and
       re-run.

       Expected output: BOTH addresses are now labeled "Contract
       Account," including the EOA — confirming this one line is
       genuinely the entire mechanism distinguishing Concept 1's two
       account types in this script, not a coincidence of the example
       data chosen. Revert this change afterward.
   ```

2. **Medium - EIP-1559 Fee Mechanics: Reading Real Base Fee and Priority Fee Data.**

   **What you practice:**
   - Fetching a real, current block's `baseFeePerGas` directly (Concept 4, 8), and estimating the current network's suggested priority fee (`getFeeData`)
   - Converting gas price figures into Gwei explicitly (Concept 10), the unit real fee data is conventionally read in
   - Estimating a real transaction's total cost in ETH by combining a gas estimate (Concept 3) with Concept 4's two-part fee, entirely without ever sending anything

   **Requirements:**
   - A script fetches the latest block and prints its number, `baseFeePerGas` (in both wei and Gwei), and `gasUsed`/`gasLimit` (as a percentage, connecting directly to Concept 4's "base fee rises when blocks run over 50% full" rule).
   - The same script calls `getFeeData()` to fetch the network's current suggested `maxFeePerGas` and `maxPriorityFeePerGas`, printing both in Gwei.
   - The script estimates the gas cost of a plain ETH transfer (`21000` gas, the fixed, well-known cost of the simplest possible Ethereum transaction) and computes the total estimated fee in ETH using the fetched fee data, entirely as a read-only estimate, no transaction is ever sent.
   - The script then fetches five consecutive recent blocks and prints each one's `baseFeePerGas`, directly showing Concept 4's adjustment in action across real, consecutive blocks.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
         Latest block: 7234891
           Base fee: 843215602 wei (0.843215602 gwei)
           Fullness: 4213092 / 30000000 gas (14.0%)
           Below 50% full — base fee should FALL next block (Concept 4).

         Current suggested fee data:
           maxFeePerGas:         1.245 gwei
           maxPriorityFeePerGas: 0.1 gwei

         Estimated cost of a plain ETH transfer (21000 gas):
           ~0.0000261 ETH (an upper bound — the actual charge uses the
           real base fee at inclusion time, never more than maxFeePerGas)

         Base fee across the 5 most recent blocks (Concept 4's
         adjustment, in action):
           Block 7234891: 0.843215602 gwei
           Block 7234890: 0.891402215 gwei
           Block 7234889: 0.798113400 gwei
           Block 7234888: 0.812556710 gwei
           Block 7234887: 0.855201982 gwei

   2. Command: verify by hand.

       Compare consecutive blocks in the 5-block list: whichever
       direction each one's base fee moved should be consistent with the
       PRIOR block's fullness (a fuller-than-50% block should be
       followed by a HIGHER base fee, an emptier one by a LOWER one) —
       confirming Concept 4's rule with real, chained data, not just a
       single snapshot in isolation.

   3. Command: run the script again a minute or two later.

       Expected output: a different latest block number, and very likely
       different base fee figures throughout — confirming this is live,
       continuously-updating chain state, not a cached or fixed dataset.

   4. Command: temporarily change `PLAIN_TRANSFER_GAS` from `21000n` to
       `210000n` (10x), and re-run.

       Expected output: the estimated total fee is roughly 10x higher —
       confirming Concept 3's claim directly, total fee scales linearly
       with gas used, at a fixed price per unit, not some flat
       per-transaction charge regardless of complexity. Revert this
       change afterward.
   ```

3. **Hard - Bytecode and ABI: Disassembling Real Opcodes and Decoding Real Calldata.**

   **What you practice:**
   - Fetching a real contract's raw bytecode and manually disassembling its first several bytes into actual opcode mnemonics (Concept 5, 6), against a small, real lookup table, not a library abstraction hiding the byte-level detail
   - Using an ABI (Concept 6) to encode a function call into the exact calldata format a contract expects, and separately, decoding a real transaction's actual calldata back into a readable function name and arguments
   - Directly observing the difference Concept 6 draws: bytecode is what the EVM executes, the ABI is a completely separate description used only by clients, a contract can be called successfully by anyone with the right raw bytes, with or without ever seeing its ABI

   **Requirements:**
   - A small, hardcoded lookup table mapping a handful of common opcode bytes to their mnemonics (at minimum: `0x60` `PUSH1`, `0x80` `DUP1`, `0x52` `MSTORE`, `0x00` `STOP`, `0xf3` `RETURN`, `0xfd` `REVERT`), sourced from the real EVM opcode table, not invented.
   - A script fetches a real contract's bytecode (Sepolia WETH again works well) and disassembles the first `20` bytes by hand: walk the bytes one at a time, print each one's hex value and its mnemonic if it's in the lookup table (or `UNKNOWN (0xNN)` if not), being careful that a `PUSH1` (`0x60`) opcode consumes exactly one additional data byte immediately after it, which must be skipped, not itself interpreted as another opcode.
   - A separate part of the script builds an `ethers.Interface` from a hardcoded, standard ERC-20 ABI fragment (`transfer(address,uint256)` is enough), encodes a sample call to it (Concept 6's client-to-bytecode direction), then decodes that exact encoded calldata back into a readable function name and arguments (the reverse direction), confirming both directions round-trip correctly.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
         Fetching real bytecode from: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
         Total bytecode length: 2957 bytes

         Disassembling the first 20 bytes:
           Offset 0: 0x60  PUSH1
             (immediate data: 0x80)
           Offset 2: 0x60  PUSH1
             (immediate data: 0x40)
           Offset 4: 0x52  MSTORE
           ...

         --- ABI encode/decode round trip (Concept 6) ---

         Encoded calldata (what actually gets sent on-chain):
           0xa9059cbb000000000000000000000000000000000000000000000000000000000000de...

         Decoded back from that exact calldata:
           Function: transfer
           to:       0x00000000000000000000000000000000000000dE
           amount:   1500000000000000000 (1.5 tokens)

         Round trip matches original input: true

   2. Command: verify by hand.

       The encoded calldata's first 4 bytes (`0xa9059cbb`) are ERC-20's
       real, standard `transfer(address,uint256)` function selector,
       look it up independently if you want to confirm, this isn't
       fabricated, it's the actual Keccak-256 hash of the function
       signature, truncated to 4 bytes, exactly how every EVM client
       really identifies which function to call.

   3. Command: temporarily change the disassembly loop's PUSH1 handling
       from `i += 2` to `i += 1` (failing to skip the data byte), and
     re-run.

       Expected output: every offset after the first PUSH1 shifts by
       one, and the data byte itself (e.g. `0x80`) gets misread as if it
       were its OWN opcode, in this case coincidentally landing on
       `DUP1`, a real but entirely wrong instruction, confirming Concept
       5's point directly: bytecode has no built-in separators, correct
       disassembly depends entirely on knowing each opcode's exact
       operand length. Revert this change afterward.

   4. Command: temporarily change the decode step to call
       `iface.decodeFunctionData("transfer", encodedCalldata)` against a
       DIFFERENT, mismatched ABI (e.g. add a second function
       `"function approve(address,uint256)"` to erc20TransferAbi and
       decode using `"approve"` instead of `"transfer"` against the same
       calldata).

       Expected output: an error, or garbage/mismatched decoded values,
       since the raw calldata's function selector doesn't match what
       `approve` expects, confirming the ABI is only a client-side
       INTERPRETATION of raw bytes, not something enforced or checked by
       the bytecode itself, exactly Concept 6's distinction. Revert this
       change afterward.
   ```
