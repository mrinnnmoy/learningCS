import "dotenv/config";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Keypair as Web3Keypair } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import {
  mplBubblegum,
  transfer,
  getAssetWithProof,
} from "@metaplex-foundation/mpl-bubblegum";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";

function loadLocalWallet(): Web3Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Web3Keypair.fromSecretKey(secretKey);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const rpcUrl = process.env.HELIUS_DEVNET_RPC_URL;
  if (!rpcUrl)
    throw new Error(
      "Set HELIUS_DEVNET_RPC_URL in .env first — required for dasApi below.",
    );

  // Paste in the first asset ID Medium's mint.ts printed for you.
  const ASSET_ID = process.argv[2];
  if (!ASSET_ID) {
    throw new Error("Usage: npx tsx transfer.ts <ASSET_ID_FROM_MEDIUM>");
  }

  const umi = createUmi(rpcUrl).use(mplBubblegum()).use(dasApi());
  const walletKeypair = loadLocalWallet();
  const umiSigner = createSignerFromKeypair(
    umi,
    fromWeb3JsKeypair(walletKeypair),
  );
  umi.use(keypairIdentity(umiSigner));

  // A fresh recipient. The sender (our wallet) signs and pays for the
  // Bubblegum transfer transaction, so the recipient does not need SOL.
  const newOwnerKeypair = new Web3Keypair();

  console.log(
    "New owner (freshly generated):",
    newOwnerKeypair.publicKey.toBase58(),
  );

  // Concept 7: fetch the leaf's CURRENT proof, not an assumed one.
  const assetWithProof = await getAssetWithProof(umi, publicKey(ASSET_ID));
  console.log(
    "\nCurrent owner (from DAS):",
    assetWithProof.leafOwner.toString(),
  );

  const { signature } = await transfer(umi, {
    ...assetWithProof,
    leafOwner: umi.identity.publicKey,
    newLeafOwner: publicKey(newOwnerKeypair.publicKey.toBase58()),
  }).sendAndConfirm(umi, { send: { commitment: "confirmed" } });

  console.log(
    "Transfer signature:",
    Buffer.from(signature).toString("base64").slice(0, 20) + "...",
  );

  // Concept 8: eventual consistency — poll rather than assuming the
  // indexer has already caught up the instant the transaction lands.
  let confirmedOwner: string | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const refreshed = await umi.rpc.getAsset(publicKey(ASSET_ID));
    const owner = refreshed.ownership.owner.toString();
    if (owner === newOwnerKeypair.publicKey.toBase58()) {
      confirmedOwner = owner;
      break;
    }
    console.log(
      `  Indexer hasn't caught up yet (attempt ${attempt + 1}/10), waiting...`,
    );
    await sleep(1500);
  }

  if (confirmedOwner === null) {
    throw new Error(
      "DAS indexer never reflected the new owner after 10 attempts — see Test Case 3 below.",
    );
  }

  console.log("\nConfirmed post-transfer owner (from DAS):", confirmedOwner);
  console.log(
    "Matches new owner:",
    confirmedOwner === newOwnerKeypair.publicKey.toBase58(),
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
