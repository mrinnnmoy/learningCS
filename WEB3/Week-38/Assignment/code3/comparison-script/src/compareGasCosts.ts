import { ethers } from "ethers";
import { splitSecret, reconstructSecret } from "./shamir";
import { M521 } from "./finiteField";

const RPC_URL = "http://127.0.0.1:8545";

const MULTISIG_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const OWNER_0_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const OWNER_1_KEY =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const RECIPIENT = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

const MULTISIG_ABI = [
  "function submit(address to, uint256 value, bytes data) external returns (uint256)",
  "function confirm(uint256 txId) external",
  "function execute(uint256 txId) external",

  "event Submitted(uint256 indexed txId, address indexed to, uint256 value)",
  "event Confirmed(uint256 indexed txId, address indexed owner)",
  "event Executed(uint256 indexed txId)",
];

/**
 * Complete 2-of-3 multisig flow:
 *
 * 1. submit
 * 2. confirm by owner 0
 * 3. confirm by owner 1
 * 4. execute
 *
 * Returns the total gasUsed across all four transactions.
 */
async function multisigFlow(provider: ethers.JsonRpcProvider): Promise<bigint> {
  const owner0 = new ethers.Wallet(OWNER_0_KEY, provider);

  const owner1 = new ethers.Wallet(OWNER_1_KEY, provider);

  console.log("\n========================================");
  console.log("MULTISIG FLOW");
  console.log("========================================");

  console.log("Owner 0:", owner0.address);
  console.log("Owner 1:", owner1.address);

  // ------------------------------------------------------------
  // Get current mined nonces.
  //
  // Owner 0 performs:
  //   submit
  //   confirm
  //   execute
  //
  // Owner 1 performs:
  //   confirm
  //
  // The explicit nonce management allows this script to be rerun
  // against the same Anvil instance.
  // ------------------------------------------------------------

  let owner0Nonce = await provider.getTransactionCount(
    owner0.address,
    "latest",
  );

  let owner1Nonce = await provider.getTransactionCount(
    owner1.address,
    "latest",
  );

  console.log("Owner 0 nonce:", owner0Nonce);
  console.log("Owner 1 nonce:", owner1Nonce);

  const multisig = new ethers.Contract(MULTISIG_ADDRESS, MULTISIG_ABI, owner0);

  const multisigAsOwner1 = new ethers.Contract(
    MULTISIG_ADDRESS,
    MULTISIG_ABI,
    owner1,
  );

  let totalGas = 0n;

  // ============================================================
  // 1. SUBMIT
  // ============================================================

  console.log("\n--- 1. SUBMIT ---");

  const submitTx = await multisig.submit(
    RECIPIENT,
    ethers.parseEther("1"),
    "0x",
    {
      nonce: owner0Nonce,
    },
  );

  const submitReceipt = await submitTx.wait();

  if (!submitReceipt) {
    throw new Error("Submit transaction did not produce a receipt");
  }

  totalGas += submitReceipt.gasUsed;
  owner0Nonce++;

  console.log("submit tx:", submitReceipt.hash);
  console.log("submit gas:", submitReceipt.gasUsed.toString());

  // ------------------------------------------------------------
  // Find the actual txId from the Submitted event.
  //
  // IMPORTANT:
  //
  // Do NOT hard-code txId = 0.
  //
  // The first execution creates txId 0.
  // The next execution creates txId 1.
  // Then txId 2, etc.
  //
  // Therefore the event emitted by submit() is the reliable way
  // to discover the transaction ID created by THIS run.
  // ------------------------------------------------------------

  let txId: bigint | undefined;

  for (const log of submitReceipt.logs) {
    try {
      const parsed = multisig.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (parsed?.name === "Submitted") {
        txId = parsed.args[0] as bigint;
        break;
      }
    } catch {
      // Ignore logs that don't match our ABI.
    }
  }

  if (txId === undefined) {
    throw new Error("Could not find Submitted event in submit receipt");
  }

  console.log("created multisig txId:", txId.toString());

  // ============================================================
  // 2. CONFIRM — OWNER 0
  // ============================================================

  console.log("\n--- 2. CONFIRM — OWNER 0 ---");

  const confirm0Tx = await multisig.confirm(txId, {
    nonce: owner0Nonce,
  });

  const confirm0Receipt = await confirm0Tx.wait();

  if (!confirm0Receipt) {
    throw new Error("Owner 0 confirmation did not produce a receipt");
  }

  totalGas += confirm0Receipt.gasUsed;
  owner0Nonce++;

  console.log("confirm 0 tx:", confirm0Receipt.hash);

  console.log("confirm 0 gas:", confirm0Receipt.gasUsed.toString());

  // ============================================================
  // 3. CONFIRM — OWNER 1
  // ============================================================

  console.log("\n--- 3. CONFIRM — OWNER 1 ---");

  const confirm1Tx = await multisigAsOwner1.confirm(txId, {
    nonce: owner1Nonce,
  });

  const confirm1Receipt = await confirm1Tx.wait();

  if (!confirm1Receipt) {
    throw new Error("Owner 1 confirmation did not produce a receipt");
  }

  totalGas += confirm1Receipt.gasUsed;
  owner1Nonce++;

  console.log("confirm 1 tx:", confirm1Receipt.hash);

  console.log("confirm 1 gas:", confirm1Receipt.gasUsed.toString());

  // ============================================================
  // 4. EXECUTE
  // ============================================================

  console.log("\n--- 4. EXECUTE ---");

  const executeTx = await multisig.execute(txId, {
    nonce: owner0Nonce,
  });

  const executeReceipt = await executeTx.wait();

  if (!executeReceipt) {
    throw new Error("Execute transaction did not produce a receipt");
  }

  totalGas += executeReceipt.gasUsed;
  owner0Nonce++;

  console.log("execute tx:", executeReceipt.hash);

  console.log("execute gas:", executeReceipt.gasUsed.toString());

  console.log("\nMultisig txId:", txId.toString());

  console.log("Multisig total gas:", totalGas.toString());

  return totalGas;
}

