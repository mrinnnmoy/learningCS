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

// Configuration
const CONFIRMATIONS_REQUIRED = 3;
const POLL_INTERVAL_MS = 5000;

// Providers
const providerA = new ethers.JsonRpcProvider(CHAIN_A_RPC);
const providerB = new ethers.JsonRpcProvider(CHAIN_B_RPC);

// Relayer wallets
// Same private key, but connected separately to each chain.
// Chain A wallet is needed for LockBox.unlock()
// Chain B wallet is needed for WrappedToken.mint()
const relayerWalletA = new ethers.Wallet(RELAYER_PRIVATE_KEY, providerA);

const relayerWalletB = new ethers.Wallet(RELAYER_PRIVATE_KEY, providerB);

// Chain A → Chain B
// Locked event → mint()
const lockBox = new ethers.Contract(LOCKBOX_ADDRESS, LOCKBOX_ABI, providerA);

const wrappedToken = new ethers.Contract(
  WRAPPED_TOKEN_ADDRESS,
  WRAPPED_TOKEN_ABI,
  relayerWalletB,
);

// Start from block 0 for this local assignment.
// In a production relayer, this would normally be persisted
// somewhere durable rather than reset whenever the process restarts.
let lastProcessedBlock = 0;

// Chain B → Chain A
// Burn event → unlock()
const WRAPPED_TOKEN_TRANSFER_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const LOCKBOX_UNLOCK_ABI = [
  "function unlock(address user, uint256 amount) external",
];

const wrappedTokenEvents = new ethers.Contract(
  WRAPPED_TOKEN_ADDRESS,
  WRAPPED_TOKEN_TRANSFER_ABI,
  providerB,
);

const lockBoxUnlock = new ethers.Contract(
  LOCKBOX_ADDRESS,
  LOCKBOX_UNLOCK_ABI,
  relayerWalletA,
);

// Separate cursor for Chain B.
let lastProcessedBlockB = 0;

// Chain A → Chain B watcher
async function pollForLockedEvents() {
  const currentBlock = await providerA.getBlockNumber();

  // Only process blocks that have at least 3 blocks after them.
  const safeBlock = currentBlock - CONFIRMATIONS_REQUIRED;

  if (safeBlock <= lastProcessedBlock) {
    console.log(
      `[relayer] Chain A: nothing new and confirmed yet ` +
        `(current=${currentBlock}, safe=${safeBlock})`,
    );

    return;
  }

  const fromBlock = lastProcessedBlock + 1;
  const toBlock = safeBlock;

  const events = await lockBox.queryFilter(
    lockBox.filters.Locked(),
    fromBlock,
    toBlock,
  );

  console.log(
    `[relayer] Chain A: scanning blocks ${fromBlock}-${toBlock}: ` +
      `found ${events.length} Locked event(s)`,
  );

  for (const event of events) {
    const log = event as ethers.EventLog;

    const { user, amount, nonce, sourceChainId } = log.args!;

    console.log(
      `[relayer] Chain A Locked event: ` +
        `user=${user} ` +
        `amount=${amount} ` +
        `nonce=${nonce} ` +
        `sourceChainId=${sourceChainId} ` +
        `block=${log.blockNumber}`,
    );

    try {
      console.log(
        `[relayer] relaying nonce ${nonce} from Chain A → Chain B...`,
      );

      const tx = await wrappedToken.mint(user, amount, nonce);

      const receipt = await tx.wait();

      console.log(
        `[relayer] minted on Chain B — ` +
          `tx ${receipt!.hash}, ` +
          `block ${receipt!.blockNumber}`,
      );
    } catch (err: any) {
      console.error(
        `[relayer] failed to relay nonce ${nonce}:`,
        err.shortMessage ?? err.message,
      );
    }
  }

  // Move the Chain A cursor forward after scanning this range.
  lastProcessedBlock = safeBlock;
}

// Chain B → Chain A watcher
async function pollForBurnEvents() {
  const currentBlock = await providerB.getBlockNumber();

  // Apply the same 3-confirmation safety margin on Chain B.
  const safeBlock = currentBlock - CONFIRMATIONS_REQUIRED;

  if (safeBlock <= lastProcessedBlockB) {
    console.log(
      `[relayer] Chain B: nothing new and confirmed yet ` +
        `(current=${currentBlock}, safe=${safeBlock})`,
    );

    return;
  }

  const fromBlock = lastProcessedBlockB + 1;
  const toBlock = safeBlock;

  // ERC20 burns emit:
  // Transfer(user, address(0), amount)
  // So we specifically search for Transfer events whose `to`
  // address is the zero address.
  const events = await wrappedTokenEvents.queryFilter(
    wrappedTokenEvents.filters.Transfer(null, ethers.ZeroAddress),
    fromBlock,
    toBlock,
  );

  console.log(
    `[relayer] Chain B: scanning blocks ${fromBlock}-${toBlock}: ` +
      `found ${events.length} burn event(s)`,
  );

  for (const event of events) {
    const log = event as ethers.EventLog;

    const { from, value } = log.args!;

    console.log(
      `[relayer] Chain B burn detected: ` +
        `user=${from} ` +
        `amount=${value} ` +
        `block=${log.blockNumber}`,
    );

    try {
      console.log(`[relayer] relaying burn from Chain B → Chain A...`);

      const tx = await lockBoxUnlock.unlock(from, value);

      const receipt = await tx.wait();

      console.log(
        `[relayer] unlocked on Chain A — ` +
          `tx ${receipt!.hash}, ` +
          `block ${receipt!.blockNumber}`,
      );
    } catch (err: any) {
      console.error(
        `[relayer] failed to unlock ${value} for ${from}:`,
        err.shortMessage ?? err.message,
      );
    }
  }

  // Move the Chain B cursor forward after scanning this range.
  lastProcessedBlockB = safeBlock;
}

// Main relayer loop
async function main() {
  console.log("[relayer] started — watching Chain A ↔ Chain B");

  console.log(`[relayer] confirmations required: ${CONFIRMATIONS_REQUIRED}`);

  console.log(`[relayer] polling interval: ${POLL_INTERVAL_MS}ms`);

  console.log(`[relayer] LockBox: ${LOCKBOX_ADDRESS}`);

  console.log(`[relayer] WrappedToken: ${WRAPPED_TOKEN_ADDRESS}`);

  console.log(
    `[relayer] relayer address on Chain A: ${relayerWalletA.address}`,
  );

  console.log(
    `[relayer] relayer address on Chain B: ${relayerWalletB.address}`,
  );

  while (true) {
    try {
      // Watch Chain A for Locked events.
      await pollForLockedEvents();

      // Watch Chain B for burn events.
      await pollForBurnEvents();
    } catch (err: any) {
      console.error(
        "[relayer] polling error:",
        err.shortMessage ?? err.message,
      );
    }

    // Wait before the next polling cycle.
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Start
main().catch((err) => {
  console.error("[relayer] fatal error:", err);
  process.exit(1);
});
