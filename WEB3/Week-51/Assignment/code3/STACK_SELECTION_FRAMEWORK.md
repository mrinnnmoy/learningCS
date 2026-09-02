# Stack Selection Framework

Choosing a blockchain stack should not begin with the question, "Which chain has the highest TPS?" A real stack decision depends on what the application actually needs from its execution model, state model, interoperability architecture, security assumptions, governance model, and scalability.

This framework draws directly on concepts from across the course and produces a concrete recommendation rather than ending with "it depends."

The central rule is simple:

> Choose a stack because one of its structural properties directly solves an important problem in the application, not simply because the ecosystem is popular or because its benchmark numbers look better.

---

# The Six Questions, Each Tied to a Real Week

## 1. Execution Model — Weeks 10 and 26

**Question:** Does this application need Solana's real parallel throughput, or is the EVM's sequential execution model and its vastly larger tooling ecosystem a better fit regardless of raw throughput?

Week 10 introduced Solana's Sealevel execution model and the importance of parallel transaction execution. Applications with large numbers of independent state updates can benefit significantly from parallel execution.

Week 26 introduced the contrasting EVM model. EVM execution is fundamentally sequential, but the EVM has an extremely mature ecosystem of:

- smart-contract tooling,
- wallets,
- standards,
- auditors,
- infrastructure,
- developer tools,
- DeFi protocols, and
- application integrations.

The correct decision is therefore not automatically "choose the fastest chain."

For an application with occasional, high-value transactions, raw throughput may not be important enough to outweigh mature tooling and infrastructure.

For an application whose product quality directly depends on:

- low latency,
- rapid transaction processing,
- continuous order updates, or
- many independent state updates,

parallel execution becomes much more important.

---

## 2. Account and Data Model — Weeks 11, 27, 40, and This Week's Concept 1

**Question:** Does this application's core logic involve genuinely unique, non-duplicable assets where Move's linear-type guarantee is worth its smaller ecosystem, or does a mapping-based EVM or Solana account model suffice?

Week 11 introduced Solana's account model, including accounts and ownership relationships.

Week 27 covered EVM storage and mapping-based application state.

Week 40 demonstrated that data schemas evolve and that storage design eventually creates versioning and migration problems.

This week's Concept 1 adds a structural difference: Move resources can be linearly owned. A resource cannot be freely copied or silently dropped in the same way that ordinary structured data can be manipulated through Solidity or conventional program logic.

This gives Move real consideration when an application's core logic is fundamentally about:

- uniquely owned assets,
- non-duplicable state,
- scarce resources, or
- assets where accidental duplication or disappearance would be catastrophic.

Examples include:

- legal ownership records,
- high-value collectibles,
- unique financial assets,
- scarce resources, and
- other applications where one resource existing twice would represent a fundamental failure.

Move's linear-type system prevents that class of resource-copying or accidental-dropping problem at the language level.

Neither Solidity nor Solana's ordinary Rust program model provides the same structural guarantee for application resources.

However, Move should not automatically win whenever an application has NFTs or tokens.

If the application's main requirements are better served by:

- EVM tooling,
- existing marketplace infrastructure,
- liquidity,
- wallet compatibility, or
- Solana's execution performance,

then a carefully designed mapping-based or account-based model may still be the better overall choice.

---

## 3. Cross-Chain Needs — Weeks 36, 37, and This Week's Concept 2

**Question:** Does this application need to move value or messages across multiple chains as a core, everyday feature—favoring an IBC-native Cosmos chain—or is it fundamentally single-chain, making this question largely moot?

Weeks 36 and 37 demonstrated that bridges are not automatically secure merely because one chain can communicate with another.

Week 36's trust spectrum included:

1. A single trusted relayer.
2. An M-of-N multisig relayer set.
3. Light-client verification.

Week 37 demonstrated the operational side of a bridge through a real relayer process that:

