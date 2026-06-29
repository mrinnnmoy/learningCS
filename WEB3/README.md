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

## [Week 18](./) : Token Extensions (Token-2022)

- Why Token-2022 was introduced
- Extension architecture overview
- Transfer fees extension
- Interest-bearing tokens
- Non-transferable tokens
- Confidential transfers (concept)
- Metadata pointer extension
- Permanent delegate extension
- Default account state extension
- Migrating from legacy SPL to Token-2022

## [Week 19](./) : Common Contracts (Staking & Escrow)

- Staking contract design
- Reward calculation models
- Lock-up periods & vesting
- Escrow contract design
- Multi-party fund holding
- Timelocks
- Cancel/refund logic
- State machine design for contracts
- Testing staking/escrow flows

## [Week 20](./) : Program Security

- Common Solana vulnerabilities
- Missing signer checks
- Missing owner checks
- Account substitution attacks
- PDA seed collisions
- Integer overflow/underflow
- Re-initialization attacks
- Arbitrary CPI vulnerabilities
- Type confusion
- Rent-exemption bypass issues
- Security audit checklists
- Fuzzing programs (Trident/Honggfuzz)

## [Week 21](./) : Compressed NFTs

- Why NFT compression exists
- State compression concept
- Merkle trees for cNFTs
- Concurrent Merkle trees
- Bubblegum program overview
- Minting compressed NFTs
- Transferring compressed NFTs
- Indexing compressed NFTs (DAS API)
- Cost comparison vs regular NFTs

## [Week 22](./) : DeFi (AMM, DLMM, CLMM, Perps)

- AMM fundamentals (constant product formula)
- Liquidity pools basics
- Slippage & price impact
- DLMM (Dynamic Liquidity Market Maker) concept
- CLMM (Concentrated Liquidity Market Maker) concept
- Tick-based liquidity ranges
- Impermanent loss mechanics
- Perpetual futures basics
- Funding rates
- Leverage & liquidation mechanics
- Order books vs AMMs on-chain

## [Week 23](./) : Payment Infrastructure

- On-chain payment flows
- Payment request standards (Solana Pay)
- QR code payment flows
- Recurring payments/subscriptions on-chain
- Merchant integration patterns
- Handling refunds on-chain
- Stablecoin payment rails
- Fee abstraction (paying fees in SPL tokens)

## [Week 24](./) : Indexing

- Why indexing is needed (RPC limitations)
- Geyser plugin concept (Solana)
- gRPC streaming (Yellowstone)
- Building custom indexers
- Webhooks for on-chain events
- Third-party indexers (Helius, QuickNode)
- Database design for indexed data
- Real-time vs historical indexing

## [Week 25](./) : LSTs (Liquid Staking Tokens)

- Native staking vs liquid staking
- How LSTs work (mint on stake, burn on unstake)
- Validator delegation strategies
- Exchange rate mechanics (stake pool value growth)
- Unstaking & cooldown periods
- LST use in DeFi (as collateral)
- Risks of liquid staking (slashing, depeg)
- Popular LST protocols overview (Marinade, Jito)

## [Week 26](./) : Intro to Ethereum & EVM

- Ethereum account model (EOA vs contract accounts)
- EVM architecture overview
- Gas & gas price mechanics
- EIP-1559 fee model
- Opcodes basics
- Bytecode & ABI
- Nonces on Ethereum
- Block structure on Ethereum
- Ethereum client types (execution vs consensus layer)

## [Week 27](./) : Solidity (Fundamentals)

- Contract structure
- State variables
- Data types & visibility modifiers
- Functions & modifiers
- Constructors
- Events & logging
- Mappings & arrays
- Structs & enums
- `msg.sender`, `msg.value`, `msg.data`
- Error handling (`require`, `revert`, `assert`)
- Inheritance basics

## [Week 28](./) : Payable, Fallback & CCIs

- `payable` functions
- Sending/receiving ETH
- `receive()` function
- `fallback()` function
- Difference between `receive` and `fallback`
- Low-level calls (`call`, `delegatecall`, `staticcall`)
- Cross-contract interactions (CCIs)
- Reentrancy risks in cross-contract calls
- Checks-Effects-Interactions pattern

