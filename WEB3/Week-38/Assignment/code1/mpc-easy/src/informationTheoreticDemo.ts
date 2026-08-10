import { splitSecret } from "./shamir";
import { mod, modInverse, M127 } from "./finiteField";

const realSecret = 999n;
const shares = splitSecret(realSecret, 2, 3, M127); // threshold = 2 — a straight line
const oneShare = shares[0];

console.log(
  `Real secret: ${realSecret} (never revealed by a single share alone)`,
);
console.log(`One real share: x=${oneShare.x}, y=${oneShare.y}\n`);

// For ANY candidate secret, a valid line through (0, candidate) and the one real point exists —
// meaning this single share is EQUALLY consistent with every one of them (Concept 3's own claim).
const candidates = [0n, 1n, 123n, 999n, 50000n];
for (const candidate of candidates) {
  // slope of the unique line through (0, candidate) and (oneShare.x, oneShare.y)
  const slope = mod(
    (oneShare.y - candidate) * modInverse(oneShare.x, M127),
    M127,
  );
  console.log(
    `Candidate secret ${candidate}: a valid line exists (slope=${slope}) through the SAME one share`,
  );
}
