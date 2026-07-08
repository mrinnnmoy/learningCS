# How to Build.

```
1. Start from Medium's already-existing project, with at least one
   cNFT already minted (Medium's Test Case 1 output).

2. Create transfer.ts from the Solution section below.

3. Run it.

   Run:
     npx tsx transfer.ts

   You should see the cNFT's current owner (your wallet), the new
   owner's freshly generated address, a transfer signature, and
   finally a confirmed post-transfer owner read back from the DAS
   API, matching the new owner.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-21/Assignment/code3$ npx tsx transfer.ts FhuzjFcR4gRmAEkQAoRUY68YHwsTpcn6NNG91Df5DpDF
New owner (freshly generated): Bt2QZ8RjGXLQjc8h6rbm1bkDdYcu53tjkof5VDYkGabw

Current owner (from DAS): HGjTtQGMdubFRYXVYQi8qbSegdKc3zYABa9qoQmdoQVW
Transfer signature: eJfBz472gn6w3Ryo+Qsc...

Confirmed post-transfer owner (from DAS): Bt2QZ8RjGXLQjc8h6rbm1bkDdYcu53tjkof5VDYkGabw
Matches new owner: true
```