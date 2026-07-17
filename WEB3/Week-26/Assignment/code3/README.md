# How to Build.

```
1. Scaffold the project.

   Run:
     mkdir bytecode-abi-explorer && cd bytecode-abi-explorer
     npm init -y
     npm install ethers
     npm install -D typescript tsx @types/node

2. Create tsconfig.json and index.ts from the Solution section below.

3. Run it.

   Run:
     npx tsx index.ts

   You should see the first 20 bytes of a real contract's bytecode
   disassembled into opcodes (correctly skipping PUSH1's data byte),
   then an encoded ERC-20 transfer call, and that same calldata
   successfully decoded back into a readable function call.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-26/Assignment/code3$ npm start

> code3@1.0.0 start
> tsx index.ts

Fetching real bytecode from: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14
Total bytecode length: 3124 bytes

Disassembling the first 20 bytes:
  Offset 0: 0x60  PUSH1
    (immediate data: 0x60)
  Offset 2: 0x60  PUSH1
    (immediate data: 0x40)
  Offset 4: 0x52  MSTORE
  Offset 5: 0x60  PUSH1
    (immediate data: 0x04)
  Offset 7: 0x36  UNKNOWN (0x36)
  Offset 8: 0x10  UNKNOWN (0x10)
  Offset 9: 0x61  UNKNOWN (0x61)
  Offset 10: 0x00  STOP
  Offset 11: 0xaf  UNKNOWN (0xaf)
  Offset 12: 0x57  JUMPI
  Offset 13: 0x60  PUSH1
    (immediate data: 0x00)
  Offset 15: 0x35  UNKNOWN (0x35)
  Offset 16: 0x7c  UNKNOWN (0x7c)
  Offset 17: 0x01  ADD
  Offset 18: 0x00  STOP
  Offset 19: 0x00  STOP
  Offset 20: 0x00  STOP
  Offset 21: 0x00  STOP
  Offset 22: 0x00  STOP
  Offset 23: 0x00  STOP

--- ABI encode/decode round trip (Concept 6) ---

Encoded calldata (what actually gets sent on-chain):
  0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e00000000000000000000000000000000000000000000000014d1120d7b160000

Decoded back from that exact calldata:
  Function: transfer
  to:       0x742d35Cc6634C0532925a3b844Bc454e4438f44e
  amount:   1500000000000000000 (1.5 tokens)

Round trip matches original input: true
```