- watches one chain,
- waits for confirmations,
- detects relevant events,
- signs and submits a transaction on another chain.

This week's Concept 2 established that IBC belongs specifically in the **light-client verification** category.

Under IBC, relayers can still transport packets and proofs, but the destination chain does not simply trust the relayer's claim that an event occurred. The destination chain verifies cryptographic evidence against a light client representing the source chain's consensus-backed state.

This makes Cosmos SDK a serious choice when multi-chain communication is not an optional feature but part of the application's normal operation.

However, an application should not choose Cosmos merely because it wants a dedicated execution environment.

Week 43 already provides app-chain and dedicated execution approaches that can offer an application its own execution lane while still benefiting from shared settlement or security.

Cosmos earns real consideration when the application genuinely needs:

- sovereign governance,
- independent protocol rules,
- its own native fee token,
- its own validator or security model, and
- standardized IBC interoperability as a core product feature.

If an application is fundamentally single-chain, adding bridge infrastructure can increase complexity and attack surface without solving an important problem.

---

## 4. Security and Trust Model — Weeks 31, 38, 42, and 48

**Question:** What real, disclosed trust assumptions is this application's user base actually willing to accept, and does that rule any stack out immediately?

Week 31 established that security must be analyzed explicitly rather than assumed from successful compilation or passing tests.

Week 38 reinforced the importance of understanding trust boundaries and dependencies.

Week 42 introduced governance and control structures that can themselves become security assumptions.

Week 48 reinforced the need to evaluate actual attack surfaces and real system guarantees.

Week 39's honesty standard is also essential:

> Trust assumptions should be disclosed plainly instead of being hidden behind vague claims of decentralization.

The practical questions are:

- Who can upgrade the contracts?
- Who can pause the application?
- Who can censor transactions?
- Who controls critical private keys?
- Who controls bridges or relayers?
- Can an administrator change user balances?
- Can a governance system be captured?
- What happens if a validator, multisig member, or sequencer is compromised?

A stack should be ruled out when its real trust assumptions conflict with the value being protected.

A high-value ownership system should not casually depend on a weak custom bridge.

A trading venue should not ignore transaction-ordering manipulation.

A payment system should not hide the fact that fiat gateways remain trusted institutions.

Security architecture is therefore part of stack selection, not something added after choosing the chain.

---

## 5. Upgradability and Governance Needs — Weeks 33, 39, and 42

**Question:** Does this application need real on-chain governance from day one, or is Week 39's simpler, progressively decentralizing admin model sufficient for its real stage?

Week 33 demonstrated that contracts can be upgraded through deliberate upgrade architectures, but upgradeability creates its own security and governance risks.

Week 39 introduced the practical model of starting with a transparent and constrained administrator while progressively decentralizing control.

Week 42 examined formal on-chain governance.

The correct answer depends on the application's maturity and the consequences of changing its rules.

A rapidly evolving application may need controlled upgrades because:

- security vulnerabilities must be fixed,
- product features change,
- integrations evolve,
- risk parameters need adjustment.

A long-lived, high-value ownership system requires stronger restrictions because arbitrary rule changes could affect valuable property.

Therefore, the decision should explicitly distinguish between:

- **technical upgradability**, meaning whether the code can be changed, and
- **governance legitimacy**, meaning who is allowed to decide that it changes.

Immediate token-based governance is not automatically the safest or most mature option.

A transparent admin model with:

- clearly disclosed powers,
- multisig control,
- timelocks,
- emergency procedures, and
- a progressive decentralization plan

can be more appropriate during early development.

---

## 6. Cost and Scalability Needs — Weeks 43, 45, and 46

**Question:** Does this application's real transaction volume and latency sensitivity justify a dedicated L2 or app-chain outright, or does a general-purpose chain's shared security matter more than dedicated throughput?

Week 43 examined scaling architectures and the trade-offs between L1s, L2s, rollups, app-chains, and shared security.

