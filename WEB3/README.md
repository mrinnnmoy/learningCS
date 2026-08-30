# List of things learned.

## [Week 1](./Week-1/README.md) : Orientation.

- What is WEB3 & how it differs from WEB2,
- The Blockchain Landscape,
- Anatomy of a WEB3 developer's Toolchain,
- How this Course is structures & How to use each week's README,
- Reading fast-moving documentation & pinning versions,
- Block Explorers, Networks & Faucets.

## [Week 2](./Week-2/README.md) : Introduction to Blockchains.

- What is a Blockchain, really,
- Hash Functions,
- From block to chain,
- Distributed ledgers,
- Basic Consensus,
- The Mempool, The Transaction Lifecycle & Why fees exist.

## [Week 3](./Week-3/README.md) : Cryptography.

- Symmetric vs Asymmetric Cryptography,
- Public vs Private Keys,
- Digital Signatures,
- Elliptic Curves,
- Signed Transactions,
- Merkle trees & Merkle proofs,
- Zero-Knowledge proofs.

## [Week 4](./Week-4/README.md) : Wallets & Key Management (Basics).

- What is a Wallet,
- Seed Phrases,
- Hierarchical deterministic wallets,
- Password-based Encryption,
- The Wallet Landscape,
- Signing messages vs Signing transactions.

## [Week 5](./Week-5/README.md) : Data Serialization. (Serde/Borsh)

- What is Serialization,
- Why JSON isn't good enough for on-chain data,
- Borsh,
- Serde,
- Schema evolution.

## [Week 6](./Week-6/README.md) : Rust (Fundamentals)

- Cargo & The Anatomy of a Rust Project,
- Variables, Mutability & Basic types,
- Ownership & Borrowing,
- Structs & Enums,
- Pattern Matching, Option & Result,
- Control flow, Slices & A preview of modules.

## [Week 7](./Week-7/README.md) : Rust (Advanced)

- Traits,
- Generics,
- Trait objects & Dynamic Dispatch,
- Closures & Iterators,
- Smart pointers (`Box`, `Rc` and `RefCell`),
- Concurrency and Unsafe Rust.

## [Week 8](./Week-8/README.md) : Deriving Macros.

- What is a derive macro,
- A tour of the built-in derives,
- Declarative vs. Procedural,
- How a custom derive macro actually works,
- Attribute macros & Function-like macros,
- Preview.

## [Week 9](./Week-9/README.md) : Lifetimes in Depth.

- What Lifetimes solve,
- Function Signatures,
- Lifetime elision rules,
- Structs with Lifetimes,
- Lifetime bounds on generics,
- The `static` lifetime,
- Common borrow-checker errors & Fixes.

## [Week 10](./Week-10/README.md) : Solana Architecture.

- The Solana Runtime,
- Sealevel,
- Proof of History,
- Tower BFT,
- Validators, The Leader schedule & Clusters,
- Guld Stream & Turbine,
- Cloudbreak,
- Transaction fees, Rent & Compute units.

## [Week 11](./Week-11/README.md) : Solana Jargon.

- The Account Model,
- Anatomy of an Account,
- The `owner` field,
- System Accounts & The System Program,
- Authority,
- Signer vs. Writable,
- Rent, Rent-exemption & Account size limits,
- Sysvars & Cross-Program invocation (intro).

## [Week 12](./Week-12/README.md) : Solana Wallet Adapter & Client-Side.

- `@solana/web3.js` Basics, consolidated,
- Wallet Adapter Architecture,
- Provider Setup,
- Connecting a Wallet to UI,
- Requesting signatures,
- Sending transactions & Reading account data from the client,
- Handling transaction confirmation, client-side,
- Error Handling.

## [Week 13](./Week-13/README.md) : PDA's (Program Derived Addresses).

- What are PDA's & the exact problem they solve,
- Off-Curve Addresses,
- Seeds & The Bump,
- Deterministic Address derivation,
- `findProgramAddressSync` and The Canonical Bump,
- Common PDA Patterns,
- PDA as signer,
- PDA Collision Avoidance & Solana's hard seed Limits.

## [Week 14](./Week-14/README.md) : Solana Native Contracts in Rust.

