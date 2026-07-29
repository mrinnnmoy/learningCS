# List of things learned.

## 1. Basics of `ethers.js` vs. `viem`.

This course has used `ethers` since Week 26's very first read-only provider and every browser-side assignment this week continues with it.

But `viem`, a newer, increasingly popular alternative, is worth recognizing on sight even without building with it directly this week, the same "overview, not hands-on" treatment Week 29, Concept 3 gave ERC-1155.

|                      | `ethers`                                                              | `viem`                                                                      |
| -------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| API style            | Class-based (`Contract`, `Provider`, `Signer` instances)              | Functional (`createPublicClient`, `readContract`, plain functions)          |
| TypeScript inference | Good, added on top of a JS-first design                               | Excellent, designed TypeScript-first from the start                         |
| Bundle size          | Larger                                                                | Smaller, more aggressively tree-shakeable                                   |
| Maturity / ecosystem | Older, extremely widely used, most tutorials and existing code use it | Newer, growing fast, the default choice in several modern scaffolding tools |

Both wrap the identical underlying JSON-RPC methods (Week 26, Concept 11) and the identical browser wallet interface (Concept 10, added material below).

Picking one over the other is a real, legitimate preference, not a correctness question and a project can migrate between them without changing what it's actually capable of doing.

---

## 2. Provider & signer concepts. (now in the browser)

Every previous week's own scripts already used a **provider**, a read-only connection to a network (`JsonRpcProvider`, Week 26 onward).

This week adds the browser-specific kind, `BrowserProvider`, which wraps whatever wallet extension is installed (Concept 10) instead of a plain RPC URL.

A **signer**, something capable of actually producing a valid signature over a transaction, has looked different every place this course has used one so far:

