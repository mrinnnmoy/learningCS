import { Connection, clusterApiUrl } from "@solana/web3.js";
import type { VoteAccountInfo } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function main(): Promise<void> {
  const currentSlot: number = await connection.getSlot();
  const currentLeader: string = await connection.getSlotLeader();
  console.log("Current slot:", currentSlot);
  console.log("Current slot leader:", currentLeader);

  const voteAccounts = await connection.getVoteAccounts();
  const allValidators: VoteAccountInfo[] = [
    ...voteAccounts.current,
    ...voteAccounts.delinquent,
  ];
  console.log(
    "\nTotal known validators (current + delinquent):",
    allValidators.length,
  );

  const leaderIsKnownValidator: boolean = allValidators.some(
    (v) => v.nodePubkey === currentLeader,
  );
  console.log(
    "Current leader matches a known validator entry:",
    leaderIsKnownValidator,
  );

  const totalStake: number = voteAccounts.current.reduce(
    (sum, v) => sum + v.activatedStake,
    0,
  );
  const sorted: VoteAccountInfo[] = [...voteAccounts.current].sort(
    (a, b) => b.activatedStake - a.activatedStake,
  );
  const top10Stake: number = sorted
    .slice(0, 10)
    .reduce((sum, v) => sum + v.activatedStake, 0);
  const top10Share: string =
    totalStake > 0 ? ((top10Stake / totalStake) * 100).toFixed(2) : "0.00";

  console.log("\nActive validators:", voteAccounts.current.length);
  console.log("Top 10 validators hold", top10Share, "% of total active stake");
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
