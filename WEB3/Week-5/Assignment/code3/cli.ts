import * as borsh from "borsh";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import {
  V1_SCHEMA,
  V2_SCHEMA,
  DEFAULT_DECIMALS,
  type AccountV1,
  type AccountV2,
} from "./schemas.js";

function writeVersioned(
  path: string,
  version: number,
  encoded: Uint8Array,
): void {
  const record = Buffer.concat([Buffer.from([version]), Buffer.from(encoded)]);
  writeFileSync(path, record);
}

function readVersioned(path: string): { version: number; payload: Buffer } {
  const record = readFileSync(path);
  return { version: record[0], payload: record.subarray(1) };
}

function createV1(path: string): void {
  const account: AccountV1 = {
    owner: Array.from(randomBytes(32)),
    balance: 2_500_000n,
  };
  const encoded = borsh.serialize(V1_SCHEMA, account);
  writeVersioned(path, 1, encoded);
  console.log(`Wrote a V1 account record to ${path}`);
  console.log(account);
}

function decode(path: string): void {
  const { version, payload } = readVersioned(path);
  console.log(`Record at ${path} is version ${version}`);

  if (version === 1) {
    const account = borsh.deserialize(V1_SCHEMA, payload) as AccountV1;
    console.log(account);
    return;
  }
  if (version === 2) {
    const account = borsh.deserialize(V2_SCHEMA, payload) as AccountV2;
    console.log(account);
    return;
  }
  console.error(`Unknown version: ${version}`);
  process.exit(1);
}

function migrate(path: string): void {
  const { version, payload } = readVersioned(path);
  if (version !== 1) {
    console.error(
      `Can only migrate version 1 records, found version ${version}.`,
    );
    process.exit(1);
  }

  const oldAccount = borsh.deserialize(V1_SCHEMA, payload) as AccountV1;
  const newAccount: AccountV2 = {
    owner: oldAccount.owner,
    balance: oldAccount.balance,
    decimals: DEFAULT_DECIMALS,
  };

  const encoded = borsh.serialize(V2_SCHEMA, newAccount);
  writeVersioned(path, 2, encoded);

  console.log(
    `Migrated ${path} from V1 to V2 (added decimals: ${DEFAULT_DECIMALS}).`,
  );
  console.log(newAccount);
}

function printUsage(): void {
  console.log(`
Usage:
  node cli.js create-v1 <path>   Write a fresh V1 account record to <path>
  node cli.js decode <path>      Read the version byte and decode accordingly
  node cli.js migrate <path>     Upgrade a V1 record at <path> to V2 in place
`);
}

function main(): void {
  const [command, path] = process.argv.slice(2);

  if (command === "create-v1" && path) {
    createV1(path);
    return;
  }
  if (command === "decode" && path) {
    decode(path);
    return;
  }
  if (command === "migrate" && path) {
    migrate(path);
    return;
  }
  printUsage();
  process.exit(command ? 1 : 0);
}

main();
