import { splitSecret, reconstructSecret, Share } from "./shamir";
import { M127 } from "./finiteField";

const secret = 42n;
const shares = splitSecret(secret, 3, 5, M127);
console.log("Generated 5 shares for secret 42, threshold 3:");
shares.forEach((s) => console.log(`  share ${s.x}: ${s.y}`));

const firstThree: Share[] = [shares[0], shares[1], shares[2]];
const lastThree: Share[] = [shares[2], shares[3], shares[4]];

console.log(
  "\nReconstructed from shares 1,2,3:",
  reconstructSecret(firstThree, M127),
);
console.log(
  "Reconstructed from shares 3,4,5:",
  reconstructSecret(lastThree, M127),
);
