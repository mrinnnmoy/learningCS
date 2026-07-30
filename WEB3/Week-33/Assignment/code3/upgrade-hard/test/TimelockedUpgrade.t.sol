// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {
    TimelockController
} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {VaultV1} from "../src/VaultV1.sol";
import {VaultV2} from "../src/VaultV2.sol";

contract TimelockedUpgradeTest is Test {
    TimelockController timelock;
    address proxyAddress;
    address proposer = address(0xA11CE);

    uint256 constant DELAY = 2 days;

    function setUp() public {
        address[] memory proposers = new address[](1);
        proposers[0] = proposer;
        address[] memory executors = new address[](1);
        executors[0] = proposer;

        // admin = address(0) means the timelock governs itself after deployment — standard practice.
        timelock = new TimelockController(
            DELAY,
            proposers,
            executors,
            address(0)
        );

        proxyAddress = Upgrades.deployUUPSProxy(
            "VaultV1.sol",
            abi.encodeCall(VaultV1.initialize, (address(timelock))) // the TIMELOCK owns the proxy, not an EOA
        );
    }

    function testFix_UpgradeCannotExecuteBeforeTheDelayHasPassed() public {
        // Deployed standalone, exactly how Upgrades.deployUUPSProxy deploys an implementation
        // under the hood (Concept 9) — VaultV2 inherits VaultV1's own constructor, which already
        // calls _disableInitializers(), so this is a safe, real, callable implementation contract.
        VaultV2 newImplementation = new VaultV2();

        bytes memory upgradeCalldata = abi.encodeWithSignature(
            "upgradeToAndCall(address,bytes)",
            address(newImplementation),
            ""
        );

        vm.startPrank(proposer);
        timelock.schedule(
            proxyAddress,
            0,
            upgradeCalldata,
            bytes32(0),
            bytes32(0),
            DELAY
        );

        vm.expectRevert(); // the delay hasn't passed yet — TimelockController's own guard
        timelock.execute(
            proxyAddress,
            0,
            upgradeCalldata,
            bytes32(0),
            bytes32(0)
        );

        vm.warp(block.timestamp + DELAY + 1); // Week 31's own vm.warp pattern, reused here for a legitimate purpose
        timelock.execute(
            proxyAddress,
            0,
            upgradeCalldata,
            bytes32(0),
            bytes32(0)
        ); // now succeeds
        vm.stopPrank();

        assertEq(
            Upgrades.getImplementationAddress(proxyAddress),
            address(newImplementation)
        );
    }
}
