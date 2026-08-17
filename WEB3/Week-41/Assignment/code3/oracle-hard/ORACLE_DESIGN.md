# Oracle Design. (Chainlink Guarded Lending Pool)

## 1. Problem

The vulnerable lending pool prices collateral using the AMM's current spot price:

```solidity
priceSource.spotPriceBPerA()
```

This price can be manipulated inside the same transaction using a flash loan.

The attacker:

1. Deposits a small amount of real collateral.
2. Takes a large flash loan of the borrow token.
3. Swaps the borrowed tokens into the AMM.
4. Manipulates the AMM reserves and spot price.
5. Uses the inflated spot price to make the collateral appear much more valuable.
6. Borrows an oversized amount from the lending pool.
7. Repays the flash loan.
8. Keeps the remaining borrowed funds as profit.

The core problem is that the lending pool trusts a price source that the attacker can manipulate in the same transaction.

---

## 2. Vulnerable Design

The original `VulnerableLendingPool` uses `SimplePool` as its oracle:

```solidity
SimplePool public immutable priceSource;
```

During borrowing, it calculates the collateral value using:

```solidity
uint256 collateralValue = (collateralDeposited[msg.sender] *
    priceSource.spotPriceBPerA()) / 1e18;
```

The `SimplePool` price is calculated directly from its current reserves:

```solidity
function spotPriceBPerA() external view returns (uint256) {
    return (reserveB * 1e18) / reserveA;
}
```

Because the reserves can be changed before the lending pool reads the price, the attacker can temporarily manipulate the oracle.

---

## 3. Attack Flow

The unchanged `FlashLoanAttacker` performs the following sequence:

```text
Attacker
   |
   | 1. Deposit 10 tokenA
   v
Vulnerable Lending Pool
   |
   | 2. Flash loan 10,000 tokenB
   v
Flash Loan Provider
   |
   | 3. Swap 10,000 tokenB for tokenA
   v
SimplePool
   |
   | 4. Spot price becomes heavily inflated
   v
Vulnerable Lending Pool
   |
   | 5. Borrow using manipulated price
   v
Attacker
   |
   | 6. Repay flash loan
   v
Flash Loan Provider
```

The important point is that the attacker manipulates the AMM before the lending pool reads its price.

---

## 4. Vulnerable Test

The vulnerable version is tested with:

```solidity
function testExploit_UnchangedAttackStillDrainsVulnerablePool() public
```

The test deploys:

```solidity
VulnerableLendingPool lendingPool = new VulnerableLendingPool(
    address(tokenA),
    address(tokenB),
    address(pool)
);
```

The lending pool is funded with enough `tokenB` for the exploit:

```solidity
tokenB.mint(address(lendingPool), 2_000_000 ether);
```

The attacker is then created using the same `FlashLoanAttacker` contract:

```solidity
FlashLoanAttacker attacker = new FlashLoanAttacker(
    address(provider),
    address(pool),
    address(lendingPool),
    address(tokenA),
    address(tokenB)
);
```

The attack is executed with:

```solidity
attacker.attack(10 ether, 10 ether);
```

The attacker deposits only `10 tokenA`, but uses a `10,000 tokenB` flash loan to manipulate the AMM price.

---

## 5. Debugging Issue

Initially, the vulnerable test failed with:

```text
panic: arithmetic underflow or overflow (0x11)
```

The detailed trace showed the failure happening here:

```text
FlashLoanAttacker::onFlashLoan()
    |
    └─ MockERC20::transfer(FlashLoanProvider, 10000 ether)
       └─ panic: arithmetic underflow or overflow (0x11)
```

The reason was that the attacker had successfully borrowed only about:

```text
1,209 tokenB
```

while trying to repay:

```text
10,000 tokenB
```

The attacker therefore did not have enough `tokenB` to repay the flash loan.

The lending pool needed enough `tokenB` liquidity so that the vulnerable attack could actually complete.

After funding the vulnerable lending pool with:

```solidity
tokenB.mint(address(lendingPool), 2_000_000 ether);
```

the original attack succeeds.

---

## 6. The Attacker Was Not Changed

The important part of this assignment is that the attack contract remains unchanged.

The original attack logic is:

```solidity
pool.swapBForA(amount);

uint256 inflatedValue = (lendingPool.collateralDeposited(
    address(this)
) * pool.spotPriceBPerA()) / 1e18;

lendingPool.borrow(inflatedValue);

tokenB.transfer(address(provider), amount);
```

