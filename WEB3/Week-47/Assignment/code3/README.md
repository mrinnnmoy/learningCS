# How to Build.

```
1. Install `circomlib` and `circomlibjs`, the real, standard library of common Circom templates including Poseidon.

      npm init -y
      npm install circomlib
      npm install circomlibjs

  Verify that the Poseidon circuit is available:

      ls node_modules/circomlib/circuits/poseidon.circom

  Reuse the same Powers of Tau file from the Tutorial:

      cp ../../code1/zk-easy/pot12_final.ptau .

  Verify that the file was copied successfully:

      ls pot12_final.ptau

2. Create the Poseidon preimage circuit

    Create `preimage.circom` using `circomlib`'s real Poseidon implementation.

    The circuit accepts:

      * `secret` as a private input
      * `expectedHash` as a public input

    The circuit proves that:

      Poseidon(secret) == expectedHash

    Compile the circuit:

      circom preimage.circom --r1cs --wasm --sym -l node_modules

    The expected output includes:

      Written successfully: ./preimage.r1cs
      Written successfully: ./preimage.sym
      Written successfully: ./preimage_js/preimage.wasm
      Everything went okay

    Inspect the generated R1CS:

      snarkjs r1cs info preimage.r1cs

    The circuit should contain one private input and one public input.

3. Compute the real Poseidon hash

    Choose a real secret.

    For this assignment, the secret is:

      123456789


    Use `circomlibjs` to calculate its Poseidon hash:

      node hash.js

    The generated Poseidon hash for this secret is:

      7110303097080024260800444665787206606103183587082596139871399733998958991511

    Create `input.json` using the private secret and its corresponding public Poseidon hash:

      {
          "secret": "123456789",
          "expectedHash": "7110303097080024260800444665787206606103183587082596139871399733998958991511"
      }

    The `secret` will be used privately by the witness generator. Only `expectedHash` becomes part of the public signals.

4. Run the Groth16 setup

    Reuse the Tutorial's existing `pot12_final.ptau` file and generate the initial proving key:

      snarkjs groth16 setup preimage.r1cs pot12_final.ptau preimage_0000.zkey


    Contribute entropy to the ceremony:

      snarkjs zkey contribute preimage_0000.zkey preimage_final.zkey --name="preimage-toy" -v

    When prompted, enter random entropy.

    Export the verification key:

      snarkjs zkey export verificationkey preimage_final.zkey verification_key.json

5. Generate the witness and real proof

    Generate the witness using the private secret:

      node preimage_js/generate_witness.js preimage_js/preimage.wasm input.json witness.wtns

    Generate the Groth16 proof and public signals:

      snarkjs groth16 prove preimage_final.zkey witness.wtns proof.json public.json

    Inspect the public signal:

      cat public.json

    The output should contain the real Poseidon hash:

      [
      "7110303097080024260800444665787206606103183587082596139871399733998958991511"
      ]

    Verify the proof off-chain:

      snarkjs groth16 verify verification_key.json public.json proof.json

    The expected result is:

      [INFO]  snarkJS: OK!

    This confirms that the proof correctly proves knowledge of a private preimage whose Poseidon hash equals the public `expectedHash`.

6. Export the Solidity verifier.

    Generate the Solidity Groth16 verifier:

      snarkjs zkey export solidityverifier preimage_final.zkey verifier.sol

    Confirm the generated contract exists:

      grep -n "contract " verifier.sol

    The generated verifier contract is:

      Groth16Verifier

    Copy the generated verifier into the Foundry project's `src` directory:

      cp verifier.sol zk-hard-contracts/src/Verifier.sol

7. Export Solidity calldata

    Export the real proof values in Solidity-compatible format:

      snarkjs zkey export soliditycalldata public.json proof.json

    The output contains the real values for:

    * `pA`
    * `pB`
    * `pC`
    * the public signal

    Use these generated values in:

      zk-hard-contracts/test/PrivateAccessControl.t.sol

    The real public Poseidon hash used by the contract is:

      7110303097080024260800444665787206606103183587082596139871399733998958991511

    The private secret `123456789` must not be placed in the Solidity contract, test calldata, public signals, or emitted events.

8. Create the Foundry access-control contract

    Inside `zk-hard-contracts/src/`, create:

      Verifier.sol
      PrivateAccessControl.sol

    `PrivateAccessControl` should:

      * Store the deployed `Groth16Verifier`
      * Store the real public `expectedHash`
      * Verify Groth16 proofs against that hash
      * Revert with `InvalidProof()` when verification fails
      * Generate a replay identifier from the proof and nonce
      * Revert with `ProofAlreadyUsed()` when the same proof and nonce are submitted again
      * Set `hasAccess[msg.sender] = true` only after successful verification

    The replay identifier follows the pattern:

      bytes32 proofId = keccak256(abi.encode(pA, pB, pC, nonce));

    The contract checks whether the proof has already been used before performing another expensive verification.

9. Create the Foundry test

    Create:

      zk-hard-contracts/test/PrivateAccessControl.t.sol

    Insert the real proof values generated by:

      snarkjs zkey export soliditycalldata public.json proof.json

    The test suite should cover:

    1. A legitimate proof generated from the correct private secret grants access.
    2. The identical proof submitted again with the same nonce reverts with `ProofAlreadyUsed()`.
    3. A tampered proof fails verification and reverts with `InvalidProof()`.

10. Build the Foundry project

    Enter the Foundry project:

      cd zk-hard-contracts

    Build all Solidity contracts:

      forge build

    The expected result is a successful compilation.

11. Run the complete test suite

    Run all tests:

      forge test -vv

    The expected output shape is:

    Ran 3 tests for test/PrivateAccessControl.t.sol:PrivateAccessControlTest
    [PASS] testExploit_IdenticalProofCannotBeReplayed()
    [PASS] testExploit_TamperedProofFailsOutright()
    [PASS] testFix_ValidProofGrantsAccessWithoutRevealingTheSecret()

    Suite result: ok. 3 passed; 0 failed; 0 skipped
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ node hash.js
7110303097080024260800444665787206606103183587082596139871399733998958991511
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ circom preimage.circom --r1cs --wasm --sym -l node_modules
template instances: 71
non-linear constraints: 216
linear constraints: 199
public inputs: 1
private inputs: 1
public outputs: 0
wires: 417
labels: 583
Written successfully: ./preimage.r1cs
Written successfully: ./preimage.sym
Written successfully: ./preimage_js/preimage.wasm
Everything went okay
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs r1cs info preimage.r1cs
[INFO]  snarkJS: Curve: bn-128
[INFO]  snarkJS: # of Wires: 417
[INFO]  snarkJS: # of Constraints: 415
[INFO]  snarkJS: # of Private Inputs: 1
[INFO]  snarkJS: # of Public Inputs: 1
[INFO]  snarkJS: # of Labels: 583
[INFO]  snarkJS: # of Outputs: 0
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs groth16 setup \
  preimage.r1cs \
  pot12_final.ptau \
  preimage_0000.zkey
[INFO]  snarkJS: Reading r1cs
[INFO]  snarkJS: Reading tauG1
[INFO]  snarkJS: Reading tauG2
[INFO]  snarkJS: Reading alphatauG1
[INFO]  snarkJS: Reading betatauG1
[INFO]  snarkJS: Circuit hash:
                9493d301 22885a3d c1b343c2 56416c2b
                eab524eb c3eb4fa2 00b8959e 92a14709
                e1548330 b64b5e40 46f7571b 18db3e76
                4d6ee1e0 9f016f7d 4754a382 47bdb676
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs zkey contribute \
  preimage_0000.zkey \
  preimage_final.zkey \
  --name="preimage-toy" \
  -v
Enter a random text. (Entropy): hi
[DEBUG] snarkJS: Applying key: L Section: 0/415
[DEBUG] snarkJS: Applying key: H Section: 0/512
[INFO]  snarkJS: Circuit Hash:
                9493d301 22885a3d c1b343c2 56416c2b
                eab524eb c3eb4fa2 00b8959e 92a14709
                e1548330 b64b5e40 46f7571b 18db3e76
                4d6ee1e0 9f016f7d 4754a382 47bdb676
[INFO]  snarkJS: Contribution Hash:
                ad33bee6 c2484f7a 77275e37 f9d5712c
                16b29793 c27c1ceb 728767c2 0284af0f
                589fa8dd f2460be0 6699da74 726d7a15
                9bb0e7e8 32a5fa2f 7ae28eca 9a4b9f6f
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs zkey export verificationkey \
  preimage_final.zkey \
  verification_key.json
[INFO]  snarkJS: EXPORT VERIFICATION KEY STARTED
[INFO]  snarkJS: > Detected protocol: groth16
[INFO]  snarkJS: EXPORT VERIFICATION KEY FINISHED
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ node preimage_js/generate_witness.js \
  preimage_js/preimage.wasm \
  input.json \
  witness.wtns
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs groth16 prove \
  preimage_final.zkey \
  witness.wtns \
  proof.json \
  public.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs groth16 verify \\
  verification_key.json \
  public.json \
  proof.json
[INFO]  snarkJS: OK!
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs zkey export solidityverifier \
  preimage_final.zkey \
  verifier.sol
[INFO]  snarkJS: EXPORT VERIFICATION KEY STARTED
[INFO]  snarkJS: > Detected protocol: groth16
[INFO]  snarkJS: EXPORT VERIFICATION KEY FINISHED
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard$ snarkjs zkey export soliditycalldata \
  public.json \
  proof.json
["0x1c44c1d46dda463f3ca9bb7880d89310d30ada68cc2e5e13fceaf8d5c9e31039", "0x08c1f42412ce306ad2feddf72ed36208a600d7e85a36b06d9344afbb7750f8d5"],[["0x0cd23a3c8ddb88015b00b651ccbcecd99b026fd1d9be42b5cc7462191eb01532", "0x218f69bb5747b0b991b2722f97002a0b3c972776c8ba116e171c2573058b2cfe"],["0x27262d62b59f76ea9de5e5668706a9fa19046d40530790de6d03802f9f593505", "0x0a8798c3c52687e6ec040fe5c12d9d9a28369d0395a98d86b497acac23069222"]],["0x21ab02fdfd1a44306371efbb9a0fd0b7810415e1795de47bb5c0149e2ccf4aef", "0x05152f3fcf282f8d9e45df9c9cd1524a1073562ccf1c05062f2faa4ea811a418"],["0x0fb849f7cf35865c838cef48782e803b2c38263e2f467799c87eff168eb4d897"]
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard/zk-hard-contracts$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/PrivateAccessControl.t.sol:PrivateAccessControlTest
[PASS] testExploit_IdenticalProofCannotBeReplayed() (gas: 283103)
[PASS] testExploit_TamperedProofFailsOutright() (gas: 1024174819)
[PASS] testFix_ValidProofGrantsAccessWithoutRevealingTheSecret() (gas: 274962)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 16.85ms (19.80ms CPU time)

Ran 1 test suite in 25.09ms (16.85ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard/zk-hard-contracts$ forge test --match-test testFix_ValidProofGrantsAccessWithoutRevealingTheSecret -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/PrivateAccessControl.t.sol:PrivateAccessControlTest
[PASS] testFix_ValidProofGrantsAccessWithoutRevealingTheSecret() (gas: 274962)
Traces:
  [274962] PrivateAccessControlTest::testFix_ValidProofGrantsAccessWithoutRevealingTheSecret()
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [240702] PrivateAccessControl::claimAccess([12786243124858845696466051475218871822215030612564676885551242795070838214713 [1.278e76], 3961189270815498735891912673058209689117105215149736131552788963166830786773 [3.961e75]], [[5799194000426914303292843327913257407316616571911447369403662315689346078002 [5.799e75], 15179712867579200608806449749488746389734230596684925105126301812414409813246 [1.517e76]], [17707654522996471396781987837661218191243607556716246267198864403066628158725 [1.77e76], 4762707182974430166454220381123098567091671940176631537857004154025538916898 [4.762e75]]], [15228475502338910054211718944101893277358221125981713111341342822670300826351 [1.522e76], 2298994133647793035781002392393483221177997133421772772732759907603213034520 [2.298e75]], 1)
    │   ├─ [189126] Groth16Verifier::verifyProof([12786243124858845696466051475218871822215030612564676885551242795070838214713 [1.278e76], 3961189270815498735891912673058209689117105215149736131552788963166830786773 [3.961e75]], [[5799194000426914303292843327913257407316616571911447369403662315689346078002 [5.799e75], 15179712867579200608806449749488746389734230596684925105126301812414409813246 [1.517e76]], [17707654522996471396781987837661218191243607556716246267198864403066628158725 [1.77e76], 4762707182974430166454220381123098567091671940176631537857004154025538916898 [4.762e75]]], [15228475502338910054211718944101893277358221125981713111341342822670300826351 [1.522e76], 2298994133647793035781002392393483221177997133421772772732759907603213034520 [2.298e75]], [7110303097080024260800444665787206606103183587082596139871399733998958991511 [7.11e75]]) [staticcall]
    │   │   ├─ [6000] PRECOMPILES::ecmul(13516075405705141106319315717538235725637939250711477532548517318836962807532, 17394180056462563313465557247284235032840999316846181104144312554459005939685, 7110303097080024260800444665787206606103183587082596139871399733998958991511) [staticcall]
    │   │   │   └─ ← [Return] (9489785057179783893931896406990724138472401116613695249812347400666027844485, 18723811017493708223704604059271523460112930482745883918186621483258410803524)
    │   │   ├─ [150] PRECOMPILES::ecadd(9489785057179783893931896406990724138472401116613695249812347400666027844485, 18723811017493708223704604059271523460112930482745883918186621483258410803524, 11449629735215577333429923686750782670853995717967436990349768902819882230779, 2890434771965313470056049897731768450439184154920896991675773726622413662875) [staticcall]
    │   │   │   └─ ← [Return] (4969900899111235824907707490309285171234809814389282156865064149184922112005, 18416009469504800671060978117712215591908708607984066816620258785423595531743)
    │   │   ├─ [181000] PRECOMPILES::ecpairing([12786243124858845696466051475218871822215030612564676885551242795070838214713, 17927053601023776486354493072199065399579205942148087531136248931478395421810, 5799194000426914303292843327913257407316616571911447369403662315689346078002, 15179712867579200608806449749488746389734230596684925105126301812414409813246, 17707654522996471396781987837661218191243607556716246267198864403066628158725, 4762707182974430166454220381123098567091671940176631537857004154025538916898], [2961263713475775015226390701158533988032315185542719461986634100846799627325, 7239014905809008932897638011199818312185780626184801802816317486699045155181, 4104512540399604200022161417726434478532070430090330392758531291320254355217, 17560776505242011557846718213664354094658272412128654389959283982597825579001, 19113440016168810944797745073941154587851853106157966257417353237609410066206, 9518562540427551978003387824235021240131952305916904664694983055748363724], [4969900899111235824907707490309285171234809814389282156865064149184922112005, 18416009469504800671060978117712215591908708607984066816620258785423595531743, 11559732032986387107991004021392285783925812861821192530917403151452391805634, 10857046999023057135944570762232829481370756359578518086990519993285655852781, 4082367875863433681332203403145435568316851327593401208105741076214120093531, 8495653923123431417604973247489272438418190587263600148770280649306958101930], [15228475502338910054211718944101893277358221125981713111341342822670300826351, 2298994133647793035781002392393483221177997133421772772732759907603213034520, 15993462656841321400811585399868762929995038634130690351245869577678834810329, 9392809930634528951543479731193105047419659430179771270838007171420220907669, 13182524555932201379224770940926931048334234711284048879567823205055543947559, 18543024337296393345860778489975677549017091090710768381809612746878432741349]) [staticcall]
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [855] PrivateAccessControl::hasAccess(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] true
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 3.54ms (2.58ms CPU time)

Ran 1 test suite in 25.38ms (3.54ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code3/zk-hard/zk-hard-contracts$ forge test --match-test testExploit_IdenticalProofCannotBeReplayed -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/PrivateAccessControl.t.sol:PrivateAccessControlTest
[PASS] testExploit_IdenticalProofCannotBeReplayed() (gas: 283103)
Traces:
  [283103] PrivateAccessControlTest::testExploit_IdenticalProofCannotBeReplayed()
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [240702] PrivateAccessControl::claimAccess([12786243124858845696466051475218871822215030612564676885551242795070838214713 [1.278e76], 3961189270815498735891912673058209689117105215149736131552788963166830786773 [3.961e75]], [[5799194000426914303292843327913257407316616571911447369403662315689346078002 [5.799e75], 15179712867579200608806449749488746389734230596684925105126301812414409813246 [1.517e76]], [17707654522996471396781987837661218191243607556716246267198864403066628158725 [1.77e76], 4762707182974430166454220381123098567091671940176631537857004154025538916898 [4.762e75]]], [15228475502338910054211718944101893277358221125981713111341342822670300826351 [1.522e76], 2298994133647793035781002392393483221177997133421772772732759907603213034520 [2.298e75]], 1)
    │   ├─ [189126] Groth16Verifier::verifyProof([12786243124858845696466051475218871822215030612564676885551242795070838214713 [1.278e76], 3961189270815498735891912673058209689117105215149736131552788963166830786773 [3.961e75]], [[5799194000426914303292843327913257407316616571911447369403662315689346078002 [5.799e75], 15179712867579200608806449749488746389734230596684925105126301812414409813246 [1.517e76]], [17707654522996471396781987837661218191243607556716246267198864403066628158725 [1.77e76], 4762707182974430166454220381123098567091671940176631537857004154025538916898 [4.762e75]]], [15228475502338910054211718944101893277358221125981713111341342822670300826351 [1.522e76], 2298994133647793035781002392393483221177997133421772772732759907603213034520 [2.298e75]], [7110303097080024260800444665787206606103183587082596139871399733998958991511 [7.11e75]]) [staticcall]
    │   │   ├─ [6000] PRECOMPILES::ecmul(13516075405705141106319315717538235725637939250711477532548517318836962807532, 17394180056462563313465557247284235032840999316846181104144312554459005939685, 7110303097080024260800444665787206606103183587082596139871399733998958991511) [staticcall]
    │   │   │   └─ ← [Return] (9489785057179783893931896406990724138472401116613695249812347400666027844485, 18723811017493708223704604059271523460112930482745883918186621483258410803524)
    │   │   ├─ [150] PRECOMPILES::ecadd(9489785057179783893931896406990724138472401116613695249812347400666027844485, 18723811017493708223704604059271523460112930482745883918186621483258410803524, 11449629735215577333429923686750782670853995717967436990349768902819882230779, 2890434771965313470056049897731768450439184154920896991675773726622413662875) [staticcall]
    │   │   │   └─ ← [Return] (4969900899111235824907707490309285171234809814389282156865064149184922112005, 18416009469504800671060978117712215591908708607984066816620258785423595531743)
    │   │   ├─ [181000] PRECOMPILES::ecpairing([12786243124858845696466051475218871822215030612564676885551242795070838214713, 17927053601023776486354493072199065399579205942148087531136248931478395421810, 5799194000426914303292843327913257407316616571911447369403662315689346078002, 15179712867579200608806449749488746389734230596684925105126301812414409813246, 17707654522996471396781987837661218191243607556716246267198864403066628158725, 4762707182974430166454220381123098567091671940176631537857004154025538916898], [2961263713475775015226390701158533988032315185542719461986634100846799627325, 7239014905809008932897638011199818312185780626184801802816317486699045155181, 4104512540399604200022161417726434478532070430090330392758531291320254355217, 17560776505242011557846718213664354094658272412128654389959283982597825579001, 19113440016168810944797745073941154587851853106157966257417353237609410066206, 9518562540427551978003387824235021240131952305916904664694983055748363724], [4969900899111235824907707490309285171234809814389282156865064149184922112005, 18416009469504800671060978117712215591908708607984066816620258785423595531743, 11559732032986387107991004021392285783925812861821192530917403151452391805634, 10857046999023057135944570762232829481370756359578518086990519993285655852781, 4082367875863433681332203403145435568316851327593401208105741076214120093531, 8495653923123431417604973247489272438418190587263600148770280649306958101930], [15228475502338910054211718944101893277358221125981713111341342822670300826351, 2298994133647793035781002392393483221177997133421772772732759907603213034520, 15993462656841321400811585399868762929995038634130690351245869577678834810329, 9392809930634528951543479731193105047419659430179771270838007171420220907669, 13182524555932201379224770940926931048334234711284048879567823205055543947559, 18543024337296393345860778489975677549017091090710768381809612746878432741349]) [staticcall]
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [0] VM::expectRevert(ProofAlreadyUsed())
    │   └─ ← [Return]
    ├─ [2440] PrivateAccessControl::claimAccess([12786243124858845696466051475218871822215030612564676885551242795070838214713 [1.278e76], 3961189270815498735891912673058209689117105215149736131552788963166830786773 [3.961e75]], [[5799194000426914303292843327913257407316616571911447369403662315689346078002 [5.799e75], 15179712867579200608806449749488746389734230596684925105126301812414409813246 [1.517e76]], [17707654522996471396781987837661218191243607556716246267198864403066628158725 [1.77e76], 4762707182974430166454220381123098567091671940176631537857004154025538916898 [4.762e75]]], [15228475502338910054211718944101893277358221125981713111341342822670300826351 [1.522e76], 2298994133647793035781002392393483221177997133421772772732759907603213034520 [2.298e75]], 1)
    │   └─ ← [Revert] ProofAlreadyUsed()
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 4.57ms (3.78ms CPU time)

Ran 1 test suite in 14.27ms (4.57ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
