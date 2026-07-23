# Tutorial: Installing OpenZeppelin Contracts as a Foundry Dependency.

This is the first week that pulls in a real external dependency rather than writing every contract from scratch and it's worth its own short setup pass before Contents, the same shape Week 27's Foundry/`solc` tutorial used.

## 1. Install OpenZeppelin Contracts into a project.

Run this inside each new `forge init` project this week needs it (Easy, Medium, and Hard each get their own):

```
forge install OpenZeppelin/openzeppelin-contracts
```

`forge install` with no `--branch`/`--tag` flag installs whatever the repository's latest _tagged_ release currently is — `5.6.x` at time of writing.

OpenZeppelin ships minor releases fairly often, so treat that as a starting point to confirm, not a fixed number.

Worth a specific, documented gotcha. A later `forge update` on this same dependency switches to tracking the `master` branch rather than staying on tagged releases, `master` is a live development branch, not meant for use in a real project.

Never run a bare `forge update` against this dependency, if a version bump is ever wanted later, reinstall a specific tag explicitly instead.

---

## 2. Tell the compiler where to find it.

Add this line to `remappings.txt` (create the file if `forge init` didn't already, in the project root):

```
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
```

This is what makes `import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";` resolve to the actual installed files under `lib/`.

The same remapping mechanism `forge-std` already uses by default for `forge-std/Test.sol`-style imports.

---

## 3. Confirm the install with a sanity build.

Any file importing something real from the library, then `forge build`, confirms both the install and the remapping worked before Contents and Assignment below:

```solidity
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

```
forge build
```

A clean build here means the dependency is genuinely resolvable, not just present on disk.

---
