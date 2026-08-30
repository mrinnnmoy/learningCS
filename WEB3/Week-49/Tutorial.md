# Tutorial: Installing Halmos for Symbolic Execution.

Every previous week's own `forge test` suite has been example-based.

- specific,
- hand-picked inputs,
- checked against specific,
- expected outcomes.

This week introduces genuinely different testing modes Foundry has supported all along but this course hasn't used yet, plus one new, real tool.

## 1. Foundry's own fuzz and invariant testing need no install at all.

They're built directly into `forge test`, simply unused until this week's own Contents and assignments reach for them deliberately.

---

## 2. Install Halmos.

A real, open-source symbolic execution tool for Solidity that integrates directly with Foundry-style test syntax:

```
pip install halmos
halmos --version
```

Halmos is genuinely newer and less universally documented than core Foundry itself.

If an exact flag or behavior doesn't match what's shown here, check Halmos's own current README.

The same caution this course has applied to a few other actively-evolving tools (Week 41's `MockPyth`, Week 44's `PackedUserOperation`).

---
