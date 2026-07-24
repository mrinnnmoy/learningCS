import { network } from "hardhat";

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_ABI = ["function totalSupply() view returns (uint256)"];

async function main() {
  const { ethers } = await network.connect();

  const usdc = new ethers.Contract(USDC, USDC_ABI, ethers.provider);

  const supply = await usdc.totalSupply();

  console.log(
    "Real USDC totalSupply, read via a local mainnet fork:",
    supply.toString(),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
