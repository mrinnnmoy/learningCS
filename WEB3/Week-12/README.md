# List of things learned.

## 1. `@solana/web3.js` basics, consolidated. (`Connection` and RPC endpoints).

> Weeks 10 and 11 already used `Connection` constantly, this section just names what you've been doing formally, before building on top of it.

A `Connection` is a client's single handle to a specific RPC endpoint, everything else, `getAccountInfo`, `getBalance`, `sendTransaction`, is a method call through that one object.

`clusterApiUrl("devnet")` (Week 10) points at Solana Labs' free, shared, public devnet RPC, fine for this course, but real production apps almost always use a dedicated RPC provider instead (Week 24 covers this properly).

Since the public endpoints are rate-limited and offer no uptime guarantee.

This week's actual point is what sits on the _other side_ of that `Connection`:

- until now, every transaction you built (Weeks 10–11) was signed by a `Keypair` you generated and held directly in a Node.js script.

This week, that changes, the signer becomes a real wallet, connected through a browser.

---

## 2. Wallet Adapter Architecture. (Why a browser can't just read `~/.config/solana/id.json`)

> Week 4 covered keystore files and password-based encryption; the Solana CLI's own wallet lives at exactly `~/.config/solana/id.json`, a raw JSON array of 64 secret-key bytes.

In a Node.js script, loading it is direct and simple:

```typescript
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Keypair } from "@solana/web3.js";

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}
```

A browser tab **cannot do this at all** and not by accident:

- browsers deliberately have no arbitrary filesystem access,
- a webpage reading any local file without you explicitly picking it via a file dialog would be a catastrophic security hole.

So a real Solana **web app** needs an entirely different answer to _"where does the signer come from"_ and that answer is a **browser extension wallet** (Phantom, Backpack, Solflare).

That holds the private key inside the extension's own sandboxed storage and injects a small API into every page you visit, letting a site _request_ signatures without ever seeing the key itself.

Most wallets today implement this injected API following a shared convention called the **Wallet Standard**, which is what lets a single app support Phantom, Backpack and Solflare simultaneously without writing separate integration code for each one.

`@solana/wallet-adapter-react` wraps all of this in React context and hooks, so your components can say _"give me whatever wallet is connected"_ without caring which extension it actually is.

This is the direct client-side equivalent of `loadLocalWallet()` above, same underlying job (produce something that can sign), completely different mechanism, because the environment (browser vs. Node) makes the local-file approach structurally impossible.

---

## 3. Provider setup. (`ConnectionProvider`, `WalletProvider`, `WalletModalProvider`)

A wallet-adapter app wraps its whole tree in three nested React providers, each with one job:

```tsx
<ConnectionProvider endpoint={clusterApiUrl("devnet")}>
  <WalletProvider wallets={[]} autoConnect>
    <WalletModalProvider>{/* your app */}</WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
```

- **`ConnectionProvider`** holds the single shared `Connection` (Concept 1) every component below it can access via `useConnection()`.

- **`WalletProvider`** tracks connection state (connected/connecting/disconnected, which wallet, its public key) and exposes it via `useWallet()`.

  The `wallets={[]}` isn't a placeholder waiting to be filled in, Wallet Standard-compliant wallets (Concept 2) register themselves automatically, so nothing needs to be listed here by hand for Phantom, Backpack, or Solflare to show up.

- **`WalletModalProvider`** supplies the actual "choose a wallet" popup UI, along with the `WalletMultiButton` component this week's Easy assignment uses directly.

---

## 4. Connecting a wallet in the UI. (`useWallet()` and connection state)

`useWallet()` is the hook every component uses to read the current connection state and act on it:

```tsx
const { publicKey, connected, connecting, disconnect } = useWallet();
```

`publicKey` is `PublicKey | null`, `null` until a wallet is actually connected, which is why every one of this week's components checks it before doing anything that needs a real address.

