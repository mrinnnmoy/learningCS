// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";

contract FeesAndImpermanentLossTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    LiquidityPool pool;
    address lp = address(0xA1);
    address trader = address(0xB1);

    function setUp() public {
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");
        pool = new LiquidityPool(address(tokenA), address(tokenB));
    }

    function _deposit1000() internal returns (uint256 liquidity) {
        tokenA.mint(lp, 1000 ether);
        tokenB.mint(lp, 1000 ether);
        vm.startPrank(lp);
        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);
        liquidity = pool.addLiquidity(1000 ether, 1000 ether, 0);
        vm.stopPrank();
    }

    function testFix_FeesGrowLPsRedeemableValueOverTime() public {
        uint256 liquidity = _deposit1000();

        // A DIFFERENT address trades back and forth several times — each swap leaves 0.3% behind.
        tokenA.mint(trader, 500 ether);
        vm.startPrank(trader);
        tokenA.approve(address(pool), type(uint256).max);
        tokenB.approve(address(pool), type(uint256).max);
        for (uint256 i = 0; i < 5; i++) {
            uint256 outB = pool.swap(100 ether, 0, 0, block.timestamp);
            pool.swap(0, outB, 0, block.timestamp); // swap straight back, roughly restoring the price
        }
        vm.stopPrank();

        vm.prank(lp);
        (uint256 amount0, uint256 amount1) = pool.removeLiquidity(
            liquidity,
            0,
            0
        );

        // lp owned effectively all circulating shares — redeemed value should exceed the
        // original 1000/1000 deposit purely from the 10 swaps' worth of accrued fees.
        assertGt(amount0 + amount1, 2000 ether);
    }

    function testFix_ImpermanentLossMatchesTheClosedFormFormula() public {
        uint256 liquidity = _deposit1000();

        // Push the price from 1:1 to roughly 2:1 (token A becomes scarcer, worth more B) via a large swap.
        tokenB.mint(trader, 1000 ether);
        vm.startPrank(trader);
        tokenB.approve(address(pool), type(uint256).max);
        pool.swap(0, 414 ether, 0, block.timestamp); // sized to land reserve1/reserve0 near k=2
        vm.stopPrank();

        uint256 k_numerator = (pool.reserve1() * 1e18) / pool.reserve0(); // new price ratio, scaled

        vm.prank(lp);
        (uint256 amount0, uint256 amount1) = pool.removeLiquidity(
            liquidity,
            0,
            0
        );

        // "Value if I'd just held," priced in token1 terms at the NEW price: 1000 A * newPrice + 1000 B.
        uint256 holdValue = ((1000 ether * k_numerator) / 1e18) + 1000 ether;
        uint256 lpValue = ((amount0 * k_numerator) / 1e18) + amount1;

        // IL should be a real, negative difference — lpValue strictly less than holdValue —
        // and roughly in the -5% to -6% range the Concept 5 table predicts for k≈2.
        assertLt(lpValue, holdValue);
        uint256 lossPercent = ((holdValue - lpValue) * 10000) / holdValue; // basis points
        assertApproxEqAbs(lossPercent, 570, 150); // ≈5.7%, ±1.5% tolerance for the swap's own fee drag
    }

    function testFix_LargerPriceMoveProducesLargerImpermanentLoss() public {
        // A fresh pool, pushed MUCH further (toward k≈4) — Concept 6's own correlation, made concrete.
        LiquidityPool pool2 = new LiquidityPool(
            address(tokenA),
            address(tokenB)
        );
        tokenA.mint(lp, 1000 ether);
        tokenB.mint(lp, 1000 ether);
        vm.startPrank(lp);
        tokenA.approve(address(pool2), 1000 ether);
        tokenB.approve(address(pool2), 1000 ether);
        uint256 liquidity = pool2.addLiquidity(1000 ether, 1000 ether, 0);
        vm.stopPrank();

        tokenB.mint(trader, 3000 ether);
        vm.startPrank(trader);
        tokenB.approve(address(pool2), type(uint256).max);
        pool2.swap(0, 1000 ether, 0, block.timestamp); // a much larger push toward k≈4
        vm.stopPrank();

        uint256 k_numerator = (pool2.reserve1() * 1e18) / pool2.reserve0();

        vm.prank(lp);
        (uint256 amount0, uint256 amount1) = pool2.removeLiquidity(
            liquidity,
            0,
            0
        );

        uint256 holdValue = ((1000 ether * k_numerator) / 1e18) + 1000 ether;
        uint256 lpValue = ((amount0 * k_numerator) / 1e18) + amount1;
        uint256 lossPercent = ((holdValue - lpValue) * 10000) / holdValue;

        assertGt(lossPercent, 570); // meaningfully worse than the k≈2 case above — Concept 6's own point
    }
}
