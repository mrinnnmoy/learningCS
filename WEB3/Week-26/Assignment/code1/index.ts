import { ethers } from "ethers";

// Use a direct Sepolia RPC provider instead of getDefaultProvider
const provider = new ethers.JsonRpcProvider(
  "https://ethereum-sepolia-rpc.publicnode.com",
);

const ADDRESSES_TO_INSPECT = [
  {
    label: "A real EOA (replace with any wallet address you like)",
    // Replace this with your own wallet address if desired
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  },
  {
    label: "Sepolia WETH (a real, verified contract)",
    address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
  },
];

async function inspect(address: string): Promise<void> {
  const [balanceWei, nonce, code] = await Promise.all([
    provider.getBalance(address),
    provider.getTransactionCount(address),
    provider.getCode(address),
  ]);

  // Convert wei to ETH
  const balanceEth = ethers.formatEther(balanceWei);

  // Calculate deployed bytecode length
  const codeLengthBytes = code === "0x" ? 0 : (code.length - 2) / 2;

  // Determine account type based solely on bytecode
  const kind = codeLengthBytes === 0 ? "EOA" : "Contract Account";

  console.log(`  Balance:  ${balanceWei.toString()} wei (${balanceEth} ETH)`);
  console.log(`  Nonce:    ${nonce}`);
  console.log(`  Code:     ${codeLengthBytes} bytes`);
  console.log(`  Kind:     ${kind}`);
}

async function main(): Promise<void> {
  for (const { label, address } of ADDRESSES_TO_INSPECT) {
    console.log(`\n${label}`);
    console.log(`  Address: ${address}`);

    await inspect(address);
  }
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
