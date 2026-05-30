import {
  createHash,
  sign,
  verify,
  createPublicKey,
  type KeyObject,
} from "node:crypto";

export interface Block {
  index: number;
  timestamp: number;
  data: string;
  previousHash: string;
  signerPublicKeyPem: string;
  signature: string;
  hash: string;
}

type BlockContent = Omit<Block, "signature" | "hash">;

function computeHash(content: BlockContent): string {
  const payload = `${content.index}:${content.timestamp}:${content.data}:${content.previousHash}:${content.signerPublicKeyPem}`;
  return createHash("sha256").update(payload).digest("hex");
}

export function createSignedBlock(
  previous: Block | null,
  data: string,
  signerPrivateKey: KeyObject,
  signerPublicKeyPem: string,
): Block {
  const content: BlockContent = {
    index: previous ? previous.index + 1 : 0,
    timestamp: Date.now(),
    data,
    previousHash: previous ? previous.hash : "0".repeat(64),
    signerPublicKeyPem,
  };

  const hash = computeHash(content);
  const signature = sign(
    null,
    Buffer.from(hash, "utf-8"),
    signerPrivateKey,
  ).toString("hex");
  return { ...content, hash, signature };
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function isLedgerValid(
  chain: Block[],
  authorizedKeys: Set<string>,
): ValidationResult {
  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    const { signature, hash, ...content } = block;

    const recomputedHash = computeHash(content);
    if (recomputedHash !== hash) {
      return {
        valid: false,
        reason: `Block #${block.index}: stored hash does not match its recomputed contents`,
      };
    }

    if (!authorizedKeys.has(block.signerPublicKeyPem)) {
      return {
        valid: false,
        reason: `Block #${block.index}: signed by a public key that is not in the registry`,
      };
    }

    const publicKey = createPublicKey(block.signerPublicKeyPem);
    const signatureValid = verify(
      null,
      Buffer.from(hash, "utf-8"),
      publicKey,
      Buffer.from(signature, "hex"),
    );
    if (!signatureValid) {
      return {
        valid: false,
        reason: `Block #${block.index}: signature does not match the block's hash`,
      };
    }

    if (i > 0 && block.previousHash !== chain[i - 1].hash) {
      return {
        valid: false,
        reason: `Block #${block.index}: previousHash does not match Block #${i - 1}'s hash`,
      };
    }
  }
  return { valid: true };
}
