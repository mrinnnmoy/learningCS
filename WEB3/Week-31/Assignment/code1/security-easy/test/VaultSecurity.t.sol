// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {VulnerableVault} from "../src/VulnerableVault.sol";
import {FixedVault} from "../src/FixedVault.sol";

contract VaultSecurityTest is Test {
    address legitOwner = address(0xA11CE);
    address attacker = address(0xBEEF);

    function testExploit_AnyoneCanClaimUnprotectedVault() public {
        VulnerableVault vault = new VulnerableVault();
        vm.deal(address(vault), 10 ether);   // some legitimate funds already sitting in it

        vm.prank(legitOwner);
        vault.initialize(legitOwner);   // the real owner initializes it first, as intended...

        vm.prank(attacker);
        vault.initialize(attacker);     // ...but the attacker can just call it again, and again wins

        assertEq(vault.owner(), attacker);

        vm.prank(attacker);
        vault.withdraw();
        assertEq(attacker.balance, 10 ether);   // the exploit succeeds — this IS the point of this test
    }

    function testFix_ConstructorOnlyOwnerCannotBeReclaimed() public {
        vm.prank(legitOwner);
        FixedVault vault = new FixedVault(legitOwner);
        vm.deal(address(vault), 10 ether);

        vm.prank(attacker);
        vm.expectRevert("not owner");
        vault.withdraw();   // no initialize() exists at all to hijack — the fix holds
    }
}