`<WalletMultiButton />` (from `@solana/wallet-adapter-react-ui`) is a complete, pre-built button that opens the connect modal, shows the connected address once connected and offers a disconnect option, you don't have to build this UI by hand, though understanding what it's doing under the hood (calling into `useWallet()`'s `select`/`connect` methods) is exactly what this concept covers.

---

## 5. Requesting signatures. (`signMessage` vs. `signTransaction` vs. `sendTransaction`)

> Week 4, Concept 6 drew a hard line between signing a message (proves identity, nothing moves) and signing a transaction (authorizes a real state change).

Wallet adapter exposes this as three genuinely separate capabilities on `useWallet()`'s return value and not every wallet implements all three:

```
signMessage(message: Uint8Array)            -> Promise<Uint8Array>

  Week 4's "sign a message" case. Proves you control this address.
  Nothing is broadcast anywhere. This week's Medium assignment.


signTransaction(transaction)                -> Promise<Transaction>

  Signs a transaction WITHOUT sending it — useful when you need the
  signed bytes yourself (e.g. to hand off to a backend to broadcast).


sendTransaction(transaction, connection)    -> Promise<TransactionSignature>

  Signs AND broadcasts in one call — the most common case, and what
  this week's Hard assignment uses.
```

Because not every wallet supports every capability, real code feature-detects rather than assuming: `const { signMessage } = useWallet();` can come back `undefined` and this week's Medium assignment checks for exactly that before calling it.

---

## 6. Sending transactions from the client and reading account data back afterward.

Building a transaction client-side uses the exact same `@solana/web3.js` pieces Week 10's Hard assignment used from Node,

- `SystemProgram.transfer`,
- `TransactionMessage`,
- `compileToV0Message()`.

Only now `payerKey` is the connected wallet's real `publicKey` (Concept 4) and the actual signing happens inside `sendTransaction`, which internally asks the browser extension to show its approval popup, rather than calling `.sign()` on a `Keypair` you're holding directly.

Once a transaction is confirmed, _"reading account data client-side"_ (Week 11's `getAccountInfo`/`getBalance`, unchanged) is how a UI actually reflects the result, re-fetching a balance after a send is what makes a wallet app feel alive rather than static.

This week's Hard assignment does exactly this. Send, confirm, then re-fetch and display the updated balance.

---

## 7. Handling transaction confirmation, client-side.

The confirmation strategy is identical to the one Week 10's Hard assignment landed on after fixing the deprecated overload, `{ signature, blockhash, lastValidBlockHeight }`, still the correct, non-deprecated pattern here.

What's genuinely new is the **UI state** around it?

A real app needs to represent _"building,"_ _"awaiting your approval in the wallet popup,"_ _"broadcast, awaiting confirmation"_ and _"confirmed"_ (or _"failed"_) as distinct states a user can actually see, rather than a script that just blocks until `await` resolves and prints one line at the end.

This week's Hard assignment tracks exactly these states in a single `status` string, updated at each stage.

---

## 8. Error handling. (Simulation failures & why this week never calls `requestAirdrop`)

> Week 10 already used `simulateTransaction` to preview compute units before deciding to send.

Client-side, simulation earns a second, sharper purpose:

- **catching a doomed transaction before ever bothering the user with a wallet approval popup.**

Asking someone to approve a transaction that's certain to fail (insufficient funds, an invalid instruction) is a bad experience for no reason, simulate first and only proceed to `sendTransaction` if the simulation itself reports no error.

This week's Hard assignment does exactly this, and its Manual Test Cases include deliberately forcing a simulation failure to confirm the wallet popup never even appears in that case.

One closing note on funding:

- real dApps essentially never call `requestAirdrop` programmatically at all,
- faucets are a devnet-only convenience,
- rate-limited and shared across everyone using them (Week 10) and
- auto-requesting on every page load would be both antisocial and unreliable.

> This week's assignments follow that same real-world pattern, every signer is whatever wallet you personally connect, already holding whatever devnet SOL you funded it with yourself, once, outside of any code here, exactly as a real user's wallet would arrive already funded before ever visiting your site.

---

## Assignment.

1. **Easy - Connect & Display: `WalletMultiButton` and a Live Balance.**

   **What you practice:**
   - Wiring up the three nested providers (`ConnectionProvider`, `WalletProvider`, `WalletModalProvider`) that every wallet-adapter app needs
   - Using `useWallet()` and `useConnection()` together to read connection state and fetch live account data (Week 11) once a wallet is actually connected
   - Handling the `publicKey: PublicKey | null` nullability correctly, both in the UI and inside a `useEffect`, without ever asserting past it

   **Requirements:**
   - Wraps the app in `ConnectionProvider` (pointed at `clusterApiUrl("devnet")`), `WalletProvider` (with an empty `wallets` array and `autoConnect`), and `WalletModalProvider`.
   - Renders `<WalletMultiButton />` from `@solana/wallet-adapter-react-ui`, including its default stylesheet.
   - While no wallet is connected, displays "No wallet connected yet." and nothing else.
   - Once connected, displays the connected wallet's full base58 address and its live SOL balance, refetched whenever the connected `publicKey` changes.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npm run dev, open the printed localhost URL in a
       browser, before clicking anything.

       Expected: the page shows "Week 12 — Wallet Connect & Display",
       a "Select Wallet" button, and, directly beneath it, exactly the
       text "No wallet connected yet." and nothing else.

   2. Command: click "Select Wallet", choose your installed wallet, and
       approve the connection request in its popup.

       Expected: the button's label changes to show your wallet's
       truncated address. Beneath it, "No wallet connected yet." is
       replaced with your full base58 address and a SOL balance.

   3. Command: open your wallet extension directly (outside the
       browser tab) and note the SOL balance it displays on Devnet.

       Expected: it matches the balance shown on the page (allowing for
       normal floating-point display rounding) — confirming the page is
       reading real, live account data (Week 11), not placeholder values.

   4. Command: click the wallet button again and choose "Disconnect".

       Expected: the page reverts to showing "No wallet connected yet.",
       confirming BalanceDisplay correctly reacts to publicKey becoming
       null again, not just to it first becoming non-null.

   5. Command: temporarily change `const [balance, setBalance] =
       useState<number | null>(null);` to `useState<number>(null)`
       (dropping the `| null` from the type parameter, leaving the
       initial value as null), then run npm run build.

       Expected output: a type error, reporting that null isn't
       assignable to a plain number — confirming the nullable balance
       state is being genuinely type-checked, not just working by luck.

       Revert this change afterward.
   ```

2. **Medium - Requesting a Signature: Sign & Verify a Message.**

   **What you practice:**
   - Calling `signMessage`, the Week 4/Concept 5 "sign a message, nothing moves" case, through a real connected wallet
   - Feature-detecting a capability that not every wallet implements, rather than assuming `signMessage` always exists
   - Verifying an Ed25519 signature (Week 3, Concepts 4–5) client-side with `tweetnacl`, closing the loop between this course's cryptography theory and a real wallet's actual signing algorithm

   **Requirements:**
   - Renders a text input (pre-filled with a default message) and a "Sign Message" button, alongside the same wallet connection UI from Easy.
   - On click, if no wallet is connected or the connected wallet doesn't expose `signMessage`, displays a clear message saying so and does nothing else.
   - Otherwise, encodes the input text as UTF-8 bytes, calls `signMessage` on it, and verifies the returned signature client-side using `tweetnacl`'s `nacl.sign.detached.verify`, against the connected wallet's own public key bytes.
   - Displays both the signature (base58-encoded, via `bs58`, not `Buffer`, since `Buffer` isn't available in a browser without a polyfill) and the boolean verification result.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npm run dev, open the app, click "Sign Message" WITHOUT
       connecting a wallet first.

       Expected: the page immediately shows "Connect a wallet that
       supports message signing first." — no popup ever appears, since
       the code checks for both publicKey and signMessage before calling
       anything.

   2. Command: connect your wallet, then click "Sign Message" with the
       default text still in the input.

       Expected: your wallet extension shows a message-signing approval
       popup (visually distinct from a transaction-approval popup, per
       Week 4, Concept 6). After approving, the page displays a base58
       signature string and "Verified client-side with tweetnacl: true".

   3. Command: verify the invariant by hand.

       The verification MUST read true — this is the actual point of the
       assignment: the signature nacl.sign.detached.verify checks is the
       real one your wallet just produced over the real bytes you saw on
       screen, not a canned or placeholder value.

   4. Command: apply How to Build Step 6 (change the input text, sign
       again).

       Expected: a completely different base58 signature string than
       Test 2 produced, still verifying as true — confirming the
       signature is genuinely a function of the exact message bytes, not
       something reused or cached from the first signature.

   5. Command: temporarily change `nacl.sign.detached.verify(encodedMessage,
       signature, publicKey.toBytes())` to pass `message` (the raw string)
       instead of `encodedMessage` (the encoded Uint8Array) as the first
       argument, then run npm run build.

       Expected output: a type error, reporting that a string isn't
       assignable to nacl.sign.detached.verify's expected Uint8Array
       parameter — confirming tweetnacl's own types catch the mistake
       of verifying against the wrong (unencoded) value before you'd
       ever get a confusing "verified: false" at runtime instead. Revert
       this change afterward.
   ```

3. **Hard - Build, Simulate, Send & Confirm, with Simulation-First Error Handling.**

   **What you practice:**
   - Building a real transaction client-side and sending it through `sendTransaction` from `useWallet()`, rather than signing directly against a `Keypair`
   - Simulating a transaction **before** requesting a wallet approval, specifically to catch a doomed transaction without ever showing the user a popup for it, Concept 8's central point
   - Tracking multi-stage UI state (building → simulating → awaiting approval → confirming → confirmed/failed) instead of a single blocking script that only prints a result at the end
   - Reading account data back (Week 11) after a confirmed send, to reflect the real, updated on-chain state in the UI

   **Requirements:**
   - Builds a `SystemProgram.transfer` instruction sending 1000 lamports from the connected wallet **to itself** (so the assignment never depends on a second funded party, and never touches the devnet faucet).
   - Compiles the instruction into a `v0` message using a freshly-fetched blockhash, and calls `connection.simulateTransaction` on the **unsigned** transaction before ever calling `sendTransaction`.
   - If the simulation reports an error, displays it and stops, `sendTransaction` (and therefore any wallet popup) must never be called in that case.
   - If the simulation succeeds, calls `sendTransaction`, then confirms the result using the object-based `{ signature, blockhash, lastValidBlockHeight }` strategy (Week 10), updating a visible status string at every stage along the way.
   - After confirmation, re-fetches and displays the connected wallet's updated SOL balance.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npm run dev, connect a wallet holding some devnet SOL,
       click "Send 1000 lamports to myself."

       Expected: the status line moves through, in order: "Building
       transaction...", "Simulating...", "Simulation succeeded (N
       compute units). Requesting your approval...", then your wallet
       shows a transaction approval popup. After approving: "Sent.
       Confirming <signature>...", then finally "Confirmed: <signature>",
       with the balance line updating to a real number afterward.

   2. Command: verify the invariant by hand.

       The balance after should be lower than before by roughly 0.000005
       SOL (5000 lamports, Week 10's observed base fee) — NOT by 1000
       lamports plus the fee, since the 1000 lamports were sent to your
       own address and therefore net out to zero actual transfer, only
       the fee is a genuine loss.

   3. Command: without connecting any wallet, observe the button.

       Expected: the button is disabled (greyed out, unclickable),
       confirming the `disabled={!publicKey}` guard, no click handler
       logic even needs to run to prevent this case.

   4. Command: temporarily change `lamports: 1000` to
       `lamports: 999_999_999_999_999` (999 trillion lamports — far more
       than any devnet wallet holds), then click the send button again.

       Expected: the status stops at a "Simulation failed, nothing was
       sent: ..." message describing an insufficient-funds-style error —
       and, critically, no wallet approval popup appears at all. This is
       Concept 8's actual point, made directly observable: a transaction
       guaranteed to fail never reaches the point of asking for your
       signature. Revert this change afterward.

   5. Command: temporarily change `async function refreshBalance(owner:
       PublicKey)` to `async function refreshBalance(owner: string)`,
       leaving its call site (`refreshBalance(publicKey)`) unchanged,
       then run npm run build.

       Expected output: a type error at the refreshBalance(publicKey)
       call site, reporting that a PublicKey isn't assignable to a
       string parameter — confirming the function's parameter type is
       actually checked against how it's really called, not just
       declared and ignored. Revert this change afterward.
   ```
