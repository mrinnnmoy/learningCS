# For someone cloning.

Simply reinstall the dependencies.

```
cd pyth-consumer
forge install foundry-rs/forge-std
forge install pyth-network/pyth-sdk-solidity
forge build
```

---

# How to Build.

```
1. Foundry side — scaffold and install Pyth's SDK (Tutorial above).

     forge init pyth-consumer --no-git
     cd pyth-consumer
     forge install pyth-network/pyth-sdk-solidity
     echo '@pythnetwork/pyth-sdk-solidity/=lib/pyth-sdk-solidity/' >> remappings.txt

   Set solc = "0.8.36" under [profile.default] in foundry.toml,
   create src/PythPriceConsumer.sol and the one test file from the
   Solution below, then:

     forge build
     forge test -vv

2. Deploy to Sepolia, pointed at Pyth's OWN real, current Sepolia
   contract address (confirmed directly from Pyth's own contract
   address page per the Tutorial's own step 4 — don't assume it's
   unchanged from any address written elsewhere):

     forge create src/PythPriceConsumer.sol:PythPriceConsumer \
       --rpc-url sepolia --account deployerKey --broadcast \
       --constructor-args <REAL_CURRENT_PYTH_SEPOLIA_ADDRESS> <ETH_USD_PRICE_ID>

   (`0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`
   is Pyth's own real, chain-agnostic ETH/USD price feed ID — the same
   ID works on every chain Pyth supports, unlike the contract address
   itself, which differs per network.)

3. TypeScript side — scaffold and create src/fetchAndUpdate.ts from
   the Solution below.

     cd ../hermes-fetcher
     npm init -y
     npm install @pythnetwork/hermes-client ethers@6.17.0
     npm install -D typescript tsx @types/node

4. Run the full, real pull flow.

     npx tsx src/fetchAndUpdate.ts
```

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code2/pyth-consumer$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/PythPriceConsumer.t.sol:PythPriceConsumerTest
[PASS] testFix_UpdateAndReadReturnsPriceAndConfidence() (gas: 192277)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 831.01µs (204.27µs CPU time)

Ran 1 test suite in 11.52ms (831.01µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code2/pyth-consumer$ forge create src/PythPriceConsumer.sol:PythPriceConsumer \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --account deployerKey \
  --broadcast \
  --constructor-args \
  0xDd24F84d36BF92C65F92307595335bdFab5Bbd21 \
  0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace
Enter keystore password:
[⠊] Compiling...
No files changed, compilation skipped
Deployer: 0xBe1A491A93822eB244F111Ce83baA0B2C617c305
Deployed to: 0xa2A3d870699Fb745705d2aBb6e167FEFEe787097
Transaction hash: 0x4ad8e8df003a1cd2813779f5eb8f502d7e5202ff69eee2ad72d9a49df191d62e
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code2/hermes-fetcher$ npx tsx src/fetchAndUpdate.ts
Updated on-chain — tx 0x034e78657c8f81e5f5b5533153cb74ea98ab5995ac654e637f545e1464c93a9a, fee paid: 1 wei
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code2/hermes-fetcher$ cast logs \
  --address 0xa2A3d870699Fb745705d2aBb6e167FEFEe787097 \
  --from-block 11548486 \
  --to-block 11548486 \
  --rpc-url "$SEPOLIA_RPC_URL"
- address: 0xa2A3d870699Fb745705d2aBb6e167FEFEe787097
  blockHash: 0x9900282397a86250919f1188b0664d496ba613fe71cd74778d9165494f615d75
  blockNumber: 11548486
  data: 0x00000000000000000000000000000000000000000000000000000037b6b9f043000000000000000000000000000000000000000000000000000000000681a53dfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8000000000000000000000000000000000000000000000000000000006a8a9d3e
  logIndex: 382
  removed: false
  topics: [
        0x1dcabca1c86fdcf588731c0728fab62d3bbc88a68ac7caa0a039ecbe85b2be5e
  ]
  transactionHash: 0x034e78657c8f81e5f5b5533153cb74ea98ab5995ac654e637f545e1464c93a9a
  transactionIndex: 136
```