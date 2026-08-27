pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template PreimageCheck() {
// Private witness input.
// This value will NOT be a public signal.
signal input secret;

// Public value that the secret must hash to.
signal input expectedHash;

component hasher = Poseidon(1);

// Feed the private secret into Poseidon.
hasher.inputs[0] <== secret;

// Pure constraint:
// expectedHash must equal Poseidon(secret).
expectedHash === hasher.out;

}

component main {public [expectedHash]} = PreimageCheck();