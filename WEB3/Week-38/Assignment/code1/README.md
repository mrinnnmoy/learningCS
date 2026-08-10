# How to Build.

```
1. Scaffold.

     mkdir mpc-easy && cd mpc-easy
     npm init -y
     npm install -D typescript tsx @types/node

2. Create all four src/ files from the Solution below.

3. Run each demo script directly.

     npx tsx src/splitAndReconstruct.ts
     npx tsx src/informationTheoreticDemo.ts
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-38/Assignment/code1/mpc-easy$ npx tsx src/splitAndReconstruct.ts
Generated 5 shares for secret 42, threshold 3:
  share 1: 82954745086438923214991845483997361590
  share 2: 42348405607727529389115627569159339924
  share 3: 48322165024335050254058649971370040771
  share 4: 100876023336261485809820912690629464131
  share 5: 29868797083037604324715112011053504277

Reconstructed from shares 1,2,3: 42n
Reconstructed from shares 3,4,5: 42n
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-38/Assignment/code1/mpc-easy$ npx tsx src/informationTheoreticDemo.ts
Real secret: 999 (never revealed by a single share alone)
One real share: x=1, y=3077606236786156866486835135924288926

Candidate secret 0: a valid line exists (slope=3077606236786156866486835135924288926) through the SAME one share
Candidate secret 1: a valid line exists (slope=3077606236786156866486835135924288925) through the SAME one share
Candidate secret 123: a valid line exists (slope=3077606236786156866486835135924288803) through the SAME one share
Candidate secret 999: a valid line exists (slope=3077606236786156866486835135924287927) through the SAME one share
Candidate secret 50000: a valid line exists (slope=3077606236786156866486835135924238926) through the SAME one share
```
