import { createHash } from "node:crypto";

export interface Block {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  nonce: number;
  hash: string;
}

export type BlockContent = Omit<Block, "hash">;

export function hashContent(content: BlockContent): string {
  const payload = `${content.index}:${content.timestamp}:${content.data}:${content.previousHash}:${content.nonce}`;
  return createHash("sha256").update(payload).digest("hex");
}

export function meetsDifficulty(hash: string, difficulty: number): boolean {
  return hash.startsWith("0".repeat(difficulty));
}

export interface MineResult {
  block: Block;
  attempts: number;
  milliseconds: number;
}

function mine(
  partial: Omit<BlockContent, "nonce">,
  difficulty: number,
): MineResult {
  const startedAt = Date.now();
  let nonce = 0;
  let hash = hashContent({ ...partial, nonce });
  let attempts = 1;

  while (!meetsDifficulty(hash, difficulty)) {
    nonce += 1;
    attempts += 1;
    hash = hashContent({ ...partial, nonce });
  }

  const block: Block = { ...partial, nonce, hash };
  return { block, attempts, milliseconds: Date.now() - startedAt };
}

export function createGenesisBlock(difficulty: number): MineResult {
  return mine(
    {
      index: 0,
      timestamp: Date.now(),
      data: "Genesis Block",
      previousHash: "0".repeat(64),
    },
    difficulty,
  );
}

export function mineNextBlock(
  previous: Block,
  data: string,
  difficulty: number,
): MineResult {
  return mine(
    {
      index: previous.index + 1,
      timestamp: Date.now(),
      data,
      previousHash: previous.hash,
    },
    difficulty,
  );
}

export function isChainValid(chain: Block[], difficulty: number): boolean {
  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    const { hash, ...content } = block;

    if (hashContent(content) !== hash) {
      return false;
    }
    if (!meetsDifficulty(hash, difficulty)) {
      return false;
    }
    if (i > 0 && block.previousHash !== chain[i - 1].hash) {
      return false;
    }
  }
  return true;
}
