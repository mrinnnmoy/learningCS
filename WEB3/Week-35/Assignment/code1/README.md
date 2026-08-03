# How to Build.

```
1. Complete the Tutorial above (Docker Graph Node running, Graph CLI
   installed).

2. Scaffold.

     graph init counter-subgraph

     (
        Network:          Ethereum Sepolia Testnet
        Contract:         0xe22F630A1AB30a145EAf7B2fA92d49687e796268
        Start block:      11444545
        Contract name:    Counter
        Index events:     true
     )

     cd counter-subgraph

3. Replace the generated schema.graphql and src/counter.ts with the
   Solution below and update subgraph.yaml.

   In subgraph.yaml:

     address: "0xe22F630A1AB30a145EAf7B2fA92d49687e796268"
     startBlock: 11444545

     entities:
       - CountChangeEvent

   because both blockchain events are mapped into the single immutable
   CountChangeEvent entity defined in schema.graphql.

4. Run the full deploy loop against the local Graph Node:

     graph codegen
     graph build
     graph create --node http://localhost:8020 counter-subgraph
     graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 counter-subgraph

   Version label used during deployment: 1.0.0
```

---

# Resource.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-35/Assignment/code1/counter-subgraph$ graph deploy \
  --node http://localhost:8020 \
  --ipfs http://localhost:5001 \
  counter-subgraph
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
  Compile data source: Counter => build/Counter/Counter.wasm
✔ Compile subgraph
  Copy schema file build/schema.graphql
  Write subgraph file build/Counter/Counter.json
  Write subgraph manifest build/subgraph.yaml
✔ Write compiled subgraph to build/
  Add file to IPFS build/schema.graphql
                .. QmfPQie6gSCqhc1YuwuwYrPngMPP7cL3hFAcwSS4P5eEFs
  Add file to IPFS build/Counter/Counter.json
                .. QmV3DQ8ubTRgjgZ1FW1Gm6hSXsFteCT3zwUErWbM1GtACC
  Add file to IPFS build/Counter/Counter.wasm
                .. QmThzprGtDjzZoQN4MhHzxPZfxUFTmFo4oYGEupkzYTMKS
✔ Upload subgraph to IPFS

Build completed: QmU8146nv7jiksW8BjSQY4LYz2tcdDaWtLSsYZKWzRgYy6

Deployed to http://localhost:8000/subgraphs/name/counter-subgraph/graphql

Subgraph endpoints:
Queries (HTTP):     http://localhost:8000/subgraphs/name/counter-subgraph
```

---

# Output.

```
<!-- Manual Test Case 1. (Graph Node sync : PASS) -->

//Output
{
  "data": {
    "indexingStatuses": [
      {
        "subgraph": "QmU8146nv7jiksW8BjSQY4LYz2tcdDaWtLSsYZKWzRgYy6",
        "synced": true,
        "health": "healthy",
        "chains": [
          {
            "chainHeadBlock": {
              "number": "11486328"
            },
            "latestBlock": {
              "number": "11486328"
            }
          }
        ]
      }
    ]
  }
}

//Result
synced: true
health: healthy
```

```
<!-- Manual Test Case 2. (GraphQL query : PASS) -->

// Output.
{
  "data": {
    "countChangeEvents": []
  }
}

// Result
No CountChangeEvent entities existed before the new test transaction.
The subgraph itself was synced successfully.
```

```
<!-- Manual Test Case 3, Trigger a New Real Sepolia Transaction. (Live transaction : PASS) -->

// Output.
blockHash            0xc1ccc64843c36fa86c75d6fd18225e9d123c42e76f1c9b4f4d2bf10b046fd4be
blockNumber          11486403
contractAddress
cumulativeGasUsed    13590186
effectiveGasPrice    1062286178
from                 0xBe1A491A93822eB244F111Ce83baA0B2C617c305
gasUsed              45253
status               1 (success)
transactionHash      0x826cabd698e9cbd89041185b1fccb5d61c7509d9e00294fda7d9eb4b842e3765
transactionIndex     112
type                 2
to                   0xe22F630A1AB30a145EAf7B2fA92d49687e796268

// Event Generated
Event:        CountIncreased
changedBy:    0xBe1A491A93822eB244F111Ce83baA0B2C617c305
newCount:     1
blockNumber:  11486403

// Result
Transaction succeeded and emitted a CountIncreased event.
```

```
<!-- Manual Test Case 3, Query the Live Indexed Event. (Live transaction : PASS) -->

// Output
{
  "data": {
    "countChangeEvents": [
      {
        "id": "0x826cabd698e9cbd89041185b1fccb5d61c7509d9e00294fda7d9eb4b842e376555010000",
        "changedBy": "0xbe1a491a93822eb244f111ce83baa0b2c617c305",
        "newCount": "1",
        "eventType": "increase",
        "blockNumber": "11486403",
        "blockTimestamp": "1786700832"
      }
    ]
  }
}

// Result.
A new CountChangeEvent entry appears matching the real Sepolia
transaction.

Transaction:
0x826cabd698e9cbd89041185b1fccb5d61c7509d9e00294fda7d9eb4b842e3765

Block:
11486403

Event:
increase

New count:
1
```

```
<!-- Manual Test Case 4. (GraphQL filtering : PASS) -->

// Output.
{
  "data": {
    "countChangeEvents": [
      {
        "id": "0x826cabd698e9cbd89041185b1fccb5d61c7509d9e00294fda7d9eb4b842e376555010000",
        "newCount": "1"
      }
    ]
  }
}

// Result
Only increase-type events are returned.

eventType:
increase

newCount:
1

No decrease-type events are returned.
```