Week 45 demonstrated that scaling introduces transaction-ordering and MEV concerns rather than simply increasing TPS.

Week 46 reinforced that scalability decisions affect the application's entire architecture.

The important distinction is between:

### Low-frequency, high-value applications

These often benefit more from:

- shared security,
- mature infrastructure,
- strong tooling, and
- lower operational complexity.

### High-frequency, latency-sensitive applications

These may justify:

- high-throughput execution,
- parallel processing,
- a dedicated execution environment,
- an app-chain, or
- specialized infrastructure.

A dedicated chain should not be chosen merely because it sounds more scalable.

The application should justify the operational complexity with a real transaction volume or latency requirement.

---

# 5. When to Choose a Non-EVM / Non-Solana Stack

A non-EVM or non-Solana stack should be selected for a concrete structural reason.

"These ecosystems could all work" is not a sufficient recommendation.

## Move — This Week's Concept 1

Move earns real consideration when an application's core logic is fundamentally about **uniquely owned, non-duplicable assets**.

Examples include:

- real estate,
- legal ownership records,
- high-value collectibles,
- scarce resources,
- unique financial instruments, and
- other assets where accidental duplication or silent disappearance would be catastrophic.

Move's linear-type system prevents certain resource-copying and accidental-dropping bugs at compile time in a way neither Solidity nor Solana's normal Rust programs structurally guarantee.

However, Move does not automatically win.

If liquidity, user familiarity, wallet support, marketplace infrastructure, mature standards, and auditing availability are more important to the application's overall success, an EVM stack may still be the better practical decision.

---

## Cosmos — This Week's Concept 2

Cosmos earns real consideration when an application genuinely needs:

- sovereign governance,
- independent protocol rules,
- its own native fee token,
- its own economic model, and
- cross-chain interoperability through IBC as a normal product feature.

Cosmos should not be chosen merely because an application wants a dedicated execution lane.

Week 43's app-chain and rollup architectures can already provide dedicated execution while still settling to and drawing security from a shared L1.

Cosmos becomes structurally preferable when sovereignty itself is part of the application's requirements.

---

## Bitcoin L2s and Bitcoin-Based Layers — This Week's Concept 3

A Bitcoin-based L2 or payment layer earns real consideration specifically when the application's value proposition depends on:

- Bitcoin's particular base-layer security,
- Bitcoin's deep and singular liquidity,
- Bitcoin settlement,
- Bitcoin-denominated value, or
- a payment architecture specifically designed around Bitcoin.

This is different from generic "blockchain security."

An application should not choose a Bitcoin-based stack merely because Bitcoin is secure. The application should have a reason that Bitcoin's particular security or liquidity matters to the product.

For repeated micropayments, the Lightning Network is a particularly strong example because its architecture directly addresses frequent, low-cost payment transfer.

---

# Project 1: A Real-Estate-Deed NFT Platform

## Project Description

This platform represents legal, unique, high-value ownership of real estate through NFTs or equivalent on-chain assets.

Its requirements include:

- unique ownership,
- prevention of duplication,
- high-value transfers,
- strong auditability,
- legal and institutional integration,
- low transaction volume,
- long-term reliability.

The platform does not need high-frequency execution.

---

## 1. Execution Model

Solana's parallel execution is not necessary.

Real-estate deed transfers occur relatively infrequently. A sequential execution model is not the application's bottleneck.

The EVM's larger ecosystem is more valuable because the application benefits from:

- mature smart-contract tooling,
- established NFT standards,
- wallet support,
- auditing expertise,
- indexing infrastructure, and
- existing token and ownership standards.

**Decision:** Prefer EVM ecosystem maturity over Solana's raw throughput.

---

## 2. Account and Data Model

This is the project where Move's linear ownership model deserves the strongest consideration.

A real-estate deed is conceptually:

- unique,
- non-duplicable,
- explicitly owned,
- transferred under strict rules.