- Program entrypoint Structure,
- Instruction data parsing,
- Account Validation,
- Processing Instructions,
- State management without a framework,
- Cross-program Invocation,
- Error handling in native programs,
- Deploying native programs,
- Testing native programs.

## [Week 15](./Week-15/README.md) : Anchor Framework vs Raw Contracts.

- Anchor project structure,
- The `#[program]` macro,
- `#[derive(Accounts)]` & Account constraints,
- Anchor's typed account wrappers,
- Anchor IDL generation,
- Anchor error handling,
- CPI with Anchor,
- Anchor's testing framework,
- Trade-offs.

## [Week 16](./Week-16/README.md) : JS Clients for Smart Contracts.

- The Anchor IDL (in full),
- `@coral-xyz/anchor` client setup (formalized),
- Program instance creation & Program ID's origin,
- 3 ways to call an Instruction,
- Fetching & Deserializing account data,
- Event Listening,
- Transaction building & Sending,
- Error decoding from Anchor programs.

## [Week 17](./Week-17/README.md) : SPL Tokens & Token Program.

- The SPL Token Program,
- Mint Accounts,
- Token Accounts & Associated Token Accounts,
- Minting tokens,
- Transferring tokens,
- Burning tokens,
- Freezing & Thawing Accounts,
- Decimals & Supply,
- Multisig token Authorities & The `spl-token` CLI.

## [Week 18](./Week-18/README.md) : Token Extensions. (Token-2022)

- Why Token-2022 was introduced,
- Extension architecture,
- Transfer fees Extension,
- Interest-bearing Tokens,
- Non-transferable Tokens,
- Confidential transfers,
- Metadata pointer Extension,
- Permanent delegate Extension,
- Default Account State & What "migrating" to Token-2022 actually means.

## [Week 19](./Week-19/README.md) : Common Contracts. (Staking & Escrow)

- Staking contract Design,
- Rewards calculation Models,
- Lock-up Periods & Vesting,
- Escrow contract Design,
- Multi-party Fund Holding,
- Timelocks,
- Cancel/Refund Logic,
- State machine design for Contracts,
- Testing Staking/Escrow Flows.

## [Week 20](./Week-20/README.md) : Program Security.

- Common Solana vulnerabilities,
- Missing signer checks,
- Missing owner checks,
- Account substitution atacks,
- PDA seed collisions,
- Integer overflow/underflow,
- Re-initialization checks,
- Arbitrary CPI vulnerabilities,
- Type confusion,
- Rent-exemption bypass issues,
- Security audit checklists,
- Fuzzing programs.

## [Week 21](./Week-21/README.md) : Compressed NFTs.

- Why NFT compression exists,
- State compression concept,
- Merkle trees for cNFTs,
- Concurrent Merkle trees,
- Bubblegum program overview,
- Minting compressed NFTs,
- Transferring compressed NFTs,
- Indexing compressed NFTs,
- Cost comparison vs Regular NFTs,
- Canopy depth,
- Tree authority, delegates & public vs private trees,
- Verified collections on cNFTs,
- Burning compressed NFTs,
- Bubblegum V2.

## [Week 22](./Week-22/README.md) : DeFi. (AMM, DLMM, CLMM, Perps)

- AMM Fundamentals,
- Liquidity Pool basics,
- Slippage & Price Impact,
- DLMM (Dynamic Liquidity Market Maker),
- CLMM (Concentrated Liquidity Market Maker),
- Ticket-based Liquidity ranges,
- Impermanent loss mechanics,
- Perpetual Future basics,
- Funding rates,
- Leverage & Liquidation mechanics,
- Order books vs AMMs on-chain,
- Swap fees & LP fees accural,
- LP shares as an Accounting mechanism,
- Mark price vs Index price & Funding settlement mechanics,
- Liquidation engines & Insurance funds.

## [Week 23](./Week-23/README.md) : Payment Infrastructure.

- On-chain Payment flows,
- Solana Pay (Payment request standards),
- QR code payment flows,
- Recurring payments/subscriptions on-chain,
- Merchant integration patterns,
- Handling refunds on-chain,
- Stablecoin payment rails,
- Fee abstraction,
- Solana Pay's 2 request types,
- Reference keys & Payment detection,
- Idempotency & Double-payment prevention,
- How fee abstraction actually works on Solana.

## [Week 24](./Week-24/README.md) : Indexing.

