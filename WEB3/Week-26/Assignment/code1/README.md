# How to Build.

```
1. Complete the Tutorial section above first.

2. Scaffold the project.

   Run:
     mkdir account-inspector && cd account-inspector
     npm init -y
     npm install ethers
     npm install -D typescript tsx @types/node

3. Create tsconfig.json (same shape as every prior client script) and
   index.ts from the Solution section below.

4. Run it.

   Run:
     npx tsx index.ts

   You should see both addresses' balance, nonce, and bytecode
   length, each correctly labeled EOA or Contract Account.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-26/Assignment/code1$ npm start

> code1@1.0.0 start
> tsx index.ts


A real EOA (replace with any wallet address you like)
  Address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
  Balance:  30778130232803985280 wei (30.77813023280398528 ETH)
  Nonce:    0
  Code:     0 bytes
  Kind:     EOA

Sepolia WETH (a real, verified contract)
  Address: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
  Balance:  237861375483335857826896 wei (237861.375483335857826896 ETH)
  Nonce:    1
  Code:     3124 bytes
  Kind:     Contract Account
```