import { ethers } from "ethers";
import {
  CHAIN_A_RPC,
  CHAIN_B_RPC,
  LOCKBOX_ADDRESS,
  WRAPPED_TOKEN_ADDRESS,
  RELAYER_PRIVATE_KEY,
  LOCKBOX_ABI,
  WRAPPED_TOKEN_ABI,
} from "./config";

const CONFIRMATIONS_REQUIRED = 3; // Concept 7 — a small, deliberate safety margin

const providerA = new ethers.JsonRpcProvider(CHAIN_A_RPC);
const providerB = new ethers.JsonRpcProvider(CHAIN_B_RPC);
const relayerWalletB = new ethers.Wallet(RELAYER_PRIVATE_KEY, providerB);

const lockBox = new ethers.Contract(LOCKBOX_ADDRESS, LOCKBOX_ABI, providerA);
const wrappedToken = new ethers.Contract(
  WRAPPED_TOKEN_ADDRESS,
  WRAPPED_TOKEN_ABI,
  relayerWalletB,
);

let lastProcessedBlock = 0; // set to LockBox's own real deployment block in a real system — 0 is fine locally

async function pollForLockedEvents() {
  const currentBlock = await providerA.getBlockNumber();
  const safeBlock = currentBlock - CONFIRMATIONS_REQUIRED;

  if (safeBlock <= lastProcessedBlock) {
    console.log(
      `[relayer] nothing new and confirmed yet (current=${currentBlock}, safe=${safeBlock})`,
    );
    return;
  }

  const events = await lockBox.queryFilter(
    lockBox.filters.Locked(),
    lastProcessedBlock + 1,
    safeBlock,
  );
  console.log(
    `[relayer] scanning blocks ${lastProcessedBlock + 1}-${safeBlock}: found ${events.length} Locked event(s)`,
  );

  for (const event of events) {
    const log = event as ethers.EventLog;
    const { user, amount, nonce } = log.args!;
    console.log(
      `[relayer] relaying: user=${user} amount=${amount} nonce=${nonce}`,
    );

    try {
      const tx = await wrappedToken.mint(user, amount, nonce);
      const receipt = await tx.wait();
      console.log(
        `[relayer] minted on Chain B — tx ${receipt!.hash}, block ${receipt!.blockNumber}`,
      );
    } catch (err: any) {
      console.error(
        `[relayer] failed to relay nonce ${nonce}:`,
        err.shortMessage ?? err.message,
      );
    }
  }

  lastProcessedBlock = safeBlock;
}

console.log("[relayer] started — watching Chain A, minting on Chain B");
setInterval(pollForLockedEvents, 5000);
