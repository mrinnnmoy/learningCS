import { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  clusterApiUrl,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

function SelfTransfer() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState<string>("idle");
  const [balance, setBalance] = useState<number | null>(null);

  async function refreshBalance(owner: PublicKey): Promise<void> {
    const lamports = await connection.getBalance(owner);
    setBalance(lamports / LAMPORTS_PER_SOL);
  }

  async function handleSend(): Promise<void> {
    if (!publicKey) {
      setStatus("Connect a wallet first.");
      return;
    }

    setStatus("Building transaction...");

    // A transfer TO OURSELVES — costs only the network fee, and never
    // depends on a second party or the devnet faucet (Concept 8).
    const transferIx = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey,
      lamports: 1000,
    });

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    const message = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [transferIx],
    }).compileToV0Message();
    const transaction = new VersionedTransaction(message);

    setStatus("Simulating...");

    // simulateTransaction does NOT require a valid signature by
    // default — which is exactly why we can preview this BEFORE ever
    // asking the wallet to sign. Catch a doomed transaction here,
    // and the user never sees an approval popup for it at all.
    const simulation = await connection.simulateTransaction(transaction);
    if (simulation.value.err) {
      setStatus(
        `Simulation failed, nothing was sent: ${JSON.stringify(simulation.value.err)}`,
      );
      return;
    }
    setStatus(
      `Simulation succeeded (${simulation.value.unitsConsumed} compute units). Requesting your approval...`,
    );

    try {
      const signature = await sendTransaction(transaction, connection);
      setStatus(`Sent. Confirming ${signature}...`);

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      setStatus(`Confirmed: ${signature}`);
      await refreshBalance(publicKey);
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      setStatus(`Send failed: ${reason}`);
    }
  }

  return (
    <div>
      <button onClick={handleSend} disabled={!publicKey}>
        Send 1000 lamports to myself
      </button>
      <p>Status: {status}</p>
      <p>Balance: {balance === null ? "not yet checked" : `${balance} SOL`}</p>
    </div>
  );
}

function App() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <h1>Week 12 : Assignment 3 (Build, Simulate, Send & Confirm).</h1>
          <WalletMultiButton />
          <SelfTransfer />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
