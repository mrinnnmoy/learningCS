# Incident Response Plan. (GoodVault)

## Scope

This incident response plan applies specifically to the deployed `GoodVault` contract used in this assignment.

The contract has the following relevant emergency mechanisms:

- `pause()` — callable only by the owner and stops new `deposit()` calls.
- `unpause()` — callable only by the owner and resumes `deposit()` calls.
- `emergencyWithdraw()` — remains callable even while the contract is paused, allowing users with a recorded vault balance to withdraw their own funds.

The monitoring script, `monitor.ts`, watches for `Paused` and `Unpaused` events and produces a structured security alert when either occurs.

---

## Trigger: monitor.ts fires a "Contract PAUSED" alert

### 1. Notify the contract owner and security responder immediately

The person responsible for the `GoodVault` owner key should be notified immediately through the project's chosen communication channel.

The alert should include:

- The time of the event.
- The `GoodVault` contract address.
- The address that called `pause()`.
- The transaction hash, when available.

The first goal is to determine whether the pause was an expected emergency action or an unauthorized transaction.

### 2. Confirm who called `pause()`

Check whether the caller address is the known `GoodVault` owner.

Investigate the transaction using:

```bash
cast tx <TX_HASH> --rpc-url http://127.0.0.1:8545
```

Also confirm the current contract owner:

```bash
cast call <GOODVAULT_ADDRESS> "owner()(address)" \
  --rpc-url http://127.0.0.1:8545
```

If the caller was the expected owner and the pause was deliberately initiated, document the reason for the pause and continue investigating the underlying event that caused it.

### 3. Treat an unexpected pause as a possible owner-key incident

Only the `GoodVault` owner can call `pause()`.

Therefore, an unexpected successful `pause()` transaction strongly suggests one of the following:

- The owner deliberately paused the contract but failed to communicate the action.
- The owner key was compromised.
- The owner key or signing system was used without authorization.

If compromise is suspected, the owner key must no longer be treated as trusted.

The response should follow the key-management approach described in `KEY_MANAGEMENT_NOTES.md`. For a real deployment holding meaningful value, access to the owner key should be reviewed immediately and signing credentials should be rotated or replaced where the contract architecture allows it.

### 4. Inform users about emergency withdrawal availability

While `GoodVault` is paused, `deposit()` is blocked because it uses `whenNotPaused`.

However, `emergencyWithdraw()` deliberately does not use `whenNotPaused`.

Users with a positive recorded balance can therefore still call:

```solidity
emergencyWithdraw()
```

and withdraw their own recorded funds.

If the pause is caused by a genuine security incident, users should be proactively informed that deposits are temporarily disabled but that `emergencyWithdraw()` remains available.

This allows users to exit the vault without waiting for the root cause to be fully resolved.

---

## Trigger: monitor.ts fires a large-withdrawal alert

The current unchanged `GoodVault` contract does not emit a `Withdrawn` event.

Therefore, a large-withdrawal alert cannot be implemented by directly subscribing to a withdrawal event without modifying the Week 39 contract.

A production monitor for this unchanged contract would instead need to inspect successful `emergencyWithdraw()` transactions or detect significant changes in the vault's token balance and user balances.

### 1. Determine whether the withdrawal is actually suspicious

A single large withdrawal is not automatically malicious for this specific contract.

`emergencyWithdraw()` allows a user to withdraw their own recorded balance.

The withdrawal should be escalated when:

- The amount exceeds the configured monitoring threshold.
- Multiple large withdrawals occur in a short period.
- Withdrawals are accompanied by unusual owner activity.
- The observed token movement does not match expected `balances[user]` values.

A large withdrawal of 10 tokens or more may be used as a demonstration threshold for monitoring, but a real production threshold should be based on the vault's actual total value.

### 2. Decide whether the owner should call `pause()`

The owner should consider calling `pause()` when the activity suggests a broader security incident rather than a normal user withdrawal.

Examples include:

- Multiple unexpected large withdrawals.
- Evidence of a vulnerability allowing users to withdraw more than their recorded balances.
- Suspicious activity involving the owner key.
- Unexpected token movements that do not match the contract's accounting.

Calling `pause()` stops new deposits while the incident is investigated.

Importantly, pausing does not prevent existing users from calling `emergencyWithdraw()`.

---

## Trigger: monitor.ts fires a "Contract UNPAUSED" alert

### 1. Confirm that the unpause was expected

Only the owner can call `unpause()`.

Confirm:

- Who sent the transaction.
- Whether that address is the expected owner.
- Whether the underlying incident was actually resolved.
- Whether the unpause was approved by the responsible security process.

An `Unpaused` event should not automatically be treated as proof that the system is safe.

### 2. Resume normal operation only after verification

Before considering the incident resolved, verify that:

- The cause of the original alert was understood.
- The affected functionality was reviewed.
- The owner key is still trusted.
- No suspicious transactions occurred while the incident was being investigated.

---

## Post-incident

After the incident is resolved, document what caused the alert and what changes are necessary.

Possible improvements specific to `GoodVault` include:

- Adding a dedicated withdrawal event to future versions of the contract.
- Monitoring `emergencyWithdraw()` activity through transaction or balance-change monitoring.
- Adjusting the large-withdrawal threshold based on the vault's real value.
- Improving monitoring to include transaction hashes and block numbers.
- Moving the owner key away from development-grade key storage.
- Using stronger key protection for production deployments.
- Considering a multisignature or threshold-signing mechanism for high-value deployments.

The final goal is not only to restore normal operation, but to reduce the chance that the same type of incident can occur again.
