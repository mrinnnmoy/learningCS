# IBC vs. This Course's Own Bridges

This comparison uses the actual bridge implementations built earlier in the course:

- **Week 36:** `bridge-medium/src/MultisigBridge.sol`
- **Week 37:** `bridge-relayer/src/relayer.ts`

The important difference is not simply that IBC is "more secure" or "more trustless." The difference is specifically **what the destination chain verifies before accepting a cross-chain message and where the trust is placed**.

---

## Where IBC sits on Week 36's own trust spectrum, specifically

Week 36, Concept 5's trust spectrum had three rows:

1. **Single trusted relayer**
2. **M-of-N multisig relayer set**
3. **Light-client verification**

IBC belongs specifically in the **light-client verification** row.

The reason is that IBC does not ask the destination chain to simply trust that one relayer, or a threshold of relayers, correctly observed an event on the source chain. Instead, an IBC-enabled chain maintains verification logic for the consensus state of the other chain and verifies cryptographic proofs against that trusted client state.

This matches Week 36's **light-client verification** row because the destination chain verifies evidence about the source chain's state instead of treating signatures from a separate relayer set as the final proof.

A relayer can still transport IBC packets and proofs between chains, but the relayer is not the party that determines whether the message is true. The destination chain checks the proof itself using its light-client machinery.

This is structurally different from both of the other rows in Week 36's spectrum:

- With a **single trusted relayer**, the destination chain accepts the relayer's claim because it trusts that relayer.
- With an **M-of-N multisig relayer set**, the destination chain accepts the claim after enough trusted relayers have signed it.
- With **light-client verification**, the destination chain verifies cryptographic evidence about the source chain's consensus and state itself.

Therefore, IBC's security model belongs in the **light-client verification** row, not the multisig row. IBC does not become secure because many relayers agree; its core design is that a relayer supplies proofs which the destination chain can independently verify.

---

## How Week 36's `MultisigBridge.sol` differs from IBC

Week 36's `MultisigBridge.sol` is explicitly an **M-of-N multisig relayer set** design.

The contract stores a fixed set of trusted relayer addresses:

```solidity
address[] public relayers;
uint256 public immutable threshold;
```

When a cross-chain mint is requested, `mintWithSignatures` reconstructs a message hash from:

- `recipient`
- `amount`
- `nonce`
- `block.chainid`
- `address(this)`

It then recovers the signer for every submitted signature:

```solidity
address signer = ECDSA.recover(ethSignedHash, signatures[i]);
```

The contract checks that every recovered signer belongs to the registered `relayers` array through `_isRelayer`, rejects duplicate signers, and requires at least `threshold` valid signatures.

The critical security check is:

```solidity
if (validCount < threshold) revert InsufficientSignatures();
```

This means the destination chain does not independently verify that a real burn or lock actually happened on the source chain.

Instead, it verifies only that enough addresses from the trusted `relayers` array signed a message claiming that the transfer should be minted.

The multisig model improves on a single relayer because one compromised or malicious relayer is not enough when the threshold requires multiple independent signatures. However, the trust assumption is still fundamentally about the honesty and security of the fixed relayer set.

IBC changes this assumption. Under IBC, the destination chain is not satisfied merely because a threshold of off-chain operators signed a message. It verifies a proof against a light client representing the source chain's consensus state.

---

## What Week 37's own `relayer.ts` would still need to do under real IBC

Week 37's relayer is a real off-chain process that watches Chain A and performs an action on Chain B.

The central function is:

```typescript
async function pollForLockedEvents();
```

It performs the following steps:

1. Reads Chain A's current block number.
2. Calculates a safer block:

```typescript
const safeBlock = currentBlock - CONFIRMATIONS_REQUIRED;
```

3. Uses:

```typescript
const CONFIRMATIONS_REQUIRED = 3;
```

as a deliberate confirmation margin before treating `Locked` events as sufficiently confirmed. 4. Searches for `Locked` events with:

