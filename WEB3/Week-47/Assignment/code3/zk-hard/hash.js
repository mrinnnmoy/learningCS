const { buildPoseidon } = require("circomlibjs");

async function main() {
const poseidon = await buildPoseidon();

const secret = 123456789n;
const hash = poseidon.F.toString(
    poseidon([secret])
);

console.log(hash);

}

main();