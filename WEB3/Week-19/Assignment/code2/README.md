# How to Build.

```
1. Start from Easy's already-existing staking-program/ folder.

2. Replace tests/staking-program.ts's scaffolded placeholder with the
   version in the Solution section below.

3. Run the test suite.

   Run:
     anchor test --skip-deploy

   This deploys to a fresh local validator (Concept 9's third tier)
   and runs the test, including its real-time wait, expect this to
   take a few seconds longer than Easy's single-instruction runs did.
```