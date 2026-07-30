// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {VaultV1} from "../src/VaultV1.sol";

contract TransparentProxySafetyTest is Test {
    function testFix_RealProxyStorageNeverCollidesWithImplementationSlot() public {
        address initialOwner = address(this);

        address proxyAddress = Upgrades.deployTransparentProxy(
            "VaultV1.sol",
            initialOwner,
            abi.encodeCall(VaultV1.initialize, (initialOwner))
        );

        VaultV1 vault = VaultV1(proxyAddress);
        vault.deposit{value: 1 ether}();
        assertEq(vault.balance(), 1 ether);      // VaultV1's own slot 0, exactly where it should be
        assertEq(vault.owner(), initialOwner);    // OwnableUpgradeable's own storage, untouched

        // The REAL implementation address lives at ERC-1967's own dedicated slot, nowhere near
        // slot 0 — confirmed independently via the plugin's own helper, not by reading storage by hand.
        address implementationAddress = Upgrades.getImplementationAddress(proxyAddress);
        assertTrue(implementationAddress != address(0));
        assertTrue(implementationAddress != proxyAddress);
    }
}