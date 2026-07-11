# List of things learned.

## 1. On-chain Payment flows.

Underneath every payment product this week builds, the actual mechanism is nothing new.

An SPL `Transfer` (Week 17, Concept 5) or a native SOL transfer, signed by whoever owns the source account.

What _is_ new this week is everything wrapped around that one instruction, a standard way to _request_ a specific payment (Concept 2), a way for a merchant to later _prove_ it happened (Concept 10), and patterns for handling the cases a single transfer alone doesn't cover, recurring charges (Concept 4), reversals (Concept 6) and who actually pays the network fee (Concept 8, 12).

---

## 2. Solana Pay. (Payment request Standards)

**Solana Pay** is a protocol, not a program.

A specified URL format (`solana:<recipient>?amount=...&reference=...`) that any wallet capable of parsing it can turn into a pre-filled, ready-to-sign transfer, the same way a `mailto:` link pre-fills an email client.

Nothing about the format requires a custom on-chain program at all, Easy's assignment builds a complete, real payment flow using nothing but this specification and the tokens Week 17 already introduced.

---

## 3. QR code payment flows.

A QR code is simply Concept 2's URL, rendered as a scannable image, the actual mechanism by which a point-of-sale terminal or a printed receipt hands a Solana Pay URL to a customer's phone.

Nothing about the payment logic changes, this is purely a transport/UX layer, the same URL a customer could also receive by text message or a tapped NFC link, worth recognizing as separate from the protocol itself rather than treating _"QR code payments"_ as its own distinct payment mechanism.

---

## 4. Recurring payments/subscriptions on-chain.

A single signed transaction authorizes exactly one transfer, at one moment, there's no native _"keep charging me monthly"_ primitive the way a stored credit card has.

Medium's assignment builds the standard on-chain pattern instead.

