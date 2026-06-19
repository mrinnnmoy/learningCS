import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { Keypair, PublicKey } from "@solana/web3.js";

// Exactly Week 12's loadLocalWallet pattern — we only ever read
// .publicKey below, nothing this week signs anything.
function loadLocalWalletPublicKey(): PublicKey {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey).publicKey;
}

// A real, deployed program's address — used only as a realistic
// programId to derive against, never actually invoked this week.
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

function main(): void {
  const seeds = [Buffer.from("demo-seed")];

  // Deterministic (Concept 4): identical seeds and programId, called
  // twice, with no network involved either time.
  const [pdaFirstCall, bumpFirstCall] = PublicKey.findProgramAddressSync(
    seeds,
    MEMO_PROGRAM_ID,
  );
  const [pdaSecondCall, bumpSecondCall] = PublicKey.findProgramAddressSync(
    seeds,
    MEMO_PROGRAM_ID,
  );

  console.log("Seed:", seeds[0].toString());
  console.log("Program ID:", MEMO_PROGRAM_ID.toBase58());

  console.log(
    "\nFirst derivation: ",
    pdaFirstCall.toBase58(),
    " bump:",
    bumpFirstCall,
  );
  console.log(
    "Second derivation:",
    pdaSecondCall.toBase58(),
    " bump:",
    bumpSecondCall,
  );
  console.log(
    "Identical both times:",
    pdaFirstCall.equals(pdaSecondCall) && bumpFirstCall === bumpSecondCall,
  );

  // Off-curve, proven directly (Concept 2).
  console.log(
    "\nIs the derived PDA a valid on-curve public key?",
    PublicKey.isOnCurve(pdaFirstCall.toBytes()),
  );

  const myWallet = loadLocalWalletPublicKey();
  console.log("Your wallet address:", myWallet.toBase58());
  console.log(
    "Is your own real wallet address on-curve?",
    PublicKey.isOnCurve(myWallet.toBytes()),
  );
}

main();
