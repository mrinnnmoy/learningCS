import type { Block } from "./chain.js";

const targetUrl = process.argv[2] ?? "http://localhost:5001";

async function main(): Promise<void> {
  console.log(`Fetching current chain from ${targetUrl}...`);
  const response = await fetch(`${targetUrl}/chain`);
  const { chain } = (await response.json()) as { chain: Block[] };

  if (chain.length < 2) {
    console.log(
      "Target chain is too short to tamper with meaningfully. Mine a block first.",
    );
    return;
  }

  console.log("Tampering with Block #1's data, without re-mining...");
  const tampered: Block[] = chain.map((block) => ({ ...block }));
  const target = tampered[1];
  target.data = "Attacker rewrites history here";
  // Deliberately NOT recomputing target.hash or re-mining — this is what
  // makes the tamper attempt naive rather than a genuine (very expensive)
  // rewrite of real proof-of-work.

  console.log(`Submitting tampered chain to ${targetUrl}/receive-chain...`);
  const submitResponse = await fetch(`${targetUrl}/receive-chain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chain: tampered }),
  });
  const result = await submitResponse.json();

  console.log("Response from node:");
  console.log(result);
}

main();
