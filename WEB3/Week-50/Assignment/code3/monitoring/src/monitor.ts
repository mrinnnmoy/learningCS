import { ethers } from "ethers";

const RPC_URL = "http://127.0.0.1:8545";
const VAULT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // the real deployed GoodVault address from How to Build, step 1
const LARGE_WITHDRAWAL_THRESHOLD = ethers.parseEther("10");

const VAULT_ABI = [
  "event Paused(address account)",
  "event Unpaused(address account)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

function sendAlert(message: string) {
  // A real production system would POST this to Slack/Discord/PagerDuty (Concept 5) — this
  // week's own assignment simulates that with a clearly-formatted, structured console alert.
  console.log("\n🚨🚨🚨 SECURITY ALERT 🚨🚨🚨");
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(message);
  console.log("Action: see INCIDENT_RESPONSE_PLAN.md immediately.\n");
}

vault.on("Paused", (account: string) => {
  sendAlert(
    `Contract PAUSED by ${account}. This is either a deliberate emergency response or a compromised admin key.`,
  );
});

vault.on("Unpaused", (account: string) => {
  sendAlert(
    `Contract UNPAUSED by ${account}. Confirm this was expected before assuming normal operation resumed.`,
  );
});

console.log(
  `[monitor] watching GoodVault at ${VAULT_ADDRESS} for security-relevant events...`,
);
