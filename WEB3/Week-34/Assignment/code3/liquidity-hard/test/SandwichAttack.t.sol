// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";
import {SandwichAttacker} from "../src/SandwichAttacker.sol";

contract SandwichAttackTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    LiquidityPool pool;
    address victim = address(0xC1);

    function setUp() public {
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");
        pool = new LiquidityPool(address(tokenA), address(tokenB));

        tokenA.mint(address(this), 10_000 ether);
        tokenB.mint(address(this), 10_000 ether);
        tokenA.approve(address(pool), 10_000 ether);
        tokenB.approve(address(pool), 10_000 ether);
        pool.addLiquidity(10_000 ether, 10_000 ether, 0);
    }

    function testExploit_SandwichProfitsAgainstUnprotectedVictimSwap() public {
        SandwichAttacker attacker = new SandwichAttacker(
            address(pool),
            address(tokenA),
            address(tokenB)
        );
        tokenA.mint(address(attacker), 2000 ether);
        tokenA.mint(victim, 500 ether);

        uint256 attackerTokenABefore = tokenA.balanceOf(address(attacker));

        attacker.frontRun(2000 ether); // pushes the price against the victim BEFORE they trade

        vm.startPrank(victim);
        tokenA.approve(address(pool), 500 ether);
        pool.swap(500 ether, 0, 0, block.timestamp); // minAmountOut = 0 — UNPROTECTED, Concept 10's own warning
        vm.stopPrank();

        uint256 attackerTokenBBalance = tokenB.balanceOf(address(attacker));
        attacker.backRun(attackerTokenBBalance); // sells back, realizing the profit

        uint256 attackerTokenAAfter = tokenA.balanceOf(address(attacker));
        assertGt(attackerTokenAAfter, attackerTokenABefore); // the attacker profited — the exploit succeeded
    }

    function testFix_RealisticMinAmountOutMakesTheSandwichRevertInstead()
        public
    {
        SandwichAttacker attacker = new SandwichAttacker(
            address(pool),
            address(tokenA),
            address(tokenB)
        );
        tokenA.mint(address(attacker), 2000 ether);
        tokenA.mint(victim, 500 ether);

        // Victim computes their own minAmountOut against the PRE-ATTACK price with a small,
        // realistic 1% tolerance — exactly Concept 10's own defense.
        uint256 preAttackQuote = (500 ether * 997 * pool.reserve1()) /
            (pool.reserve0() * 1000 + 500 ether * 997);
        uint256 minAmountOut = (preAttackQuote * 99) / 100; // 1% slippage tolerance

        attacker.frontRun(2000 ether);

        vm.startPrank(victim);
        tokenA.approve(address(pool), 500 ether);
        vm.expectRevert(LiquidityPool.SlippageExceeded.selector);
        pool.swap(500 ether, 0, minAmountOut, block.timestamp); // now reverts instead of executing at a bad price
        vm.stopPrank();
    }
}
