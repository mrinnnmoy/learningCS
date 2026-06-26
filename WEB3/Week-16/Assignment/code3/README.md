# Folder Structure.

```
counter-anchor/                         (Week 15's existing project, extended)
├── Anchor.toml                          (unchanged)
├── programs/
│   └── counter-anchor/
│       └── src/lib.rs                    (edited — event added)
└── events-client/
    ├── package.json
    ├── tsconfig.json
    ├── index.ts
    └── counter_anchor.json               (re-copied AFTER rebuilding)
```

---

# How to Build.

```
1. Start from Week 15's existing counter-anchor/ project.

2. Edit programs/counter-anchor/src/lib.rs, adding the event and the
   emit! call shown in the Solution section below.

3. Rebuild and re-check the program ID hasn't changed (it shouldn't,
   this is the same declare_id! as Week 15).

   Run:
     anchor build

4. Upgrade the existing devnet deployment in place.

   Run:
     anchor deploy --provider.cluster devnet

   This deploys the new bytecode to the SAME program ID (the default
   upgrade authority is your own wallet, which deployed it originally
   in Week 15), no new PDA, no new client program ID needed.

5. Create events-client/, exactly Easy/Medium's setup.

   Run:
     mkdir events-client && cd events-client
     npm init -y
     npm install @coral-xyz/anchor @solana/web3.js
     npm install -D typescript tsx @types/node

6. Copy the FRESHLY REBUILT target/idl/counter_anchor.json into this
   folder — Step 3's rebuild changed it, the old copy from Week 15
   won't include the new event.

7. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

8. Create tsconfig.json and index.ts from the Solution section below.

9. Run it.

   Run:
     npx tsx index.ts

   You should see the event fire and print, "Event received before
   cleanup: true", then the deliberate double-initialize failing with
   a caught, printed error.```

---

# Program Key + ID.

```
8Usiwh28LZ451hEpwmjLiJVcY2QsXa8SsrSpcmr2vy7e
```

## Metadata.

```
45uiA4K2TStJS3PyuZvRHwsQWN6gr387JKR46H5fuuU9
```