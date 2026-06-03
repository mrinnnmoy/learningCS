import * as borsh from "borsh";
import { randomBytes } from "node:crypto";

interface TokenAccount {
  owner: number[];
  amount: bigint;
  decimals: number;
}

const schema = {
  struct: {
    owner: { array: { type: "u8", len: 32 } },
    amount: "u64",
    decimals: "u8",
  },
} as const;

function randomOwner(): number[] {
  return Array.from(randomBytes(32));
}

function ownersMatch(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

function main(): void {
  const account: TokenAccount = {
    owner: randomOwner(),
    amount: 1_500_000n,
    decimals: 6,
  };

  console.log("Original account:");
  console.log(account);

  const encoded = borsh.serialize(schema, account);
  const expectedSize = 32 + 8 + 1;
  console.log(
    `\nEncoded size: ${encoded.length} bytes (expected ${expectedSize})`,
  );
  console.log(`Encoded hex: ${Buffer.from(encoded).toString("hex")}\n`);

  const decoded = borsh.deserialize(schema, encoded) as TokenAccount;
  console.log("Decoded account:");
  console.log(decoded);
  console.log(
    `\nOwner bytes match? ${ownersMatch(account.owner, decoded.owner)}`,
  );
  console.log(`Amount matches? ${account.amount === decoded.amount}`);
  console.log(`Decimals match? ${account.decimals === decoded.decimals}`);

  console.log("\n--- Corruption 1: flip one byte inside the owner field ---\n");
  const flipped = Buffer.from(encoded);
  flipped[5] = flipped[5] ^ 0xff;

  const flippedDecoded = borsh.deserialize(schema, flipped) as TokenAccount;
  const flippedOwnerMatches = ownersMatch(account.owner, flippedDecoded.owner);
  console.log(
    `Deserialize threw an error? false (it always returns a value here)`,
  );
  console.log(
    `Owner bytes still match the original after flipping? ${flippedOwnerMatches}`,
  );
  console.log(
    "Nothing about the format itself flagged this — the buffer is still exactly 41 bytes,",
  );
  console.log(
    "still lines up field by field, and deserializes into a complete, valid-looking,",
  );
  console.log("but silently WRONG owner value.");

  console.log("\n--- Corruption 2: truncate the buffer by 10 bytes ---\n");
  const truncated = encoded.slice(0, encoded.length - 10);
  try {
    borsh.deserialize(schema, truncated);
    console.log(
      "Unexpectedly succeeded decoding a truncated buffer — this should not happen.",
    );
  } catch (err) {
    console.log(
      `Deserialize threw an error as expected: ${(err as Error).message}`,
    );
  }
}

main();