- Need for Indexing,
- Geyser plugin concept,
- gRPC streaming (Yellowstone),
- Building custom Indexers,
- Webhooks for on-chain events,
- Third-party Indexers (Helius, Quicknode),
- Database design for Indexed data,
- Real-time vs Historical Indexing,
- Polling vs. Push-based Indexing,
- Checkpointing and Resumable Indexing,
- Idempotent event processing,
- Webhook payload verification.

## [Week 25](./Week-25/README.md) : LSTs. (Liquid Staking Tokens)

- Native staking vs Liquid staking,
- How LSTs work,
- Validator delegation strategies,
- Exchange rate mechaincs,
- Unstaking & Cooldown periods,
- LST use in DeFi,
- Risks of Liquid staking,
- Popular LST protocols overview,
- Native Solana staking mechanics,
- Stake pool Architecture,
- Reward compounding & Exchange-rate growth Mechanics,
- Instant unstake via a secondary Liquidity pool.

## [Week 26](./Week-26/README.md) : Intro to Ethereum & EVM.

- Ethereum Account model,
- EVM Architecture overview,
- Gas & Gas Price mechanics,
- EIP-1559 Fee model,
- Opcodes basics,
- Bytecode & ABI,
- Nonce on Ethereum,
- Block structure on Ethereum,
- Ethereum client types,
- Wei, Gwei & ETH,
- JSON-RPC,
- Comparing Ethereum's account model to Solana's.

## [Week 27](./Week-27/README.md) : Solidity. (Fundamentals)

- Contract structure,
- State variables,
- Data types & Visibility modifiers,
- Functions & Modifiers,
- Constructors,
- Events & Logging,
- Mapping & Arrays,
- Structus & Enums,
- `msg.sender`, `msg.value`, `msg.data`,
- Error Handling,
- Inheritance basics,
- Function state mutability,
- Custom errors,
- Foundry project anatomy & The compile/test/deploy lifecycle.

## [Week 28](./Week-28/README.md) : Payable, Fallback & CCIs.

- `payable` functions,
- Sending & receiving ETH,
- The `receive()` function,
- The `fallback()` function,
- `receive` vs `fallback`,
- Low-level calls,
- Cross-contract interactions (CCIs),
- Reentrancy risks in cross-contract calls,
- The Checks-Effects-Interactions pattern,
- Interface-based external calls,
- Reentrancy guards.

## [Week 29](./Week-29/README.md) : ERC-20/ERC-721/OpenZeppelin.

- ERC-20 standard functions & events,
- ERC-721 standard functions & events,
- ERC-1155 overview (multi-token standard),
- Metadata standards,
- OpenZeppelin contracts library overview,
- Extending OpenZeppelin base contracts,
- Access control,
- The Pausable pattern,
- SafeMath & built-in overflow checks,
- Choosing the right standard,
- Multiple inheritance overrides in practice.

## [Week 30](./Week-30/README.md) : Hardhat/Foundry.

- Project setup,
- Compiling contracts,
- Local test networks,
- Writing tests, (JS/TS in Hardhat & Solidity in Foundry)
- Scripting deployments,
- Forking mainnet for testing,
- Gas reporting,
- Debugging with console logs/traces,
- Verifying contracts on Etherscan,
- Choosing between both.

## [Week 31](./Week-31/README.md) : Smart Contract Security.

- Reentrancy attacks,
- Integer overflow/underflow,
- Access control vulnerabilities,
- Front-running & MEV basics,
- Flash loan attacks,
- Oracle manipulation attacks,
- Denial of service patterns,
- Delegatecall vulnerabilities,
- Timestamp dependence,
- Audit tools (Slither/Mythril),
- Security best-practice checklists,
- Composing vulnerabilities.

## [Week 32](./Week-32/README.md) : ETH Wallet Adapter & Client-Side.

- Basics of `ethers.js` vs `viem`,
- Provider & signer concepts,
- Connecting MetaMask & WalletConnect,
- Reading contract state,
- Sending transactions,
- Listening to contract events,
- Handling transaction receipts,
- Chain switching & Network detection,
- Gas estimation client-side,
- The EIP-1193 provider interface,
- Client-side key safety.

## [Week 33](./Week-33/README.md) : Upgradability in ETH.

