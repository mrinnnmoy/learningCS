# How to Build.

```
1. Complete the Tutorial above (Circom, snarkjs installed, a real
   pot12_final.ptau produced).

2. Create multiplier.circom and input.json from the Solution below & copy the pot12_final.ptau here.

3. Run the full, correct pipeline.

     <!-- Compile the circuit -->
     circom multiplier.circom --r1cs --wasm --sym
     
     <!-- Run circuit-specific setup -->
     snarkjs groth16 setup multiplier.r1cs pot12_final.ptau multiplier_0000.zkey
     snarkjs zkey contribute multiplier_0000.zkey multiplier_final.zkey --name="toy" -v
     <!-- Now export the verification key for the above run circuit-specific setup  -->
     snarkjs zkey export verificationkey multiplier_final.zkey verification_key.json

     <!-- Generate the witness -->
     node multiplier_js/generate_witness.js multiplier_js/multiplier.wasm input.json witness.wtns

     <!-- Generate the proof -->
     snarkjs groth16 prove multiplier_final.zkey witness.wtns proof.json public.json

     <!-- Verify the statement -->
     snarkjs groth16 verify verification_key.json public.json proof.json

4. Create broken_multiplier.circom and bad_input.json from the
   Solution below, and repeat the identical pipeline against it,
   using bad_input.json instead of input.json for the witness step.
```

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ circom multiplier.circom --r1cs --wasm --sym
template instances: 1
non-linear constraints: 1
linear constraints: 0
public inputs: 0
private inputs: 2
public outputs: 1
wires: 4
labels: 4
Written successfully: ./multiplier.r1cs
Written successfully: ./multiplier.sym
Written successfully: ./multiplier_js/multiplier.wasm
Everything went okay
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs groth16 setup multiplier.r1cs pot12_final.ptau multiplier_0000.zkey
[INFO]  snarkJS: Reading r1cs
[INFO]  snarkJS: Reading tauG1
[INFO]  snarkJS: Reading tauG2
[INFO]  snarkJS: Reading alphatauG1
[INFO]  snarkJS: Reading betatauG1
[INFO]  snarkJS: Circuit hash: 
                baf077ff 1f67760b 321bdb46 771f9f48
                63f69bc9 80e21e76 2b7b88d0 323e4824
                76142ade 1b6bf1ea 3383c4a5 b1eb2be8
                243e8bb2 7296e309 e1437bb6 bc058775
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs zkey contribute multiplier_0000.zkey multiplier_final.zkey --name="toy" -v
Enter a random text. (Entropy): hi
[DEBUG] snarkJS: Applying key: L Section: 0/2
[DEBUG] snarkJS: Applying key: H Section: 0/4
[INFO]  snarkJS: Circuit Hash: 
                baf077ff 1f67760b 321bdb46 771f9f48
                63f69bc9 80e21e76 2b7b88d0 323e4824
                76142ade 1b6bf1ea 3383c4a5 b1eb2be8
                243e8bb2 7296e309 e1437bb6 bc058775
[INFO]  snarkJS: Contribution Hash: 
                b445764f 2b47e78d 99bbd423 e5220b3d
                fdc85d32 81d42b55 ee1906fa f4ab09b4
                4e7d15a3 9aec009b 50900d20 32e1f599
                902bbf0e bc309b28 af88648c 8b43fb1d
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs zkey export verificationkey multiplier_final.zkey verification_key.json
[INFO]  snarkJS: EXPORT VERIFICATION KEY STARTED
[INFO]  snarkJS: > Detected protocol: groth16
[INFO]  snarkJS: EXPORT VERIFICATION KEY FINISHED
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ node multiplier_js/generate_witness.js multiplier_js/multiplier.wasm input.json witness.wtns
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs groth16 prove multiplier_final.zkey witness.wtns proof.json public.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs groth16 verify verification_key.json public.json proof.json
[INFO]  snarkJS: OK!
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ cat public.json
[
 "42"
]
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ circom broken_multiplier.circom --r1cs --wasm --sym
template instances: 1
non-linear constraints: 0
linear constraints: 0
public inputs: 0
private inputs: 3 (none belong to witness)
public outputs: 1
wires: 2
labels: 5
Written successfully: ./broken_multiplier.r1cs
Written successfully: ./broken_multiplier.sym
Written successfully: ./broken_multiplier_js/broken_multiplier.wasm
Everything went okay
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs groth16 setup broken_multiplier.r1cs pot12_final.ptau broken_multiplier_0000.zkey
[INFO]  snarkJS: Reading r1cs
[INFO]  snarkJS: Reading tauG1
[INFO]  snarkJS: Reading tauG2
[INFO]  snarkJS: Reading alphatauG1
[INFO]  snarkJS: Reading betatauG1
[INFO]  snarkJS: Circuit hash: 
                b332380a e2007058 e7020774 4a73d39d
                2d59042b fcdc361a e5d489af ac83c5c8
                8669f12e d8f0a20d e114a54e a30cc7c4
                91ac0f76 5f4f140b 4d10f19e ebd0ddef
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs zkey contribute broken_multiplier_0000.zkey broken_multiplier_final.zkey --name="broken-toy" -v
Enter a random text. (Entropy): hii
[DEBUG] snarkJS: Applying key: H Section: 0/2
[INFO]  snarkJS: Circuit Hash: 
                b332380a e2007058 e7020774 4a73d39d
                2d59042b fcdc361a e5d489af ac83c5c8
                8669f12e d8f0a20d e114a54e a30cc7c4
                91ac0f76 5f4f140b 4d10f19e ebd0ddef
[INFO]  snarkJS: Contribution Hash: 
                598fc6fe a463485a cc294a0a a3d77a2a
                473f7bf5 ccf90ea7 37985441 203eaffc
                37764099 197930ac cffc2945 72f0707d
                6432e224 5cbee678 b9258935 5d9ae8b6
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs zkey export verificationkey broken_multiplier_final.zkey broken_verification_key.json
[INFO]  snarkJS: EXPORT VERIFICATION KEY STARTED
[INFO]  snarkJS: > Detected protocol: groth16
[INFO]  snarkJS: EXPORT VERIFICATION KEY FINISHED
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ node broken_multiplier_js/generate_witness.js \
  broken_multiplier_js/broken_multiplier.wasm \
  bad_input.json \
  broken_witness.wtns
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs groth16 prove \
  broken_multiplier_final.zkey \
  broken_witness.wtns \
  broken_proof.json \
  broken_public.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs groth16 verify \
  broken_verification_key.json \
  broken_public.json \
  broken_proof.json
[INFO]  snarkJS: OK!
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ cat broken_public.json
[
 "999"
]
```

<!-- Compare the R1CS constraints -->
```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs r1cs info multiplier.r1cs
[INFO]  snarkJS: Curve: bn-128
[INFO]  snarkJS: # of Wires: 4
[INFO]  snarkJS: # of Constraints: 1
[INFO]  snarkJS: # of Private Inputs: 2
[INFO]  snarkJS: # of Public Inputs: 0
[INFO]  snarkJS: # of Labels: 4
[INFO]  snarkJS: # of Outputs: 1
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-47/Assignment/code1/zk-easy$ snarkjs r1cs info broken_multiplier.r1cs
[INFO]  snarkJS: Curve: bn-128
[INFO]  snarkJS: # of Wires: 2
[INFO]  snarkJS: # of Constraints: 0
[INFO]  snarkJS: # of Private Inputs: 3
[INFO]  snarkJS: # of Public Inputs: 0
[INFO]  snarkJS: # of Labels: 5
[INFO]  snarkJS: # of Outputs: 1
```