## [Week 29](./) : ERC-20/ERC-721/OpenZeppelin

- ERC-20 standard functions & events
- ERC-721 standard functions & events
- ERC-1155 overview (multi-token standard)
- Metadata standards (tokenURI, JSON schema)
- OpenZeppelin contracts library overview
- Extending OZ base contracts
- Access control (Ownable, Roles)
- Pausable pattern
- SafeMath (legacy context) & built-in overflow checks

## [Week 30](./) : Hardhat/Foundry

- Project setup (Hardhat vs Foundry)
- Compiling contracts
- Local test networks
- Writing tests (JS/TS in Hardhat, Solidity in Foundry)
- Scripting deployments
- Forking mainnet for testing
- Gas reporting
- Debugging with console logs/traces
- Verifying contracts on Etherscan

## [Week 31](./) : Smart Contract Security

- Reentrancy attacks
- Integer overflow/underflow (pre-0.8 context)
- Access control vulnerabilities
- Front-running & MEV basics
- Flash loan attacks
- Oracle manipulation attacks
- Denial of service patterns
- Delegatecall vulnerabilities
- Timestamp dependence
- Audit tools (Slither, Mythril)
- Security best-practice checklists

## [Week 32](./) : ETH Wallet Adapter & Client-Side

- `ethers.js` / `viem` basics
- Provider & signer concepts
- Connecting MetaMask/WalletConnect
- Reading contract state
- Sending transactions
- Listening to contract events
- Handling transaction receipts
- Chain switching & network detection
- Gas estimation client-side

## [Week 33](./) : Upgradability in ETH

- Why contracts need upgradability
- Proxy pattern basics
- Transparent proxy pattern
- UUPS proxy pattern
- Storage layout & collisions
- Initializer functions vs constructors
- Diamond pattern (multi-facet proxies) overview
- Upgrade governance & timelocks
- Risks of upgradable contracts

## [Week 34](./) : Liquidity Pools & Impermanent Loss

- Constant product AMM math (x\*y=k)
- LP token mechanics
- Adding/removing liquidity
- Fee accrual to LPs
- Impermanent loss calculation
- Impermanent loss vs volatility correlation
- Concentrated liquidity implications
- Yield farming basics
- Pool exploits (sandwich attacks on pools)

## [Week 35](./) : Indexing (The Graph)

- Subgraph concept
- GraphQL basics for querying
- Defining schema.graphql
- Mapping handlers (AssemblyScript)
- Event-driven indexing
- Deploying subgraphs
- Querying subgraphs from frontend
- The Graph hosted service vs decentralized network

## [Week 36](./) : Bridges (How They Work)

- Cross-chain communication problem
- Lock-and-mint bridge model
- Burn-and-mint bridge model
- Liquidity network bridges
- Trusted vs trustless bridges
- Light client verification bridges
- Validator/relayer roles
- Message-passing protocols (generic messaging)
- Bridge risks & historical exploits

## [Week 37](./) : Building an EVM Bridge

- Bridge contract architecture (source & destination)
- Locking assets on source chain
- Emitting cross-chain events
- Relayer/oracle service design
- Minting wrapped assets on destination chain
- Replay protection across chains
- Handling finality differences between chains
- Testing bridge flows end-to-end

## [Week 38](./) : MPC & Shamir's Secret Sharing

- Multi-Party Computation (MPC) concept
- Threshold cryptography basics
- Shamir's Secret Sharing algorithm
- Secret reconstruction (Lagrange interpolation, conceptual)
- MPC wallets vs multisig wallets
- Key generation without a single point of failure
- Use cases in custody solutions
- Trade-offs of MPC (latency, complexity)

## [Week 39](./) : Partially Centralized Contracts

- Admin key patterns
- Pausable/circuit-breaker patterns
- Emergency withdrawal mechanisms
- Rate limiting on-chain
- Whitelisting/blacklisting patterns
- Governance-gated parameters
- Progressive decentralization strategies
- Trust assumptions disclosure