- Why contracts need upgradability,
- Proxy pattern basics,
- Transparent proxy pattern,
- UUPS proxy pattern,
- Storage layout & collisions,
- Initializer functions vs constructors,
- The Diamond pattern (multi-facet proxies) overview,
- Upgrade governance & Timelocks,
- Risks of upgradable contracts,
- Choosing a pattern for a real project.

## [Week 34](./Week-34/README.md) : Liquidity Pools & Impermanent Loss.

- Constant product AMM math (x\*y=k),
- LP token mechanics,
- Adding & Removing liquidity,
- Fee accrual to LPs,
- Impermanent loss calculation,
- Impermanent loss vs Volatility correlation,
- Concentrated liquidity basics,
- Yield farming basics,
- Pool exploits (sandwich attacks),
- Slippage protection.

## [Week 35](./Week-35/README.md) : Indexing (The Graph).

- The Subgraph concept,
- GraphQL basics for querying,
- Defining `schema.graphql`,
- Mapping handlers (AssemblyScript),
- Event-driven indexing,
- Deploying subgraphs,
- Querying subgraphs from a frontend,
- The Graph's hosted service vs The decentralized network,
- Subgraphs vs A custom indexer vs A live listener.

## [Week 36](./Week-36/README.md) : Bridges (How They Work).

- The cross-chain communication problem,
- Lock-and-mint bridge model,
- Burn-and-mint bridge model,
- Liquidity network bridges,
- Trusted vs Trustless bridges,
- Light client verification bridges,
- Validator/relayer roles,
- Message-passing protocols (generic messaging),
- Bridge risks & Historical exploits,
- Choosing a bridge model.

## [Week 37](./Week-37/README.md) : Building an EVM Bridge.

- Bridge contract architecture,
- Locking assets on source chain,
- Emitting cross-chain events,
- Relayer/oracle service design,
- Minting wrapped assets on destination chain,
- Replay protection across chains,
- Handling finality differences between chains,
- Testing bridge flows end-to-end,
- The full lifecycle of one cross-chain transfer.

## [Week 38](./Week-38/README.md) : MPC & Shamir's Secret Sharing.

- Multi-Party Computation (concept),
- Threshold cryptography basics,
- Shamir's Secret Sharing algorithm,
- Secret reconstruction (Lagrange interpolation, conceptual),
- MPC wallets vs multisig wallets,
- Key generation without a single point of failure,
- Use cases in custody solutions,
- Trade-offs of MPC (latency, complexity),
- Details on this week's hands-on demo.

## [Week 39](./Week-39/README.md) : Partially Centralized Contracts.

- Admin key patterns,
- Pausable & Circuit-breaker patterns,
- Emergency withdrawal mechanisms,
- Rate limiting on-chain,
- Whitelisting & Blacklisting patterns,
- Governance-gated parameters,
- Progressive decentralization strategies,
- Trust assumptions disclosure,
- Designing one contract's admin surface deliberately.

## [Week 40](./Week-40/README.md) : On-Chain Data Model Design.

- Designing account/state structures for scalability,
- Data normalization vs Denormalization on-chain,
- Choosing PDAs vs Storage contracts for relationships,
- Minimizing storage costs (rent/gas considerations),
- Versioning on-chain schemas,
- Pagination patterns for large datasets,
- Off-chain vs On-chain data trade-offs,
- Designing one real data model end to end.

## [Week 41](./Week-41/README.md) : Oracles (Chainlink/Pyth).

- The oracle problem,
- Price feed oracles,
- Pull vs Push oracle models,
- Chainlink architecture overview,
- Pyth network architecture overview,
- Data freshness & staleness checks,
- Oracle manipulation risks,
- Aggregation & median pricing,
- VRF (verifiable random functions) overview,
- Choosing Chainlink, Pyth or neither.

## [Week 42](./Week-42/README.md) : Multisig & Governance.

- Multisig wallet mechanics,
- Threshold signatures (M-of-N),
- Popular multisig tools (Squads & Gnosis Safe),
- On-chain governance models,
- Proposal & Voting mechanisms,
- Timelocks in governance,
- Token-weighted voting,
- Delegated voting,
- Quorum & Governance attack vectors,
- Full lifecycle of one real governance proposal.