Move's resource model is therefore highly relevant.

However, legal ownership creates an important practical limitation: Move cannot by itself guarantee that the token represents legally recognized ownership. Legal institutions and registries must still recognize the on-chain record.

The platform also needs mature ecosystem infrastructure.

Therefore, while Move provides a genuine language-level safety advantage, that advantage does not outweigh the practical benefits of the EVM ecosystem for this particular product.

**Decision:** Use carefully audited EVM ownership logic rather than selecting Move solely for resource linearity.

---

## 3. Cross-Chain Needs

The platform should have one canonical source of truth.

Moving a legal deed representation freely across multiple chains would create unnecessary complexity and potentially ambiguous ownership.

IBC and custom bridges are therefore not core requirements.

**Decision:** Fundamentally single-chain.

---

## 4. Security and Trust Model

Users should accept very limited trust assumptions.

The platform should not rely on:

- a single trusted bridge relayer,
- a weak multisig determining ownership,
- arbitrary administrator changes.

However, a legal ownership system may require explicitly defined institutional powers for:

- initial issuance,
- court orders,
- fraud correction,
- legally required recovery.

Those powers should be disclosed clearly.

**Decision:** Strong smart-contract security with explicit, limited, legally justified institutional authority.

---

## 5. Upgradability and Governance

The system may need upgrades as legal requirements and integrations evolve.

However, unrestricted upgradeability would be dangerous because administrators could change the rules governing high-value property.

The appropriate model is:

- transparent admin powers,
- multisig protection,
- timelocks,
- carefully constrained upgradeability,
- progressive decentralization where appropriate.

Immediate token governance is not necessarily appropriate because popular voting should not automatically determine legal property rights.

**Decision:** Week 39's transparent, progressively decentralizing admin model.

---

## 6. Cost and Scalability

Transaction volume is low.

The application does not need:

- a dedicated app-chain,
- high-frequency execution,
- ultra-low latency.

Shared security and ecosystem maturity matter more.

**Decision:** A general-purpose Ethereum L2 provides sufficient scalability and lower costs.

---

## Project 1 Recommendation

> **Ethereum L2 using the EVM, with Solidity smart contracts and established NFT standards.**

The recommendation prioritizes:

- mature tooling,
- established standards,
- wallet compatibility,
- auditing availability,
- institutional integration potential,
- lower transaction costs than Ethereum L1.

Move is the strongest non-EVM candidate because compiler-enforced resource uniqueness is highly relevant. However, the broader EVM ecosystem outweighs that advantage for this real-world legal ownership platform.

---

# Project 2: A Cross-Border Micropayment Remittance App

## Project Description

This application moves small amounts of value across borders.

Its main requirements are:

- extremely low transaction costs,
- fast payments,
- frequent transfers,
- large potential transaction volume,
- efficient payment routing,
- simple user experience.

The application's primary problem is payment, not general-purpose smart-contract computation.

---

## 1. Execution Model

The application requires efficient payment execution, but it does not need arbitrary smart-contract logic for every payment.

Choosing a general-purpose high-throughput chain simply because it can process many transactions is not necessarily optimal.

The application's core requirement is repeated value transfer.

**Decision:** Optimize for payment routing and settlement efficiency rather than general-purpose smart-contract throughput.

---

## 2. Account and Data Model

The primary state involves:

- balances,
- payment obligations,
- transfers.

The application does not fundamentally depend on Move's unique-resource semantics in the same way as the real-estate platform.

Correct accounting and double-spend prevention matter, but Move's linear type system is not the decisive advantage.

**Decision:** Move is not necessary for the application's primary technical requirement.

---

## 3. Cross-Chain Needs

Cross-border does not necessarily mean every payment must cross a blockchain bridge.

The application may need integration with multiple currencies and payment systems, but arbitrary blockchain interoperability should not sit on the critical path of every micropayment.

