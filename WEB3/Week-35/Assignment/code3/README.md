# How to Build.

```text
1. Scaffold the subgraph using the Week 27 TaskRegistry deployment on
   Sepolia. Use the real contract address and let the Graph CLI fetch
   the verified ABI from Sourcify.

     graph init task-registry-subgraph

   During the interactive prompts, use/confirm:

     ✔ Network · Ethereum Sepolia Testnet · sepolia · https://sepolia.etherscan.io
     ✔ Source · Smart Contract · ethereum
     ✔ Subgraph slug · task-registry-subgraph
     ✔ Directory to create the subgraph in · task-registry-subgraph
     ✔ Contract address · 0xef7EC7E600A1e8486915C8E0A87184A36073357c
     ✔ Fetching ABI from Sourcify API...
     ✔ Start block · 11422139
     ✔ Contract name · TaskRegistry
     ✔ Index contract events as entities (Y/n) · true
     ✔ Add another contract? (y/N) · false

   Then enter the directory:

     cd task-registry-subgraph

2. Replace schema.graphql and src/task-registry.ts with the Solution
   below.

   Update subgraph.yaml so that it uses TaskRegistry's own real
   Sepolia deployment:

     address: "0xef7EC7E600A1e8486915C8E0A87184A36073357c"
     startBlock: 11422139

   The startBlock is TaskRegistry's actual Week 27 deployment block.

3. Sign up for a free Subgraph Studio account at
   https://thegraph.com/studio

   Connect a wallet, reusing the same deployerKey address already
   used throughout this course is fine.

   No funds are needed for a development subgraph deployment.

   Create a new subgraph in Subgraph Studio and copy its deploy key.

4. Authenticate the Graph CLI and deploy the subgraph for real to
   Subgraph Studio:

     graph auth <YOUR_STUDIO_DEPLOY_KEY>

     graph codegen

     graph build

     graph deploy task-registry-subgraph

   When prompted for a version label, use an appropriate version such
   as:

     1.0.0
```

---

# Resource.

```
<!-- task-registry-subgraph live sepolia testnet contract. -->

~/projects/learningCS/WEB3/Week-27/Assignment/code3/task-registry-live
Contract:       TaskRegistry
Network:        Sepolia
Chain ID:       11155111 (Sepolia)
Address:        0xef7EC7E600A1e8486915C8E0A87184A36073357c
Deployment tx:  0xb7636fc10adb25c0bf8bb46b4243d9580b2f56a2eee38abc55b6766750219c6c
Start block:    11422139
ABI:            confirmed as the Week 27 TaskRegistry ABI

On-chain bytecode: confirmed
Sourcify verification: exact_match ✅
```

```
<!-- Deploying Subgraph -->

mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-35/Assignment/code3/task-registry-subgraph$ graph deploy task-registry-subgraph
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
  Compile data source: TaskRegistry => build/TaskRegistry/TaskRegistry.wasm
✔ Compile subgraph
  Copy schema file build/schema.graphql
  Write subgraph file build/TaskRegistry/TaskRegistry.json
  Write subgraph manifest build/subgraph.yaml
✔ Write compiled subgraph to build/
  Add file to IPFS build/schema.graphql
                .. QmR6oe7exSyioNZ1kHVWJ5KQxdFzuPiBMNMBCnt2Uw13UX
  Add file to IPFS build/TaskRegistry/TaskRegistry.json
                .. QmVz57Uc8NQgHQCFMLyr8ZA2jBvUhmxW1KnCUgN2Ei8RJM
  Add file to IPFS build/TaskRegistry/TaskRegistry.wasm
                .. QmSyGDmp1wphu3cyq8iFEKBijzwacx6ETfah34wheV97Nx
✔ Upload subgraph to IPFS

Build completed: Qme14mgdTzsj29UBExXgmPd4wKKFnqKb4ixNXBio3NLAJ7

Deployed to https://thegraph.com/studio/subgraph/task-registry-subgraph

Subgraph endpoints:
Queries (HTTP):     https://api.studio.thegraph.com/query/1757793/task-registry-subgraph/1.0.0
```

---

# Output.

````
<!-- Manual Test Case 1 : Subgraph Sync Status and Historical Tasks. -->

**Query:**
```graphql
{
  tasks {
    id
    description
    status
    assignedTo
  }
}

**Output:**
{
  "data": {
    "tasks": [
      {
        "id": "0",
        "description": "Ship Week 27",
        "status": "Open",
        "assignedTo": null
      }
    ]
  }
}

**Result:**
The subgraph successfully indexed the historical `TaskCreated` event from Week 27, confirming that the configured `startBlock` allowed the subgraph to recover historical task data.
````

```
<!-- Manual Test Case 2 : Full Task Lifecycle — Created → Assigned → Status Updated. -->

**Initial query after creation:**
{
  task(id: "1") {
    id
    description
    status
    assignedTo
    createdAtBlock
    updatedAtBlock
  }
}

**Output:**
{
  "data": {
    "task": {
      "id": "1",
      "description": "Week 35 full lifecycle test",
      "status": "Open",
      "assignedTo": null,
      "createdAtBlock": "11492568",
      "updatedAtBlock": "11492568"
    }
  }
}

**After `TaskAssigned`:**
{
  "data": {
    "task": {
      "id": "1",
      "description": "Week 35 full lifecycle test",
      "status": "Open",
      "assignedTo": "0xbe1a491a93822eb244f111ce83baa0b2c617c305",
      "createdAtBlock": "11492568",
      "updatedAtBlock": "11492578"
    }
  }
}

**After StatusUpdated` to `Done`:**
{
  "data": {
    "task": {
      "id": "1",
      "description": "Week 35 full lifecycle test",
      "status": "Done",
      "assignedTo": "0xbe1a491a93822eb244f111ce83baa0b2c617c305",
      "createdAtBlock": "11492568",
      "updatedAtBlock": "11492585"
    }
  }
}

**Result:**
The same mutable `Task` entity was created at block `11492568`, updated after `TaskAssigned` at block `11492578` and updated again after `StatusUpdated` at block `11492585`. The enum-shaped `Status` value `2` was correctly mapped to the readable string `"Done"`.
```

```
<!-- Manual Test Case 3 : Unassigned Task query. -->

**Query:**
{
  tasks(where: { assignedTo: null }) {
    id
    description
  }
}

**Output:**
{
  "data": {
    "tasks": [
      {
        "id": "0",
        "description": "Ship Week 27"
      }
    ]
  }
}

**Result:**
Task `0` appears in the `assignedTo: null` query, confirming that `assignedTo` is genuinely nullable and that an unassigned task is represented as `null`, rather than the zero address or an empty string.
```

```
<!-- Manual Test Case 4 : Defensive Guard Verification. -->

**Action:**
The `if (task == null) return;` guard in `handleTaskAssigned` was considered against the contract's actual on-chain behavior. An attempt to execute:

cast send <TASKREGISTRY_ADDRESS> \
  "assignTask(uint256,address)" \
  999 \
  <ANY_ADDRESS> \
  --rpc-url sepolia \
  --account deployerKey

was expected to revert because Task ID `999` does not exist and the Week 27 `TaskRegistry` contract raises its `TaskNotFound` custom error.

**Observed result:**
No `TaskAssigned` event was emitted for the nonexistent task, so the defensive `task == null` branch could not be triggered through this valid on-chain contract path.

**Result:**
The guard remains correctly implemented as defensive-in-depth. It protects the mapping from a missing `Task` entity if such an event were ever encountered, while the current `TaskRegistry` contract logic already prevents this situation from occurring through normal transactions.
```
