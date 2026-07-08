import "dotenv/config";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { mplBubblegum, mintV1 } from "@metaplex-foundation/mpl-bubblegum";

const TREE_RECORD_PATH = join(import.meta.dirname, "tree-address.json");

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

async function main(): Promise<void> {
  const rpcUrl = process.env.HELIUS_DEVNET_RPC_URL;
  if (!rpcUrl) throw new Error("Set HELIUS_DEVNET_RPC_URL in .env first.");

  if (!existsSyncGuard()) {
    throw new Error(
      "tree-address.json not found — run Easy's index.ts first to create a tree.",
    );
  }

  function existsSyncGuard(): boolean {
    try {
      readFileSync(TREE_RECORD_PATH, "utf-8");
      return true;
    } catch {
      return false;
    }
  }

  const { tree } = JSON.parse(readFileSync(TREE_RECORD_PATH, "utf-8")) as {
    tree: string;
  };
  const merkleTree = publicKey(tree);
  console.log("Minting into existing tree:", tree);

  const umi = createUmi(rpcUrl).use(mplBubblegum());
  const walletKeypair = loadLocalWallet();
  const umiSigner = createSignerFromKeypair(
    umi,
    fromWeb3JsKeypair(walletKeypair),
  );
  umi.use(keypairIdentity(umiSigner));

  const nftsToMint = [
    { name: "Week 21 cNFT #1", uri: "https://example.com/cnft-1.json" },
    { name: "Week 21 cNFT #2", uri: "https://example.com/cnft-2.json" },
    { name: "Week 21 cNFT #3", uri: "https://example.com/cnft-3.json" },
  ];

  let totalFeeLamports = 0n;

  for (const nft of nftsToMint) {
    const balanceBefore = await umi.rpc.getBalance(umi.identity.publicKey);

    const { signature } = await mintV1(umi, {
      leafOwner: umi.identity.publicKey,
      merkleTree,
      metadata: {
        name: nft.name,
        uri: nft.uri,
        sellerFeeBasisPoints: 0,
        collection: null,
        creators: [
          {
            address: umi.identity.publicKey,
            verified: true,
            share: 100,
          },
        ],
      },
    }).sendAndConfirm(umi, {
      send: { commitment: "confirmed" },
    });

    const balanceAfter = await umi.rpc.getBalance(umi.identity.publicKey);
    const feeLamports = balanceBefore.basisPoints - balanceAfter.basisPoints;
    totalFeeLamports += feeLamports;

    console.log(`\nMinted "${nft.name}"`);
    console.log(
      "  Signature:",
      Buffer.from(signature).toString("base64").slice(0, 20) + "...",
    );
    console.log("  Fee paid:", Number(feeLamports), "lamports");

    // Workaround:
    // parseLeafFromMintV1Transaction() fails with the current
    // mpl-bubblegum/Helius SDK combination because the transaction
    // metadata does not include innerInstructions. Query the Helius
    // DAS API instead to obtain the minted compressed NFT's asset ID.

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAssetsByOwner",
        params: {
          ownerAddress: umi.identity.publicKey.toString(),
          page: 1,
          limit: 20,
        },
      }),
    });

    const json = await response.json();

    const asset = json.result?.items?.find(
      (item: any) =>
        item.compression?.compressed === true &&
        item.content?.metadata?.name === nft.name,
    );

    if (asset) {
      console.log("  Asset ID:", asset.id);
    } else {
      console.log("  Asset ID: not found yet (Helius may still be indexing)");
    }
  }

  console.log(
    `\nTotal fee cost for ${nftsToMint.length} cNFT mints:`,
    Number(totalFeeLamports),
    "lamports",
  );
  console.log(
    "Compare against Easy's regular-NFT rent estimate — this is transaction fees only, no new rent at all.",
  );
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
