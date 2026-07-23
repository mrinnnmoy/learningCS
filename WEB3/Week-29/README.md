# List of things learned.

## 1. ERC-20 standard functions & events.

ERC-20 is the fungible-token standard.

A fixed interface every compliant token contract implements so that any wallet, exchange, or other contract can interact with it without knowing anything token-specific in advance.

The same _"shared interface, many implementations"_ idea Week 28's `ILogger` (Week 28, Concept 10) demonstrated for a single custom function, formalized here as an entire, universally-recognized standard.

```solidity
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
```

`transfer` moves the caller's own tokens directly.

`approve`/`allowance`/`transferFrom` is the two-step pattern that lets a _third_ address (a DEX, a marketplace, any contract) move tokens on an owner's behalf, up to a pre-approved amount, exactly the mechanism a Solana SPL token's delegate authority (Week 17, Concept 9) achieves by a structurally different route.

SPL delegates that authority as a field on the token account itself, checked by the Token Program.

ERC-20's allowance is just another number in the token contract's own storage (Week 27, Concept 2), checked by the token contract's own code.

Worth flagging directly rather than glossing over, calling `approve` a second time to _change_ an existing non-zero allowance has a well-known front-running caveat (a pending `transferFrom` using the old allowance can still land in between), which is exactly why OpenZeppelin's implementation, used throughout this week's assignments, is preferred over a hand-rolled one.

---

## 2. ERC-721 standard functions & events.

ERC-721 is the non-fungible-token standard, each `tokenId` within one contract is a distinct, individually-owned asset rather than an interchangeable unit the way an ERC-20 balance is.

The direct EVM-side counterpart to a Solana NFT (an SPL mint with supply fixed at 1 and 0 decimals, Week 17) or a compressed NFT's leaf (Week 21), but structurally simpler in one respect:

- one ERC-721 contract holds every token in the collection itself,
- there's no separate mint account per NFT the way Solana's model requires.

```solidity
interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}
```

`safeTransferFrom` differs from plain `transferFrom` in exactly one way, worth naming precisely.

If the recipient is a contract, `safeTransferFrom` requires it to implement `onERC721Received` and return the correct magic value, confirming it actually knows how to hold an NFT, otherwise the transfer reverts.

`transferFrom` skips that check entirely, meaning an NFT sent to a contract that never expected one can become permanently unreachable.

`approve`/`getApproved` grants transfer rights over one specific `tokenId`; `setApprovalForAll`/`isApprovedForAll` grants it over an owner's _entire_ collection at once, the mechanism every NFT marketplace relies on so it doesn't need a fresh approval per listing.

---

## 3. ERC-1155 overview. (The multi-token standard)

Where ERC-20 (Concept 1) is one fungible type per contract and ERC-721 (Concept 2) is one non-fungible token per `tokenId`.

ERC-1155 collapses both into a single contract.

Each `id` within it can represent either a fungible quantity (like an ERC-20) or a unique one-of-one (an ERC-721-shaped `id` with supply fixed at 1), decided per-`id`, not per-contract, plus genuinely new capability neither older standard has batch operations moving many different `id`s in one transaction.

```solidity
interface IERC1155 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids)
        external view returns (uint256[] memory);
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function safeBatchTransferFrom(
        address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data
    ) external;
    function setApprovalForAll(address operator, bool approved) external;

    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event URI(string value, uint256 indexed id);
}
```

|                            | ERC-20                                | ERC-721                                 | ERC-1155                                              |
| -------------------------- | ------------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| Fungibility                | Fungible only                         | Non-fungible only                       | Either, chosen per `id`                               |
| Balance shape              | One `uint256` per address             | One owner address per `tokenId`         | `uint256` per (address, `id`) pair                    |
| Batch transfer in one call | No                                    | No (one `tokenId` per call)             | Yes, natively                                         |
| Typical use                | Currencies, governance tokens, points | 1-of-1 collectibles, deeds, memberships | Game items (many of each), tickets, mixed collections |

This week's own assignments build a real ERC-20 (Easy) and a real ERC-721 (Medium, Hard).