- A raw private key flag (`--private-key`, Week 27 onward),
- an encrypted local keystore (`--account`, Week 27's Hard onward),
- a Hardhat keystore (Week 30).

This week's signer is different again and closes the loop on why all of those existed:

- `browserProvider.getSigner()` returns an object that,
- when asked to sign,
- triggers a real MetaMask popup and
- waits for an actual human to click "Confirm".

The private key itself never enters this course's own code at all, for the first time since Week 27 first touched a real key.

```typescript
import { BrowserProvider, JsonRpcProvider } from "ethers";

const readOnlyProvider = new JsonRpcProvider("http://127.0.0.1:8545"); // exactly Week 27's own pattern

const browserProvider = new BrowserProvider(window.ethereum); // NEW this week — wraps MetaMask
const signer = await browserProvider.getSigner(); // triggers a real wallet popup
```

---

## 3. Connecting MetaMask & WalletConnect.

MetaMask (and every other browser wallet extension) injects a single object, `window.ethereum`, implementing the EIP-1193 standard (Concept 10 covers its actual shape).

`browserProvider.send("eth_requestAccounts", [])` is what triggers the familiar "Connect" popup, asking the user to pick which account(s), if any, to share with the page.

```typescript
async function connectWallet() {
  const browserProvider = new BrowserProvider(window.ethereum);
  const accounts = await browserProvider.send("eth_requestAccounts", []);
  return accounts[0]; // the address the user chose to connect
}
```

**WalletConnect** solves a different, related problem.

Connecting a wallet that _isn't_ a browser extension at all, a mobile app, most commonly, via a QR code the mobile wallet scans, then relaying signing requests over its own protocol rather than `window.ethereum`.

This week's own assignments stay MetaMask-only, since a WalletConnect integration needs its own separate SDK and a mobile device to actually test against.

Worth knowing exists and roughly how it differs (a relayed connection vs. an injected browser object), not built hands-on this week for exactly that reason.

---

## 4. Reading contract state, client-side.

An `ethers.Contract` bound to a plain provider (no signer at all) can call any `view`/`pure` function (Week 27, Concept 12) for free, no wallet connection, no popup, no gas.

Exactly what a page's own initial "here's the current state" display should use, before the user has even connected a wallet.

```typescript
import { Contract } from "ethers";
import { COUNTER_ADDRESS, COUNTER_ABI } from "./counter";

const readOnlyCounter = new Contract(
  COUNTER_ADDRESS,
  COUNTER_ABI,
  readOnlyProvider,
);
const count = await readOnlyCounter.getCount(); // no wallet needed at all — Concept 2's read-only provider
```

The ABI here is the identical artifact Week 26, Concept 6 first introduced, exactly what `forge build`/`hardhat compile` (Weeks 27, 30) already produce.

This week's own assignments copy it directly out of a project's own `out/`/`artifacts/` folder rather than retyping it by hand.

---

## 5. Sending transactions, client-side.

The same `Contract` object, bound to a _signer_ (Concept 2) instead of a plain provider, turns a state-changing call into a real transaction.

Calling it doesn't execute anything itself, it triggers MetaMask's own confirmation popup, showing the user the function, its arguments and an estimated cost (Concept 9) and only actually broadcasts once they click "Confirm."

```typescript
const writableCounter = new Contract(COUNTER_ADDRESS, COUNTER_ABI, signer);

const tx = await writableCounter.increment(); // ← MetaMask popup appears here, this line awaits the user's click
console.log("Submitted:", tx.hash); // a TransactionResponse — SENT, not yet confirmed (Concept 7)
```

This is the exact moment every previous week's own `--private-key`/`--account`/keystore flag was standing in for, all along, on a script's behalf. Concept 11 (added material) makes the contrast explicit.

---

## 6. Listening to contract events, client-side.

`contract.on("EventName", callback)` subscribes to a live event stream (Week 28, Concept 6's own event mechanism), the callback firing every time a matching event is mined.

Genuinely useful for a small UI needing to react live (updating a displayed count the instant someone else's transaction changes it) and genuinely different in scale and purpose from Week 24's real indexing infrastructure.

A page-level listener like this only sees events from the moment it starts listening onward, holds no historical record and stops the instant the tab closes.

Exactly right for "keep this one open page in sync," entirely wrong for "give me every event that's ever happened," which is what Week 24's own indexers exist for.

```typescript
readOnlyCounter.on("CountIncreased", (by: string, newCount: bigint) => {
  console.log(`CountIncreased: by=${by}, newCount=${newCount}`);
  refreshDisplayedCount();
});
```

---

## 7. Handling transaction receipts.

`tx.wait()` (Concept 5's `tx`) pauses until the transaction is actually mined, then returns a `TransactionReceipt`.

The genuinely load-bearing field on it is `status`,

- `1` for success,
- `0` for a mined-but-reverted transaction.

(A real, distinct outcome from Week 27, Concept 10's revert, which prevents mining a _successful_ state change but still costs gas and still produces a receipt).

```typescript
const receipt = await tx.wait();
if (receipt!.status === 1) {
  console.log(
    `Success, block ${receipt!.blockNumber}, gas used: ${receipt!.gasUsed}`,
  );
} else {
  console.log("Transaction was mined but reverted on-chain");
}
```

A receipt's own `logs` array holds every event the transaction emitted, in raw form (Week 26, Concept 6's ABI-encoded shape).

`contract.interface.parseLog(...)` turns a raw log back into the same typed, named event Concept 6's live listener already receives, useful specifically for reading events out of a receipt the user's own transaction just produced, rather than waiting on a separate live subscription to notice it.

---

## 8. Chain switching & Network detection.

A connected wallet can be pointed at any network at all, not necessarily the one a page's own contract is actually deployed to.

Checking `eth_chainId` before letting a user attempt a transaction and prompting a switch if it doesn't match, is standard, expected dapp behavior, not an edge case to skip.

```typescript
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111, hex — chain IDs travel as hex strings over EIP-1193

async function ensureSepolia() {
  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });
  if (currentChainId === SEPOLIA_CHAIN_ID) return true;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    return true;
  } catch (err: any) {
    if (err.code === 4902) {
      // the specific, standard code for "wallet doesn't know this chain yet"
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID,
            chainName: "Sepolia",
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
      return true;
    }
    return false;
  }
}
```

`window.ethereum.on("chainChanged", ...)` and `.on("accountsChanged", ...)` fire whenever the user switches networks or accounts from inside their wallet directly, not through the page at all.

The standard, correct response to either is simply reloading the page's own state (often literally `window.location.reload()`), since silently continuing to act on stale chain/account assumptions is exactly the kind of mismatch that leads to a confusing, wrong transaction.

---

## 9. Gas estimation, client-side.

Before actually sending a transaction (Concept 5), `contract.functionName.estimateGas(...)` simulates the call against current state and returns how much gas it would need.

Genuinely useful two ways:

- showing the user an honest cost estimate before they click "Confirm," and
- more importantly, catching a transaction that would revert _before_ ever prompting the wallet at all.

Since a call that would fail generally throws right here instead of returning a number.

```typescript
try {
  const estimatedGas = await writableCounter.incrementBy.estimateGas(5);
  console.log("Estimated gas:", estimatedGas);
} catch (err: any) {
  console.log("This call would revert:", err.shortMessage ?? err.message);
  // never even calls writableCounter.incrementBy(5) here — no point prompting MetaMask for a guaranteed failure
}
```

This is the browser-side counterpart to Week 27, Concept 13's custom errors and Week 28's `vm.expectRevert`.

The same underlying revert reason, surfaced here through a caught JavaScript exception's own message rather than a Solidity test assertion, since this is the layer real users actually see it at.

---

## 10. The EIP-1193 provider interface. (what `window.ethereum` actually is)

Every wallet extension this course has mentioned, MetaMask and any other, injects the identical shape into a page's own `window` object:

- one method,
- `request({ method, params })`,
- returning a Promise.

Genuinely the entire interface, everything else (`ethers`' `BrowserProvider`, `viem`'s custom transport, Concept 1's whole comparison) is a convenience layer built on top of this one standardized method.

```typescript
// What ethers' BrowserProvider is actually doing underneath, every time:
const accounts = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const chainId = await window.ethereum.request({
  method: "eth_chainId",
  params: [],
});
```

This is exactly why a page can call `browserProvider.send("eth_requestAccounts", [])` (Concept 3) without knowing or caring whether the user has MetaMask, Coinbase Wallet, Brave's built-in wallet or anything else installed.

Every one of them implements this identical, standardized surface, the same "shared interface, many implementations" idea Week 29, Concept 1 introduced for ERC-20, now at the level of the wallet itself rather than a token contract.

---

## 11. Client-side key safety. (why the signer never holds a real private key here)

Every previous week that needed a real signature,

- Foundry's `--private-key`/`--account` (Week 27 onward),
- Hardhat's keystore (Week 30),

ran entirely on your own machine, in a terminal only you could see, code that never left your own filesystem.

Browser JavaScript is fundamentally different and worth stating plainly rather than assuming it's obvious.

Anything shipped to a page is downloadable and readable by anyone who visits it, full stop, no exceptions for "obfuscated" or "minified."

This is the entire reason Concept 2's browser signer works the way it does.

`browserProvider.getSigner()` never receives, holds, or even has access to a private key at all, it only ever sends a _request_ to the wallet extension (Concept 10) to sign something and the extension, running in its own separate, isolated context the page's own JavaScript cannot read, is the only thing that ever touches the real key, guarded behind its own password and the user's own explicit, per-transaction click.

Constructing `new Wallet(realPrivateKey)` (the same `Wallet` class Week 26's own scripts have used, fine there) directly inside browser code that ships to real users is a genuine, serious vulnerability, not a shortcut.

This week's own assignments never do it, on purpose, as the actual point of the whole wallet-adapter model rather than an incidental detail.

---

## Assignment.

1. **Easy - Reading and Writing to a Local Counter Through MetaMask.**

   **What you practice:**
   - A read-only provider displaying state with no wallet connected at all (Concept 4)
   - Connecting MetaMask and obtaining a real browser signer (Concepts 2, 3)
   - Sending a real, MetaMask-confirmed transaction and awaiting its receipt (Concepts 5, 7)
   - A live event listener keeping the displayed count in sync (Concept 6)

   **Requirements:**
   - Reuse Week 27's `Counter` contract, deployed fresh to `anvil` for this assignment.
   - A minimal page (`index.html` + `src/main.ts`) showing the current count (read via Concept 4, no wallet needed to see it), a "Connect Wallet" button, and an "Increment" button, disabled until a wallet is connected.
   - Clicking "Increment" sends a real `increment()` transaction through the connected MetaMask account, shows the pending transaction hash, then the confirmed block number once `tx.wait()` resolves.
   - A live `CountIncreased` listener updates the displayed count automatically, without needing a page refresh, including when the count changes from a source other than this page's own button (Manual Test Case 4 exercises this directly).

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Action: open the dev server URL with no wallet connected yet.

       Expected result: "Current count" shows a real number (0, on a
       freshly deployed Counter) within a second or two of the page
       loading — confirming Concept 4's read-only provider works with NO
       wallet connection at all, before the "Connect Wallet" button has
       even been clicked once.

   2. Action: click "Connect Wallet." MetaMask's own connect popup should
       appear; approve it using the Account 1 test wallet imported in the
       Tutorial.

       Expected result: "Connected address" shows Account 1's real address
       (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`), and the "Increment"
       button becomes enabled — confirming Concept 2 and 3 both worked:
       a real signer was obtained from a real wallet connection.

   3. Action: click "Increment." MetaMask should show a confirmation
       popup for the `increment()` call — approve it.

       Expected result: "Pending: 0x…" appears immediately, then changes
       to "Confirmed in block N" within a second or two, and "Current
       count" updates to `1` without a page refresh — confirming Concepts
       5, 6, and 7 together: a real signed transaction, a receipt
       genuinely awaited, and the event listener catching the resulting
       `CountIncreased` event on its own. Independently confirm from a
       terminal:
         cast call <COUNTER_ADDRESS> "getCount()(uint256)" --rpc-url http://127.0.0.1:8545
       should also show `1`, matching what the page displayed.

   4. Action, exercising the event listener specifically (Concept 6) as
       something reacting to changes from OUTSIDE the page, not just the
       page's own button: with the browser tab still open, from a
       terminal, call increment() a second time via `cast` directly,
       bypassing the UI entirely:
         cast send <COUNTER_ADDRESS> "increment()" --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

       Expected result: without touching the browser at all, "Current
       count" updates to `2` on its own within a second or two —
       confirming the live event listener genuinely reacts to ANY matching
       event on-chain, not just ones this specific page's own button
       happened to send.
   ```

2. **Medium - Gas Estimation and Handling a Real On-Chain Revert.**

   **What you practice:**
   - Estimating gas before sending, and catching a would-revert call before ever prompting the wallet (Concept 9)
   - Reading a transaction receipt's `status` field directly, rather than assuming "no thrown error" means success (Concept 7)
   - Owner-gated access control (Week 27, Concept 4) experienced from the client side, for the first time as a real, user-facing error rather than a test assertion

   **Requirements:**
   - Extend Easy's page with an `incrementBy(amount)` input and button.
   - Before sending, call `writableCounter.incrementBy.estimateGas(amount)`; if it throws (because the connected account isn't `Counter`'s owner), display the caught error's message and do NOT proceed to send the actual transaction.
   - If estimation succeeds, send the transaction, await the receipt, and explicitly check `receipt.status`, displaying a genuinely different message for `1` (success) vs. `0` (mined but reverted) — even though, for `Counter`'s own `incrementBy`, a caught estimation failure should make a `status === 0` outcome unreachable in practice, the check itself is the point, not this specific contract's own behavior.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Action: with Account 1 (Easy's own imported test wallet — NOT
       Counter's owner, which is Account 0, the address that ran the
       original Deploy.s.sol) still connected, type `5` into the amount
       field and click "Increment By."

       Expected result: NO MetaMask popup appears at all — the page shows
       "This call would revert: …" directly, naming `NotOwner` (Week 27,
       Concept 13's own custom error) somewhere in the message — confirming
       `estimateGas` genuinely caught the failure before ever prompting the
       wallet, exactly Concept 9's point.

   2. Action: in MetaMask, switch the connected account to Account 0
       (import it too, using its own well-known key,
       `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`,
       copied in full — this IS Counter's real owner), reload the page,
       reconnect, then repeat the exact same "Increment By 5" action.

       Expected result: this time a real MetaMask popup DOES appear;
       approving it shows "Estimated gas: …" beforehand, then "Success!
       Gas used: …" once the receipt lands — confirming the identical
       call succeeds for the actual owner, and that Test Case 1's block
       was genuinely about the specific connected account, not a bug.
       Independently confirm:
         cast call <COUNTER_ADDRESS> "getCount()(uint256)" --rpc-url http://127.0.0.1:8545
       should show the count increased by exactly `5` from wherever Easy's
       own tests left it.

   3. Action: type `0` into the amount field and click "Increment By"
       while connected as Account 0.

       Expected result: the estimation succeeds (there's nothing in
       `Counter`'s own logic that rejects a zero amount) and the
       transaction goes through, "Success!" with the count UNCHANGED —
       worth noticing as a real, if mild, gap in `Counter`'s own
       Requirements from Week 27, not this week's own bug: `estimateGas`
       only catches calls that would genuinely REVERT, not calls that
       succeed while doing nothing meaningful.

   4. Action: temporarily comment out the `try`/`catch` around the
       `estimateGas` call in src/main.ts (call `writableCounter.incrementBy
       .estimateGas(amount)` directly, letting a rejection propagate as an
       unhandled promise rejection instead of being caught), reload, and
       repeat Test Case 1 exactly (Account 1, non-owner, amount `5`).

       Expected result: the browser's own JavaScript console shows an
       uncaught exception, and the page's own UI shows nothing at all,
       no helpful message, no updated state, just silence from the user's
       own point of view — confirming the try/catch wasn't incidental
       styling, it's the entire mechanism turning a raw revert into a
       readable, user-facing message. Revert the change afterward so the
       catch block is back in place, matching Requirements.
   ```

3. **Hard - Chain Switching and a Real Transaction on Sepolia.**

   **What you practice:**
   - Detecting the wallet's current network and prompting a switch to Sepolia specifically, including the "wallet doesn't know this chain yet" fallback path (Concept 8)
   - Reacting to `chainChanged`/`accountsChanged` fired from inside the wallet, not the page (Concept 8)
   - A real, MetaMask-confirmed transaction against a real, already-deployed Sepolia contract, tying Concepts 1 through 9 together into one working flow

   **Requirements:**
   - Reuse an already-deployed Sepolia `Counter` from a previous week (Week 30's Hard deployed one via both Foundry and Hardhat) — **confirm the actual address with me before starting**, rather than assuming which one, or redeploying a new one unnecessarily.
   - Before enabling any "send transaction" UI, check `eth_chainId` against Sepolia's own (`0xaa36a7`); if it doesn't match, show a "Switch to Sepolia" button that calls `wallet_switchEthereumChain`, falling back to `wallet_addEthereumChain` if MetaMask reports error code `4902` (chain not yet known to the wallet).
   - Listen for `chainChanged` and `accountsChanged` on `window.ethereum`, reloading the page's own state on either (a plain `window.location.reload()` is a perfectly correct, standard response, not a shortcut).
   - Once genuinely on Sepolia, clicking "Increment" sends a real transaction, exactly Easy's own flow, but now against a real, live network, with a real Etherscan link shown alongside the confirmed receipt.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Action: with MetaMask connected to Anvil Local (Easy/Medium's own
       network) or any other non-Sepolia network, open the page.

       Expected result: "Wrong network (chainId 0x…)" shows, and "Switch
       to Sepolia" is visible — confirming Concept 8's detection runs
       correctly on page load, before any button has been clicked.

   2. Action: click "Switch to Sepolia."

       Expected result: if Sepolia was already added to MetaMask at some
       point in a previous week, a plain network-switch popup appears; if
       this is MetaMask's first time seeing Sepolia at all, an "Add
       network" popup appears first instead, showing exactly the details
       from the `wallet_addEthereumChain` call (name, RPC URL, explorer)
       — confirming the error-code-4902 fallback path genuinely runs, not
       just the simpler switch path. After approving, "Connected to
       Sepolia ✓" should show.

   3. Action: click "Increment" (using the same real, funded `deployerKey`
       wallet's address imported into MetaMask, or any account you hold
       real Sepolia ETH with) and approve the MetaMask popup.

       Expected result: a real transaction hash, a receipt with a real
       confirmed block number (this can take longer than Easy's own local,
       instant-mining `anvil` — Sepolia has real block times), and an
       "View on Etherscan" link that, when clicked, shows the exact same
       transaction on the real, public block explorer. Independently
       confirm from a terminal:
         cast call <SEPOLIA_COUNTER_ADDRESS> "getCount()(uint256)" --rpc-url https://ethereum-sepolia-rpc.publicnode.com
       should reflect the new, incremented value.

   4. Action: with the page open and a wallet connected to Sepolia, open
       MetaMask directly (not the page) and manually switch its network to
       something else, Anvil Local or Ethereum Mainnet.

       Expected result: the page reloads on its own, without any button on
       the page itself being clicked — confirming the `chainChanged`
       listener genuinely fires on a wallet-initiated switch, not just a
       page-initiated one, and that Concept 8's "don't silently continue
       on stale chain assumptions" point holds in practice, not just in
       the Contents explanation above.
   ```
