import { ethers } from "ethers";

const provider = ethers.getDefaultProvider("sepolia");
const PLAIN_TRANSFER_GAS = 21000n; // Concept 3: the fixed, well-known cost of the simplest possible transaction

async function main(): Promise<void> {
  const latestBlock = await provider.getBlock("latest");
  if (!latestBlock || latestBlock.baseFeePerGas === null) {
    throw new Error("Could not fetch a block with base fee data.");
  }

  const baseFeeWei = latestBlock.baseFeePerGas;
  const baseFeeGwei = ethers.formatUnits(baseFeeWei, "gwei");
  const fullnessPercent =
    (Number(latestBlock.gasUsed) / Number(latestBlock.gasLimit)) * 100;

  console.log("Latest block:", latestBlock.number);
  console.log(`  Base fee: ${baseFeeWei.toString()} wei (${baseFeeGwei} gwei)`);
  console.log(
    `  Fullness: ${latestBlock.gasUsed.toString()} / ${latestBlock.gasLimit.toString()} gas (${fullnessPercent.toFixed(1)}%)`,
  );
  console.log(
    `  ${fullnessPercent > 50 ? "Above 50% full — base fee should RISE next block (Concept 4)." : "Below 50% full — base fee should FALL next block (Concept 4)."}`,
  );

  const feeData = await provider.getFeeData();
  console.log("\nCurrent suggested fee data:");
  console.log(
    `  maxFeePerGas:         ${ethers.formatUnits(feeData.maxFeePerGas ?? 0n, "gwei")} gwei`,
  );
  console.log(
    `  maxPriorityFeePerGas: ${ethers.formatUnits(feeData.maxPriorityFeePerGas ?? 0n, "gwei")} gwei`,
  );

  const estimatedTotalFeeWei =
    (feeData.maxFeePerGas ?? 0n) * PLAIN_TRANSFER_GAS;
  console.log(
    `\nEstimated cost of a plain ETH transfer (${PLAIN_TRANSFER_GAS} gas):`,
  );
  console.log(
    `  ~${ethers.formatEther(estimatedTotalFeeWei)} ETH (an upper bound — the actual charge uses the real base fee at inclusion time, never more than maxFeePerGas)`,
  );

  console.log(
    "\nBase fee across the 5 most recent blocks (Concept 4's adjustment, in action):",
  );
  for (let i = 0; i < 5; i++) {
    const blockNumber = latestBlock.number - i;
    const block = await provider.getBlock(blockNumber);
    if (block?.baseFeePerGas !== null && block?.baseFeePerGas !== undefined) {
      console.log(
        `  Block ${blockNumber}: ${ethers.formatUnits(block.baseFeePerGas, "gwei")} gwei`,
      );
    }
  }
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