/**
 * Concept 9's deliberately simplified "MPC-style"
 * reconstruct-then-sign demonstration.
 *
 * IMPORTANT HONEST BOUNDARY:
 *
 * This is NOT a production MPC or threshold-signing protocol.
 *
 * We split a private key using Shamir Secret Sharing and then
 * reconstruct the COMPLETE private key from two shares in one
 * place.
 *
 * A real production threshold-signing protocol would NOT
 * reconstruct the complete private key at one party.
 *
 * Instead, participants would cooperate cryptographically to
 * produce a valid signature while the complete private key
 * never exists in one location.
 *
 * This assignment deliberately uses reconstruct-then-sign
 * because we are measuring the resulting ON-CHAIN FOOTPRINT.
 */
async function mpcStyleFlow(provider: ethers.JsonRpcProvider): Promise<bigint> {
  console.log("\n========================================");
  console.log("MPC-STYLE / RECONSTRUCT-THEN-SIGN");
  console.log("========================================");

  // ------------------------------------------------------------
  // Create a fresh private key.
  // ------------------------------------------------------------

  const originalWallet = ethers.Wallet.createRandom();

  const secretKey = BigInt(originalWallet.privateKey);

  console.log("Original wallet:", originalWallet.address);

  // ------------------------------------------------------------
  // Split the private key:
  //
  // threshold = 2
  // total shares = 3
  //
  // Any two shares can reconstruct the secret.
  // ------------------------------------------------------------

  const shares = splitSecret(secretKey, 2, 3, M521);

  console.log("Generated 3 Shamir shares.");

  // ------------------------------------------------------------
  // IMPORTANT HONEST-BOUNDARY MOMENT
  //
  // A real production threshold-signing protocol would NEVER
  // reconstruct the complete private key here.
  //
  // This assignment deliberately does so because it is measuring
  // a simplified "reconstruct then sign" model.
  //
  // The complete private key exists in this script's memory after
  // this operation.
  // ------------------------------------------------------------

  const reconstructedKey = reconstructSecret([shares[0], shares[1]], M521);

  const hexKey = "0x" + reconstructedKey.toString(16).padStart(64, "0");

  const reconstructedWallet = new ethers.Wallet(hexKey, provider);

  console.log("Reconstructed wallet:", reconstructedWallet.address);

  // ------------------------------------------------------------
  // Verify reconstruction.
  // ------------------------------------------------------------

  if (
    reconstructedWallet.address.toLowerCase() !==
    originalWallet.address.toLowerCase()
  ) {
    throw new Error("Reconstructed private key does not match original wallet");
  }

  console.log("Key reconstruction verified.");

  // ------------------------------------------------------------
  // Fund the reconstructed wallet.
  //
  // This funding transaction is NOT included in the comparison.
  //
  // We only measure the actual ordinary transaction produced
  // by the reconstructed wallet.
  // ------------------------------------------------------------

  console.log("\nFunding reconstructed wallet...");

  const funder = new ethers.Wallet(OWNER_0_KEY, provider);

  const fundingTx = await funder.sendTransaction({
    to: reconstructedWallet.address,
    value: ethers.parseEther("2"),
  });

  const fundingReceipt = await fundingTx.wait();

  if (!fundingReceipt) {
    throw new Error("Funding transaction did not produce a receipt");
  }

  console.log("Funding tx:", fundingReceipt.hash);

  // ------------------------------------------------------------
  // ONE ORDINARY EOA TRANSACTION
  //
  // From the blockchain's perspective this is just a normal
  // EOA -> EOA transaction.
  //
  // There is no multisig contract.
  // There are no confirmation transactions.
  // There are no coordination events.
  //
  // The blockchain sees the resulting transaction/signature,
  // not the Shamir-share process that happened off-chain.
  // ------------------------------------------------------------

  const tx = await reconstructedWallet.sendTransaction({
    to: RECIPIENT,
    value: ethers.parseEther("1"),
  });

  const receipt = await tx.wait();

  if (!receipt) {
    throw new Error("MPC-style transaction did not produce a receipt");
  }

  console.log("\nMPC-style transaction:", receipt.hash);

  console.log("MPC-style gas:", receipt.gasUsed.toString());

  console.log("MPC-style from:", receipt.from);

  console.log("MPC-style to:", receipt.to);

  console.log("MPC-style logs:", receipt.logs.length);

  return receipt.gasUsed;
}

