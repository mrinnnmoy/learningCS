// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {
    TimelockController
} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {GovToken} from "../src/GovToken.sol";
import {Treasury} from "../src/Treasury.sol";
import {MyGovernor} from "../src/MyGovernor.sol";

contract GovernanceLifecycleTest is Test {
    GovToken token;
    Treasury treasury;
    MyGovernor governor;
    TimelockController timelock;

    address voter = address(this);
    address recipient = address(0xCAFE);
    uint256 constant TIMELOCK_DELAY = 2 days;

    function setUp() public {
        token = new GovToken(1_000_000 ether);

        address[] memory proposers = new address[](0); // filled in AFTER the Governor exists
        address[] memory executors = new address[](0);
        timelock = new TimelockController(
            TIMELOCK_DELAY,
            proposers,
            executors,
            address(this)
        );

        governor = new MyGovernor(token, timelock);

        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.EXECUTOR_ROLE(), address(governor));
        timelock.renounceRole(timelock.DEFAULT_ADMIN_ROLE(), address(this)); // Concept 6 — no EOA left in control

        treasury = new Treasury(address(timelock));
        vm.deal(address(treasury), 10 ether);
    }

    function testFix_UndelegatedHolderHasZeroVotingPowerUntilSelfDelegating()
        public
    {
        assertEq(token.getVotes(voter), 0); // real tokens held, but never delegated — Concept 8's own trap

        token.delegate(voter);
        assertEq(token.getVotes(voter), 1_000_000 ether); // fixed, immediately
    }

    function testFix_FullLifecycleMovesRealFundsFromTreasury() public {
        token.delegate(voter); // must self-delegate BEFORE the proposal's own snapshot block (Concept 7)
        vm.roll(block.number + 1); // let the delegation checkpoint land in a real, past block

        address[] memory targets = new address[](1);
        targets[0] = address(treasury);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSelector(
            Treasury.release.selector,
            payable(recipient),
            5 ether
        );
        string memory description = "Release 5 ETH to recipient";

        uint256 proposalId = governor.propose(
            targets,
            values,
            calldatas,
            description
        );

        vm.roll(block.number + governor.votingDelay() + 1); // Pending -> Active
        governor.castVote(proposalId, 1); // 1 = For

        vm.roll(block.number + governor.votingPeriod() + 1); // Active -> Succeeded

        bytes32 descriptionHash = keccak256(bytes(description));
        governor.queue(targets, values, calldatas, descriptionHash);

        vm.warp(block.timestamp + TIMELOCK_DELAY + 1); // the timelock's OWN delay, Concept 6
        governor.execute(targets, values, calldatas, descriptionHash);

        assertEq(recipient.balance, 5 ether); // real ETH, genuinely moved, through the FULL real lifecycle
    }
}
