// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {SimplePool} from "../src/SimplePool.sol";
import {FlashLoanProvider} from "../src/FlashLoanProvider.sol";
import {VulnerableLendingPool} from "../src/VulnerableLendingPool.sol";
import {TrustedOracle} from "../src/TrustedOracle.sol";
import {GuardedLendingPool} from "../src/GuardedLendingPool.sol";
import {FlashLoanAttacker} from "../src/FlashLoanAttacker.sol";

contract FlashLoanOracleAttackTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    SimplePool pool;
    FlashLoanProvider provider;

    address attackerOwner = address(0xBEEF);

    function setUp() public {
        tokenA = new MockERC20("Collateral", "COLL");
        tokenB = new MockERC20("Borrow", "BRRW");

        pool = new SimplePool(address(tokenA), address(tokenB));

        tokenA.mint(address(this), 1000 ether);
        tokenB.mint(address(this), 1000 ether);

        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);

        pool.addLiquidity(1000 ether, 1000 ether); // 1:1 starting price

        provider = new FlashLoanProvider(address(tokenB));

        // Deep flash-loan liquidity, test fixture only.
        tokenB.mint(address(provider), 50_000 ether);
    }

    function testExploit_FlashLoanOracleManipulationDrainsVulnerablePool()
        public
    {
        VulnerableLendingPool lendingPool = new VulnerableLendingPool(
            address(tokenA),
            address(tokenB),
            address(pool)
        );

        // Fund the vulnerable lending pool.
        tokenB.mint(address(lendingPool), 2_000_000 ether);

        vm.startPrank(attackerOwner);

        FlashLoanAttacker attacker = new FlashLoanAttacker(
            address(provider),
            address(pool),
            address(lendingPool),
            address(tokenA),
            address(tokenB)
        );

        vm.stopPrank();

        // The attacker supplies only 10 real tokenA as collateral.
        tokenA.mint(attackerOwner, 10 ether);

        vm.startPrank(attackerOwner);

        tokenA.approve(address(attacker), 10 ether);

        // IMPORTANT:
        // 10 tokenB is enough to manipulate the spot price slightly above 1:1.
        // The resulting inflated collateral value is ~10.201 tokenB,
        // allowing the attacker to repay the 10 tokenB flash loan
        // and keep the difference as profit.
        attacker.attack(10 ether, 10 ether);

        attacker.collect();

        vm.stopPrank();

        // The attacker should have made a positive profit.
        assertGt(tokenB.balanceOf(attackerOwner), 0);
    }

    function testFix_IdenticalAttackRevertsEntirelyAgainstGuardedPool() public {
        TrustedOracle oracle = new TrustedOracle(address(this), 1e18); // fixed 1:1 price

        GuardedLendingPool guardedPool = new GuardedLendingPool(
            address(tokenA),
            address(tokenB),
            address(oracle)
        );

        tokenB.mint(address(guardedPool), 2_000_000 ether);

        vm.startPrank(attackerOwner);

        FlashLoanAttacker attacker = new FlashLoanAttacker(
            address(provider),
            address(pool),
            address(guardedPool),
            address(tokenA),
            address(tokenB)
        );

        vm.stopPrank();

        tokenA.mint(attackerOwner, 10 ether);

        vm.startPrank(attackerOwner);

        tokenA.approve(address(attacker), 10 ether);

        // The same attack is attempted.
        //
        // The attacker's own calculation uses the manipulated AMM price,
        // but GuardedLendingPool ignores that price and uses TrustedOracle,
        // which remains exactly 1:1.
        //
        // Therefore 10 tokenA collateral is worth only 10 tokenB,
        // while the attacker requests slightly more than 10 tokenB.
        // The guarded pool rejects the borrow and the entire flash loan
        // transaction reverts atomically.
        vm.expectRevert("exceeds collateral value");

        attacker.attack(10 ether, 10 ether);

        vm.stopPrank();

        // Because the whole transaction reverted, the attacker keeps nothing.
        assertEq(tokenB.balanceOf(attackerOwner), 0);
    }
}
