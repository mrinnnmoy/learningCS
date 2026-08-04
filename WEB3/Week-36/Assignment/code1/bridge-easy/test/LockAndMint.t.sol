// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {LockBox} from "../src/LockBox.sol";
import {WrappedToken} from "../src/WrappedToken.sol";

contract LockAndMintTest is Test {
    MockERC20 realToken;
    LockBox lockBox;
    WrappedToken wrappedToken;
    address relayer = address(0xBEEF);
    address user = address(0xCAFE);

    function setUp() public {
        realToken = new MockERC20("Real Token", "REAL");
        lockBox = new LockBox(address(realToken), relayer);
        wrappedToken = new WrappedToken(relayer);

        realToken.mint(user, 100 ether);
    }

    function testFullRoundTrip_LockMintBurnUnlock() public {
        // 1. User locks real tokens on "Chain A."
        vm.startPrank(user);
        realToken.approve(address(lockBox), 100 ether);
        lockBox.lock(100 ether);
        vm.stopPrank();

        assertEq(realToken.balanceOf(user), 0);
        assertEq(realToken.balanceOf(address(lockBox)), 100 ether);

        // 2. The relayer, having "observed" the Locked event (Concept 7), mints on "Chain B."
        vm.prank(relayer);
        wrappedToken.mint(user, 100 ether);
        assertEq(wrappedToken.balanceOf(user), 100 ether);

        // 3. User burns the wrapped token to bridge back.
        vm.prank(user);
        wrappedToken.burn(100 ether);
        assertEq(wrappedToken.balanceOf(user), 0);
        assertEq(wrappedToken.totalSupply(), 0);

        // 4. The relayer, having observed the burn, unlocks the real token on "Chain A."
        vm.prank(relayer);
        lockBox.unlock(user, 100 ether);

        assertEq(realToken.balanceOf(user), 100 ether); // exactly what the user started with
        assertEq(realToken.balanceOf(address(lockBox)), 0);
    }

    function testFix_OnlyRelayerCanMintOrUnlock() public {
        vm.startPrank(user);
        vm.expectRevert(WrappedToken.NotRelayer.selector);
        wrappedToken.mint(user, 100 ether);

        vm.expectRevert(LockBox.NotRelayer.selector);
        lockBox.unlock(user, 100 ether);
        vm.stopPrank();
    }
}