IBC could be useful for future multi-chain integrations, but it is not the best reason to choose the core payment layer.

**Decision:** Cross-network integration matters at the edges, but not as the core transaction architecture.

---

## 4. Security and Trust Model

Users need strong assurances that payments cannot be:

- arbitrarily minted,
- double-spent,
- silently changed.

However, cross-border remittance often requires regulated components such as:

- fiat on-ramps,
- fiat off-ramps,
- banking integrations.

Those components may remain trusted.

The important requirement from Week 39's honesty principle is that this trust must be disclosed clearly.

**Decision:** Use a strong trust-minimized payment layer while explicitly acknowledging trusted fiat gateways.

---

## 5. Upgradability and Governance

The application may need rapid changes because:

- regulations evolve,
- payment providers change,
- fraud systems improve,
- fiat integrations change.

Immediate full on-chain governance is unnecessary.

A transparent admin model with progressive decentralization is more practical.

**Decision:** Week 39's progressively decentralizing admin model.

---

## 6. Cost and Scalability

This is the decisive question.

Micropayments cannot economically tolerate high per-transaction fees.

Week 43's L2s can reduce transaction costs, but the application is specifically focused on frequent small payments.

This week's Concept 3 directly points toward a Bitcoin-based payment layer when the application benefits from Bitcoin's specific liquidity and settlement network.

The Lightning Network is specifically designed for frequent, low-cost payments without requiring every payment to consume a base-layer Bitcoin transaction.

**Decision:** Use a specialized micropayment network rather than putting every payment directly on a general-purpose chain.

---

## Project 2 Recommendation

> **Bitcoin Lightning Network for the core micropayment layer, with Bitcoin L1 settlement and regulated fiat on/off-ramps at the application edges.**

This is the strongest recommendation because the product's primary requirement directly matches Lightning's architecture.

The app should not choose a general-purpose L2 simply because it has low transaction fees when Lightning is specifically designed for repeated micropayments.

Bitcoin's deep liquidity and settlement value also provide a concrete reason to choose a Bitcoin-based stack rather than generic blockchain infrastructure.

---

# Project 3: A High-Frequency Perpetuals Trading Exchange

## Project Description

This application requires:

- continuous trading,
- high transaction volume,
- low latency,
- rapid order placement,
- rapid cancellation,
- position updates,
- liquidation,
- oracle integration,
- predictable execution.

The execution environment is part of the product itself.

This project has fundamentally different requirements from the real-estate platform.

---

## 1. Execution Model

Week 10's Solana parallel execution model is directly relevant.

The exchange processes a continuous stream of independent or partially independent state updates.

The EVM's sequential execution model is less naturally suited to this workload unless significant specialized infrastructure is added.

**Decision:** Prefer Solana's parallel execution and high-throughput architecture.

---

## 2. Account and Data Model

The exchange manages:

- orders,
- positions,
- collateral,
- funding rates,
- liquidations,
- market state.

Its primary bottleneck is not whether one unique asset can be duplicated.

Move's resource model provides useful safety properties, but it does not address the exchange's main requirement as directly as high-throughput execution does.

Solana's account model can represent the exchange's separate state components efficiently.

**Decision:** Solana's account model is a better fit than Move's resource model for the core exchange workload.

---

## 3. Cross-Chain Needs

The exchange may eventually accept assets from multiple ecosystems.

However, cross-chain transfers should not be part of the latency-critical trading path.

The exchange's:

- order handling,
- matching,
- liquidation,
- risk calculations,

should operate within one primary execution environment.

Bridges can serve deposits and withdrawals at the edges.

**Decision:** Single-chain core execution with optional cross-chain entry and exit infrastructure.

---

## 4. Security and Trust Model

Week 45's MEV material is directly relevant.

For a high-frequency perpetuals exchange, **Week 45, Concepts 2–4 and 10** are particularly important.

The relevant MEV risks include:

