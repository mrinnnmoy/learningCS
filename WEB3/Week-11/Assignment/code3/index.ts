import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Sysvars live at fixed, well-known addresses — this one exposes the
// cluster's live, Proof of History-derived clock (Week 10, Concept 3).
const CLOCK_SYSVAR_ID = new PublicKey(
  "SysvarC1ock11111111111111111111111111111111",
);

// Solana's protocol-enforced maximum account data size: 10 MiB. This
// isn't returned by any RPC call, it's a constant compiled directly
// into the runtime, cited here as documented fact.
const MAX_ACCOUNT_SIZE_BYTES = 10_485_760;

interface ClockSysvar {
  slot: bigint;
  epochStartTimestamp: bigint;
  epoch: bigint;
  leaderScheduleEpoch: bigint;
  unixTimestamp: bigint;
}

function decodeClockSysvar(data: Buffer): ClockSysvar {
  // The Clock sysvar predates Borsh (Week 5) as a data-format
  // convention — it's a fixed-layout, little-endian struct: five
  // consecutive 8-byte fields, no length prefixes, no schema.
  return {
    slot: data.readBigUInt64LE(0),
    epochStartTimestamp: data.readBigInt64LE(8),
    epoch: data.readBigUInt64LE(16),
    leaderScheduleEpoch: data.readBigUInt64LE(24),
    unixTimestamp: data.readBigInt64LE(32),
  };
}

async function main(): Promise<void> {
  const clockInfo = await connection.getAccountInfo(CLOCK_SYSVAR_ID);
  if (clockInfo === null) {
    throw new Error(
      "Clock sysvar account not found — this should never happen on a live cluster.",
    );
  }
  const clock = decodeClockSysvar(clockInfo.data);

  console.log("Clock sysvar, decoded directly from raw account bytes:");
  console.log("  Slot:", clock.slot.toString());
  console.log("  Epoch:", clock.epoch.toString());
  console.log("  Leader schedule epoch:", clock.leaderScheduleEpoch.toString());
  console.log("  Unix timestamp (on-chain):", clock.unixTimestamp.toString());

  const localUnixSeconds = Math.floor(Date.now() / 1000);
  const driftSeconds = Math.abs(localUnixSeconds - Number(clock.unixTimestamp));
  console.log("  Local machine's unix timestamp:", localUnixSeconds);
  console.log(
    "  Drift between on-chain clock and local clock:",
    driftSeconds,
    "seconds",
  );

  console.log("\nRent-exemption cost by account size:");
  const sizesToCheck: number[] = [
    0,
    165,
    1_000,
    10_000,
    MAX_ACCOUNT_SIZE_BYTES,
  ];
  for (const size of sizesToCheck) {
    const minBalance = await connection.getMinimumBalanceForRentExemption(size);
    const label =
      size === MAX_ACCOUNT_SIZE_BYTES
        ? `${size} bytes (protocol max)`
        : `${size} bytes`;
    console.log(`  ${label}: ${minBalance} lamports`);
  }
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
