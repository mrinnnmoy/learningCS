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

// ============================================================
// Providers / Contract
// ============================================================

// Read-only provider for the REAL Sepolia network.
// This works even before MetaMask is connected.
const readOnlyProvider = new JsonRpcProvider(
  "https://ethereum-sepolia-rpc.publicnode.com",
);

const readOnlyCounter = new Contract(
  COUNTER_ADDRESS,
  COUNTER_ABI,
  readOnlyProvider,
);

// ============================================================
// Wallet state
// ============================================================

let signer: Signer | undefined;
let writableCounter: Contract | undefined;

// Sepolia chain ID
const SEPOLIA_CHAIN_ID = "0xaa36a7";

// ============================================================
// DOM elements
// ============================================================

const countEl = document.getElementById("count")!;

const addressEl = document.getElementById("address")!;

const statusEl = document.getElementById("status")!;

const networkStatusEl = document.getElementById("networkStatus")!;

const connectBtn = document.getElementById("connectBtn") as HTMLButtonElement;

const incrementBtn = document.getElementById(
  "incrementBtn",
) as HTMLButtonElement;

const switchBtn = document.getElementById("switchBtn") as HTMLButtonElement;

const etherscanLinkEl = document.getElementById(
  "etherscanLink",
) as HTMLAnchorElement;

// ============================================================
// Read current count
// ============================================================

async function refreshCount() {
  try {
    const count: bigint = await readOnlyCounter.getCount();

    countEl.textContent = count.toString();
  } catch (error) {
    console.error("Failed to read count:", error);
    countEl.textContent = "Error";
  }
}

// ============================================================
// Check MetaMask network
// ============================================================

async function checkNetwork() {
  if (!window.ethereum) {
    networkStatusEl.textContent = "MetaMask not found";
    switchBtn.style.display = "none";
    incrementBtn.disabled = true;
    return false;
  }

  const chainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  const onSepolia = chainId === SEPOLIA_CHAIN_ID;

  if (onSepolia) {
    networkStatusEl.textContent = "Connected to Sepolia ✓";
    switchBtn.style.display = "none";
  } else {
    networkStatusEl.textContent = `Wrong network (chainId ${chainId})`;
    switchBtn.style.display = "inline-block";
  }

  // Never allow a transaction unless BOTH:
  // 1. We are on Sepolia
  // 2. We have a writable contract
  incrementBtn.disabled = !onSepolia || !writableCounter;

  return onSepolia;
}

// ============================================================
// Connect MetaMask
// ============================================================

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found — install it first.");
    return;
  }

  // Check network before creating the writable contract.
  const onSepolia = await checkNetwork();

  if (!onSepolia) {
    statusEl.textContent = "Switch to Sepolia before connecting.";
    return;
  }

  const browserProvider = new BrowserProvider(window.ethereum);

  // Concept 3 — ask MetaMask for account access
  await browserProvider.send("eth_requestAccounts", []);

  // Concept 2 — obtain a real browser signer
  signer = await browserProvider.getSigner();

  writableCounter = new Contract(COUNTER_ADDRESS, COUNTER_ABI, signer);

  addressEl.textContent = await signer.getAddress();

  // Now that we have a Sepolia signer and writable contract,
  // Increment can be enabled.
  incrementBtn.disabled = false;

  statusEl.textContent = "Wallet connected.";
}

// ============================================================
// Switch to Sepolia
// ============================================================

async function switchToSepolia() {
  if (!window.ethereum) {
    alert("MetaMask not found — install it first.");
    return;
  }

  try {
    // Concept 8 — request MetaMask to switch networks
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: SEPOLIA_CHAIN_ID,
        },
      ],
    });
  } catch (err: any) {
    // MetaMask uses 4902 when it does not know the chain yet.
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID,
            chainName: "Sepolia",
            nativeCurrency: {
              name: "Sepolia ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          },
        ],
      });
    } else {
      console.error("Failed to switch to Sepolia:", err);
      statusEl.textContent = "Failed to switch network.";
      return;
    }
  }

  await checkNetwork();
}

// ============================================================
// Send increment transaction
// ============================================================

async function increment() {
  if (!writableCounter) {
    return;
  }

  // Double-check the wallet is still on Sepolia immediately
  // before sending the transaction.
  const onSepolia = await checkNetwork();

  if (!onSepolia) {
    statusEl.textContent = "Wrong network. Switch to Sepolia first.";
    return;
  }

  try {
    // Concept 5 — MetaMask confirmation appears here
    const tx = await writableCounter.increment();

    // Show transaction hash immediately
    statusEl.textContent = `Pending: ${tx.hash}`;

    // Concept 7 — wait for actual blockchain confirmation
    const receipt = await tx.wait();

    statusEl.textContent = `Confirmed in block ${receipt!.blockNumber}`;

    // Show Etherscan transaction link
    etherscanLinkEl.href = `https://sepolia.etherscan.io/tx/${tx.hash}`;

    etherscanLinkEl.style.display = "inline";

    // Refresh count after confirmation
    await refreshCount();
  } catch (error) {
    console.error("Increment failed:", error);
    statusEl.textContent = "Transaction failed or was rejected.";
  }
}

// ============================================================
// Live CountIncreased event listener
// ============================================================

readOnlyCounter.on("CountIncreased", (by: string, newCount: bigint) => {
  console.log(`CountIncreased event: by=${by} newCount=${newCount}`);

  // Concept 6 — update automatically when ANY matching
  // event occurs on the Sepolia contract.
  refreshCount();
});

// ============================================================
// React to wallet changes
// ============================================================

// Concept 8 — wallet-initiated network change
if (window.ethereum) {
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });

  // Concept 8 — wallet-initiated account change
  window.ethereum.on("accountsChanged", () => {
    window.location.reload();
  });
}

// ============================================================
// Event handlers
// ============================================================

connectBtn.addEventListener("click", connectWallet);

incrementBtn.addEventListener("click", increment);

switchBtn.addEventListener("click", switchToSepolia);

// ============================================================
// Initial page state
// ============================================================

// Read the real Sepolia count immediately.
// This does NOT require MetaMask.
refreshCount();

// Detect MetaMask's current network immediately.
checkNetwork();
