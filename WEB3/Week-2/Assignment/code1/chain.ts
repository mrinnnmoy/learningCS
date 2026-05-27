import { createHash } from "node:crypto";

export interface Block {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  hash: string;
}

type BlockContent = Omit<Block, "hash">;

function computeHash(content: BlockContent): string {
  const payload = `${content.index}:${content.timestamp}:${content.data}:${content.previousHash}`;
  return createHash("sha256").update(payload).digest("hex");
}

export function createGenesisBlock(): Block {
  const content: BlockContent = {
    index: 0,
    timestamp: Date.now(),
    data: "Genesis Block",
    previousHash: "0".repeat(64),
  };
  return { ...content, hash: computeHash(content) };
}

export function createNextBlock(previous: Block, data: string): Block {
  const content: BlockContent = {
    index: previous.index + 1,
    timestamp: Date.now(),
    data,
    previousHash: previous.hash,
  };
  return { ...content, hash: computeHash(content) };
}

export function isChainValid(chain: Block[]): boolean {
  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    const { hash, ...content } = block;

    if (computeHash(content) !== hash) {
      return false;
    }
    if (i > 0 && block.previousHash !== chain[i - 1].hash) {
      return false;
    }
  }
  return true;
}

function buildDemoChain(): Block[] {
  const chain: Block[] = [createGenesisBlock()];
  chain.push(
    createNextBlock(chain[chain.length - 1], "Alice pays Bob 5 coins"),
  );
  chain.push(
    createNextBlock(chain[chain.length - 1], "Bob pays Carol 2 coins"),
  );
  chain.push(
    createNextBlock(chain[chain.length - 1], "Carol pays Dave 1 coin"),
  );
  chain.push(
    createNextBlock(chain[chain.length - 1], "Dave pays Alice 3 coins"),
  );
  return chain;
}

function printChain(chain: Block[]): void {
  for (const block of chain) {
    console.log(`Block #${block.index}`);
    console.log(`  timestamp:     ${block.timestamp}`);
    console.log(`  data:          ${block.data}`);
    console.log(`  previousHash:  ${block.previousHash}`);
    console.log(`  hash:          ${block.hash}`);
    console.log("");
  }
}

function main(): void {
  const chain = buildDemoChain();

  console.log("Mini Chain — 5 block demo chain\n");
  printChain(chain);
  console.log(`Chain valid? ${isChainValid(chain)}`);

  const tamperedChain = chain.map((block) => ({ ...block }));
  tamperedChain[2].data = "Bob pays Carol 200 coins";

  console.log(
    `\nTampering with Block #2's data (leaving its stored hash unchanged)...`,
  );
  console.log(`Tampered chain valid? ${isChainValid(tamperedChain)}`);
}

main();
