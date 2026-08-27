pragma circom 2.0.0;

template Multiplier() {
    signal input a;
    signal input b;
    signal output c;

    c <== a * b;   // CORRECTLY constrained — Concept 4
}

component main = Multiplier();