## [Week 40](./) : On-Chain Data Model Design

- Designing account/state structures for scalability
- Data normalization vs denormalization on-chain
- Choosing PDAs vs storage contracts for relationships
- Minimizing storage costs (rent/gas considerations)
- Versioning on-chain schemas
- Pagination patterns for large datasets
- Off-chain vs on-chain data trade-offs

## [Week 41](./) : Oracles (Chainlink/Pyth)

- Why oracles are needed (oracle problem)
- Price feed oracles
- Pull vs push oracle models
- Chainlink architecture overview
- Pyth network architecture overview
- Data freshness & staleness checks
- Oracle manipulation risks
- Aggregation & median pricing
- VRF (verifiable random functions) overview

## [Week 42](./) : Multisig & Governance

- Multisig wallet mechanics
- Threshold signatures (M-of-N)
- Popular multisig tools (Squads, Gnosis Safe)
- On-chain governance models
- Proposal & voting mechanisms
- Timelocks in governance
- Token-weighted voting
- Delegated voting
- Quorum & governance attack vectors

## [Week 43](./) : Layer 2s & Rollups

- Why L2s exist (scalability trilemma)
- Optimistic rollups (Arbitrum, Optimism) mechanics
- Fraud proofs & challenge periods
- ZK rollups (zkSync, Starknet, Polygon zkEVM) mechanics
- Validity proofs vs fraud proofs
- Sequencers & centralization trade-offs
- Data availability (calldata vs blobs, EIP-4844)
- L1-to-L2 messaging & withdrawals
- Shared sequencing & based rollups (concept)
- App-chains & rollup-as-a-service (concept)

## [Week 44](./) : Account Abstraction (ERC-4337)

- Problem with EOAs (private key single point of failure)
- ERC-4337 architecture overview
- UserOperations
- Bundlers
- EntryPoint contract
- Paymasters (sponsored/gasless transactions)
- Smart contract wallets (Safe, Biconomy, ZeroDev)
- Session keys
- Social recovery mechanisms
- Native account abstraction (comparison with Solana's account model)

## [Week 45](./) : MEV in Depth

- MEV definition & sources (arbitrage, liquidations, sandwiching)
- Mempool visibility & front-running
- Proposer-Builder Separation (PBS)
- Block builders & relays (MEV-Boost)
- Private mempools / RPC (Flashbots Protect)
- MEV protection design patterns for contracts
- Just-in-time (JIT) liquidity
- MEV on Solana (Jito, bundles)

## [Week 46](./) : Gas Optimization & Low-Level Solidity

- Storage vs memory vs calldata cost trade-offs
- Packing storage variables
- Custom errors vs `require` strings (gas cost)
- Unchecked math blocks
- Yul & inline assembly basics
- Function selector & calldata layout
- Loop and array optimization patterns
- Gas profiling tools (Foundry gas reports)

## [Week 47](./) : Practical Zero-Knowledge Proofs

- ZK-SNARKs vs ZK-STARKs (trade-offs)
- Trusted setup concept
- Circuit design basics
- Circom fundamentals
- Noir fundamentals (alternative circuit language)
- zkVMs overview (RISC Zero, SP1)
- Proof generation & verification flow
- On-chain proof verification (verifier contracts)
- Real-world ZK use cases (private transactions, identity, scaling)

## [Week 48](./) : Restaking & Shared Security

- Restaking concept (EigenLayer model)
- Actively Validated Services (AVSs)
- Slashing conditions in restaking
- Liquid restaking tokens (LRTs)
- Shared security trade-offs & risks
- Restaking on Solana (concept/emerging landscape)

## [Week 49](./) : Formal Verification & Advanced Testing

- Property-based / invariant testing (Foundry invariants)
- Fuzzing strategies beyond basic fuzzing
- Formal verification tools overview (Certora, Halmy)
- Symbolic execution basics
- Writing testable contract specifications
- Differential testing between implementations
- Continuous fuzzing in CI pipelines

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
