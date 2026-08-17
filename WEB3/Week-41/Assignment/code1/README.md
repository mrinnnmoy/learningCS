# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge install smartcontractkit/chainlink-brownie-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install Chainlink's contracts (Tutorial above).

     forge init oracle-easy --no-git
     cd oracle-easy
     forge install smartcontractkit/chainlink-brownie-contracts
     echo '@chainlink/contracts/=lib/chainlink-brownie-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create src/PriceConsumer.sol, script/DeployPriceConsumer.s.sol,
   and the one test file from the Solution below.

4. Unit-test locally first, entirely deterministic.

     forge build
     forge test -vv

   You should see 3 tests, all passing.

5. Deploy for real to Sepolia, reading Chainlink's own real, live
   feed:

        forge script script/DeployPriceConsumer.s.sol \
        --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
        --account deployerKey \
        --broadcast
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code1/oracle-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/PriceConsumer.t.sol:PriceConsumerTest
[PASS] testExploit_StalePriceReverts() (gas: 23022)
[PASS] testFix_ConvertsToEighteenDecimalsCorrectly() (gas: 23456)
[PASS] testFix_FreshPriceDoesNotRevert() (gas: 23394)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 2.49ms (926.02µs CPU time)

Ran 1 test suite in 97.16ms (2.49ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code1/oracle-easy$ forge script script/DeployPriceConsumer.s.sol \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --account deployerKey \
  --broadcast
Enter keystore password:
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
consumer: contract PriceConsumer 0xB0934201d2cD58c67768b4836F064F94Fe1572f1

== Logs ==
  PriceConsumer deployed at: 0xB0934201d2cD58c67768b4836F064F94Fe1572f1
  Live ETH/USD price (18 decimals): 2418940000000000000000

## Setting up 1 EVM.

==========================

Chain 11155111

Estimated gas price: 1.980936468 gwei

Estimated total gas used for script: 589154

Estimated amount required: 0.001167076643868072 ETH

==========================

##### sepolia
✅  [Success] Hash: 0x44ac2d030a898e006a5f67632df19434aedde496dae7fbdcb25fe94ce43f38ae
Contract: PriceConsumer
Contract Address: 0xB0934201d2cD58c67768b4836F064F94Fe1572f1
Block: 11547186
Paid: 0.000480062151363488 ETH (453196 gas * 1.059281528 gwei)

✅ Sequence #1 on sepolia | Total Paid: 0.000480062151363488 ETH (453196 gas * avg 1.059281528 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-41/Assignment/code1/oracle-easy/broadcast/DeployPriceConsumer.s.sol/11155111/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-41/Assignment/code1/oracle-easy/cache/DeployPriceConsumer.s.sol/11155111/run-latest.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code1/oracle-easy$ cast call 0xB0934201d2cD58c67768b4836F064F94Fe1572f1 "getLatestPrice()(uint256)" --rpc-url https://ethereum-sepolia-rpc.publicnode.com
2418940000000000000000 [2.418e21]
```
