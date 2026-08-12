// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {GoodVault} from "../src/GoodVault.sol";
import {BadVault} from "../src/BadVault.sol";

contract CircuitBreakerTest is Test {
    MockERC20 token;
    address owner = address(this);
    address user = address(0xCAFE);

    function setUp() public {
        token = new MockERC20("Test Token", "TST");
        token.mint(user, 100 ether);
    }

    function testFix_GoodVaultEmergencyWithdrawWorksWhilePaused() public {
        GoodVault vault = new GoodVault(address(token), owner);
        vault.setWhitelisted(user, true);

        vm.prank(user);
        vault.deposit(50 ether);
        assertEq(vault.balances(user), 50 ether);

        vault.pause();

        vm.prank(user);
        vault.emergencyWithdraw(); // succeeds EVEN WHILE PAUSED — Concept 2's own entire point
        assertEq(token.balanceOf(user), 100 ether);
    }

    function testExploit_BadVaultTrapsUserFundsWhilePaused() public {
        BadVault vault = new BadVault(address(token), owner);
        vault.setWhitelisted(user, true);

        vm.prank(user);
        vault.deposit(50 ether);

        vault.pause();

        vm.prank(user);
        vm.expectRevert(); // BadVault's OWN whenNotPaused on withdraw() — the user's funds are stuck
        vault.withdraw();
    }
}
