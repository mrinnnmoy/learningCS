// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {Upgrades, Options} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {VaultV1} from "../src/VaultV1.sol";
import {VaultV2} from "../src/VaultV2.sol";

contract ValidationCaller {
    function validateBadUpgrade() external {
        Options memory opts;
        opts.referenceContract = "VaultV1.sol:VaultV1";

        Upgrades.validateUpgrade("VaultV2Bad.sol", opts);
    }
}

contract UUPSUpgradeTest is Test {
    address owner = address(this);
    address stranger = address(0xBEEF);

    function testFix_SafeUpgradePreservesStateAndAddsNewField() public {
        address proxyAddress = Upgrades.deployUUPSProxy(
            "VaultV1.sol",
            abi.encodeCall(VaultV1.initialize, (owner))
        );

        VaultV1(proxyAddress).deposit{value: 3 ether}();
        assertEq(VaultV1(proxyAddress).balance(), 3 ether);

        Upgrades.upgradeProxy(proxyAddress, "VaultV2.sol", "");

        VaultV2 vaultV2 = VaultV2(proxyAddress);

        assertEq(vaultV2.balance(), 3 ether);

        vaultV2.deposit{value: 1 ether}();

        assertEq(vaultV2.balance(), 4 ether);
        assertGt(vaultV2.lastDepositTimestamp(), 0);
    }

    function testExploit_UnsafeLayoutChangeIsRejectedByValidation() public {
        ValidationCaller caller = new ValidationCaller();

        (bool success, bytes memory returndata) = address(caller).call(
            abi.encodeCall(ValidationCaller.validateBadUpgrade, ())
        );

        assertFalse(success);
        assertGt(returndata.length, 0);
    }

    function testFix_NonOwnerCannotAuthorizeAnUpgrade() public {
        address proxyAddress = Upgrades.deployUUPSProxy(
            "VaultV1.sol",
            abi.encodeCall(VaultV1.initialize, (owner))
        );

        vm.prank(stranger);

        vm.expectRevert();

        VaultV1(proxyAddress).upgradeToAndCall(address(0xCAFE), "");
    }
}
