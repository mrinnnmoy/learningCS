import * as borsh from "borsh";
import { createHash } from "node:crypto";

interface AccountData {
  owner: string;
  balance: bigint;
  isInitialized: boolean;
}

const schema = {
  struct: {
    owner: "string",
    balance: "u64",
    isInitialized: "u8",
  },
} as const;

function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}


function toBorshValue(account: AccountData) {
  return {
    owner: account.owner,
    balance: account.balance,
    isInitialized: account.isInitialized ? 1 : 0,
  };
}

function main(): void {
  const owner = "11111111111111111111111111111111";
  const balance = 1_000_000n;
  const isInitialized = true;

  const accountOrderA: AccountData = { owner, balance, isInitialized };
  const accountOrderB: AccountData = { isInitialized, balance, owner };

  console.log("--- JSON ---\n");

  const jsonA = JSON.stringify({
    ...accountOrderA,
    balance: accountOrderA.balance.toString(),
  });
  const jsonB = JSON.stringify({
    ...accountOrderB,
    balance: accountOrderB.balance.toString(),
  });

  console.log(`JSON (order A): ${jsonA}`);
  console.log(`JSON (order B): ${jsonB}`);
  console.log(`Strings identical? ${jsonA === jsonB}`);
  console.log(
    `SHA-256 hashes identical? ${sha256Hex(jsonA) === sha256Hex(jsonB)}\n`,
  );

  console.log("--- Borsh ---\n");

  const borshA = borsh.serialize(schema, toBorshValue(accountOrderA));
  const borshB = borsh.serialize(schema, toBorshValue(accountOrderB));

  const hexA = Buffer.from(borshA).toString("hex");
  const hexB = Buffer.from(borshB).toString("hex");

  console.log(`Borsh (order A) hex: ${hexA}`);
  console.log(`Borsh (order B) hex: ${hexB}`);
  console.log(`Bytes identical? ${hexA === hexB}`);
  console.log(
    `SHA-256 hashes identical? ${sha256Hex(borshA) === sha256Hex(borshB)}`,
  );
}

main();
