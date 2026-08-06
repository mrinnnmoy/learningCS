import { ethers } from "ethers";

const providerA = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const providerB = new ethers.JsonRpcProvider("http://127.0.0.1:8546");

const [networkA, networkB] = await Promise.all([
  providerA.getNetwork(),
  providerB.getNetwork(),
]);
console.log("Chain A:", networkA.chainId, "| Chain B:", networkB.chainId);
