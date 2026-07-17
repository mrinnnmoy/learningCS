import { ethers } from "ethers";

const provider = ethers.getDefaultProvider("sepolia");
const CONTRACT_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"; // Sepolia WETH

// A small, real subset of the actual EVM opcode table (Concept 5).
const OPCODES: Record<number, string> = {
  0x00: "STOP",
  0x01: "ADD",
  0x52: "MSTORE",
  0x54: "SLOAD",
  0x55: "SSTORE",
  0x56: "JUMP",
  0x57: "JUMPI",
  0x5b: "JUMPDEST",
  0x60: "PUSH1", // consumes exactly 1 following data byte, not itself an opcode
  0x80: "DUP1",
  0x90: "SWAP1",
  0xf3: "RETURN",
  0xfd: "REVERT",
};

function disassemble(bytecodeHex: string, byteCount: number): void {
  // Strip the "0x" prefix, work in raw bytes.
  const bytes = Buffer.from(bytecodeHex.slice(2), "hex");
  let i = 0;
  let printed = 0;

  while (i < bytes.length && printed < byteCount) {
    const opcode = bytes[i];
    const mnemonic =
      OPCODES[opcode] ?? `UNKNOWN (0x${opcode.toString(16).padStart(2, "0")})`;
    console.log(
      `  Offset ${i}: 0x${opcode.toString(16).padStart(2, "0")}  ${mnemonic}`,
    );

    if (opcode === 0x60) {
      // PUSH1's immediate data byte — Concept 5's real EVM parsing
      // rule: this next byte is DATA, not another opcode, skipping
      // it incorrectly would misread every subsequent byte's meaning.
      const dataByte = bytes[i + 1];
      console.log(
        `    (immediate data: 0x${dataByte.toString(16).padStart(2, "0")})`,
      );
      i += 2;
    } else {
      i += 1;
    }
    printed += 1;
  }
}

async function main(): Promise<void> {
  console.log("Fetching real bytecode from:", CONTRACT_ADDRESS);
  const bytecode = await provider.getCode(CONTRACT_ADDRESS);
  console.log(`Total bytecode length: ${(bytecode.length - 2) / 2} bytes\n`);

  console.log("Disassembling the first 20 bytes:");
  disassemble(bytecode, 20);

  console.log("\n--- ABI encode/decode round trip (Concept 6) ---\n");

  const erc20TransferAbi = [
    "function transfer(address to, uint256 amount) returns (bool)",
  ];
  const iface = new ethers.Interface(erc20TransferAbi);

  const recipient = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const amount = ethers.parseUnits("1.5", 18);

  const encodedCalldata = iface.encodeFunctionData("transfer", [
    recipient,
    amount,
  ]);
  console.log("Encoded calldata (what actually gets sent on-chain):");
  console.log(" ", encodedCalldata);

  const decoded = iface.decodeFunctionData("transfer", encodedCalldata);
  console.log("\nDecoded back from that exact calldata:");
  console.log("  Function:", "transfer");
  console.log("  to:      ", decoded[0]);
  console.log(
    "  amount:  ",
    decoded[1].toString(),
    `(${ethers.formatUnits(decoded[1], 18)} tokens)`,
  );

  const roundTripMatches =
    decoded[0].toLowerCase() === recipient.toLowerCase() &&
    decoded[1] === amount;
  console.log("\nRound trip matches original input:", roundTripMatches);
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
