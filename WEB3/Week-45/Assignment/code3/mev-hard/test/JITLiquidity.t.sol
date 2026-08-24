// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test, console} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";

contract JITLiquidityTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    address honestLP = address(0xA1);
    address jitLP = address(0xB1);
    address trader = address(0xC1);

    function _freshPoolWithHonestLP() internal returns (LiquidityPool pool) {
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");
        pool = new LiquidityPool(address(tokenA), address(tokenB));

        tokenA.mint(honestLP, 1000 ether);
        tokenB.mint(honestLP, 1000 ether);
        vm.startPrank(honestLP);
        tokenA.approve(address(pool), 1000 ether);
        tokenB.approve(address(pool), 1000 ether);
        pool.addLiquidity(1000 ether, 1000 ether, 0);
        vm.stopPrank();

        // Confirmed explicitly, at the very start, per this course's own hard-won testing discipline:
        // the honest LP holds ALL circulating shares right now, before anything else happens.
        assertEq(
            pool.balanceOf(honestLP),
            pool.totalSupply() - pool.MINIMUM_LIQUIDITY()
        );
    }

    function _runLargeTrade(LiquidityPool pool) internal {
        tokenA.mint(trader, 500 ether);
        vm.startPrank(trader);
        tokenA.approve(address(pool), 500 ether);
        pool.swap(500 ether, 0, 0, block.timestamp);
        vm.stopPrank();
    }

    function testFix_BaselineHonestLPCapturesTheFullFee() public {
        LiquidityPool pool = _freshPoolWithHonestLP();
        _runLargeTrade(pool);

        vm.startPrank(honestLP);
        uint256 shares = pool.balanceOf(honestLP);
        (uint256 amount0, uint256 amount1) = pool.removeLiquidity(shares, 0, 0);
        vm.stopPrank();

        console.log("Baseline (no JIT) - honestLP redeemed:", amount0, amount1);
        // Recorded for direct comparison in the next test — the honest LP's own combined value
        // should be MEANINGFULLY above their original 1000/1000 deposit, purely from the fee.
        assertGt(amount0 + amount1, 2000 ether);
    }

    function testExploit_JITLiquidityCapturesMostOfTheFeeInstead() public {
        LiquidityPool pool = _freshPoolWithHonestLP();

        // JIT LP swoops in RIGHT BEFORE the large trade — a huge deposit, at the pool's own current ratio.
        tokenA.mint(jitLP, 100_000 ether);
        tokenB.mint(jitLP, 100_000 ether);
        vm.startPrank(jitLP);
        tokenA.approve(address(pool), 100_000 ether);
        tokenB.approve(address(pool), 100_000 ether);
        uint256 jitShares = pool.addLiquidity(100_000 ether, 100_000 ether, 0);
        vm.stopPrank();

        _runLargeTrade(pool);

        // JIT LP withdraws IMMEDIATELY afterward, same block in spirit — capturing most of the fee.
        vm.prank(jitLP);
        (uint256 jitAmount0, uint256 jitAmount1) = pool.removeLiquidity(
            jitShares,
            0,
            0
        );

        uint256 jitDeposited = 100_000 ether + 100_000 ether;
        uint256 jitWithdrawn = jitAmount0 + jitAmount1;
        console.log("JIT LP deposited (combined):", jitDeposited);
        console.log("JIT LP withdrew (combined):", jitWithdrawn);
        assertGt(jitWithdrawn, jitDeposited); // the JIT LP genuinely profited from being present only briefly

        // NOW the honest LP withdraws — after the JIT LP has already taken their own share of the fee.
        vm.startPrank(honestLP);
        uint256 honestShares = pool.balanceOf(honestLP);
        (uint256 honestAmount0, uint256 honestAmount1) = pool.removeLiquidity(
            honestShares,
            0,
            0
        );
        vm.stopPrank();

        console.log(
            "With JIT present - honestLP redeemed:",
            honestAmount0,
            honestAmount1
        );

        // Concept 10's own real, measured harm: meaningfully closer to the ORIGINAL 1000/1000 deposit
        // than the baseline test's own result — most of the fee went to the JIT LP instead.
        assertLt(honestAmount0 + honestAmount1, 1050 ether + 1050 ether);
    }
}