This demonstrates that the vulnerability exists in the lending pool's oracle design rather than in the attacker implementation.

The same `FlashLoanAttacker` is used against both:

- `VulnerableLendingPool`
- `ChainlinkGuardedLendingPool`

---

## 7. Chainlink-Based Fix

The fixed lending pool is:

```solidity
ChainlinkGuardedLendingPool
```

Instead of reading the AMM spot price, it reads a Chainlink-style price feed.

The test uses:

```solidity
MockV3Aggregator priceFeed = new MockV3Aggregator(
    8,
    1e8
);
```

This represents:

```text
Decimals: 8
Price:    $1.00
```

The important property is that the price does not come from the manipulable `SimplePool`.

---

## 8. Fixed Design

The fixed architecture is:

```text
                 +----------------------+
                 |    Chainlink Feed    |
                 |      $1.00 price     |
                 +----------+-----------+
                            |
                            | trusted price
                            v
                     +-------------+
                     | Chainlink-  |
                     | Guarded Pool|
                     +-------------+
                            ^
                            |
                          Attacker
                            |
                            v
                     +-------------+
                     | SimplePool  |
                     |    AMM      |
                     +-------------+
```

The attacker can still manipulate `SimplePool`.

However, the lending pool no longer trusts that manipulated price.

Therefore:

```text
AMM manipulation
       |
       X
       |
Chainlink price remains unchanged
       |
       v
Collateral value remains honest
       |
       v
Oversized borrow rejected
```

---

## 9. Fixed Test

The fixed version is tested with:

```solidity
function testFix_IdenticalAttackFailsAgainstRealChainlinkShapedOracle()
    public
```

The Chainlink-style oracle is created with:

```solidity
MockV3Aggregator priceFeed = new MockV3Aggregator(
    8,
    1e8
);
```

The guarded lending pool is deployed with:

```solidity
ChainlinkGuardedLendingPool guardedPool =
    new ChainlinkGuardedLendingPool(
        address(tokenA),
        address(tokenB),
        address(priceFeed)
    );
```

The exact same attacker contract is then used:

```solidity
FlashLoanAttacker attacker = new FlashLoanAttacker(
    address(provider),
    address(pool),
    address(guardedPool),
    address(tokenA),
    address(tokenB)
);
```

The attack is attempted with:

```solidity
attacker.attack(10_000 ether, 10 ether);
```

The test expects the transaction to revert:

```solidity
vm.expectRevert();
attacker.attack(10_000 ether, 10 ether);
```

---

## 10. Why the Attack Fails

The attacker still successfully manipulates the AMM.

The trace confirms:

```text
SimplePool::spotPriceBPerA()
    -> 120.999999999999999999
```

So the AMM price is successfully manipulated.

However, the guarded lending pool does not use this price.

Instead, it reads:

```text
MockV3Aggregator::latestRoundData()
    -> 1e8
```

which represents:

```text
$1.00
```

The attacker requests approximately:

```text
1,209 tokenB
```

against:

```text
10 tokenA
```

The Chainlink price values the collateral honestly at approximately:

```text
10 tokenB
```

Therefore the oversized borrow fails with:

```text
exceeds collateral value
```

The flash-loan transaction reverts.

---

## 11. Detailed Fixed-Test Flow

The fixed test executes the following sequence:

```text
FlashLoanAttacker::attack(10000 ether, 10 ether)
    |
    +-- Deposit 10 tokenA
    |
    +-- Flash loan 10000 tokenB
    |
    +-- Manipulate SimplePool
    |
    +-- SimplePool spot price becomes ~121 tokenB/tokenA
    |
    +-- Request ~1209 tokenB borrow
    |
    +-- ChainlinkGuardedLendingPool reads Chainlink price
    |
    +-- Chainlink price = $1.00
    |
    +-- Collateral value = 10 tokenB
    |
    +-- Borrow rejected
    |
    +-- Transaction reverted
```

The attacker receives no profit.

The final assertion confirms:

```solidity
assertEq(tokenB.balanceOf(attackerOwner), 0);
```

---

## 12. Final Test Results

The final command was:

```bash
forge test -vv
```

The final result was:

```text
Ran 2 tests for test/ChainlinkGuardedAttack.t.sol:ChainlinkGuardedAttackTest
[PASS] testExploit_UnchangedAttackStillDrainsVulnerablePool() (gas: 1685466)
[PASS] testFix_IdenticalAttackFailsAgainstRealChainlinkShapedOracle() (gas: 2361226)

Suite result: ok. 2 passed; 0 failed; 0 skipped
```