## [Week 43](./Week-43/README.md) : Layer 2's & Rollups.

- The scalability trilemma (Why L2s exist),
- Optimistic rollup mechanics(Arbitrum, Optimism),
- Fraud proofs & Challenge periods,
- ZK rollup mechanics(zkSync, Starknet, Polygon zkEVM),
- Validity proofs vs Fraud proofs,
- Sequencers & Centralization trade-offs,
- Data availability (calldata vs blobs, EIP-4844),
- L1-to-L2 messaging & withdrawals,
- Shared sequencing & Based rollups (concept),
- App-chains & Rollup-as-a-service (concept),
- The full deposit-execute-withdraw lifecycle.

## [Week 44](./Week-44/README.md) : Account Abstraction (ERC-4337).

- Problem with EOAs (private key single point of failure),
- ERC-4337 architecture overview,
- UserOperations,
- Bundlers,
- EntryPoint contract,
- Paymasters (sponsored/gasless transactions),
- Smart contract wallets (Safe, Biconomy, ZeroDev),
- Session keys,
- Social recovery mechanisms,
- Native account abstraction (comparison with Solana's account model),
- The full UserOperation lifecycle.

## [Week 45](./Week-45/README.md) : MEV in Depth.

- MEV definition & sources,
- Arbitrage as MEV,
- Liquidations as MEV,
- Sandwiching, placed correctly in the taxonomy,
- Mempool visibility & front-running,
- Proposer-Builder Separation (PBS),
- Block builders & relays (MEV-Boost),
- Private mempools / RPC (Flashbots Protect),
- MEV protection design patterns for contracts,
- Just-in-time (JIT) liquidity,
- MEV on Solana (Jito, bundles),
- The full anatomy of one block.

## [Week 46](./Week-46/README.md) : Gas Optimization & Low-Level Solidity.

- Storage vs memory vs calldata cost trade-offs,
- Packing storage variables,
- Custom errors vs `require` strings (gas cost),
- Unchecked math blocks,
- Yul & inline assembly basics,
- Function selector & calldata layout,
- Loop and array optimization patterns,
- Gas profiling tools (Foundry gas reports),
- Optimizing one real contract.

## [Week 47](./Week-47/README.md) : Practical Zero-Knowledge Proofs.

- ZK-SNARKs vs ZK-STARKs (trade-offs),
- Trusted setup concept,
- Circuit design basics.
- Circom fundamentals,
- Noir fundamentals (alternative circuit language),
- zkVMs overview (RISC Zero, SP1),
- Proof generation & verification flow,
- On-chain proof verification (verifier contracts),
- Real-world ZK use cases (private transactions, identity, scaling),
- The full pipeline.

## [Week 48](./Week-48/README.md) : Restaking & Shared Security.

- Restaking concept (EigenLayer model),
- Actively Validated Services (AVSs),
- Slashing conditions in restaking,
- Liquid restaking tokens (LRTs),
- Shared security trade-offs & risks,
- Restaking on Solana (concept/emerging landscape),
- The full restaking lifecycle.

## [Week 49](./Week-49/README.md) : Formal Verification & Advanced Testing.

- Property-based / invariant testing (Foundry invariants),
- Fuzzing strategies beyond basic fuzzing,
- Formal verification tools overview (Certora, Halmy),
- Symbolic execution basics,
- Writing testable contract specifications,
- Differential testing between implementations,
- Continuous fuzzing in CI pipelines,
- Writing a specification first, then catching a real bug it predicts.

## [Week 50](./) : Web3 DevOps & Infrastructure

- Running an RPC node (light vs full vs archive)
- Running a validator (Solana/Ethereum basics)
- CI/CD pipelines for contract deployment
- Deployment verification & reproducible builds
- Monitoring on-chain activity (alerts, dashboards)
- Incident response planning for exploits
- Key management in production (KMS, HSM concepts)
- Multi-environment config management (devnet/testnet/mainnet)

## [Week 51](./) : Beyond Solana & EVM (Landscape Awareness)

- Move-based chains overview (Aptos, Sui) — object-centric model
- Cosmos SDK & IBC (inter-blockchain communication) overview
- Bitcoin L2s overview (Lightning, Stacks, Rootstock)
- App-specific chains vs general-purpose chains
- When to choose a non-EVM/non-Solana stack
