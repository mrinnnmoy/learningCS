# How to Build.

```
1. Deploy Week 29's `GameToken` to Ethereum Sepolia.

   Since the original Week 29 Medium assignment was deployed locally
   using Anvil, first deploy a fresh copy of the same `GameToken`
   contract to Sepolia using the `deployerKey` pattern from Week 29's
   Hard assignment.

   forge script script/DeployGameToken.s.sol:DeployGameToken \
     --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
     --account deployerKey \
     --broadcast

   Confirm the deployment is on Ethereum Sepolia and record the
   contract address and deployment block.

2. Mint and transfer some `GAME` tokens on the newly deployed Sepolia
   contract before creating the subgraph.

   Mint an initial supply of `1000 GAME` to the deployer account.

   cast send \
     0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF \
     "mint(address,uint256)" \
     0xBe1A491A93822eB244F111Ce83baA0B2C617c305 \
     1000000000000000000000 \
     --account deployerKey \
     --rpc-url https://ethereum-sepolia-rpc.publicnode.com

   Then transfer `100 GAME` from the deployer to another address.

   cast send \
     0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF \
     "transfer(address,uint256)" \
     0x23232f3D5815361c73f5599daEA4c66e63952120 \
     100000000000000000000 \
     --account deployerKey \
     --rpc-url https://ethereum-sepolia-rpc.publicnode.com

   These real Sepolia transactions provide the `Transfer` events that
   the subgraph will index and allow the running `Holder.balance`
   calculation to be verified later.

3. Scaffold the subgraph using the following configuration:

  graph init game-token-subgraph

   ✔ Network · Ethereum Sepolia Testnet
   ✔ Source · Smart Contract · ethereum
   ✔ Subgraph slug · game-token-subgraph
   ✔ Directory to create the subgraph in · game-token-subgraph
   ✔ Contract address · 0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF

   When Graph CLI attempts to fetch the ABI from Sourcify, the contract
   is not verified, so use the locally generated ABI instead:

   ✔ Fetching ABI from Sourcify API...
   ✖ Failed to fetch ABI: Failed to fetch ABI: Error: NOTOK - Contract source code not verified
   ✔ Do you want to retry? (Y/n) · false
   ✔ ABI file (path) · game-token-deployment/out/GameToken.sol/GameToken.json

   Continue with:

   ✔ Start block · 11487401
   ✔ Contract name · GameToken
   ✔ Index contract events as entities (Y/n) · true
   ✔ Add another contract? (y/N) · false

4. The resulting `subgraph.yaml` should point to GameToken's Sepolia
   deployment:

   - Network: `sepolia`
   - Contract address:
     `0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF`
   - ABI: `GameToken`
   - Start block: `11487401`

5. Replace `schema.graphql` and `src/game-token.ts` with the Medium
   Solution.

   The schema must contain:

   - A mutable `Holder` entity with a running `balance`
   - An immutable `Transfer` entity
   - `Transfer.from` and `Transfer.to` references to `Holder`
   - `Holder.transfersSent` and `Holder.transfersReceived` using
     `@derivedFrom`

   The mapping must use one shared `handleTransfer` handler that:

   - Creates or loads the relevant `Holder` entities.
   - Records every `Transfer` as an immutable entity.
   - Debits the sender for normal transfers.
   - Credits the recipient.
   - Treats `address(0)` specially for mints so that the zero address
     is never debited.

6. Install dependencies, generate types, and build the subgraph:

   yarn install
   yarn codegen
   yarn build

   Make sure the build completes successfully.

7. Create the `game-token-subgraph` in Subgraph Studio and configure
   the deployment using the Subgraph Studio deploy key.

   Deploy using:

   yarn deploy

   When prompted for the version label, use:

   1.0.0

8. Wait for the subgraph to synchronize with Sepolia.

   Verify synchronization with:

   {
     _meta {
       block {
         number
         hash
       }
     }
   }

   Once synchronization has reached the blocks containing the mint and
   transfer transactions, the subgraph is ready for the manual test
   cases in the next section.
```

