# List of things learned.

## 1. Multi-Party Computation (MPC), the general concept.

**Multi-Party Computation** is a general cryptographic idea, older and broader than wallets specifically:

- several parties,
- each holding a private input,
- jointly compute some function of all their inputs together,
- without any party ever revealing their own input to any other party, or to anyone.

Applied to a wallet specifically, the function being computed is "produce a valid signature over this transaction" and each party's private input is their own share of a private key.

The point of an MPC wallet is that this signature gets produced _without any single party, at any point, ever holding the complete private key_.

A genuinely different guarantee from Week 4's own seed-phrase model, where one party (or one device) holds the whole thing outright or from a bridge's own multisig relayer set (Week 36, Concept 5), where each signer independently holds and uses their own _complete_, separate key.

---

## 2. Threshold cryptography basics.

Almost every scheme this week touches is a **threshold** scheme:

- some number `N` of total parties (or shares) and a smaller number `M ≤ N`.

The **threshold**, required before anything useful can happen like reconstructing a secret (Concepts 3, 4), or producing a valid signature (Concept 5).

This is the exact same `M`-of-`N` shape Week 33's `TimelockController` and Week 36's own bridge multisig both already used for authorization.

Worth naming the real distinction directly.

Those were threshold _authorization_ schemes (M-of-N distinct, complete signatures, each independently verifiable), where this week's own Concepts 3 and 4 build threshold _secret splitting_ (M-of-N _pieces_ of one single secret, individually meaningless).

A mathematically different mechanism achieving a superficially similar-sounding "M-of-N" guarantee.

---

## 3. Shamir's Secret Sharing, the actual algorithm.

**Shamir's Secret Sharing** (SSS) splits a secret into `N` shares such that any `M` of them reconstruct it exactly and the genuinely remarkable part, precise and provable, not just a design goal.

Any `M - 1` shares reveal _absolutely nothing_ about the secret at all, not even a probabilistic hint, a guarantee that holds regardless of an attacker's own computational power (**information-theoretic security**, a strictly stronger claim than the _computational_ security Week 3's own asymmetric cryptography relies on, which only holds because certain problems are hard to compute quickly, not impossible in principle).

