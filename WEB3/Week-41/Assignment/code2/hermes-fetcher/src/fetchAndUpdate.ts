import { HermesClient } from "@pythnetwork/hermes-client";
import { ethers } from "ethers";

const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

// The real deployed PythPriceConsumer address from How to Build, step 2
const CONSUMER_ADDRESS = "0xa2A3d870699Fb745705d2aBb6e167FEFEe787097";

const ETH_USD_PRICE_ID =
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

if (!DEPLOYER_PRIVATE_KEY) {
  throw new Error("DEPLOYER_PRIVATE_KEY is not set");
}

const CONSUMER_ABI = [
  "function updateAndGetPrice(bytes[] calldata priceUpdateData) external payable returns (int64 price, uint64 conf)",
  "function pyth() external view returns (address)",
];
const PYTH_ABI = [
  "function getUpdateFee(bytes[] calldata updateData) external view returns (uint256)",
];

async function main() {
  const hermes = new HermesClient("https://hermes.pyth.network");
  const updates = await hermes.getLatestPriceUpdates([ETH_USD_PRICE_ID]); // Concept 3 — the real off-chain fetch step
  const priceUpdateData = updates.binary.data.map((d) => "0x" + d);

  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
  const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY!, provider);
  const consumer = new ethers.Contract(CONSUMER_ADDRESS, CONSUMER_ABI, wallet);

  const pythAddress = await consumer.pyth();
  const pyth = new ethers.Contract(pythAddress, PYTH_ABI, provider);
  const fee = await pyth.getUpdateFee(priceUpdateData);

  const tx = await consumer.updateAndGetPrice(priceUpdateData, { value: fee });
  const receipt = await tx.wait();
  console.log(`Updated on-chain — tx ${receipt!.hash}, fee paid: ${fee} wei`);
}

main().catch(console.error);
