import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  type Signer,
} from "ethers";
import { COUNTER_ADDRESS, COUNTER_ABI } from "./counter";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const readOnlyProvider = new JsonRpcProvider("http://127.0.0.1:8545");
const readOnlyCounter = new Contract(
  COUNTER_ADDRESS,
  COUNTER_ABI,
  readOnlyProvider,
);

let signer: Signer | undefined;
let writableCounter: Contract | undefined;

const countEl = document.getElementById("count")!;
const addressEl = document.getElementById("address")!;
const statusEl = document.getElementById("status")!;
const incrementBtn = document.getElementById(
  "incrementBtn",
) as HTMLButtonElement;

async function refreshCount() {
  const count: bigint = await readOnlyCounter.getCount();
  countEl.textContent = count.toString();
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found — install it first.");
    return;
  }
  const browserProvider = new BrowserProvider(window.ethereum);
  await browserProvider.send("eth_requestAccounts", []); // Concept 3 — triggers the connect popup
  signer = await browserProvider.getSigner(); // Concept 2 — a real browser signer
  writableCounter = new Contract(COUNTER_ADDRESS, COUNTER_ABI, signer);
  addressEl.textContent = await signer.getAddress();
  incrementBtn.disabled = false;
}

async function increment() {
  if (!writableCounter) return;
  const tx = await writableCounter.increment(); // Concept 5 — MetaMask popup appears here
  statusEl.textContent = `Pending: ${tx.hash}`;
  const receipt = await tx.wait(); // Concept 7
  statusEl.textContent = `Confirmed in block ${receipt!.blockNumber}`;
  await refreshCount();
}

readOnlyCounter.on("CountIncreased", (by: string, newCount: bigint) => {
  // Concept 6
  console.log(`CountIncreased event: by=${by} newCount=${newCount}`);
  refreshCount();
});

document.getElementById("connectBtn")!.addEventListener("click", connectWallet);
incrementBtn.addEventListener("click", increment);

refreshCount();
