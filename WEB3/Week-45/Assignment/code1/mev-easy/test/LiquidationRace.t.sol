// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {SimpleLendingPool} from "../src/SimpleLendingPool.sol";

contract LiquidationRaceTest is Test {
    MockERC20 collateralToken;
    MockERC20 borrowToken;
    SimpleLendingPool pool;

    address borrower = address(0xB0);
    address searcher1 = address(0x51);
    address searcher2 = address(0x52);

    function setUp() public {
        collateralToken = new MockERC20("Collateral", "COLL");
        borrowToken = new MockERC20("Borrow", "BRRW");

        pool = new SimpleLendingPool(
            address(collateralToken),
            address(borrowToken),
            1e18
        );

        // Give the lending pool borrow-token liquidity before borrowing.
        borrowToken.mint(address(pool), 1000 ether);

        // Give the borrower collateral.
        collateralToken.mint(borrower, 100 ether);

        vm.startPrank(borrower);

        collateralToken.approve(address(pool), 100 ether);
        pool.depositCollateral(100 ether);

        // Borrow 90 against 100 collateral at the initial 1:1 price.
        pool.borrow(90 ether);

        vm.stopPrank();
    }

    function testFix_FirstSearcherWinsSecondFailsHarmlessly() public {
        // Price drops from 1.0 to 0.8.
        // Collateral value becomes 80 while debt remains 90.
        pool.setPrice(0.8e18);

        assertTrue(pool.isLiquidatable(borrower));

        // Both searchers have enough borrow tokens to repay the full debt.
        borrowToken.mint(searcher1, 90 ether);
        borrowToken.mint(searcher2, 90 ether);

        // Searcher 1 wins the liquidation race.
        vm.startPrank(searcher1);

        borrowToken.approve(address(pool), 90 ether);
        pool.liquidate(borrower, 90 ether);

        vm.stopPrank();

        // The entire debt has been repaid, so the position is no longer liquidatable.
        assertFalse(pool.isLiquidatable(borrower));

        // Searcher 1 genuinely received seized collateral with the 5% bonus.
        assertGt(collateralToken.balanceOf(searcher1), 0);

        // Searcher 2 loses the race because the position is already resolved.
        vm.startPrank(searcher2);

        borrowToken.approve(address(pool), 90 ether);

        vm.expectRevert(SimpleLendingPool.NotLiquidatable.selector);
        pool.liquidate(borrower, 90 ether);

        vm.stopPrank();
    }
}
