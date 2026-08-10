import { ethers } from "ethers";
import { splitSecret, reconstructSecret, Share } from "./shamir";
import { M521 } from "./finiteField";

const originalWallet = ethers.Wallet.createRandom();
const secretKey = BigInt(originalWallet.privateKey); // the REAL private key, as a bigint (Concept 6)

console.log("Original address:", originalWallet.address);

const shares = splitSecret(secretKey, 3, 5, M521);
console.log(
  `\nSplit into 5 shares, threshold 3. Nobody holding fewer than 3 shares learns anything (Concept 3).`,
);

function reconstructWallet(chosenShares: Share[]): string {
  const reconstructedValue = reconstructSecret(chosenShares, M521);
  // A CORRECT reconstruction is always < 2^256 already (it recovers the real key), so this is a
  // no-op for it — but an INSUFFICIENT-shares reconstruction can land anywhere up to M521, far
  // wider than 256 bits, which would make `new ethers.Wallet(...)` throw outright rather than
  // silently return a wrong address. Truncating keeps the "wrong answer, not an error" behavior
  // Test Case 3 below actually demonstrates, matching what a real, careless recovery attempt would
  // produce in practice.
  const keyAsUint256 = reconstructedValue % 2n ** 256n;
  const hexKey = "0x" + keyAsUint256.toString(16).padStart(64, "0");
  return new ethers.Wallet(hexKey).address;
}

const fromFirstThree = reconstructWallet([shares[0], shares[1], shares[2]]);
const fromLastThree = reconstructWallet([shares[2], shares[3], shares[4]]);

console.log("\nReconstructed (shares 1,2,3):", fromFirstThree);
console.log("Reconstructed (shares 3,4,5):", fromLastThree);
console.log(
  "Both match original:",
  fromFirstThree === originalWallet.address &&
    fromLastThree === originalWallet.address,
);

// The insufficient-shares gotcha, with REAL stakes this time (Concept 9's own honesty applies here too —
// this reconstructs the WHOLE key in one place, exactly the backup/recovery use case, not live signing).
const fromOnlyTwo = reconstructWallet([shares[0], shares[1]]);
console.log(
  "\nReconstructed from only 2 shares (below threshold):",
  fromOnlyTwo,
);
console.log(
  "Matches original:",
  fromOnlyTwo === originalWallet.address,
  "— should be false",
);