ERC-1155 stays at this overview level deliberately, its shape matters most once Week 34 and beyond start combining tokens with real economic mechanisms, revisited properly if a later week needs it hands-on, not manufactured here just to have a third assignment.

---

## 4. Metadata standards. (`tokenURI` & the JSON schema behind it)

ERC-721's `tokenURI(uint256 tokenId) external view returns (string memory)` (added by the standard's optional Metadata extension, which OpenZeppelin's `ERC721URIStorage`, used in this week's Medium and Hard, implements) returns a URI, almost always pointing to a JSON document, not the asset itself.

The image, video, or other media is a separate field _inside_ that JSON, not returned by `tokenURI` directly.

```json
{
  "name": "Sunset #42",
  "description": "A hand-drawn piece from the Sunset collection.",
  "image": "ipfs://bafybeigdyrzt.../42.png",
  "attributes": [
    { "trait_type": "Background", "value": "Orange" },
    { "trait_type": "Rarity", "value": "Rare" }
  ]
}
```

ERC-1155's metadata extension works slightly differently.

One `uri(uint256 id)` function returns a URI template containing the literal substring `{id}`, which every client is expected to replace with the token's actual hex-encoded id itself.

A single URI pattern covering every token in the contract, rather than one distinct `tokenURI` return value per token the way ERC-721 works.

