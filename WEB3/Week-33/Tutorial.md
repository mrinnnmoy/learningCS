# Tutorial: Installing OpenZeppelin's Upgradeable Contracts & the Foundry Upgrades Plugin.

Week 28 (Concept 6) already built a `delegatecall`-based proxy by hand and Week 31 (Concept 8) named exactly what's dangerous about doing that carelessly.

This week uses real, audited tooling instead of hand-rolling it again, two new installs on top of the Foundry/OpenZeppelin setup from Weeks 27-29.

## 1. Install the upgradeable variant of OpenZeppelin's contracts.

This is a genuinely separate package from Week 29's `openzeppelin-contracts`

- same API shape,
- `Ownable` becomes `OwnableUpgradeable`,
- a constructor becomes an `initialize` function (Concept 6 covers exactly why).

Everything else about how it's extended (Week 27, Concept 11) stays the same:

```
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
echo '@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/' >> remappings.txt
```

---

## 2. Install the OpenZeppelin Foundry Upgrades plugin.

This is the tool that actually validates a new implementation's storage layout is safe before letting an upgrade through (Concept 5), rather than trusting a human to check by hand every time:

```
forge install OpenZeppelin/openzeppelin-foundry-upgrades
echo 'openzeppelin-foundry-upgrades/=lib/openzeppelin-foundry-upgrades/src/' >> remappings.txt
```

---

## 3. Enable the compiler output this plugin needs & confirm Node.js is installed.

The validation itself runs through a Node-based CLI under the hood (installed automatically as an npm dependency of the plugin the first time it runs), needing specific extra compiler output most projects don't turn on by default.

Add this to `foundry.toml`:

```toml
[profile.default]
solc = "0.8.36"
ffi = true
ast = true
build_info = true
extra_output = ["storageLayout"]
```

`ffi = true` specifically means Foundry is allowed to shell out to an external process during a script or test run, worth understanding what that setting actually does rather than pasting it blindly.

Since it's a real, broader capability than anything a previous week's `foundry.toml` has needed.

Confirm Node is available the same way Week 30's own Tutorial did:

```
node --version
```

---

## 4. A real, specific gotcha worth flagging up front rather than discovering the hard way.

This plugin's validation can go stale against cached build artifacts.

Run `forge clean` before a script or test that deploys or upgrades a proxy or add `--force` to the `forge script`/`forge test` command itself.

Skipping this is the single most common cause of a validation that inexplicably still complains about an already-fixed storage layout issue.

```
forge clean
forge test -vv --force
```

If the validation setup itself ever becomes more friction than this week's own learning goals justify.

Every `Upgrades` function has an `UnsafeUpgrades` counterpart (`import {UnsafeUpgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";`) that skips validation entirely,

- no `ffi`,
- no Node dependency.

Genuinely useful to know exists, not the default this week's own assignments reach for, since skipping validation is exactly the corner-cutting Concept 5 exists to prevent.

---
