// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {WrappedToken} from "../src/WrappedToken.sol";

contract WrappedTokenReplayProtectionTest is Test {
    WrappedToken wrappedToken;
    address relayer = address(0xBEEF);
    address user = address(0xCAFE);
    address fakeLockBox = address(0x1234);

    function setUp() public {
        wrappedToken = new WrappedToken(relayer, 31337, fakeLockBox);
    }

    function testFix_ValidMintSucceedsOnce() public {
        vm.prank(relayer);
        wrappedToken.mint(user, 100 ether, 0);
        assertEq(wrappedToken.balanceOf(user), 100 ether);
    }

    function testFix_IdenticalNonceRevertsOnReplay() public {
        vm.startPrank(relayer);
        wrappedToken.mint(user, 100 ether, 0);

        vm.expectRevert(WrappedToken.AlreadyProcessed.selector);
        wrappedToken.mint(user, 100 ether, 0); // the exact same sourceNonce again
        vm.stopPrank();
    }
}