# Resource.

```
<!-- First deploying Game Token contract to Sepolia. -->

mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-35/Assignment/code2/game-token-deployment$ forge script script/Deploy.s.sol:DeployGameToken \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --account deployerKey \
  --broadcast
Enter keystore password:
[⠒] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
token: contract GameToken 0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF

== Logs ==
  GameToken deployed at: 0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF

## Setting up 1 EVM.

==========================

Chain 11155111

Estimated gas price: 2.200514484 gwei

Estimated total gas used for script: 1557346

Estimated amount required: 0.003426962429599464 ETH

==========================

##### sepolia
✅  [Success] Hash: 0xf82611aa8caf88d5345f34b41aba964dc08d6534773ec916bb33a1fd89fe23a3
Contract: GameToken
Contract Address: 0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF
Block: 11487401
Paid: 0.001265383000433846 ETH (1197959 gas * 1.056282394 gwei)

✅ Sequence #1 on sepolia | Total Paid: 0.001265383000433846 ETH (1197959 gas * avg 1.056282394 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-35/Assignment/code2/game-token-deployment/broadcast/Deploy.s.sol/11155111/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-35/Assignment/code2/game-token-deployment/cache/Deploy.s.sol/11155111/run-latest.json
```

```
<!-- Subgraph deployment. -->

mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-35/Assignment/code2/game-token-subgraph$ yarn deploy
yarn run v1.22.22
$ graph deploy --node https://api.studio.thegraph.com/deploy/ game-token-subgraph
✔ Which version label to use? (e.g. "v0.0.1") · 1.0.0
  Skip migration: Bump mapping apiVersion from 0.0.1 to 0.0.2
  Skip migration: Bump mapping apiVersion from 0.0.2 to 0.0.3
  Skip migration: Bump mapping apiVersion from 0.0.3 to 0.0.4
  Skip migration: Bump mapping apiVersion from 0.0.4 to 0.0.5
  Skip migration: Bump mapping apiVersion from 0.0.5 to 0.0.6
  Skip migration: Bump manifest specVersion from 0.0.1 to 0.0.2
  Skip migration: Bump manifest specVersion from 0.0.2 to 0.0.4
✔ Apply migrations
✔ Load subgraph from subgraph.yaml
  Compile data source: GameToken => build/GameToken/GameToken.wasm
✔ Compile subgraph
  Copy schema file build/schema.graphql
  Write subgraph file build/GameToken/GameToken.json
  Write subgraph manifest build/subgraph.yaml
✔ Write compiled subgraph to build/
  Add file to IPFS build/schema.graphql
                .. QmZA2Sw9Krmk5dbP8E8sFMwe5GAvy7gSJF8cVP8UBtL7FM
  Add file to IPFS build/GameToken/GameToken.json
                .. QmTWrfNwdi7smpyus4cBTfhTsTGqZFQWxgrWSA3i7z9Bv1
  Add file to IPFS build/GameToken/GameToken.wasm
                .. Qma1tMCqdvMFPeLahCEFbvQVScg3sWVHsuqnsTdWKjeLuC
✔ Upload subgraph to IPFS

Build completed: QmdamKrhJPcWWgfya2DrSFoeNZj9WtNvzMh9EUwYzauzXb

Deployed to https://thegraph.com/studio/subgraph/game-token-subgraph

Subgraph endpoints:
Queries (HTTP):     https://api.studio.thegraph.com/query/1757793/game-token-subgraph/1.0.0

Done in 15.71s.
```

---

# Output.