Where that URI actually points (a centralized HTTPS server vs. IPFS, Week 5's serialization-format concerns for the JSON itself) is a real design decision with real trust trade-offs, not covered further here, just flagged as a decision this week's assignments make plainly rather than silently.

Both use a simple HTTPS placeholder, production collections lean IPFS or Arweave for exactly the centralization concerns that implies.

---

## 5. OpenZeppelin's contracts library, in overview.

OpenZeppelin Contracts is a community-audited library of standard, reusable Solidity components.

The audited `Ownable` this week's assignments use in place of Week 27, Concept 11's hand-rolled version, the audited `ReentrancyGuard` in place of Week 28, Concept 11's hand-rolled one, full ERC-20/721/1155 implementations (Concepts 1-3), access control (Concept 7), the `Pausable` pattern (Concept 8) and further ahead in this course, upgradeable proxies (Week 33) and on-chain governance primitives (Week 42).

The library ships both `interfaces/` (bare interfaces like Concept 1's `IERC20`, for typing an external contract you didn't write, exactly Week 28 Concept 10's pattern) and `token/`, `access/`, `utils/` (full, inheritable implementations, what this week's assignments actually extend).

Worth being able to tell apart on sight, since importing the interface when an implementation was needed is a common, confusing early mistake.

The Tutorial's warning about `forge update` moving to `master` is this concept's own practical consequence.

An audited library is only as trustworthy as the specific, tagged version actually installed, which is exactly why Foundry's dependency model pins to a commit (recorded in `.gitmodules` / `lib/`) rather than a floating version range the way `npm` typically resolves one.

---

## 6. Extending OpenZeppelin base contracts.

`contract GameToken is ERC20, Ownable { ... }` (Week 27, Concept 11's inheritance mechanic, now inheriting from a real, audited library rather than a hand-rolled base) is the normal shape every assignment this week takes, but OpenZeppelin's own internal design is worth understanding, not just its public interface.

OpenZeppelin Contracts v5's `ERC20` and `ERC721` both route every balance change (a transfer, a mint, or a burn) through one internal hook, `_update`, rather than the separate `_beforeTokenTransfer`/`_afterTokenTransfer` pair older (v4-era) tutorials still online describe.

A real, versioned API difference worth knowing about specifically so an older blog post's code doesn't look broken for no visible reason.

```solidity
function _update(address from, address to, uint256 value) internal override(ERC20) whenNotPaused {
    super._update(from, to, value);
}
```

Overriding `_update` is how this week's Easy assignment adds a `Pausable` check (Concept 8) to every transfer, mint and burn in one place rather than three.

When a contract inherits from _two_ OpenZeppelin bases that both define `_update` (Hard's assignment, combining `ERC721`, `ERC721Enumerable`, and `ERC721URIStorage`), Solidity requires the override to name every parent explicitly, `override(ERC721, ERC721Enumerable, ERC721URIStorage)` and the override's own body must call `super._update(...)` to chain through each parent's own logic in turn.

Skipping that chain silently drops whatever bookkeeping the un-called parent was responsible for, exactly the kind of subtle omission Concept 11 below (added material) walks through directly.

---

## 7. Access control. (`Ownable` vs. role-based `AccessControl`)

`Ownable` (Week 27, Concept 11's own hand-rolled version, now the audited library one) is a single address with full privileged access.

Simple, and exactly right when there's genuinely only one kind of "admin" action a contract needs.

`AccessControl` generalizes this to any number of named roles, each a `bytes32` identifier (conventionally `keccak256("ROLE_NAME")`), independently grantable and revocable, checked with an `onlyRole` modifier rather than a single hardcoded `onlyOwner`.

```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

function mint(address to, uint256 tokenId) external onlyRole(MINTER_ROLE) {
    _safeMint(to, tokenId);
}
```

|                                                          | `Ownable`                                              | `AccessControl`                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Number of privilege levels                               | One (the owner)                                        | Any number, independently named                                                              |
| Granting a new privileged address                        | `transferOwnership` (replaces the ONE owner)           | `grantRole(ROLE, address)` (adds, doesn't replace)                                           |
| Revoking                                                 | Not directly — only by transferring ownership away     | `revokeRole(ROLE, address)`                                                                  |
| A `DEFAULT_ADMIN_ROLE` that can grant/revoke other roles | N/A                                                    | Yes, itself just another role, grantable to multiple addresses                               |
| This week's use                                          | Easy's `GameToken` (one kind of admin action: minting) | Medium/Hard's NFT collections (minting vs. pausing genuinely are different responsibilities) |

`AccessControl`'s many-roles model is the direct formal version of what Week 20's Solana security list called "authority" checks generally (Week 11, Concept 3's `owner` field, Week 13's PDA-as-signer).

A genuinely different mechanism, EVM roles are addresses mapped to role identifiers in the contract's own storage, not a Solana account's `owner` field, but solving the identical "who's allowed to do this specific privileged thing" problem.

---

## 8. The Pausable pattern.

`Pausable` (Concept 5's library, used directly, not hand-rolled) adds one `bool` (`_paused`) and two modifiers.

`whenNotPaused` and `whenPaused`, plus internal `_pause()`/`_unpause()` functions a contract wraps in its own access-controlled entry points (Concept 7).

A circuit breaker, letting privileged addresses freeze a contract's sensitive functions in an emergency (a discovered bug, an ongoing exploit) without needing Week 33's full upgradability machinery just to stop the bleeding.

```solidity
function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
}

function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
}
```

Structurally, `Pausable` is doing the same "modifier gates a mechanical safety property" work Week 28, Concept 11's `nonReentrant` guard did.

A different property (globally frozen vs. non-reentrant), same shape.

Check a `bool`, revert if it's in the wrong state, this week's Easy assignment applies it directly to `_update` (Concept 6) so every token movement, not just one specific function, respects the paused state in one place.

---

## 9. SafeMath, in its proper legacy context & Solidity's built-in overflow checks.

Before Solidity 0.8.0, arithmetic operators (`+`, `-`, `*`) silently wrapped around on overflow or underflow with no error at all.

A `uint256` at its maximum value plus `1` became `0` silently, a real, exploited vulnerability class in early Ethereum contracts.

OpenZeppelin's `SafeMath` library was the standard defense.

`a.add(b)` instead of `a + b`, reverting explicitly on overflow, mandatory in virtually every pre-0.8 production contract.

Solidity 0.8.0 made this check the _default_ for the plain operators themselves (Week 27, Concept 10's `assert`/Panic mechanism; Week 28's Easy assignment Test Case 4 already demonstrated the resulting `Panic(0x11)` firsthand), which is exactly why every contract this course has written since Week 27 has never needed `SafeMath` for ordinary `+`/`-`/`*`/`/`.

This week's assignments, all pinned to `0.8.36`, don't import it either, for the same reason.

```solidity
// Pre-0.8 (historical): required explicit SafeMath to be safe.
uint256 total = a.add(b);

// 0.8.36 (this course, throughout): the plain operator IS the safe version.
uint256 total = a + b;
```

`SafeMath` still exists in current OpenZeppelin releases, but narrowed to genuinely different jobs the built-in checks don't cover, muldiv-style operations that need intermediate precision beyond 256 bits.

For instance, not as a general replacement for `+`/`-`/`*` anymore.

Seeing `.add()`/`.sub()` calls in an older tutorial or an unaudited older contract is the specific signal that its code predates 0.8's own built-in protection, worth recognizing on sight rather than copying without understanding why it's there.

---

## 10. Choosing the right standard. (A direct decision, not just a definitions list)

Concepts 1 through 3 describe what each standard _is_.

The genuinely useful skill is picking the right one before writing a line of Solidity and the decision is almost always answerable from two questions.

Are the units interchangeable (fungible) and does the contract need to batch-move many different kinds of unit at once.

Fungible, single kind, no batching need → ERC-20 (Easy's `GameToken`).

Unique, one-of-a-kind, each individually owned → ERC-721 (Medium/Hard's NFT collections).

Multiple kinds — some fungible, some not, possibly wanting to move several at once in a single transaction — → ERC-1155.

The case this week's assignments don't build hands-on (Concept 3) but that a later real project reaching for a game-items inventory or a ticketing system with several ticket tiers would reach for directly, rather than bolting several separate ERC-20/721 contracts together to fake it.

---

## 11. Multiple inheritance overrides in practice. (Combining `_update` across OpenZeppelin bases correctly)

Concept 6 named the mechanism.

This is the concrete failure mode worth walking through once before Hard's assignment needs it for real.

`ERC721Enumerable` maintains extra bookkeeping (an index letting `tokenOfOwnerByIndex` and `totalSupply` work) inside its own override of `_update`;

`ERC721URIStorage` maintains a per-token URI mapping, also via its own override of a hook (`_update` for cleanup on burn, in OZ v5's unified model).

A contract inheriting both, plus plain `ERC721`, must override `_update` once, list every parent that defines it and call `super._update(...)` exactly once inside that override.

Solidity's C3 linearization then walks the override chain through every listed parent automatically, each one's own bookkeeping runs in turn.

```solidity
function _update(address to, uint256 tokenId, address auth)
    internal
    override(ERC721, ERC721Enumerable)
    returns (address)
{
    return super._update(to, tokenId, auth);   // one call — the chain walks EVERY listed parent
}

function supportsInterface(bytes4 interfaceId)
    internal view
    override(ERC721, ERC721Enumerable, AccessControl)
    returns (bool)
{
    return super.supportsInterface(interfaceId);   // same pattern, different hook (Week 26, Concept 6's ABI/interface IDs)
}
```

Forgetting to list a parent in `override(...)` is a compile error, Solidity catches that outright.

The genuinely dangerous mistake is listing every parent correctly but never actually calling `super` at all, replacing the chain with brand-new logic instead.

That compiles cleanly and silently drops whichever parent's bookkeeping the replacement forgot to reimplement, exactly the kind of corner Hard's own Manual Test Cases check for directly rather than trusting a clean compile as proof of correctness.

---

## Assignment.

1. **Easy - A Custom ERC-20 with Owner-Gated Minting and a Pause Switch.**

   **What you practice:**
   - ERC-20's standard functions and events, via a real, audited implementation rather than a hand-rolled interface (Concept 1)
   - Extending two OpenZeppelin base contracts at once, `ERC20` and `Ownable` (Concepts 5, 6)
   - `Ownable`-gated minting (Concept 7)
   - `Pausable`, applied through a single `_update` override so it covers transfers, mints, and burns in one place (Concepts 6, 8)
   - Confirming Solidity 0.8.36's built-in overflow protection directly, no `SafeMath` needed (Concept 9)

   **Requirements:**
   - A `GameToken is ERC20, Ownable, Pausable` contract, constructor takes `address initialOwner`, names the token `"GameToken"` / symbol `"GAME"`.
   - `mint(address to, uint256 amount)`, `onlyOwner`, calls OpenZeppelin's internal `_mint`.
   - `pause()` / `unpause()`, both `onlyOwner`, calling `_pause()`/`_unpause()`.
   - An overridden `_update` applying `whenNotPaused` to every balance change (transfers, mints, and burns alike), calling `super._update(...)`.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command:
           cast send <ADDRESS> "mint(address,uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1000000000000000000000 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast call <ADDRESS> "balanceOf(address)(uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
           --rpc-url http://127.0.0.1:8545

       Expected output: `1000000000000000000000` (1000 GAME, 18 decimals
       is ERC20's own default, inherited automatically from OpenZeppelin's
       implementation) — confirming owner-gated minting works end to end.

   2. Command:
           cast send <ADDRESS> "mint(address,uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       Expected output: reverts, decodable as OpenZeppelin's own
       `OwnableUnauthorizedAccount(0x70997970C51812dc3A010C7d01b50e0d17dc79C8)`
       custom error (Week 27, Concept 13 — OpenZeppelin v5's own errors are
       custom errors throughout, not string `require` messages) — confirming
       `onlyOwner` genuinely blocks a non-owner caller.

   3. Command:
           cast send <ADDRESS> "pause()" --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast send <ADDRESS> "transfer(address,uint256)" 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 1 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       Expected output: the transfer reverts with `EnforcedPause()` — even
       an ordinary transfer between two non-owner accounts is blocked,
       confirming the `_update` override (Concept 6, 8) genuinely covers
       transfers, not just minting. Run `cast send <ADDRESS> "unpause()" ...`
       with the owner's key afterward to leave the contract usable again.

   4. Command: in src/GameToken.sol, temporarily change the `_update`
       override's modifier from `whenNotPaused` to nothing (remove the
       modifier entirely, keeping `super._update(from, to, value);` as the
       only line in the body), rebuild, and redeploy fresh (note the NEW
       address, <ADDRESS2>):

           forge build

           forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast

           cast send <ADDRESS2> "pause()" --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast send <ADDRESS2> "mint(address,uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

       Expected output: minting now SUCCEEDS even while paused — confirming
       the modifier on `_update` was the entire mechanism enforcing
       Concept 8's pause behavior, not incidental to it working before.
       Revert the source change afterward; <ADDRESS2> was only ever a
       throwaway local deployment, safe to abandon.
   ```

2. **Medium - An ERC-721 Collection with Per-Token Metadata and Role-Based Minting.**

   **What you practice:**
   - ERC-721's standard functions and events, via OpenZeppelin's audited implementation (Concept 2)
   - Per-token metadata via `tokenURI`, backed by `ERC721URIStorage` (Concept 4)
   - `AccessControl`'s role-based model, genuinely different from Easy's single-owner `Ownable` (Concepts 6, 7)
   - Extending two OpenZeppelin token-related bases at once, `ERC721` and `ERC721URIStorage`, with a `_update`-style override chain kept to a single parent hook for now (Hard adds a third parent and the full pattern from Concept 11)

   **Requirements:**
   - An `ArtCollection is ERC721, ERC721URIStorage, AccessControl` contract, constructor takes `address admin`, grants that address both `DEFAULT_ADMIN_ROLE` and a `MINTER_ROLE`, names the collection `"Art Collection"` / symbol `"ART"`.
   - `mint(address to, uint256 tokenId, string calldata uri)`, `onlyRole(MINTER_ROLE)`, calls `_safeMint` then `_setTokenURI`.
   - `tokenURI(uint256 tokenId)` and `supportsInterface(bytes4 interfaceId)` both overridden to resolve the `ERC721`/`ERC721URIStorage`/`AccessControl` diamond correctly (Concept 6, 11), each calling `super`.
   - Granting `MINTER_ROLE` to a second address should let that address mint too, without touching `DEFAULT_ADMIN_ROLE` at all — the actual point of `AccessControl` over `Ownable` (Concept 7).

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command:
           cast send <ADDRESS> "mint(address,uint256,string)" \
           0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 "ipfs://bafybeigdyrzt.../1.json" \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast call <ADDRESS> "ownerOf(uint256)(address)" 1 --rpc-url http://127.0.0.1:8545

           cast call <ADDRESS> "tokenURI(uint256)(string)" 1 --rpc-url http://127.0.0.1:8545

       Expected output: `ownerOf(1)` returns Account 1's address,
       `tokenURI(1)` returns the exact URI string passed to mint —
       confirming Concept 2's ownership tracking and Concept 4's per-token
       metadata both work, and specifically that the `tokenURI` override
       chain (Concept 11) reached `ERC721URIStorage`'s real stored value
       rather than some default.

   2. Command:
           cast send <ADDRESS> "mint(address,uint256,string)" \
           0x70997970C51812dc3A010C7d01b50e0d17dc79C8 2 "ipfs://bafybeigdyrzt.../2.json" \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       Expected output: reverts, decodable as OpenZeppelin's
       `AccessControlUnauthorizedAccount(address account, bytes32 neededRole)`
       custom error, naming Account 1 and `MINTER_ROLE`'s own hash —
       confirming `onlyRole` genuinely blocks an address that has no role
       at all, distinct from Easy's simpler single-owner check.

   3. Command (grant the role, then repeat the exact same mint that just
       failed):
           cast send <ADDRESS> "grantRole(bytes32,address)" \
           $(cast keccak "MINTER_ROLE") 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast send <ADDRESS> "mint(address,uint256,string)" \
           0x70997970C51812dc3A010C7d01b50e0d17dc79C8 2 "ipfs://bafybeigdyrzt.../2.json" \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       Expected output: this time it SUCCEEDS — confirming `AccessControl`'s
       actual advantage over `Ownable` from Concept 7's table directly:
       Account 1 can now mint without ever touching `DEFAULT_ADMIN_ROLE`
       or replacing the one single owner the way `Ownable` would have
       required.

   4. Command: in src/ArtCollection.sol, temporarily remove `AccessControl`
       from the `supportsInterface` override's parent list (change
       `override(ERC721, ERC721URIStorage, AccessControl)` to
       `override(ERC721, ERC721URIStorage)`, and correspondingly drop
       `, AccessControl` from the contract's own `is` list at the top so it
       still compiles), rebuild, and redeploy fresh (new <ADDRESS2>), then:

           cast call <ADDRESS2> "supportsInterface(bytes4)(bool)" 0x7965db0b \
           --rpc-url http://127.0.0.1:8545

       (`0x7965db0b` is `AccessControl`'s own interface id.) Expected
       output: returns `false` — confirming that removing `AccessControl`
       from the override chain genuinely removes its interface advertisement
       from `supportsInterface`, exactly the kind of silent gap Concept 11
       warned a broken override chain produces, here deliberately triggered
       by removing the whole base rather than just skipping a `super` call.
       Revert the source change afterward.
   ```

3. **Hard - A Live, Enumerable, Pausable, Role-Gated NFT Collection on Sepolia.**

   **What you practice:**
   - The full three-parent override chain from Concept 11, `ERC721` + `ERC721Enumerable` + `ERC721URIStorage`, `_update` and `supportsInterface` both resolved correctly
   - `AccessControl` with two independently meaningful roles at once, `MINTER_ROLE` and `PAUSER_ROLE` (Concept 7)
   - `Pausable` applied to a real, live contract for the first time this week (Concept 8)
   - Confirming an existing keystore's balance before reusing it, rather than assuming last week's funding is still there — the environment-tracking discipline from Week 27's Hard, applied again here without you having to ask for it

   **Requirements:**
   - A `LiveArtCollection is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl, Pausable` contract, constructor takes `address admin`, granting `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` all to that one address at deploy time, named `"Live Art Collection"` / symbol `"LART"`.
   - `mint(address to, uint256 tokenId, string calldata uri)`, `onlyRole(MINTER_ROLE)`.
   - `pause()`/`unpause()`, both `onlyRole(PAUSER_ROLE)`.
   - `_update` overridden across all three token-related parents, applying `whenNotPaused`; `tokenURI` and `supportsInterface` each overridden across every parent that defines them, all calling `super`.
   - Deployment address AND the block number it was deployed in both get saved to `deployments/sepolia.txt`, specifically so a later `cast logs` query can scope `--from-block` to that number rather than searching from block 0 and hitting Sepolia's public-RPC block-range cap.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command:
           cast send <ADDRESS> "mint(address,uint256,string)" \
           $(cast wallet address --account deployerKey) 1 "ipfs://bafybeigdyrzt.../1.json" \
           --rpc-url sepolia --account deployerKey

           cast call <ADDRESS> "totalSupply()(uint256)" --rpc-url sepolia

           cast call <ADDRESS> "tokenOfOwnerByIndex(address,uint256)(uint256)" \
           $(cast wallet address --account deployerKey) 0 --rpc-url sepolia

       Expected output: `totalSupply()` returns `1`, `tokenOfOwnerByIndex`
       returns `1` — confirming `ERC721Enumerable`'s bookkeeping (Concept 11)
       genuinely ran, meaning the `_update` override chain actually reached
       it rather than silently skipping it, on a real, live deployment this
       time, not just anvil.

   2. Command (using the block number saved in deployments/sepolia.txt as
       <FROM_BLOCK> — this is the fix for last time's "exceed maximum block
       range: 50000" error, scoping the query rather than searching from
       block 0):

           cast logs --address <ADDRESS> --from-block <FROM_BLOCK> --rpc-url sepolia

       Expected output: a `Transfer` event from `address(0)` (Week 27,
       Concept 2's `address(0)` convention for "no prior owner," i.e. a
       mint) to the deployer's own address for `tokenId` `1` — confirming
       the mint transaction genuinely landed on Sepolia and is independently
       queryable after the fact, exactly Week 27 Hard's own "persisted, not
       ephemeral" point, now for an NFT instead of a task registry entry.

   3. Command:
           cast send <ADDRESS> "pause()" --rpc-url sepolia --account deployerKey

           cast call <ADDRESS> "mint(address,uint256,string)" \
           $(cast wallet address --account deployerKey) 2 "ipfs://bafybeigdyrzt.../2.json" \
           --rpc-url sepolia --from $(cast wallet address --account deployerKey)

       Expected output: the simulated call reverts with `EnforcedPause()`
       — confirming `Pausable` (Concept 8) genuinely blocks minting on the
       live contract, checked here with a free `cast call` simulation
       specifically to avoid spending real Sepolia gas on a transaction
       already known to fail. Run `cast send <ADDRESS> "unpause()" ...`
       afterward with the same account to leave the contract usable again.

   4. Command: in src/LiveArtCollection.sol, temporarily change the
       `_update` override's body from `return super._update(to, tokenId, auth);`
       to just `return to;` (keeping the `override(ERC721, ERC721Enumerable)`
       parent list and the `whenNotPaused` modifier exactly as they are —
       this is Concept 11's specific warning made concrete: every parent
       listed correctly, but the chain itself never actually called),
       rebuild, and redeploy fresh to anvil this time, not Sepolia, to avoid
       spending real gas on a contract known to be broken:

           forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast

           (note the new local address, <ADDRESS3>)

           cast send <ADDRESS3> "mint(address,uint256,string)" \
           0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1 "ipfs://.../1.json" \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast call <ADDRESS3> "totalSupply()(uint256)" --rpc-url http://127.0.0.1:8545

       Expected output: the mint transaction itself succeeds (ERC721's own
       ownership bookkeeping doesn't live in `_update`'s return value), but
       `totalSupply()` still returns `0` — confirming `ERC721Enumerable`'s
       own bookkeeping was genuinely skipped, silently, exactly Concept 11's
       warning about a syntactically-correct-but-broken override chain,
       made concrete rather than theoretical. Revert the source change
       afterward; <ADDRESS3> was only ever a throwaway local deployment,
       safe to abandon, and never touched Sepolia at all.
   ```
