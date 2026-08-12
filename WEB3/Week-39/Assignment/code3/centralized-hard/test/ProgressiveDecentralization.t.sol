// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {
    TimelockController
} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {GovernedFeeContract} from "../src/GovernedFeeContract.sol";

contract ProgressiveDecentralizationTest is Test {
    GovernedFeeContract feeContract;
    address eoaOwner = address(0xA11CE);
    uint256 constant DELAY = 2 days;

    function setUp() public {
        vm.prank(eoaOwner);
        feeContract = new GovernedFeeContract(eoaOwner, 100); // Phase 1 — a raw EOA owner, 1% starting fee
    }

    function testFix_Phase1_EOAOwnerChangesFeeInstantly() public {
        vm.prank(eoaOwner);
        feeContract.setFee(200); // ONE transaction — no delay, no process, Concept 7's own "fast" phase

        assertEq(feeContract.feeBps(), 200);
    }

    function testFix_Phase2_OwnershipMovesToATimelock() public {
        address[] memory proposers = new address[](1);
        proposers[0] = eoaOwner;
        address[] memory executors = new address[](1);
        executors[0] = eoaOwner;
        TimelockController timelock = new TimelockController(
            DELAY,
            proposers,
            executors,
            address(0)
        );

        vm.prank(eoaOwner);
        feeContract.transferOwnership(address(timelock)); // Concept 7 — the real handoff

        // The EOA can no longer act directly, even though it's still the SAME real person/key —
        // ownership genuinely moved, this isn't a permissions oversight.
        vm.prank(eoaOwner);
        vm.expectRevert();
        feeContract.setFee(300);

        // The full, legitimate Phase 2 process, Week 33's own exact pattern, reused directly:
        bytes memory setFeeCalldata = abi.encodeWithSelector(
            GovernedFeeContract.setFee.selector,
            300
        );

        vm.startPrank(eoaOwner);
        timelock.schedule(
            address(feeContract),
            0,
            setFeeCalldata,
            bytes32(0),
            bytes32(0),
            DELAY
        );

        vm.expectRevert(); // too early — the delay hasn't passed yet
        timelock.execute(
            address(feeContract),
            0,
            setFeeCalldata,
            bytes32(0),
            bytes32(0)
        );

        vm.warp(block.timestamp + DELAY + 1);
        timelock.execute(
            address(feeContract),
            0,
            setFeeCalldata,
            bytes32(0),
            bytes32(0)
        ); // now succeeds
        vm.stopPrank();

        assertEq(feeContract.feeBps(), 300);
    }

    function testFix_HardCapHoldsEvenThroughTheFullLegitimateTimelockFlow()
        public
    {
        address[] memory proposers = new address[](1);
        proposers[0] = eoaOwner;
        address[] memory executors = new address[](1);
        executors[0] = eoaOwner;
        TimelockController timelock = new TimelockController(
            DELAY,
            proposers,
            executors,
            address(0)
        );

        vm.prank(eoaOwner);
        feeContract.transferOwnership(address(timelock));

        bytes memory tooHighCalldata = abi.encodeWithSelector(
            GovernedFeeContract.setFee.selector,
            1500
        ); // 15% > 10% cap

        vm.startPrank(eoaOwner);
        timelock.schedule(
            address(feeContract),
            0,
            tooHighCalldata,
            bytes32(0),
            bytes32(0),
            DELAY
        );
        vm.warp(block.timestamp + DELAY + 1);

        vm.expectRevert(); // the timelock's OWN execute() call reverts, since the underlying setFee() does
        timelock.execute(
            address(feeContract),
            0,
            tooHighCalldata,
            bytes32(0),
            bytes32(0)
        );
        vm.stopPrank();

        assertEq(feeContract.feeBps(), 100); // unchanged — Concept 6's own hard cap held, regardless of legitimacy
    }

    function testFix_InitialFeeAboveCapRevertsAtDeployment() public {
        vm.expectRevert(GovernedFeeContract.FeeTooHigh.selector);
        new GovernedFeeContract(eoaOwner, 1500);
    }
}
