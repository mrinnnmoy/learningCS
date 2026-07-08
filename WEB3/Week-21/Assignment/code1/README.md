# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold the project.

   Run:
     mkdir compressed-nft-tree && cd compressed-nft-tree
     npm init -y
     npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults \
       @metaplex-foundation/umi-web3js-adapters @metaplex-foundation/mpl-bubblegum \
       @metaplex-foundation/mpl-token-metadata @solana/spl-account-compression \
       @solana/web3.js dotenv
     npm install -D typescript tsx @types/node

3. Create .env with your Helius devnet RPC URL from the Environment
   setup section above:

     HELIUS_DEVNET_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY_HERE

4. Create .gitignore:

     .env
     tree-address.json
     node_modules/

5. Create tsconfig.json (same shape as every prior week's client) and
   index.ts from the Solution section below.

6. Run it.

   Run:
     npx tsx index.ts

   You should see the computed tree size and rent cost, a tree
   creation signature, the new tree's address, and the cost
   comparison against 16,384 regular NFT mints.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-21/Assignment/code1$ npx tsx index.ts
Tree size (maxDepth=14, maxBufferSize=64): 31800 bytes
One-time rent cost for this tree: 0.2222 SOL

Tree created: DeFovFJkbmSLFkkxD2AkxotaaKnMEix3sUEprMCqVvw8

Cost comparison for 16,384 NFTs:
  This tree, one-time:        ~0.2222 SOL
  16,384 regular NFT mints:   ~196.61 SOL
  Approximate savings:        ~196.39 SOL
```