- front-running,
- transaction reordering,
- advantageous liquidation execution,
- back-running profitable state changes,
- order-flow information advantages.

For a high-frequency venue, the most important issue is not merely that "MEV exists."

The exchange must specifically consider how transaction ordering affects:

- execution prices,
- liquidation priority,
- order fairness,
- oracle updates,
- latency advantages.

Week 45's Concepts 6–8 demonstrate that execution and ordering architecture can change who has the opportunity to extract value from users.

Solana's high throughput can reduce congestion pressure, but it does not automatically eliminate ordering-based extraction or other MEV opportunities.

Therefore, the exchange must explicitly design:

- order sequencing,
- fair execution rules,
- liquidation mechanisms,
- oracle protections,
- MEV-aware transaction processing.

**Decision:** Choose high throughput, but only with explicit Week 45-style MEV and transaction-ordering protections.

---

## 5. Upgradability and Governance

A perpetuals protocol will need to evolve because:

- markets change,
- risk parameters change,
- oracle infrastructure evolves,
- security issues may be discovered.

Immediate full governance can make emergency response too slow.

However, unrestricted administrator control could allow changes to critical trading rules.

A staged approach is appropriate:

1. transparent multisig or admin control initially,
2. timelocks for normal upgrades,
3. clearly defined emergency powers,
4. progressive decentralization,
5. formal governance for long-term protocol parameters.

**Decision:** Controlled governance initially, followed by progressive decentralization.

---

## 6. Cost and Scalability

This project has the strongest throughput and latency requirements of all three.

Week 43's L2 trade-offs matter because L2s can reduce cost but still involve:

- sequencing,
- latency,
- ordering,
- MEV considerations.

A dedicated app-chain or L2 could eventually be justified.

However, building and operating dedicated infrastructure from day one adds significant complexity.

Solana already provides a high-throughput environment that directly addresses the immediate execution bottleneck.

**Decision:** Start with an existing high-throughput chain rather than immediately building a dedicated L2 or app-chain.

---

## Project 3 Recommendation

> **Solana for the core perpetuals trading and execution layer.**

The recommendation is driven by:

- Week 10's parallel execution,
- high transaction throughput,
- low-latency requirements,
- continuous order and position updates.

However, this recommendation has a strict architectural condition:

> **High throughput does not eliminate MEV. Week 45's Concepts 2–4 and 10 require the exchange to explicitly address front-running, transaction ordering, liquidation competition, and other forms of value extraction.**

The exchange should therefore combine Solana's execution performance with:

- explicit order sequencing rules,
- MEV-aware transaction architecture,
- carefully designed liquidation logic,
- robust oracle protections.

This recommendation is intentionally very different from Project 1.

Project 1 prioritizes:

- ecosystem maturity,
- legal ownership infrastructure,
- security,
- low operational complexity.

Project 3 prioritizes:

- throughput,
- parallel execution,
- low latency,
- execution architecture.

---

# Summary of Final Recommendations

| Project                                    | Recommended stack                                        | Primary structural reason                                                                                              |
| ------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Real-estate-deed NFT platform              | **Ethereum L2 using the EVM**                            | Mature tooling, NFT standards, ecosystem support, and sufficient scalability for low-frequency high-value ownership    |
| Cross-border micropayment remittance app   | **Bitcoin Lightning Network with Bitcoin L1 settlement** | Architecture directly designed for frequent, low-cost micropayments and benefits from Bitcoin settlement and liquidity |
| High-frequency perpetuals trading exchange | **Solana**                                               | Parallel execution and high throughput directly match continuous, latency-sensitive trading                            |

These recommendations are deliberately different.

The framework should discriminate between different application bottlenecks. If all three projects produced the same answer to every question, the framework would not be useful for real stack selection.

---

# The Full Landscape, on One Table

