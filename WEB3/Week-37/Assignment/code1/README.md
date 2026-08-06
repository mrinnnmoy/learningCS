# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

---

# How to Build.

```
1. Complete the Tutorial above (two anvil instances running, on
   ports 8545 and 8546, with chain IDs 31337 and 31338).

2. Scaffold and install OpenZeppelin.

     forge init bridge-easy --no-git
     cd bridge-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

3. Set solc = "0.8.36" under [profile.default] in foundry.toml.

4. Create all three src/ files, both script/ files, and the one test
   file from the Solution below.

5. Unit-test the contract logic in isolation first.

     forge build
     forge test -vv

   You should see 2 tests, all passing.

6. Deploy for real, to the TWO separate live chains — copy the full
   Account 0 key (Week 27's own well-known default) in full each time:

     forge script script/DeployChainA.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast

   Note the LockBox address this prints, then deploy Chain B, passing
   that real address in:

     forge script script/DeployChainB.s.sol --rpc-url http://127.0.0.1:8546 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast \
       --sig "run(address)" <LOCKBOX_ADDRESS_FROM_CHAIN_A>
```

---

# Resources.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy$ forge script script/DeployChainA.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
[⠒] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Logs ==
  Chain A chainid: 31337
  MockERC20 deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  LockBox deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1532381

Estimated amount required: 0.003064762001532381 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0xef791d1bcdc41d1549144e453be8504b29a60995c58f5548bbaa025cfdc2c801
Contract: MockERC20
Function: mint(address,uint256)
Contract Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Block: 2
Paid: 0.000391583119188888 ETH (444716 gas * 0.880524018 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0x948243865fd033c7cfb3a9a03022f3467910e687d6951337c3a79befb517a6a4
Contract: MockERC20
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.000662882000662882 ETH (662882 gas * 1.000000001 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0x9e3ca37608a6c1351f5c00727cf853af8c2e40245cc39114b9ab52b1573286b1
Contract: LockBox
Block: 2
Paid: 0.000058971335057514 ETH (66973 gas * 0.880524018 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.001113436454909284 ETH (1174571 gas * avg 0.920349345 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy/broadcast/DeployChainA.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy/cache/DeployChainA.s.sol/31337/run-latest.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy$ forge script script/DeployChainB.s.sol --rpc-url http://127.0.0.1:8546 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast \
       --sig "run(address)" 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
[⠒] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Logs ==
  Chain B chainid: 31338
  WrappedToken deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31338

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1528251

Estimated amount required: 0.003056502001528251 ETH

==========================

##### 31338
✅  [Success] Hash: 0x0240933d486fb5ce41d147996dbbc4fb7744682a52ddb9225c01833990321e93
Contract: WrappedToken
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.001175578001175578 ETH (1175578 gas * 1.000000001 gwei)

✅ Sequence #1 on 31338 | Total Paid: 0.001175578001175578 ETH (1175578gas * avg 1.000000001 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy/broadcast/DeployChainB.s.sol/31338/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy/cache/DeployChainB.s.sol/31338/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy$ cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "token()(address)" --rpc-url http://127.0.0.1:8545
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy$ cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "sourceChainId()(uint256)" --rpc-url http://127.0.0.1:8546
31337 [3.133e4]
```

```
WEB3/Week-37/Assignment/code1/bridge-easy$ cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://127.0.0.1:8545
9999998886563545090716

// 9.99... ETH
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy$ cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://127.0.0.1:8546
9999998824421998824422

// 9.99... ETH
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code1/bridge-easy$ forge test -vv
[⠒] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/WrappedTokenReplayProtection.t.sol:WrappedTokenReplayProtectionTest
[PASS] testFix_IdenticalNonceRevertsOnReplay() (gas: 87429)
[PASS] testFix_ValidMintSucceedsOnce() (gas: 85680)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 18.52ms (8.88ms CPU time)

Ran 1 test suite in 43.72ms (18.52ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```
