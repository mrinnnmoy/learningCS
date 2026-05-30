import {
  createIdentity,
  loadIdentity,
  signWithIdentity,
  verifyWithPublicKeyPem,
} from "./identity.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const LOG_FILE = join(DATA_DIR, "log.json");

interface LogEntry {
  author: string;
  publicKeyPem: string;
  message: string;
  signature: string;
  timestamp: number;
}

function loadLog(): LogEntry[] {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(LOG_FILE)) return [];
  return JSON.parse(readFileSync(LOG_FILE, "utf-8")) as LogEntry[];
}

function saveLog(entries: LogEntry[]): void {
  writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

function printUsage(): void {
  console.log(`
Usage:
  node log.js identity create <name>      Create and save a new signing identity
  node log.js append <name> "<message>"   Sign and append a message as <name>
  node log.js verify                      Verify every entry's signature
`);
}

function main(): void {
  const [command, ...rest] = process.argv.slice(2);

  if (command === "identity" && rest[0] === "create" && rest[1]) {
    const identity = createIdentity(rest[1]);
    console.log(`Created identity "${identity.name}".`);
    console.log(identity.publicKeyPem);
    return;
  }

  if (command === "append" && rest[0] && rest[1]) {
    const [name, message] = rest;
    const identity = loadIdentity(name);
    const signature = signWithIdentity(identity, message);
    const entries = loadLog();
    entries.push({
      author: identity.name,
      publicKeyPem: identity.publicKeyPem,
      message,
      signature,
      timestamp: Date.now(),
    });
    saveLog(entries);
    console.log(`Appended a signed entry from "${name}".`);
    return;
  }

  if (command === "verify") {
    const entries = loadLog();
    if (entries.length === 0) {
      console.log("Log is empty.");
      return;
    }
    let allValid = true;
    entries.forEach((entry, i) => {
      const valid = verifyWithPublicKeyPem(
        entry.publicKeyPem,
        entry.message,
        entry.signature,
      );
      allValid = allValid && valid;
      console.log(
        `Entry #${i} by ${entry.author}: ${valid ? "VALID" : "INVALID"} — "${entry.message}"`,
      );
    });
    console.log(`\nOverall log valid? ${allValid}`);
    return;
  }

  printUsage();
  process.exit(command ? 1 : 0);
}

main();
