import {
  Connection,
  clusterApiUrl,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Your existing Devnet wallet
const WALLET_ADDRESS = new PublicKey(
  "HGjTtQGMdubFRYXVYQi8qbSegdKc3zYABa9qoQmdoQVW",
);

// The SPL Token Program's well-known address
const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);

async function describeAccount(
  label: string,
  address: PublicKey,
): Promise<void> {
  const info = await connection.getAccountInfo(address);

  console.log(`\n${label} (${address.toBase58()})`);

  if (info === null) {
    console.log(
      "  Account does not exist on-chain (never created or has 0 lamports).",
    );
    return;
  }

  console.log("  Lamports:   ", info.lamports);
  console.log("  Owner:      ", info.owner.toBase58());
  console.log("  Executable: ", info.executable);
  console.log("  Data length:", info.data.length, "bytes");
}

async function main(): Promise<void> {
  // 1. Your Devnet wallet
  await describeAccount("My Wallet", WALLET_ADDRESS);

  // 2. The System Program
  await describeAccount("System Program", SystemProgram.programId);

  // 3. The SPL Token Program
  await describeAccount("SPL Token Program", TOKEN_PROGRAM_ID);
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
