// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";

contract LiquidityBasicsTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    LiquidityPool pool;
    address lp1 = address(0xA1);
    address lp2 = address(0xA2);

    function setUp() public {
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");
        pool = new LiquidityPool(address(tokenA), address(tokenB));
    }

    function testFirstDepositMintsSqrtMinusMinimumLiquidity() public {
        tokenA.mint(lp1, 1000 ether);
        tokenB.mint(lp1, 1000 ether);

        vm.startPrank(lp1);
        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);
        uint256 liquidity = pool.addLiquidity(1000 ether, 1000 ether, 0);
        vm.stopPrank();

        // sqrt(1000e18 * 1000e18) = 1000e18, minus the permanently-locked MINIMUM_LIQUIDITY
        assertEq(liquidity, 1000 ether - pool.MINIMUM_LIQUIDITY());
        assertEq(pool.balanceOf(address(0xdead)), pool.MINIMUM_LIQUIDITY());
    }

    function testSecondDepositRespectsExistingRatio() public {
        tokenA.mint(lp1, 1000 ether);
        tokenB.mint(lp1, 1000 ether);
        vm.startPrank(lp1);
        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);
        pool.addLiquidity(1000 ether, 1000 ether, 0);
        vm.stopPrank();

        // lp2 deposits an UNEVEN amount — 500 A but 1000 B — the pool should only credit
        // shares based on the LESSER-relative side (500 A), matching Concept 3's own formula.
        tokenA.mint(lp2, 500 ether);
        tokenB.mint(lp2, 1000 ether);
        vm.startPrank(lp2);
        tokenA.approve(address(pool), 500 ether);
        tokenB.approve(address(pool), 1000 ether);
        uint256 liquidity = pool.addLiquidity(500 ether, 1000 ether, 0);
        vm.stopPrank();

        assertEq(liquidity, 500 ether); // half of lp1's own original share count, matching the 1:2 ratio
    }

    function testRemoveLiquidityReturnsProportionalShare() public {
        tokenA.mint(lp1, 1000 ether);
        tokenB.mint(lp1, 1000 ether);
        vm.startPrank(lp1);
        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);
        uint256 liquidity = pool.addLiquidity(1000 ether, 1000 ether, 0);

        (uint256 amount0, uint256 amount1) = pool.removeLiquidity(
            liquidity,
            0,
            0
        );
        vm.stopPrank();

        // lp1 owns EVERY circulating share except the permanently-locked MINIMUM_LIQUIDITY,
        // so withdrawing all of it returns almost, but not quite, the full original deposit.
        assertApproxEqAbs(amount0, 1000 ether, 2000);
        assertApproxEqAbs(amount1, 1000 ether, 2000);
    }

    function testInvariantRoughlyHoldsWithNoSwaps() public {
        tokenA.mint(lp1, 1000 ether);
        tokenB.mint(lp1, 1000 ether);
        vm.startPrank(lp1);
        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);
        pool.addLiquidity(1000 ether, 1000 ether, 0);
        vm.stopPrank();

        // No swaps have happened at all — reserves should simply equal what was deposited (Concept 1).
        assertEq(pool.reserve0(), 1000 ether);
        assertEq(pool.reserve1(), 1000 ether);
    }
}
