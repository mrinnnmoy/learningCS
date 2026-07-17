import { ethers } from "ethers";
const provider = ethers.getDefaultProvider("sepolia");
const blockNumber = await provider.getBlockNumber();

console.log("Connected. Current Sepolia block:", blockNumber);
