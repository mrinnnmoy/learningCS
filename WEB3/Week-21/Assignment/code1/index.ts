import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, keypairIdentity, generateSigner } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { mplBubblegum, createTree } from "@metaplex-foundation/mpl-bubblegum";
import { getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";

const TREE_RECORD_PATH = join(import.meta.dirname, "tree-address.json");
const MAX_DEPTH = 14;
const MAX_BUFFER_SIZE = 64;
const APPROX_REGULAR_NFT_RENT_SOL = 0.012;

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf-8")));
  return Keypair.fromSecretKey(secretKey);
}

async function main(): Promise<void> {
  const rpcUrl = process.env.HELIUS_DEVNET_RPC_URL;
  if (!rpcUrl) throw new Error("Set HELIUS_DEVNET_RPC_URL in .env first — see the README's Environment setup.");

  const umi = createUmi(rpcUrl).use(mplBubblegum());
  const walletKeypair = loadLocalWallet();
  const umiSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(walletKeypair));
  umi.use(keypairIdentity(umiSigner));

  // Concept 4, made concrete: the exact on-chain size of this tree,
  // before creating anything.
  const treeSize = getConcurrentMerkleTreeAccountSize(MAX_DEPTH, MAX_BUFFER_SIZE);
  const rentLamports = await umi.rpc.getRent(treeSize);
  const rentSol = Number(rentLamports.basisPoints) / LAMPORTS_PER_SOL;
  console.log(`Tree size (maxDepth=${MAX_DEPTH}, maxBufferSize=${MAX_BUFFER_SIZE}):`, treeSize, "bytes");
  console.log("One-time rent cost for this tree:", rentSol.toFixed(4), "SOL");

  if (existsSync(TREE_RECORD_PATH)) {
    const record = JSON.parse(readFileSync(TREE_RECORD_PATH, "utf-8"));
    console.log("\nTree already exists:", record.tree);
  } else {
    const merkleTree = generateSigner(umi);
    const builder = await createTree(umi, {
      merkleTree,
      maxDepth: MAX_DEPTH,
      maxBufferSize: MAX_BUFFER_SIZE,
    });
    await builder.sendAndConfirm(umi, { send: { commitment: "confirmed" } });

    writeFileSync(TREE_RECORD_PATH, JSON.stringify({ tree: merkleTree.publicKey.toString() }, null, 2));
    console.log("\nTree created:", merkleTree.publicKey.toString());
  }

  const leafCapacity = 2 ** MAX_DEPTH;
  const regularNftEquivalentCost = leafCapacity * APPROX_REGULAR_NFT_RENT_SOL;
  console.log(`\nCost comparison for ${leafCapacity.toLocaleString()} NFTs:`);
  console.log(`  This tree, one-time:        ~${rentSol.toFixed(4)} SOL`);
  console.log(`  ${leafCapacity.toLocaleString()} regular NFT mints:   ~${regularNftEquivalentCost.toFixed(2)} SOL`);
  console.log(`  Approximate savings:        ~${(regularNftEquivalentCost - rentSol).toFixed(2)} SOL`);
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});