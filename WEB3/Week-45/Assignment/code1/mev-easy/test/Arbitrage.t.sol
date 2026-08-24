// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LiquidityPool} from "../src/LiquidityPool.sol";
import {Arbitrageur, IERC20Minimal} from "../src/Arbitrageur.sol";

contract ArbitrageTest is Test {
    MockERC20 tokenA;
    MockERC20 tokenB;
    LiquidityPool cheapPool; // more B per A here
    LiquidityPool expensivePool; // less B per A here — the SAME asset, priced differently
    Arbitrageur arbitrageur;

    function setUp() public {
        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");

        cheapPool = new LiquidityPool(address(tokenA), address(tokenB));
        tokenA.mint(address(this), 1000 ether);
        tokenB.mint(address(this), 1200 ether); // 1:1.2 — B is CHEAPER here (more B per A)
        tokenA.approve(address(cheapPool), 1000 ether);
        tokenB.approve(address(cheapPool), 1200 ether);
        cheapPool.addLiquidity(1000 ether, 1200 ether, 0);

        expensivePool = new LiquidityPool(address(tokenA), address(tokenB));
        tokenA.mint(address(this), 1000 ether);
        tokenB.mint(address(this), 800 ether); // 1:0.8 — B is MORE EXPENSIVE here (less B per A)
        tokenA.approve(address(expensivePool), 1000 ether);
        tokenB.approve(address(expensivePool), 800 ether);
        expensivePool.addLiquidity(1000 ether, 800 ether, 0);

        arbitrageur = new Arbitrageur();
        tokenA.mint(address(arbitrageur), 50 ether); // seed capital for the arbitrage trade itself
    }

    function testFix_ArbitrageProfitsAndNarrowsThePriceGap() public {
        uint256 priceGapBefore = ((cheapPool.reserve1() * 1e18) /
            cheapPool.reserve0()) -
            ((expensivePool.reserve1() * 1e18) / expensivePool.reserve0());

        vm.prank(address(this));
        uint256 profit = arbitrageur.executeArbitrage(
            cheapPool,
            expensivePool,
            IERC20Minimal(address(tokenA)),
            IERC20Minimal(address(tokenB)),
            50 ether
        );

        uint256 priceGapAfter = ((cheapPool.reserve1() * 1e18) /
            cheapPool.reserve0()) -
            ((expensivePool.reserve1() * 1e18) / expensivePool.reserve0());

        assertGt(profit, 0); // Concept 2 — the arbitrageur genuinely profited
        assertLt(priceGapAfter, priceGapBefore); // AND the two pools' own prices moved closer together
    }
}