```
<!-- 1. Test Case 1 — Verify `Holder` balances against on-chain state. -->

   Action:

   Once the subgraph finished syncing, query:

   {
     holders(orderBy: balance, orderDirection: desc, first: 5) {
       id
       balance
     }
   }

   Output:

   {
     "data": {
       "holders": [
         {
           "id": "0x0000000000000000000000000000000000000000",
           "balance": "0"
         },
         {
           "id": "0x23232f3d5815361c73f5599daea4c66e63952120",
           "balance": "100000000000000000000"
         },
         {
           "id": "0xbe1a491a93822eb244f111ce83baa0b2c617c305",
           "balance": "900000000000000000000"
         }
       ]
     }
   }

   Independent on-chain verification:

   Deployer:

   cast call \
     0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF \
     "balanceOf(address)(uint256)" \
     0xBe1A491A93822eB244F111Ce83baA0B2C617c305 \
     --rpc-url https://ethereum-sepolia-rpc.publicnode.com

   Output:

   900000000000000000000

   Recipient:

   cast call \
     0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF \
     "balanceOf(address)(uint256)" \
     0x23232f3D5815361c73f5599daEA4c66e63952120 \
     --rpc-url https://ethereum-sepolia-rpc.publicnode.com

   Output:

   100000000000000000000

   Result:

   PASS

   The `Holder.balance` values indexed by the subgraph match the
   independently verified on-chain ERC-20 balances.

   This confirms that the mapping's running balance calculation is
   correctly tracking the real GameToken state.
```

```
<!-- 2. Test Case 2 — Verify `@derivedFrom` relationships. -->

   Action:

   Query a holder that has transferred tokens:

   {
     holder(id: "0xbe1a491a93822eb244f111ce83baa0b2c617c305") {
       balance
       transfersSent {
         value
         blockTimestamp
       }
       transfersReceived {
         value
         blockTimestamp
       }
     }
   }

   Expected result:

   The holder's `balance` is populated and the transfer relationships
   are resolved through `transfersSent` and `transfersReceived`.

   Result:

   PASS

   The reverse relationships are obtained through `@derivedFrom`,
   while the mapping only stores the forward `from` and `to` references
   on each `Transfer` entity.
```

```
<!-- 3. Test Case 3 — Verify the original mint from the zero address -->

   Action:

   Query:

   {
     transfers(
       where: {
         from: "0x0000000000000000000000000000000000000000"
       }
     ) {
       to {
         id
       }
       value
     }
   }

   Output:

   {
     "data": {
       "transfers": [
         {
           "to": {
             "id": "0xbe1a491a93822eb244f111ce83baa0b2c617c305"
           },
           "value": "1000000000000000000000"
         }
       ]
     }
   }

   Result:

   PASS

   The original mint appears as a `Transfer` from the zero address to
   the deployer, with a value of `1000 GAME`.

   The recipient was correctly resolved as a `Holder`, while the zero
   address retained a balance of `0`.

   This confirms that the mint special case correctly credits the
   recipient without attempting to debit the zero address.
```

```
<!-- 4. Test Case 4 — Demonstrate why the zero-address special case is -->
   required

   Action:

   Temporarily remove:

   if (!event.params.from.equals(ZERO_ADDRESS))

   from `src/game-token.ts`, causing the mapping to debit the sender
   unconditionally.

   Deploy the intentionally broken version to:

   game-token-subgraph-broken

   Then query:

   {
     holder(
       id: "0x0000000000000000000000000000000000000000"
     ) {
       balance
     }
   }

   Expected result:

   The zero address receives an incorrect huge-positive balance caused
   by unsigned `BigInt` underflow/wrapping when the mapping attempts to
   subtract the minted amount from zero.

   Result:

   Demonstration confirms the issue.

   The zero-address check is therefore load-bearing: it prevents a mint
   from being interpreted as a normal transfer and prevents the mapping
   from creating an invalid zero-address balance.

   After completing the demonstration, restore the original condition:

   if (!event.params.from.equals(ZERO_ADDRESS))

   The intentionally broken subgraph can then be considered disposable.
```
