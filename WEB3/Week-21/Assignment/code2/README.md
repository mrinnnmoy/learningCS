# How to Build.

```
1. Start from Easy's already-existing compressed-nft-tree/ folder,
   with tree-address.json already present from a real run.

2. Create mint.ts from the Solution section below.

3. Run it.

   Run:
     npx tsx mint.ts

   You should see three mint signatures, each with its parsed asset
   ID, and a total fee cost summary at the end.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-21/Assignment/code2$ npx tsx mint.ts
Minting into existing tree: DeFovFJkbmSLFkkxD2AkxotaaKnMEix3sUEprMCqVvw8

Minted "Week 21 cNFT #1"
  Signature: 7Re2KdlL8P+tbjjZOXaR...
  Fee paid: 0 lamports
  Asset ID: FWwLB15a19ymDWYgEEFDBLW6hSp7EFcj1rtp28g68k5w

Minted "Week 21 cNFT #2"
  Signature: 7BOt+0SfZMhFTR1/qAD2...
  Fee paid: 0 lamports
  Asset ID: BcZU1AQVgqZ7JRyDLRTkinDRqY4xu94nfqfveogNKKbE

Minted "Week 21 cNFT #3"
  Signature: i1HwNNUvd/rMh22td+b+...
  Fee paid: 5000 lamports
  Asset ID: FhuzjFcR4gRmAEkQAoRUY68YHwsTpcn6NNG91Df5DpDF

Total fee cost for 3 cNFT mints: 5000 lamports
Compare against Easy's regular-NFT rent estimate — this is transaction fees only, no new rent at all.
```