Final result:

```text
2 tests passed
0 tests failed
```

This confirms both expected behaviors:

- The vulnerable lending pool remains exploitable.
- The Chainlink-guarded lending pool rejects the identical attack.

---

## 13. Security Comparison

| Design                        | Price Source                  | Manipulable in Same TX? | Attack Result   |
| ----------------------------- | ----------------------------- | ----------------------: | --------------- |
| `VulnerableLendingPool`       | `SimplePool.spotPriceBPerA()` |                     Yes | Attack succeeds |
| `ChainlinkGuardedLendingPool` | Chainlink-style feed          |                      No | Attack fails    |

The vulnerable design trusts an attacker-manipulable market state.

The fixed design uses an external oracle whose price is independent of the manipulated AMM.

---

## 14. Concept 6 — Oracle Manipulation

This assignment demonstrates **Concept 6: Oracle Manipulation**.

The vulnerable pattern is:

```solidity
uint256 collateralValue =
    collateralAmount * AMMSpotPrice / 1e18;
```

when the AMM spot price can be manipulated by the user during the same transaction.

The attacker controls the AMM state temporarily through a flash loan.

Therefore, the lending protocol can be tricked into believing that a small amount of collateral is worth much more than its real value.

---

## 15. Concept 7 — Chainlink-Style External Oracle

The fixed contract demonstrates **Concept 7: Using an external Chainlink-style oracle**.

The test uses:

```solidity
MockV3Aggregator
```

with:

```text
Decimals: 8
Price:    1e8
```

which represents:

```text
$1.00
```

The important architectural difference is:

```text
Lending Pool
     |
     v
External Oracle
     |
     v
Trusted Price
```

instead of:

```text
Lending Pool
     |
     v
AMM Spot Price
     |
     v
Attacker-Manipulable Reserves
```

---

## 16. Vulnerable Architecture

```text
Flash Loan
    |
    v
Attacker
    |
    v
SimplePool
    |
    | Manipulate reserves
    v
Manipulated Spot Price
    |
    | Trusted by
    v
VulnerableLendingPool
    |
    v
Oversized Borrow
```

---

## 17. Fixed Architecture

```text
Flash Loan
    |
    v
Attacker
    |
    v
SimplePool
    |
    | Manipulate reserves
    v
Manipulated Spot Price
         |
         X
         |
         | Not used by lending pool
         |
         v

Chainlink Price Feed
         |
         | Trusted price
         v
ChainlinkGuardedLendingPool
         |
         v
Honest Collateral Valuation
         |
         v
Oversized Borrow Rejected
```

---

## 18. Security Principle

The main security principle is:

> Do not use an attacker-manipulable AMM spot price as the sole oracle for lending decisions.

A flash loan gives an attacker enough temporary capital to move AMM reserves significantly.

If the lending protocol reads the AMM price during that same transaction, it can make a lending decision using a false price.

An independent oracle breaks this attack path.

---

## 19. Important Difference Between the Two Contracts

### Vulnerable Contract

```solidity
uint256 collateralValue = (
    collateralDeposited[msg.sender] *
    priceSource.spotPriceBPerA()
) / 1e18;
```

The collateral value depends directly on the AMM.

### Fixed Contract

The `ChainlinkGuardedLendingPool` obtains the price from the Chainlink-style aggregator instead of the AMM.

Conceptually:

```solidity
uint256 collateralValue =
    collateralDeposited[msg.sender] * trustedPrice / priceScale;
```

The exact price used by the lending pool therefore cannot be changed by manipulating `SimplePool` during the attack.

---

## 20. Final Conclusion

The vulnerable lending pool can be drained because it uses a manipulable AMM spot price as its oracle.

The attacker starts with only a small amount of real collateral and uses a flash loan to temporarily manipulate the AMM.

The vulnerable pool reads the manipulated price and accepts an oversized borrow.

The fixed `ChainlinkGuardedLendingPool` removes this dependency on the AMM spot price.

The exact same `FlashLoanAttacker` can still manipulate the AMM, but the manipulated price no longer affects the lending pool's collateral valuation.

The final tests prove the intended behavior:

```text
Vulnerable Pool:
Attack succeeds

Chainlink Guarded Pool:
Same attack fails
```

Therefore, the oracle design successfully prevents the flash-loan-based price manipulation attack demonstrated in this assignment.