A subscriber pre-funds a program-owned vault (Week 19's vault pattern, reused directly) covering several future periods upfront and a `charge` instruction, callable by the merchant but constrained by both an elapsed-time check and a fixed per-period amount, pulls from that balance periodically.

The subscriber's authorization is baked into the vault's existence and the program's own constraints, not re-requested for every individual charge.

---

## 5. Merchant integration patterns.

From a merchant's side, none of Concepts 1 through 4 individually solve the actual business problem, _"did I get paid, for which order, and how do I reconcile it against my own records."_

That's what Concept 10's reference keys and Concept 11's idempotency exist to answer.

Together they're what actually makes Concepts 1 through 4 usable by a real point-of-sale system rather than just a working payment primitive with no bookkeeping attached.

---

## 6. Handling refunds on-chain.

There's no built-in _"undo"_ for a completed SPL transfer.

A refund is simply a second, ordinary transfer, sent back in the opposite direction and _authorized by the merchant this time_, not the original payer.

What makes it meaningfully different from any other transfer is the bookkeeping.

Hard's assignment ties every refund to the specific `Payment` record it's reversing, requiring that record to genuinely exist, belong to the calling merchant and not have already been refunded once, exactly Week 20's `has_one` and state-machine discipline, applied to money moving backward instead of forward.

---

## 7. Stablecoin payment rails.

Real payment products almost never settle in SOL directly, its price moves far too much between the moment a price is quoted and the moment payment lands.

A **stablecoin** (an SPL token, Week 17's `Mint`, whose issuer maintains its value pegged to a real-world currency, typically the US dollar) removes that volatility risk entirely from the payment flow itself.

Hard's assignment settles in a stablecoin-shaped mint specifically so the amount recorded in a `Payment` account means the same thing today as it will when a `refund` reverses it weeks later.

---

## 8. Fee abstraction. (paying fees in SPL tokens)

Every Solana transaction, no matter what it does, needs its designated **fee payer** account to hold real SOL.

There is no way to pay the network fee itself in an SPL token directly, that's a hard protocol-level requirement, not a design choice any program can work around.

_"Fee abstraction"_ in practice means something more specific.

A separate party, a **relayer**, holds the SOL and pays the actual network fee, while the person actually authorizing the payment (Concept 1's transfer) never needs to hold any SOL at all, compensated in whatever SPL token the payment itself was already denominated in.

Concept 12 covers exactly how a single transaction accomplishes this.

---

## 9. Solana Pay's 2 request types. (Transfer Requests vs. Transaction Requests)

Concept 2 undersold the spec slightly.

Solana Pay actually defines two distinct URL shapes.

- A **Transfer Request** (`solana:<recipient>?amount=...`) is the simple case this week's Easy assignment builds, the wallet constructs the entire transaction itself from the URL's parameters alone.

- A **Transaction Request** (`solana:<https-url>`) instead points the wallet at a live HTTPS endpoint, which the wallet POSTs the payer's public key to and receives a fully-built, arbitrary transaction back, letting a merchant's backend construct something far more complex than a plain transfer, adding a loyalty-program CPI alongside the payment, for instance, entirely invisibly to the customer's wallet.

Easy's assignment uses only the simpler Transfer Request.

Recognizing the second type exists is what stops _"Solana Pay"_ from being mistaken for _"just a payment link."_

---

## 10. Reference keys & Payment detection.

Concept 1's transfer, on its own, gives a merchant no reliable way to find _"the specific transaction paying for order #4471"_ among every transaction on the chain.

Solana Pay's answer is the **reference key**.

An arbitrary, merchant-generated public key included as a non-signing account in the payment transaction, existing purely as a searchable tag, never actually receiving or sending anything itself.

A merchant later calls `getSignaturesForAddress` against that one reference key (conceptually, Week 16's account-fetching pattern, aimed at a search key instead of a data account) to find the exact transaction, then verifies its actual amount and recipient match what was expected before considering the order paid.

---

## 11. Idempotency & Double-payment prevention.

A customer's wallet or network connection can retry a submitted transaction, or a merchant's own backend can accidentally process the same webhook notification twice (Week 24 covers webhooks properly, this is the concept that motivates why they need this property at all).

Hard's `Payment` record account existing at a deterministic, order-specific PDA address (Week 13's collision-avoidance discipline, applied here on purpose rather than avoided) is what makes the whole system **idempotent**.

A second attempt to `pay` for the same `order_id` doesn't create a second charge, it fails outright with the same _"account already in use"_ error Week 19's `init` constraint has produced since Week 14, this time as a deliberately useful safety property rather than an accidental bug to guard against.

---

## 12. How fee abstraction actually works on Solana. (relayers & multi-signer fee payers)

Concept 8 named the goal.

The actual mechanism is that a single Solana transaction can carry **multiple signers** and whichever signer's key is listed first is the one the runtime charges the network fee to, a detail entirely separate from which account a program's own instruction logic treats as the meaningful authority.

Hard's assignment constructs exactly this.

A `relayer` keypair signs as the transaction's fee payer (and pays the rent for creating the `Payment` record, Anchor's `init` constraint's `payer` field pointed at the relayer rather than the customer), while a separate `customer` keypair signs only to authorize the actual SPL `Transfer`'s `authority` (Week 3's digital-signature model, one key, one specific authorization, doing exactly what it says and nothing more).

The customer never needs to hold a single lamport of SOL.

Week 44 revisits this same idea in far more generality, as ERC-4337's paymasters, once the course reaches Ethereum.

This week is the direct, simpler, Solana-native version of the same underlying problem.

---

## Assignment.

1. **Easy - A Solana Pay Transfer Request: Link, QR Code and Reference-Key Detection.**

   **What you practice:**
   - Building a real Solana Pay Transfer Request URL (Concept 2, 9) and rendering it as a scannable QR code (Concept 3)
   - Generating a merchant reference key and including it in a payment transaction, then finding that exact transaction on-chain by searching for it (Concept 10)
   - Validating a detected payment's actual amount and recipient against what was originally requested before treating it as confirmed (Concept 5, 11)

   **Requirements:**
   - No custom Anchor program. This assignment uses one real wallet as both the customer and merchant for a self-contained demo.
   - A script generates a Solana Pay Transfer Request URL for a fixed SOL amount, creates a fresh reference public key, and saves a QR code image.
   - The script sends a SOL transfer from the wallet to itself while including the reference key as a non-signing account.
   - The script finds the transaction using `findReference`, validates the amount and recipient using `validateTransfer`, and prints a confirmation only if the payment matches the original request.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Solana Pay URL: solana:6nBWg...?amount=0.001&reference=9pQr...
           &label=Week+23+Solana+Pay+Demo&message=Order+%234471
           QR code saved to payment-qr.png

           Payment sent. Signature: 5f3G...

           Searching for the payment by reference key...
           Found transaction: 5f3G...

           Validated payment amount: confirmed via validateTransfer
           Confirmed: amount and recipient both match the original request.

   2. Command: open payment-qr.png.

       Expected result: a valid, scannable QR code image. Scanning it
       with a Solana Pay-compatible wallet app (if you have one on your
       phone) should show a payment request for 0.001 SOL, confirming
       the generated URL is genuinely spec-compliant, not just
       syntactically plausible.

   3. Command: verify by hand.

       "Found transaction" must equal the SAME signature "Payment sent"
       printed — confirming findReference genuinely located the exact
       right transaction using only the reference key, out of every
       transaction on devnet, not a coincidental match.

   4. Command: temporarily change the validateTransfer call's expected
       amount from `new BN(amountSol)` to `new BN(amountSol * 2)`
       (double the real amount), and re-run.

       Expected output: validateTransfer throws an error (amount
       mismatch) instead of confirming — proving Concept 11's validation
       step is a real check against the transaction's actual contents,
       not just confirming a transaction merely exists at that
       reference. Revert this change afterward.
   ```

2. **Medium - Recurring Subscription Payments: Pre-Funded Vault, Time-Gated Charges.**

   **What you practice:**
   - Building a subscription vault that a subscriber pre-funds, with merchant charges allowed only after the required time has passed (Concept 4)
   - Testing the time-gating by confirming an early charge fails, waiting, then confirming a charge succeeds, and an immediate second charge fails again
   - Confirming the subscription stops charging when the vault runs out of funds

   **Requirements:**
   - Test-only, run with `anchor test` against a local validator.
   - A `Subscription` PDA (seeds `["subscription", subscriber, merchant]`) storing `subscriber`, `merchant`, `amount_per_period`, `period_seconds`, `next_charge_ts`, and a PDA-owned vault `TokenAccount`.
   - `create_subscription(ctx, amount_per_period, period_seconds)` creates the subscription and sets the first charge time.
   - `top_up(ctx, amount)` lets the subscriber add more tokens to the vault.
   - `charge(ctx)` allows only the merchant to charge after the required time, checks the vault has enough funds, transfers tokens to the merchant, and updates the next charge time.
   - `cancel_subscription(ctx)` closes the subscription and returns any remaining tokens to the subscriber.
   - A test confirms an early charge is rejected, a charge succeeds after waiting, and another immediate charge is rejected.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: anchor test --provider.cluster localnet

       Expected output:
           subscription-vault
           ✔ rejects an early charge, then succeeds after the period
               elapses, then rejects again immediately (....ms)

           1 passing

   2. Command: verify by hand.

       The merchant's token balance must equal exactly AMOUNT_PER_PERIOD
       (100) after the single successful charge, not some other number
       — confirming the vault paid out exactly one period's worth, not
       the whole 500-token top-up at once.

   3. Command: temporarily change the top_up amount from 500 to 50
       (less than one period's charge), and re-run.

       Expected output: 1 failing — the charge that previously succeeded
       after the wait now fails with InsufficientFunds instead,
       confirming the vault-balance check is real and load-bearing, a
       subscription with an empty vault genuinely can't be charged, even
       once its time-gate has passed. Revert this change afterward.

   4. Command: temporarily remove the `next_charge_ts` advancement line
       from charge() in src/lib.rs:

           sub.next_charge_ts = sub.next_charge_ts.checked_add(sub.period_seconds)...

       rebuild, and re-run.

       Expected output: 1 failing — the third assertion (immediate
       second charge rejected) now fails, because next_charge_ts was
       never advanced, so the SAME already-elapsed timestamp still
       passes the time check, letting the merchant charge repeatedly
       with no gap at all. Confirms this one line is the entire
       mechanism enforcing "once per period." Revert this change
       afterward.
   ```

3. **Hard - Merchant Payment Processor: Idempotent Payments, Refunds and Fee Abstraction.**

   **What you practice:**
   - Recording each payment in a unique order-specific PDA so duplicate payments for the same order are rejected (Concept 11)
   - Implementing merchant-authorized refunds and preventing the same payment from being refunded twice (Concept 6)
   - Demonstrating fee abstraction where the customer holds zero SOL while a relayer pays the transaction fees and account rent (Concept 8, 12)

   **Requirements:**
   - A `Payment` PDA (seeds `["payment", merchant, order_id.to_le_bytes()]`) storing `payer`, `merchant`, `mint`, `amount`, `order_id`, and `status`.
   - `pay(ctx, order_id, amount)` transfers tokens from the customer's token account to the merchant's, while the relayer pays the transaction fee and account rent.
   - `refund(ctx)` allows only the merchant to refund a paid transaction, transfers the tokens back to the customer, and marks the payment as refunded.
   - A live client demonstrates the single-wallet flow on devnet where one wallet acts as the customer, merchant, and relayer, using two different token accounts for the same wallet, then performs `pay` and `refund`.
   - An Anchor test demonstrates the real multi-party flow with separate customer, merchant, and relayer keypairs, confirms the customer keeps zero SOL throughout, rejects duplicate payments for the same `order_id`, and rejects duplicate refunds.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: anchor test --provider.cluster localnet (Rust tests)

       Expected output:
           payment-processor
           ✔ lets a zero-SOL customer pay via a relayer, rejects a
               duplicate pay, then refunds once and rejects a second
               refund (....ms)

           1 passing

   2. Command: npx tsx index.ts (live client)

       Expected output shape:
           Mint created: 6nBWg...
           Minted 10,000 tokens to your ATA.

           Paying order #171982... for 300 tokens (customer = merchant =
           relayer = your wallet, self-contained demo)...
           Paid.
           Payment status: { paid: {} }

           Refunded.
           Payment status: { refunded: {} }

   3. Command: verify by hand.

       Test 1's two balance assertions (customer's SOL balance equal to
       0 both BEFORE and AFTER paying) are the actual proof of Concept
       12, not just an assumption — the customer keypair's SOL balance
       genuinely never changes, while the relayer's does, confirming fee
       abstraction is really happening, not merely that the transaction
       succeeded for some other reason.

   4. Command: run npx tsx index.ts a second time.

       Expected output: since orderId is generated fresh from
       Date.now() on every run, a SECOND, entirely separate payment
       record is created and paid/refunded successfully — confirming
       Concept 11's idempotency guard is scoped to a specific order_id,
       not a blanket "one payment ever" restriction, a real merchant can
       process many distinct orders from the same customer.
   ```