|                          | Solana (Weeks 10–25)                                      | EVM (Weeks 26–50)                                                               | Move (Aptos/Sui)                                                              | Cosmos SDK                                                                                          | Bitcoin L2s / Bitcoin-Based Layers                                                                                      |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Execution model**      | Sealevel — parallel (Week 10)                             | Sequential (Week 26, Concept 2)                                                 | Parallel-friendly, with object ownership making conflicts explicit            | Sequential, per-chain                                                                               | Varies by L2 or layer (Concept 3)                                                                                       |
| **State/account model**  | Accounts with an owner field (Week 11)                    | Contract storage and mappings (Week 27)                                         | Resources — linearly owned and compiler-enforced (Concept 1)                  | App-specific and per-chain                                                                          | Varies: payment channels, separate VMs, or sidechains                                                                   |
| **Cross-chain approach** | Bridges built by hand (Weeks 36, 37)                      | Bridges built by hand (Weeks 36, 37)                                            | Chain-specific bridge infrastructure                                          | IBC — standardized and light-client-based (Concept 2)                                               | Varies; Lightning is not a general-purpose cross-chain protocol, while other systems can bridge specifically to Bitcoin |
| **Real, specific fit**   | Latency-sensitive, high-throughput applications (Week 10) | Maximum tooling maturity and the largest smart-contract ecosystem (Weeks 27–50) | Uniquely owned, high-value assets requiring compiler-enforced resource safety | Applications requiring sovereign governance, independent economics, and native IBC interoperability | Applications whose core value proposition depends on Bitcoin's specific security, settlement, or liquidity              |

---

# What, If Anything, Would Change These Three Recommendations a Year From Now

The landscape will continue to change.

Move ecosystems may gain:

- more wallet support,
- greater liquidity,
- stronger marketplace infrastructure,
- more developer tooling,
- more institutional adoption.

If those ecosystem gaps shrink significantly, the real-estate platform could become a stronger candidate for a Move-based chain such as **Sui**, because compiler-enforced uniqueness would remain highly relevant while the practical ecosystem disadvantage would become smaller.

The high-frequency perpetuals recommendation is also sensitive to future technical progress.

Ethereum L2s may improve:

- latency,
- sequencing,
- based-rollup designs,
- throughput,
- MEV mitigation.

Specialized rollups and app-chains may become increasingly competitive with existing high-throughput L1s.

Solana may also continue improving execution performance and transaction infrastructure.

The Bitcoin micropayment recommendation is the least likely to change structurally.

The reason is that the recommendation is not based only on current benchmark numbers.

The application itself is specifically a micropayment system, and the Lightning Network is specifically designed for frequent, low-cost payments without requiring every payment to consume a Bitcoin L1 transaction.

Therefore, the recommendation most likely to age well regardless of general ecosystem changes is:

> **Bitcoin Lightning Network for the core micropayment layer.**

The real-estate and perpetuals recommendations may change as competing smart-contract ecosystems and execution architectures mature.

Their underlying requirements will remain stable, but the best ecosystem for satisfying those requirements may change.

The micropayment recommendation is more structurally aligned with the application's core problem, which makes it the most durable of the three.

---

# Final Conclusion

The full course landscape does not produce one universally best blockchain stack.

Instead, it produces several real decision rules:

- Choose **Solana** when parallel execution and low latency are central to the product.
- Choose the **EVM** when tooling maturity, ecosystem depth, standards, and integration matter more than maximum raw throughput.
- Give **Move** serious consideration when compiler-enforced uniqueness and non-duplicable resources directly protect the application's most valuable state.
- Give **Cosmos SDK** serious consideration when sovereign governance, independent economics, and native IBC interoperability are genuine product requirements.
- Give **Bitcoin-based layers** serious consideration when Bitcoin's specific security, liquidity, settlement, or payment architecture is part of the application's value proposition.

The correct stack is therefore not chosen by popularity alone.

It is chosen by identifying which structural property of the blockchain stack directly solves the application's most important technical, economic, and security problem.
