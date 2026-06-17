import { useEffect, useMemo, useState } from "react";
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
import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

function BalanceDisplay() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    // Captured as a fresh const right after the null check, so
    // TypeScript treats it as definitely non-null inside the closure
    // below, no `!` assertions needed anywhere.
    const owner = publicKey;
    let cancelled = false;

    async function fetchBalance(): Promise<void> {
      const lamports = await connection.getBalance(owner);
      if (!cancelled) {
        setBalance(lamports / LAMPORTS_PER_SOL);
      }
    }

    fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [publicKey, connection]);

  if (!connected || !publicKey) {
    return <p>No wallet connected yet.</p>;
  }

  return (
    <div>
      <p>Connected address: {publicKey.toBase58()}</p>
      <p>Balance: {balance === null ? "loading..." : `${balance} SOL`}</p>
    </div>
  );
}

function App() {
  // useMemo so this isn't recomputed on every render for no reason —
  // the endpoint never actually changes during the app's lifetime.
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* Empty wallets array is intentional — every major wallet now
          registers itself automatically via the Wallet Standard
          (Concept 2), nothing needs to be listed here by hand. */}
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <h1>Week 12 : Assignment 1 (Wallet Connect & Display). </h1>
          <WalletMultiButton />
          <BalanceDisplay />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