/**
 * Main comparison.
 */
async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const network = await provider.getNetwork();

  console.log("========================================");
  console.log("WEEK 38 — MULTISIG VS MPC-STYLE");
  console.log("========================================");

  console.log("RPC:", RPC_URL);

  console.log("Chain ID:", network.chainId.toString());

  console.log("Multisig:", MULTISIG_ADDRESS);

  console.log("Recipient:", RECIPIENT);

  // ------------------------------------------------------------
  // Make sure this is Anvil.
  // ------------------------------------------------------------

  if (network.chainId !== 31337n) {
    throw new Error(`Expected Anvil chain ID 31337, got ${network.chainId}`);
  }

  // ------------------------------------------------------------
  // Run multisig flow.
  // ------------------------------------------------------------

  const multisigGas = await multisigFlow(provider);

  // ------------------------------------------------------------
  // Run MPC-style flow.
  // ------------------------------------------------------------

  const mpcStyleGas = await mpcStyleFlow(provider);

  // ------------------------------------------------------------
  // Calculate ratio.
  // ------------------------------------------------------------

  const ratio = Number(multisigGas) / Number(mpcStyleGas);

  // ------------------------------------------------------------
  // Final results.
  // ------------------------------------------------------------

  console.log("\n========================================");
  console.log("FINAL COMPARISON");
  console.log("========================================");

  console.log(
    "Multisig flow — 4 separate transactions:",
    multisigGas.toString(),
    "gas",
  );

  console.log(
    "MPC-style flow — 1 ordinary transaction:",
    mpcStyleGas.toString(),
    "gas",
  );

  console.log("Ratio:", ratio.toFixed(1), "x more gas for the multisig flow");

  console.log("\nOn-chain footprint:");

  console.log("  Multisig:");

  console.log("    submit → confirm → confirm → execute");

  console.log("  MPC-style:");

  console.log("    one ordinary EOA transaction");

  console.log("\nImportant limitation:");

  console.log("  The MPC-style side reconstructs the complete");

  console.log("  private key in one place before signing.");

  console.log("  This demonstrates the on-chain footprint");

  console.log("  comparison, NOT production MPC signing.");
}

// ------------------------------------------------------------
// Error handling
// ------------------------------------------------------------

main().catch((error) => {
  console.error("\nScript failed:");
  console.error(error);
  process.exit(1);
});