```typescript
lockBox.queryFilter(
  lockBox.filters.Locked(),
  lastProcessedBlock + 1,
  safeBlock,
);
```

5. Extracts:

- `user`
- `amount`
- `nonce`

from each event. 6. Uses a real private key through:

```typescript
const relayerWalletB = new ethers.Wallet(RELAYER_PRIVATE_KEY, providerB);
```

7. Submits a transaction on Chain B:

```typescript
const tx = await wrappedToken.mint(user, amount, nonce);
```

Under a real IBC connection, there would still be a real off-chain process analogous to this relayer.

IBC does not eliminate the need for packet transport between chains. A process still needs to observe information on one chain and submit the relevant packet and proof to the other chain.

Therefore, a process analogous to Week 37's `pollForLockedEvents` would still need to:

- monitor the source chain for the relevant IBC state transition,
- wait until the event or state is sufficiently finalized according to the chains' consensus and client rules,
- obtain the required cryptographic proof,
- submit the IBC packet, acknowledgement, or proof to the destination chain, and
- pay for the destination-chain transaction that carries the relay operation.

The important change is **what the relayer is trusted to prove**.

In Week 37's implementation, the relayer is trusted because its transaction directly calls:

```typescript
wrappedToken.mint(user, amount, nonce);
```

The destination-side contract accepts the transaction based on the authority of the relayer wallet and the destination contract's authorization rules.

The relayer's private key is therefore part of the bridge's trust boundary. If the relayer can mint and its key is compromised, the bridge's security can be compromised.

Under IBC, the relayer would still submit transactions, but it would no longer be the final authority for whether a cross-chain event actually happened.

Instead of the destination chain effectively accepting:

> "This relayer says the source-chain event happened."

the relayer would submit something closer to:

> "Here is a cryptographic proof of the source-chain state; verify it against your light client."

The destination chain's verification logic would then determine whether the proof is valid.

This means an IBC relayer is still operationally important for liveness and packet delivery, but it is much less trusted for correctness. A malicious relayer should not be able to create an arbitrary valid cross-chain transfer merely by signing or submitting a transaction.

---

## `pollForLockedEvents` and `CONFIRMATIONS_REQUIRED` under IBC

Week 37's relayer explicitly uses:

```typescript
const CONFIRMATIONS_REQUIRED = 3;
```

and computes:

```typescript
const safeBlock = currentBlock - CONFIRMATIONS_REQUIRED;
```

before processing events.

The purpose is to reduce the risk of acting on an event that may later disappear because of a chain reorganization.

A real IBC relayer would still need to respect the source chain's finality and consensus rules before relaying information. However, the exact mechanism would no longer simply be the course's manually chosen:

```typescript
CONFIRMATIONS_REQUIRED = 3;
```

Instead, the relayer and IBC client logic would work with the source chain's actual commitment, finality, and light-client verification model.

Therefore, the basic safety idea behind Week 37's confirmation margin still exists: **do not relay state before it is sufficiently trustworthy**.

What changes is that IBC provides a standardized protocol for verifying the resulting state. The destination chain does not ultimately trust the relayer's own judgment that three confirmations are enough. It verifies proofs against the light client's accepted view of the source chain.

---

## What Week 36's `MultisigBridge.sol` would need to change to approach IBC's guarantees

Week 36's `MultisigBridge.sol` currently trusts a fixed and small set of registered addresses:

```solidity
address[] public relayers;
```

and accepts a cross-chain message when enough of them sign it:

```solidity
if (validCount < threshold) revert InsufficientSignatures();
```

To approach IBC-style guarantees, replacing or expanding this design would require a major architectural change.

The bridge would need a **light-client verifier contract or equivalent on-chain verification mechanism**.

Instead of accepting:

```text
recipient + amount + nonce + signatures
```

as proof that a source-chain event happened, the destination-side bridge would need to verify evidence about the source chain itself.

