import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionMessage,
  MessageV0,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Your funded Devnet wallet
const PAYER = new PublicKey("HGjTtQGMdubFRYXVYQi8qbSegdKc3zYABa9qoQmdoQVW");

function categorize(isSigner: boolean, isWritable: boolean): string {
  if (isSigner && isWritable) {
    return "signer + writable  (typical fee payer: authorizes AND changes)";
  }

  if (isWritable) {
    return "writable only      (gets modified, never had to prove anything itself)";
  }

  if (isSigner) {
    return "signer only        (proves authorization, nothing about it changes)";
  }

  return "read-only          (just referenced, neither authorizes nor changes)";
}

function printAccounts(message: MessageV0): void {
  console.log("Accounts referenced by this transaction:\n");

  message.staticAccountKeys.forEach((key, index) => {
    const isSigner = message.isAccountSigner(index);
    const isWritable = message.isAccountWritable(index);

    console.log(`  [${index}] ${key.toBase58()}`);
    console.log(
      `        signer=${isSigner}  writable=${isWritable}  -> ${categorize(
        isSigner,
        isWritable,
      )}`,
    );
  });
}

async function main(): Promise<void> {
  // Receiver doesn't need to exist beforehand because we're only
  // building a transaction message, not sending it.
  const receiver = Keypair.generate();

  const transferIx = SystemProgram.transfer({
    fromPubkey: PAYER,
    toPubkey: receiver.publicKey,
    lamports: 1000,
  });

  const { blockhash } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    payerKey: PAYER,
    recentBlockhash: blockhash,
    instructions: [transferIx],
  }).compileToV0Message();

  printAccounts(message);
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
