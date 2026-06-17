import { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

import "@solana/wallet-adapter-react-ui/styles.css";

function MessageSigner() {
  const { publicKey, signMessage } = useWallet();
  const [message, setMessage] = useState(
    "Week 12 — signing without spending a single lamport.",
  );
  const [result, setResult] = useState<string>("");

  async function handleSign(): Promise<void> {
    if (!publicKey || !signMessage) {
      setResult("Connect a wallet that supports message signing first.");
      return;
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signature = await signMessage(encodedMessage);

    // Verifying an Ed25519 signature (Week 3, Concepts 4-5) — this is
    // exactly the same algorithm the wallet used to produce it,
    // checked independently, client-side, with no server involved.
    const verified = nacl.sign.detached.verify(
      encodedMessage,
      signature,
      publicKey.toBytes(),
    );

    setResult(
      `Signature (base58): ${bs58.encode(signature)}\n` +
        `Verified client-side with tweetnacl: ${verified}`,
    );
  }

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "420px" }}
      />
      <button onClick={handleSign}>Sign Message</button>
      <pre>{result}</pre>
    </div>
  );
}

function App() {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <h1>Week 12 : Assignment 2 (Message Signer).</h1>
          <WalletMultiButton />
          <MessageSigner />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
