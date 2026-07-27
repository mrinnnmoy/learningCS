# Tutorial: Installing Slither for Static Analysis.

Foundry and (from Week 30) Hardhat are both already set up, nothing new needed there.

This week adds one genuinely new tool, a static analyzer, used in Hard's own assignment and worth a short setup pass first.

Mythril (Concept 10's other tool) is covered in Contents but deliberately not required for any assignment below. It's own setup (a Rust nightly toolchain, slower symbolic-execution runs) is real friction not worth blocking this week's own work on.

Slither alone is enough to get real, hands-on audit-tool experience.

## 1. Install Slither.

It's a Python tool, not an npm or Foundry package.

`uv` (a fast Python package manager) is the currently recommended install path:

```
curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install slither-analyzer
```

Plain `pip install slither-analyzer` also works if `uv` isn't available (Python 3.10+ required either way).

The package name is specifically `slither-analyzer`, not `slither`.

A real, easy mix-up since the command itself is just `slither`.

---

## 2. Confirm the install.

```
slither --version
```

---

## 3. Sanity-run it against any existing Foundry project.

Week 27's `counter` project works fine for this.

Slither reads a Foundry project's own `forge build` output automatically, no separate config needed for a standard layout:

```
cd counter
slither .
```

A clean run here, even if it reports a few informational findings against `Counter.sol`, confirms Slither, Python and its own solc detection are all working before Hard's assignment needs it against this week's own, deliberately vulnerable contracts.

---
