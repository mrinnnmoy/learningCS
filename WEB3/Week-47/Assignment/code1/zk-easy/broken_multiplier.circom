pragma circom 2.0.0;

// VULNERABLE ON PURPOSE — Never use this pattern in production.
template BrokenMultiplier() {
    signal input a;
    signal input b;

    // Prover-controlled value.
    signal input fakeC;

    signal output c;

    // <-- assigns a witness value but does NOT create
    // a constraint connecting c to a * b.
    c <-- fakeC;
}

component main = BrokenMultiplier();