At a high level, it would need:

1. **A light client for the source chain**

   The destination chain would need verified information about the source chain's consensus state, including trusted or updated commitments representing accepted source-chain state.

2. **Consensus verification logic**

   The contract or protocol would need logic capable of verifying that a claimed source-chain state is consistent with the source chain's consensus and validator rules.

3. **Cryptographic state proofs**

   A relayer would need to provide a proof that the relevant packet, message, commitment, or state existed on the source chain.

4. **Verification against the light client's stored state**

   The bridge would need to check that the submitted proof matches a state root or other commitment accepted by the light client.

5. **Replay protection for verified packets**

   The existing contract already contains a useful form of replay protection:

   ```solidity
   mapping(bytes32 => bool) public processedMessages;
   ```

   However, in an IBC-style design, the message identity and replay rules would be tied to verified packet commitments and protocol state rather than only a locally reconstructed message hash plus relayer signatures.

6. **Removal of the fixed relayer set as the correctness authority**

   The current:

   ```solidity
   address[] public relayers;
   ```

   and signature threshold would no longer be the fundamental proof that a cross-chain event occurred.

   Relayers could still submit proofs and transactions, but their membership in a fixed trusted set would not be what makes the transfer valid.

The most important missing piece in the current `MultisigBridge.sol` is therefore **a light-client verifier capable of verifying cryptographic proofs about the source chain's consensus-backed state**.

Without that component, replacing `threshold` with a larger number or adding more relayers would still leave the bridge in the M-of-N multisig row of Week 36's trust spectrum.

---

## The trust boundary: signatures versus proofs

The central difference can be stated directly:

### Week 36 `MultisigBridge.sol`

The bridge asks:

> Did enough addresses from the trusted `relayers` array sign this message?

If the answer is yes, the bridge mints.

### IBC-style light-client verification

The destination chain asks:

> Does this cryptographic proof demonstrate, according to the verified consensus state of the source chain, that this packet or state commitment exists?

If the proof verifies, the protocol processes the packet.

This is the structural reason IBC belongs in Week 36's **light-client verification** row.

The difference is not merely that IBC uses more cryptography. The difference is that cryptographic verification replaces the relayer set as the primary source of truth for whether the source-chain event actually occurred.

---

## Week 37's relayer private key under IBC

In the Week 37 implementation, the relayer is constructed with:

```typescript
const relayerWalletB = new ethers.Wallet(RELAYER_PRIVATE_KEY, providerB);
```

The private key authorizes the relayer to submit the destination-chain transaction that calls `wrappedToken.mint`.

This means the private key is closely connected to the correctness and security model of the custom bridge.

Under IBC, an off-chain relayer would still normally need an account and private key to pay for and submit transactions on the destination chain.

However, the private key would not itself be proof that a cross-chain transfer is valid.

The relayer's transaction would carry verifiable protocol data and proofs. The destination chain would check those proofs against its light client.

Therefore:

- **Week 37:** the relayer's authority is part of why the mint is accepted.
- **IBC:** the relayer's transaction provides transport and liveness, while cryptographic proof verification provides correctness.

This is a major separation between the roles of **message delivery** and **message truth**.

---

## Based rollups and IBC: a real structural similarity

Week 43, Concept 9's based-rollup idea of **"no separate sequencer, use L1's own validators directly"** shares a real structural similarity with IBC's **"verify the other chain directly rather than trusting a separate relayer set"** idea.

In both cases, a separate group of intermediaries is removed from the core correctness assumption: a based rollup relies on the L1's existing validator or proposer set rather than a separate sequencer, while IBC relies on consensus verification through light clients rather than trusting a separate relayer set to tell the destination chain what happened.

However, they solve different problems. A based rollup concerns who orders and proposes rollup blocks, while IBC concerns how one chain verifies another chain's state. The structural similarity is therefore real—both reduce reliance on a separate intermediary set for correctness—but they are not the same mechanism.
