# Key Management Notes. (GoodVault's Owner Key)

## Scope

These notes apply specifically to the owner key of `GoodVault`.

The `GoodVault` owner has significant administrative authority. The owner can call:

- `pause()` — stops new `deposit()` operations.
- `unpause()` — resumes `deposit()` operations.
- `setWhitelisted()` — controls which users are allowed to deposit.

Because these functions are protected by `onlyOwner`, protecting the owner key is directly connected to the security of the vault.

The owner cannot directly call `emergencyWithdraw()` on behalf of users or withdraw users' balances through an owner-only function. However, compromise of the owner key can still disrupt the vault by pausing it, unpausing it unexpectedly, or changing the whitelist.

---

## Current state: `cast wallet` / development-grade key handling

For development, Foundry tools such as `cast wallet` and locally stored private keys are convenient because they allow a developer to quickly sign transactions.

In this course's local Anvil environment, the private key is used directly with commands such as:

```bash
cast send <GOODVAULT_ADDRESS> "pause()" \
  --rpc-url http://127.0.0.1:8545 \
  --private-key <PRIVATE_KEY>
```

This is acceptable for a local development network because the Anvil accounts and their private keys are public test credentials.

For a real `GoodVault` deployment holding real value, directly exposing or storing the owner private key in shell commands, scripts, source files, or environment files is not sufficient protection.

A development-grade key setup can protect against accidental loss only when the key is backed up correctly, but it does not adequately protect against:

- Malware reading local files.
- A compromised development machine.
- Shell history containing private-key commands.
- Accidental commits.
- Unauthorized access by someone with access to the machine.
- A single compromised private key immediately controlling all owner functions.

For a real deployment, the main weakness is that the security of `pause()`, `unpause()`, and `setWhitelisted()` depends on one secret remaining private.

---

## Option: MPC-based key management

An MPC-based approach can divide signing authority between multiple participants.

For `GoodVault`, this could reduce the risk that one compromised machine or participant can independently control the owner functions.

However, Week 38's reconstruct-then-sign demonstration is not sufficient for protecting a real high-value `GoodVault` owner key.

In a reconstruct-then-sign approach, the private key is reconstructed at some point before signing. This means that the full key can temporarily exist in memory, creating a security risk.

A real threshold-signing MPC system is different.

With true threshold signing:

- The complete private key does not need to be reconstructed.
- Multiple participants hold separate key shares.
- A configured threshold of participants must cooperate to produce a valid signature.
- No individual participant can independently call `pause()` or `unpause()`.

For example, a 2-of-3 threshold arrangement could require two authorized participants to approve an administrative transaction.

For `GoodVault`, this changes who can trigger emergency administrative actions. Instead of one person with one private key being able to pause the vault, multiple authorized parties must participate.

This reduces the risk of a single-key compromise, but it can also slow down emergency response. The threshold configuration must therefore balance security against the need to call `pause()` quickly during a real incident.

---

## Option: Cloud KMS

A cloud Key Management Service can protect the private key using managed hardware-backed security controls.

For `GoodVault`, administrative transactions could be prepared by an application and then signed through a cloud KMS rather than exporting the owner private key to a developer machine.

This improves how the key material is protected.

For example:

- The private key does not need to be stored directly in a local shell command.
- Access policies can restrict which users or services can request signatures.
- Authentication and authorization can be centrally managed.
- Signing activity can be logged and audited.
- Hardware-backed protection can reduce the risk of simple key theft.

However, a cloud KMS does not automatically change who is authorized to trigger `pause()` or `unpause()`.

This is an important distinction.

A KMS primarily changes **how the private key is stored and protected**.

MPC or multisignature systems can change **who must approve an administrative action**.

For the `GoodVault` threat model, these are different security properties.

A KMS can provide excellent protection for a single owner key, but if one authorized administrator can request a signature alone, that administrator may still effectively control all owner functions.

---

## Comparison for GoodVault

| Approach                        | Key protection                   | Who can trigger owner actions?                   | Main risk                                                            |
| ------------------------------- | -------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| Development key / `cast wallet` | Low for production use           | One person with the private key                  | Single-key compromise                                                |
| MPC threshold signing           | High                             | Multiple participants according to the threshold | Operational complexity and slower emergency response                 |
| Cloud KMS                       | High protection for key material | Depends on KMS access policies                   | Centralized authorization may still create a single point of control |

---

## Real recommendation for THIS contract, at THIS stage

For a newly deployed `GoodVault` with no meaningful real value, a development-grade key setup is acceptable for local development and testing.

Once the vault begins holding real value, the owner key should no longer be handled directly through local private-key commands.

My recommended progression is:

### Early testing

Use Anvil accounts and development keys.

The current assignment setup is appropriate because it is a local environment using test contracts and test funds.

### Early production deployment

Use a cloud KMS or another hardware-backed key management system.

This protects the `GoodVault` owner key from being copied into local scripts, shell history, or source code while still allowing a relatively fast response if `pause()` must be called during an incident.

### Mature deployment with meaningful value

Move away from a single individual controlling the administrative key.

For a `GoodVault` that has been live and trusted for a long period and protects meaningful value, I would use a true threshold-signing MPC system or another multi-party administrative arrangement.

A threshold model reduces the risk that one compromised administrator can independently:

- Pause the vault.
- Unpause the vault.
- Change the whitelist.

The exact threshold should still allow an emergency `pause()` to be executed quickly enough during a real incident.

---

## Final recommendation

For this assignment's newly deployed local `GoodVault`, the current Anvil development key is appropriate.

For a real production `GoodVault`, my recommendation is:

1. Do not expose the owner private key directly in shell commands or source code.
2. Move first to hardware-backed or cloud KMS protection.
3. Once the vault holds significant value and has established operational requirements, move administrative authority toward true threshold signing or another multi-party approval model.

This follows a progressive security model: simple key management during development, stronger protection during early production, and shared administrative control once the value and consequences of owner-key compromise become significant.
