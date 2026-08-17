// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {
    MockV3Aggregator
} from "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {SimplePool} from "../src/SimplePool.sol";
import {FlashLoanProvider} from "../src/FlashLoanProvider.sol";
import {VulnerableLendingPool} from "../src/VulnerableLendingPool.sol";
import {
    ChainlinkGuardedLendingPool
} from "../src/ChainlinkGuardedLendingPool.sol";
import {FlashLoanAttacker} from "../src/FlashLoanAttacker.sol";

contract ChainlinkGuardedAttackTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    SimplePool pool;
    FlashLoanProvider provider;

    address attackerOwner = address(0xBEEF);

    function setUp() public {
        tokenA = new MockERC20("Collateral", "COLL");
        tokenB = new MockERC20("Borrow", "BRRW");

        // Create the manipulable AMM used by the original Week 31 attack.
        pool = new SimplePool(address(tokenA), address(tokenB));

        tokenA.mint(address(this), 1000 ether);
        tokenB.mint(address(this), 1000 ether);

        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);

        pool.addLiquidity(1000 ether, 1000 ether);

        // Flash-loan provider holds enough tokenB for the attack.
        provider = new FlashLoanProvider(address(tokenB));
        tokenB.mint(address(provider), 50_000 ether);
    }

    function testExploit_UnchangedAttackStillDrainsVulnerablePool() public {
        VulnerableLendingPool lendingPool = new VulnerableLendingPool(
            address(tokenA),
            address(tokenB),
            address(pool)
        );

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

        tokenA.mint(attackerOwner, 10 ether);

        vm.startPrank(attackerOwner);

        tokenA.approve(address(attacker), 10 ether);

        attacker.attack(10 ether, 10 ether);

        attacker.collect();

        vm.stopPrank();

        assertGt(tokenB.balanceOf(attackerOwner), 0);
    }

    function testFix_IdenticalAttackFailsAgainstRealChainlinkShapedOracle()
        public
    {
        // MockV3Aggregator behaves like a real Chainlink
        // AggregatorV3Interface source.
        //
        // 8 decimals:
        // 1e8 = $1.00
        MockV3Aggregator priceFeed = new MockV3Aggregator(8, 1e8);

        ChainlinkGuardedLendingPool guardedPool = new ChainlinkGuardedLendingPool(
                address(tokenA),
                address(tokenB),
                address(priceFeed)
            );

        // Give the guarded lending pool enough tokenB so that lack of
        // liquidity is not what stops the attack.
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

        // The SAME Week 31 attack is attempted.
        //
        // The attacker still manipulates SimplePool's spot price,
        // but ChainlinkGuardedLendingPool does not read that price.
        //
        // It instead reads the independent Chainlink-shaped oracle,
        // which still reports $1.00.
        //
        // Therefore 10 tokenA is worth only 10 tokenB and the
        // attacker's oversized borrow request is rejected.
        vm.expectRevert();

        attacker.attack(10_000 ether, 10 ether);

        vm.stopPrank();

        // The transaction reverted, so the attacker receives nothing.
        assertEq(tokenB.balanceOf(attackerOwner), 0);
    }
}
