import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://ethereum-sepolia-rpc.publicnode.com",
);

async function main() {
  const block = await provider.getBlockNumber();
  console.log("Latest block:", block);
}

main().catch(console.error);
