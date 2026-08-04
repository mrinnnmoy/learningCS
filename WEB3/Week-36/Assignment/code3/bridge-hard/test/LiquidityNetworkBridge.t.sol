// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LiquidityBridgePool} from "../src/LiquidityBridgePool.sol";

contract LiquidityNetworkBridgeTest is Test {
    MockERC20 token;
    LiquidityBridgePool sourcePool;
    LiquidityBridgePool destPool;
    address lp = address(0xA1);
    address user = address(0xCAFE);

    function setUp() public {
        token = new MockERC20("Bridged Token", "BRT");
        sourcePool = new LiquidityBridgePool(address(token));
        destPool = new LiquidityBridgePool(address(token));
    }

    function testFix_DepositAndReleaseMovesRealTokensNoMinting() public {
        token.mint(lp, 1000 ether);
        vm.startPrank(lp);
        token.approve(address(destPool), 1000 ether);
        destPool.addLiquidity(1000 ether); // destination side pre-funded — Concept 4's own requirement
        vm.stopPrank();

        token.mint(user, 100 ether);
        vm.startPrank(user);
        token.approve(address(sourcePool), 100 ether);
        sourcePool.deposit(100 ether, 2, user); // "Chain B" = chainId 2, made-up for this simulation
        vm.stopPrank();

        assertEq(token.balanceOf(address(sourcePool)), 100 ether); // real tokens genuinely held, not burned

        destPool.release(user, 100 ether);
        assertEq(token.balanceOf(user), 100 ether - 0.3 ether); // 0.3% fee, Week 34's own convention
    }

    function testExploit_InsufficientDestinationLiquidityReverts() public {
        // Destination pool never got funded at all — Concept 4's own real, structural risk.
        vm.expectRevert(LiquidityBridgePool.InsufficientLiquidity.selector);
        destPool.release(user, 100 ether);
    }
}
