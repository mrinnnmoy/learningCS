import {
  createGenesisBlock,
  mineNextBlock,
  isChainValid,
  hashContent,
  type Block,
} from "./chain.js";

function parseArgValue(flag: string, fallback: number): number {
  const arg = process.argv.find((a) => a.startsWith(`${flag}=`));
  if (!arg) return fallback;
  const value = Number(arg.split("=")[1]);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

const difficulty = parseArgValue("--difficulty", 3);
const length = parseArgValue("--length", 5);

function report(result: {
  block: Block;
  attempts: number;
  milliseconds: number;
}): void {
  console.log(`Block #${result.block.index}`);
  console.log(`  data:       ${result.block.data}`);
  console.log(`  nonce:      ${result.block.nonce}`);
  console.log(`  hash:       ${result.block.hash}`);
  console.log(`  attempts:   ${result.attempts}`);
  console.log(`  mined in:   ${result.milliseconds}ms`);
  console.log("");
}

function main(): void {
  console.log(`Mining a ${length}-block chain at difficulty ${difficulty}\n`);

  const chain: Block[] = [];
  const genesis = createGenesisBlock(difficulty);
  chain.push(genesis.block);
  report(genesis);

  const sampleData = [
    "Alice pays Bob 5 coins",
    "Bob pays Carol 2 coins",
    "Carol pays Dave 1 coin",
    "Dave pays Alice 3 coins",
  ];

  for (let i = 1; i < length; i++) {
    const data = sampleData[(i - 1) % sampleData.length];
    const result = mineNextBlock(chain[chain.length - 1], data, difficulty);
    chain.push(result.block);
    report(result);
  }

  console.log(`Chain valid? ${isChainValid(chain, difficulty)}\n`);

  console.log("Tampering with Block #2's data only (not re-mining)...");
  const tamperedDataOnly = chain.map((block) => ({ ...block }));
  tamperedDataOnly[2].data = "Bob pays Carol 200 coins";
  console.log(
    `  Valid? ${isChainValid(tamperedDataOnly, difficulty)}  (fails: stored hash no longer matches recomputed hash)\n`,
  );

  console.log(
    "Tampering with Block #2's data AND recomputing its hash, but keeping the old nonce...",
  );
  const tamperedWithRehash = chain.map((block) => ({ ...block }));
  const target = tamperedWithRehash[2];
  target.data = "Bob pays Carol 200 coins";
  const { hash: _oldHash, ...targetContent } = target;
  target.hash = hashContent(targetContent);
  console.log(
    `  Valid? ${isChainValid(tamperedWithRehash, difficulty)}  (fails: recomputed hash won't satisfy the difficulty target with the old nonce)\n`,
  );

  console.log(
    "To hide the tampering completely, an attacker would have to re-mine Block #2",
  );
  console.log(
    "AND every block after it, since each block's previousHash depends on the one before.",
  );
  console.log(
    "That's the core idea behind proof-of-work: rewriting history costs real computation.",
  );
}

main();
