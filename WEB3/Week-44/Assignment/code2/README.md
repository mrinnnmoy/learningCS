# For someone cloning.

Simply reinstall the dependencies.

```
cd aa-medium
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge install eth-infinitism/account-abstraction@v0.8.0
forge build
```

---

# How to build.

```
1. Scaffold and install the ERC-4337 reference contracts (Tutorial
   above).

     forge init aa-medium --no-git
     cd aa-medium
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt
     forge install eth-infinitism/account-abstraction@v0.8.0
     echo 'account-abstraction/=lib/account-abstraction/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml

   and
   
   [rpc_endpoints]
   sepolia = "${SEPOLIA_RPC_URL}"

3. Create both src/ files and the one test file from the Solution
   below.

4. Build and run — note this test forks Sepolia, so it needs
   SEPOLIA_RPC_URL exported (Week 27's own caution, applying again
   here):

     export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
     forge build
     forge test -vv
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-44/Assignment/code2/aa-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/SessionKey.t.sol:SessionKeyTest
[PASS] testExploit_SessionKeyFailsAfterItsOwnExpiry() (gas: 99078)
[PASS] testExploit_SessionKeyFailsAgainstADisallowedTarget() (gas: 96346)
[PASS] testFix_SessionKeySucceedsWithinItsOwnScope() (gas: 186097)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 6.65s (9.17s CPU time)

Ran 1 test suite in 6.65s (6.65s CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-44/Assignment/code2/aa-medium$ forge test --match-test testExploit_SessionKeyFailsAgainstADisallowedTarget -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/SessionKey.t.sol:SessionKeyTest
[PASS] testExploit_SessionKeyFailsAgainstADisallowedTarget() (gas: 96346)
Traces:
  [116246] SessionKeyTest::testExploit_SessionKeyFailsAgainstADisallowedTarget()
    ├─ [2774] 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108::getNonce(SessionKeyAccount: [0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f],0) [staticcall]
    │   └─ ← [Return] 0
    ├─ [2129] 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108::getUserOpHash(PackedUserOperation({ sender: 0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f, nonce: 0, initCode: 0x, callData: 0xb61d27f6000000000000000000000000f62849f9a0b5bf2913b396098f7c7019b51a820a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000000000000000000000000000000000000000cafe000000000000000000000000000000000000000000000002b5e3af16b188000000000000000000000000000000000000000000000000000000000000, accountGasLimits: 0x00000000000000000000000000030d4000000000000000000000000000030d40, preVerificationGas: 50000 [5e4], gasFees: 0x0000000000000000000000003b9aca000000000000000000000000003b9aca00, paymasterAndData: 0x, signature: 0x })) [staticcall]
    │   └─ ← [Return] 0xef68b9b7bc2a59ae802117ec148c65a01f4d28e337a495c44ae8b58249e73dfb
    ├─ [0] VM::sign("<pk>", 0x271d98fa7beb8c4517285e7597edf9279cfbc393a9d96d08ced2ce5b4db164e8) [staticcall]
    │   └─ ← [Return] 27, 0xeffeecb10b9f0278e8f422a74a8afc1d2959bb3690aade74bce7fdd4c7df0c09, 0x2aff0186d1d20ce12e834b17aed8072a7cdf6900bbbe9f987994b7246e1c81fe
    ├─ [0] VM::prank(0x0000000000000000000000000000000000000B0b)
    │   └─ ← [Return]
    ├─ [0] VM::expectRevert(custom error 0xf4844814)
    │   └─ ← [Return]
    ├─ [74322] 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108::handleOps([PackedUserOperation({ sender: 0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f, nonce: 0, initCode: 0x, callData: 0xb61d27f6000000000000000000000000f62849f9a0b5bf2913b396098f7c7019b51a820a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000000000000000000000000000000000000000cafe000000000000000000000000000000000000000000000002b5e3af16b188000000000000000000000000000000000000000000000000000000000000, accountGasLimits: 0x00000000000000000000000000030d4000000000000000000000000000030d40, preVerificationGas: 50000 [5e4], gasFees: 0x0000000000000000000000003b9aca000000000000000000000000003b9aca00, paymasterAndData: 0x, signature: 0xeffeecb10b9f0278e8f422a74a8afc1d2959bb3690aade74bce7fdd4c7df0c092aff0186d1d20ce12e834b17aed8072a7cdf6900bbbe9f987994b7246e1c81fe1b })], 0x0000000000000000000000000000000000000B0b)
    │   ├─ [41737] SessionKeyAccount::validateUserOp(PackedUserOperation({ sender: 0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f, nonce: 0, initCode: 0x, callData: 0xb61d27f6000000000000000000000000f62849f9a0b5bf2913b396098f7c7019b51a820a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000000000000000000000000000000000000000cafe000000000000000000000000000000000000000000000002b5e3af16b188000000000000000000000000000000000000000000000000000000000000, accountGasLimits: 0x00000000000000000000000000030d4000000000000000000000000000030d40, preVerificationGas: 50000 [5e4], gasFees: 0x0000000000000000000000003b9aca000000000000000000000000003b9aca00, paymasterAndData: 0x, signature: 0xeffeecb10b9f0278e8f422a74a8afc1d2959bb3690aade74bce7fdd4c7df0c092aff0186d1d20ce12e834b17aed8072a7cdf6900bbbe9f987994b7246e1c81fe1b }), 0xef68b9b7bc2a59ae802117ec148c65a01f4d28e337a495c44ae8b58249e73dfb, 450000000000000 [4.5e14])
    │   │   ├─ [3000] PRECOMPILES::ecrecover(0x271d98fa7beb8c4517285e7597edf9279cfbc393a9d96d08ced2ce5b4db164e8, 27, 108553183551126627087003660837422570421489813653353933441669072905441669745673, 19447696178491555149205604538539960131994612459138241251037626540318284087806) [staticcall]
    │   │   │   └─ ← [Return] 0x87110f79f69670eE8dEd56E2231882D06b2873F2
    │   │   ├─ [21730] 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108::fallback{value: 450000000000000}()
    │   │   │   ├─ emit Deposited(account: SessionKeyAccount: [0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f], totalDeposit: 450000000000000 [4.5e14])
    │   │   │   └─ ← [Stop]
    │   │   └─ ← [Return] 1
    │   └─ ← [Revert] FailedOp(0, "AA24 signature error")
    ├─ [2824] MockERC20::balanceOf(0x000000000000000000000000000000000000cafE) [staticcall]
    │   └─ ← [Return] 0
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 6.39s (3.10s CPU time)

Ran 1 test suite in 6.39s (6.39s CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```