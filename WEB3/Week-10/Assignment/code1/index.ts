import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function main(): Promise<void> {
  const version = await connection.getVersion();
  console.log("Cluster: devnet");
  console.log("Solana core version:", version["solana-core"]);

  const epochInfo = await connection.getEpochInfo();
  console.log("\nCurrent epoch:", epochInfo.epoch);
  console.log(
    "Slot index within epoch:",
    epochInfo.slotIndex,
    "/",
    epochInfo.slotsInEpoch,
  );
  console.log("Absolute slot:", epochInfo.absoluteSlot);

  const nodes = await connection.getClusterNodes();
  console.log("\nActive cluster nodes visible to this RPC:", nodes.length);

  // Proof of History, observed directly: the slot number keeps
  // advancing on its own, with zero transactions of ours involved.
  const slotBefore: number = await connection.getSlot();
  console.log("\nSlot before 2s wait:", slotBefore);
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  const slotAfter: number = await connection.getSlot();
  console.log("Slot after 2s wait: ", slotAfter);
  console.log(
    "Slots advanced:",
    slotAfter - slotBefore,
    "(expect several, at ~400ms per slot)",
  );
}

main().catch((err: unknown) => {
  // strict mode types caught errors as `unknown`, not `Error` — narrow
  // before reading `.message`, since JS permits throwing non-Error values.
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
