# How to Build.

```
1. Step 1 — Replace `chain.ts` with the version below.

    The `Block` interface now includes a `nonce` and hashing/creation logic is rebuilt around a `mine()` search loop.

2. Step 2 — Write `miner.ts`.

    This is the new CLI entry point — `chain.ts` no longer has a `main()` of its own once mining is involved.

3. Step 3 — Run it at a few different difficulties.

    npx tsx miner.ts --difficulty=3 --length=5
    npx tsx miner.ts --difficulty=5 --length=3
    npx tsx miner.ts --difficulty=0 --length=3
```
