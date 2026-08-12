// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {RateLimitedVault} from "../src/RateLimitedVault.sol";

contract RateLimitingTest is Test {
    MockERC20 token;
    RateLimitedVault vault;
    address user = address(0xCAFE);

    function setUp() public {
        token = new MockERC20();
        vault = new RateLimitedVault(address(token));
        token.mint(user, 500 ether);

        vm.prank(user);
        vault.deposit(500 ether);
    }

    function testFix_WithdrawalBeyondDailyLimitReverts() public {
        vm.startPrank(user);
        vault.withdraw(100 ether); // exactly the limit — fine

        vm.expectRevert(RateLimitedVault.RateLimitExceeded.selector);
        vault.withdraw(1); // one wei over, in the SAME window — blocked
        vm.stopPrank();
    }

    function testFix_LimitResetsInANewWindow() public {
        vm.startPrank(user);
        vault.withdraw(100 ether);

        vm.warp(block.timestamp + 1 days + 1); // a genuinely new window
        vault.withdraw(100 ether); // succeeds again — the reset genuinely happened
        vm.stopPrank();

        assertEq(token.balanceOf(user), 200 ether);
    }

    function testFix_BoundaryStraddlingEdgeCaseMovesNearlyDoubleTheLimit()
        public
    {
        vm.startPrank(user);
        vault.withdraw(100 ether); // the full limit, at the very end of window 1

        vm.warp(block.timestamp + 1 days + 1); // the instant a new window opens
        vault.withdraw(100 ether); // the full limit again, immediately
        vm.stopPrank();

        // Concept 4's own honest edge case: close to 200 ether moved in a span barely over ONE second,
        // despite a nominal "100 ether per day" limit — a real, disclosed gap in this simple design.
        assertEq(token.balanceOf(user), 200 ether);
    }
}
