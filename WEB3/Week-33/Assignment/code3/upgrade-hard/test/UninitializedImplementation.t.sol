// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {VulnerableImplementation} from "../src/VulnerableImplementation.sol";
import {SafeImplementation} from "../src/SafeImplementation.sol";

contract UninitializedImplementationTest is Test {
    address attacker = address(0xBEEF);

    function testExploit_AttackerInitializesTheRawImplementationDirectly()
        public
    {
        // Deployed on its own — NOT behind any proxy, exactly how an implementation
        // contract actually gets deployed as part of Upgrades.deployUUPSProxy under the hood.
        VulnerableImplementation impl = new VulnerableImplementation();

        vm.prank(attacker);
        impl.initialize(attacker); // nothing stops this — the guard Concept 9 warns about missing

        assertEq(impl.owner(), attacker); // the attacker now owns a real, live contract at a real address
    }

    function testFix_DisableInitializersPreventsTheIdenticalAttack() public {
        SafeImplementation impl = new SafeImplementation();

        vm.prank(attacker);
        vm.expectRevert(); // Initializable's own guard, tripped by _disableInitializers() having run already
        impl.initialize(attacker);
    }
}
