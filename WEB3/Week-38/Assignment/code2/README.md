# How to Build.

```
1. Scaffold, adding ethers this time.

     mkdir mpc-medium && cd mpc-medium
     npm init -y
     npm install ethers@6.17.0
     npm install -D typescript tsx @types/node

2. Copy finiteField.ts and shamir.ts from Easy unchanged, and add
   M521 to finiteField.ts.

3. Create src/keyRecovery.ts from the Solution below.

4. Run it.

     npx tsx src/keyRecovery.ts
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-38/Assignment/code2/mpc-medium$ npx tsx src/keyRecovery.ts
Original address: 0xBe5b4F0a5B85d436FB918fCD8611aBc2eDaD90eD

Split into 5 shares, threshold 3. Nobody holding fewer than 3 shares learns anything (Concept 3).

Reconstructed (shares 1,2,3): 0xBe5b4F0a5B85d436FB918fCD8611aBc2eDaD90eD
Reconstructed (shares 3,4,5): 0xBe5b4F0a5B85d436FB918fCD8611aBc2eDaD90eD
Both match original: true

Reconstructed from only 2 shares (below threshold): 0x2Cb869Ef47858a7516f56B1e629dDA283d83E51b
Matches original: false — should be false
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-38/Assignment/code2/mpc-medium$ npm start

> mpc-medium@1.0.0 start
> tsx src/keyRecovery.ts

Original address: 0xC639c0867114a8A3E5CC8C2C6c5D54b4cAb29BF9

Split into 5 shares, threshold 3. Nobody holding fewer than 3 shares learns anything (Concept 3).

Reconstructed (shares 1,2,3): 0xC639c0867114a8A3E5CC8C2C6c5D54b4cAb29BF9
Reconstructed (shares 3,4,5): 0xC639c0867114a8A3E5CC8C2C6c5D54b4cAb29BF9
Both match original: true

Reconstructed from only 2 shares (below threshold): 0xE4Da8C094F69B86c37D7D6CCc9a96fb8F53ec371
Matches original: false — should be false
```