The mechanism, represent the secret as the constant term of a random polynomial of degree `M - 1`, over a finite field (arithmetic modulo a large prime, Concept 4 covers exactly why real numbers won't do) and hand out `N` distinct points on that polynomial's own curve as the `N` shares.

```typescript
function splitSecret(
  secret: bigint,
  threshold: number,
  totalShares: number,
  prime: bigint,
): Share[] {
  const coefficients: bigint[] = [secret]; // the secret IS the constant term
  for (let i = 1; i < threshold; i++) {
    coefficients.push(randomBigInt(prime)); // random, otherwise
  }

  const shares: Share[] = [];
  for (let x = 1n; x <= BigInt(totalShares); x++) {
    let y = 0n;
    for (let i = coefficients.length - 1; i >= 0; i--) {
      y = mod(y * x + coefficients[i], prime); // Horner's method — evaluate the polynomial at x
    }
    shares.push({ x, y });
  }
  return shares;
}
```

A `threshold = 2` polynomial is just a straight line.

Any single point on a line says nothing at all about where it crosses the y-axis (the secret). Literally infinitely many different lines, with infinitely many different y-intercepts, pass through any one given point.

This is the exact, concrete geometric intuition behind the information-theoretic claim above, worth holding onto directly rather than trusting abstractly and exactly what Easy's own assignment demonstrates concretely, not just asserts.

---

## 4. Secret reconstruction via Lagrange interpolation & why a finite field specifically.

Given `M` real points on a degree-`(M-1)` polynomial, there is exactly one polynomial of that degree passing through all of them.

**Lagrange interpolation** is the standard, direct formula for recovering it and since the secret is defined as the polynomial's value at `x = 0` (Concept 3), reconstruction only actually needs that one specific value, not the whole polynomial.

```typescript
function reconstructSecret(shares: Share[], prime: bigint): bigint {
  let secret = 0n;
  for (let i = 0; i < shares.length; i++) {
    let numerator = 1n;
    let denominator = 1n;
    for (let j = 0; j < shares.length; j++) {
      if (i === j) continue;
      numerator = mod(numerator * (0n - shares[j].x), prime);
      denominator = mod(denominator * (shares[i].x - shares[j].x), prime);
    }
    secret = mod(
      secret +
        shares[i].y * mod(numerator * modInverse(denominator, prime), prime),
      prime,
    );
  }
  return secret;
}
```

Real numbers would technically let this same formula run, but division isn't exact in floating-point arithmetic and the more fundamental problem, not just a precision inconvenience Concept 3's own information-theoretic guarantee specifically depends on every element of the field being equally likely as a candidate secret.

A finite field (`modInverse`, computed via the extended Euclidean algorithm, replaces ordinary division entirely) is what makes that guarantee mathematically exact rather than approximately true.

---

## 5. MPC wallets vs. multisig wallets.

Both achieve an `M`-of-`N` access control property (Concept 2), but through genuinely different mechanisms with a genuinely different _on-chain footprint_.

The single most practically important distinction, and Hard's own assignment measures it directly rather than only describing it.

|                         | Multisig (Week 33, Week 36's own pattern)                                                                           | MPC wallet                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Where the logic lives   | On-chain, in a real, deployed smart contract                                                                        | Entirely off-chain, among the signing parties                                                                                               |
| What lands on-chain     | Multiple separate confirmation transactions, then one execution transaction, all visible, all costing real gas each | ONE ordinary transaction, signed by what looks, on-chain, like a completely normal single-key EOA (Week 26, Concept 1)                      |
| Chain support           | Requires the destination chain to support smart contracts at all                                                    | Works on ANY chain with plain ECDSA signatures, including ones with no smart contract capability whatsoever                                 |
| Auditability            | Fully transparent — the exact M-of-N logic is real, deployed, readable Solidity anyone can inspect                  | Opaque from on-chain data alone — nothing about the transaction itself reveals that multiple parties were involved in producing it at all   |
| Changing the signer set | An on-chain transaction, visible, itself sometimes requiring the existing threshold's own approval                  | Can often be done off-chain, invisibly, via a fresh distributed key generation round (Concept 6) with the same resulting public key/address |

This on-chain indistinguishability is precisely why real MPC custody products (Concept 7) are attractive for exactly the cases where a multisig contract's own visible complexity, gas cost, or chain-support requirement is a real drawback.

---

## 6. Key generation without a single point of failure.

Worth a precise, honest distinction, easy to blur.

Concept 3's own Shamir's Secret Sharing, used the way Medium's own assignment uses it, _splits an already-existing secret_.

Meaning, for one real moment, at generation time, the complete secret genuinely existed in one place before being split.

A real, production MPC wallet instead uses **Distributed Key Generation (DKG)**.

A protocol where the parties jointly generate a key pair such that _no single party, and no single moment in the entire process, ever has the complete private key at all_ not even fleetingly during setup.

This is a real, meaningful step beyond what this week's own hands-on Shamir demo builds, named directly rather than glossed over and precisely why Concept 9 (added material) draws such a firm line between "this week's own demo" and "what a real MPC wallet provider's underlying protocol actually guarantees."

---

## 7. Use cases in custody solutions.

Institutional custody, exchanges and funds holding large, pooled customer assets, is where MPC wallets have seen the heaviest real, production adoption, precisely because Concept 5's own on-chain indistinguishability sidesteps two real, practical multisig costs at that scale.

A multisig contract redeployed identically on every chain a custodian needs to support (Concept 5's own "requires smart-contract support" row) and the gas cost of every single M-of-N confirmation, multiplied across an institution's own real transaction volume.

Consumer-facing wallet products (several real, existing companies build on exactly this model) use the identical underlying idea for a different, related benefit.

Letting a user recover wallet access via multiple independent factors (a device, a cloud backup, a recovery contact) without any single one of those factors alone being enough to compromise the wallet, the same threshold property, applied to _user_ convenience and recovery rather than institutional operations.

---

## 8. Trade-offs of MPC: latency & complexity.

Nothing about Concepts 5 through 7 is free.

Real threshold signing protocols (not this week's own simplified reconstruct-then-sign demo, Concept 9 draws this line precisely) require multiple _rounds_ of real network communication between the signing parties before a signature is finally produced.

Every party involved has to actually be online and reachable at signing time, a genuine **liveness requirement** a single-key wallet or, differently, an already-fully-signed multisig transaction waiting only for execution, doesn't share.

This shows up as real, user-facing latency.

An MPC signature can take meaningfully longer to produce than a single key simply signing locally, especially if a required party is slow to respond or geographically distant.

The second real cost is implementation complexity.

Concept 5's own multisig contract is a few dozen lines of ordinary, directly auditable Solidity anyone can read line by line.

A real, secure threshold-ECDSA protocol (the actual cryptographic machinery real MPC wallet providers implement, well beyond this week's own scope) is genuinely difficult to implement correctly, historically a real source of serious, exploited vulnerabilities in more than one production MPC library, precisely because subtle cryptographic protocol bugs are far harder to spot by reading code than an on-chain multisig's own comparatively simple, transparent logic.

---

## 9. What this week's own hands-on demo is and deliberately, is not.

Stated as plainly as possible.

**Medium and Hard's own assignments split a private key with Shamir's Secret Sharing, then reconstruct the COMPLETE key, in one place, at the moment of signing.**

This is a real, legitimate, widely-used technique for exactly one purpose, **backup and recovery** (Week 4's own seed-phrase concept, generalized: instead of one seed phrase that is a single point of failure if lost OR stolen, `M`-of-`N` independent share-holders, none of whom alone can do anything with their own share) making it genuinely valuable, genuinely real-world.

It is **not**, on its own, what a real, production MPC wallet does for live transaction signing and using it that way would defeat Concept 1's own entire point.

The instant `M` shares are combined to reconstruct the full key, whoever performed that reconstruction now holds the complete private key, even if only for a moment, reintroducing exactly the single point of failure Concept 6's own DKG exists specifically to avoid ever creating in the first place.

Real threshold-ECDSA protocols let parties jointly _produce a signature_ without the full key ever existing anywhere, whole, at any point.

Genuinely more advanced cryptography than reconstruct-then-sign, out of scope for this week's own hands-on build, named honestly here so Hard's own "MPC-style" comparison is understood for exactly what it demonstrates (Concept 5's real, on-chain indistinguishability property) and exactly what it doesn't (a real, production-grade threshold signing protocol).

---

## Assignment.

1. **Easy - Implementing Shamir's Secret Sharing From Scratch.**

   **What you practice:**
   - Finite field arithmetic: modular addition, multiplication, and inversion via the extended Euclidean algorithm (Concept 4)
   - Splitting a secret into shares via a random polynomial (Concept 3), and reconstructing it via Lagrange interpolation (Concept 4)
   - Concept 3's own information-theoretic claim, made concrete: demonstrating directly that fewer-than-threshold shares are consistent with EVERY possible secret, not just failing to reveal the real one

   **Requirements:**
   - A `finiteField.ts` module: `mod`, `modInverse` (extended Euclidean algorithm), both operating on `bigint`.
   - A `shamir.ts` module: `splitSecret(secret, threshold, totalShares, prime)` and `reconstructSecret(shares, prime)`, exactly Concepts 3 and 4's own code.
   - A script demonstrating: split a small secret (e.g. `42`) with `threshold = 3`, `totalShares = 5`; reconstruct correctly from any 3 of the 5 shares; reconstruct correctly from a DIFFERENT set of 3; confirm both give the identical, correct secret back.
   - A second script demonstrating Concept 3's own information-theoretic point directly, for the simplest case (`threshold = 2`, a line): given only ONE real share, show that for several different CANDIDATE secrets, a valid degree-1 polynomial through that one real point and the candidate's own y-intercept exists — meaning one share alone is consistent with any secret at all, not just failing to reveal the true one.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx src/splitAndReconstruct.ts

       Expected output: both reconstructions print `42` — confirming
       reconstruction from two DIFFERENT sets of 3 shares (out of the 5
       generated) both correctly recover the identical original secret,
       exactly Concept 4's own claim that ANY threshold-sized subset works.

   2. Command: npx tsx src/informationTheoreticDemo.ts

       Expected output: a valid slope prints for EVERY candidate secret,
       including ones nowhere near the real `999` — confirming Concept 3's
       own information-theoretic claim directly: the one real share is
       mathematically consistent with literally any candidate secret at
       all, not just silent about the true one.

   3. Action: in src/splitAndReconstruct.ts, temporarily reconstruct from
       only TWO shares instead of three (`reconstructSecret([shares[0],
       shares[1]], M127)`), and print the result.

       Expected output: a real, valid-looking bigint prints — NOT an
       error, and NOT `42` — confirming directly that Shamir reconstruction
       with too few shares doesn't fail loudly, it silently produces a
       plausible-looking WRONG answer, a real, important gotcha Medium's
       own Test Case 4 demonstrates again against a real Ethereum key,
       with real, concrete consequences. Revert this change afterward.

   4. Action: run src/splitAndReconstruct.ts twice in a row, without
       changing anything.

       Expected output: the printed SHARES themselves are different each
       run (the polynomial's own random coefficients, Concept 3, are
       freshly generated every time), but both reconstructions still
       correctly print `42` each run — confirming the randomness is real
       and doesn't affect correctness, exactly what a correct
       implementation should do.
   ```

2. **Medium - Splitting and Recovering a Real Ethereum Private Key.**

   **What you practice:**
   - Applying Shamir's Secret Sharing to a REAL secp256k1 private key, Week 4's own key material, this time (Concept 6's own "backup and recovery" use case, made concrete)
   - Confirming reconstruction produces the exact same Ethereum address (Week 26, Concept 1), not just "a plausible-looking key"
   - The insufficient-shares gotcha from Easy's own Test Case 3, now with a real, meaningful consequence: a DIFFERENT real address entirely

   **Requirements:**
   - A script generating a real random private key via `ethers.Wallet.createRandom()`, splitting it (as a `bigint`) via Shamir with `threshold = 3`, `totalShares = 5`, using the `M521` field (large enough to safely exceed any real private key).
   - Reconstructing from 3 of the 5 shares, converting the reconstructed `bigint` back into an `ethers.Wallet`, and confirming its `.address` exactly matches the ORIGINAL wallet's own address.
   - A second reconstruction from a DIFFERENT set of 3 shares, confirming the SAME address results either way (Easy's own Test Case 1 point, now with real key material).
   - A deliberate demonstration of Easy's own Test Case 3 gotcha, with real stakes: reconstructing from only 2 shares (below the real `threshold = 3`) and showing the resulting address is a completely different, essentially random address, not an error and not a "close enough" partial key.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx src/keyRecovery.ts

       Expected output: "Both match original: true" — confirming a REAL
       secp256k1 private key survives a full split-then-reconstruct round
       trip, from two independently-chosen sets of 3 shares, producing the
       EXACT SAME Ethereum address both times.

   2. Action: re-run the script several times.

       Expected output: a genuinely different original address and
       genuinely different share values every run (a fresh random wallet
       AND a fresh random polynomial each time), but "Both match original:
       true" holds every single time — confirming correctness doesn't
       depend on any particular key or polynomial, a real property of the
       algorithm itself, not a coincidence of one specific run.

   3. Command: check the final two lines of output specifically.

       Expected output: "Matches original: false" — a REAL, different,
       essentially random Ethereum address results from reconstructing
       with only 2 of the required 3 shares, not an error, not a partial
       or "almost right" key — a genuinely different, unrelated wallet
       entirely, exactly the concrete, high-stakes version of Easy's own
       Test Case 3.

   4. Action: temporarily change the threshold used for splitting to `2`
       (matching the number of shares used in the "only 2 shares"
       reconstruction at the bottom of the script), leaving everything
       else unchanged, and re-run.

       Expected output: "Matches original: false" now becomes "Matches
       original: true" for that SAME reconstruction call — confirming
       directly that the earlier mismatch in Test Case 3 was genuinely
       about having fewer shares than the REAL threshold, not some
       unrelated bug in the reconstruction code itself. Revert the
       threshold change afterward.
   ```

3. **Hard - On-Chain Multisig vs. Off-Chain "MPC-Style" Signing: A Direct, Measured Comparison.**

   **What you practice:**
   - A real, deployed on-chain multisig contract, and its own real gas cost and on-chain visibility, measured directly (Concept 5)
   - A real transaction signed via Medium's own reconstruct-then-sign approach, and ITS on-chain footprint, measured the identical way
   - Concept 9's own honesty, applied directly: understanding precisely what this comparison does and doesn't prove about real, production MPC wallets

   **Requirements:**
   - A `SimpleMultisig` contract (Solidity, `M`-of-`N` owners): `submit`, `confirm`, `execute`, holding real ETH and forwarding an arbitrary call once `threshold` confirmations are reached.
   - Deploy it to `anvil` with 3 owners and a `threshold` of `2`, fund it, and measure the TOTAL gas cost of a complete flow: `submit` + 2 separate `confirm` calls + `execute`.
   - A TypeScript script, reusing Medium's own `shamir.ts`/`finiteField.ts`: split a real private key (`threshold = 2`, `totalShares = 3`), reconstruct it from 2 shares, and use the reconstructed key to sign and send ONE ordinary transaction directly against `anvil`, moving an equivalent real ETH amount to the same kind of destination.
   - Measure and compare the total gas cost of both flows, and separately confirm, by inspecting the "MPC-style" transaction's own on-chain receipt, that nothing about it reveals more than one party was ever involved in producing it (Concept 5's own indistinguishability claim).
   - A written, explicit note (in the script's own comments, not just this README) restating Concept 9's own honest boundary: this comparison demonstrates the on-chain footprint difference correctly, but the "MPC-style" side reconstructs a whole key in one place, which is NOT what a real, production threshold-signing protocol would ever do for live signing.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx src/compareGasCosts.ts

       Expected output: two real gas figures, and a ratio comfortably
       above 1 — confirming Concept 5's own table directly: reaching the
       identical 2-of-3 threshold guarantee costs meaningfully more gas
       on-chain via a multisig contract's own multiple transactions than
       via a single, ordinarily-signed transaction.

   2. Command, independently confirming Concept 5's own "indistinguishable
       on-chain" claim — fetch the MPC-style transaction's own receipt
       directly and inspect it:
         cast tx <MPC_STYLE_TX_HASH> --rpc-url http://127.0.0.1:8545

       Expected output: an entirely ordinary-looking transaction — a
       `from` address, a `to` address, a value, a normal ECDSA signature
       (`v`, `r`, `s`) — nothing in this data distinguishes it from any
       single-key wallet's own plain transaction; contrast this directly
       with:
         cast tx <ANY_CONFIRM_TX_HASH> --rpc-url http://127.0.0.1:8545
       which shows real calldata calling `confirm(uint256)`, genuinely
       visible, on-chain evidence of multisig-style coordination.

   3. Action: re-run the full script several times.

       Expected output: the multisig side's own total gas stays close to
       identical every run (the same four function calls, the same
       contract logic); the MPC-style side's own gas ALSO stays close to
       identical (a single plain ETH transfer's own gas cost is fixed and
       well-known) — confirming the comparison itself is stable and not
       an artifact of one particular run's own conditions.

   4. Action: re-read this week's own Concept 9 directly, then, in
       compareGasCosts.ts's own `mpcStyleFlow` function, locate the exact
       line where `reconstructSecret` combines two shares into the whole
       key. Note, in your own words, in a comment right above that line,
       the specific moment a real, production MPC wallet's own DKG-based
       protocol (Concept 6) would NEVER allow to exist — the reconstructed
       key sitting, complete, in this script's own local memory, even
       briefly. This isn't a bug to fix in this assignment's own
       Requirements (reconstruct-then-sign is exactly what's being
       measured here, deliberately), it's the single most important thing
       to be able to point to directly before calling any part of this
       week's own work "an MPC wallet" in casual conversation.
   ```
