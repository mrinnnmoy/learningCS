// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {
    TimelockController
} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovToken} from "../src/GovToken.sol";
import {Treasury} from "../src/Treasury.sol";
import {MyGovernor} from "../src/MyGovernor.sol";

contract GovernanceAttacksTest is Test {
    GovToken token;
    Treasury treasury;
    MyGovernor governor;
    TimelockController timelock;

    address proposer = address(this); // holds enough to clear the raised proposalThreshold
    address attacker = address(0xBEEF);
    address recipient = address(0xCAFE);

    function setUp() public {
        token = new GovToken(1_000_000 ether); // proposer holds the FULL supply initially

        address[] memory proposers = new address[](0);
        address[] memory executors = new address[](0);
        timelock = new TimelockController(
            2 days,
            proposers,
            executors,
            address(this)
        );
        governor = new MyGovernor(token, timelock);
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.EXECUTOR_ROLE(), address(governor));

        treasury = new Treasury(address(timelock));
        vm.deal(address(treasury), 10 ether);

        token.delegate(proposer);
        vm.roll(block.number + 1);
    }

    function _propose()
        internal
        returns (
            uint256 proposalId,
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            bytes32 descriptionHash
        )
    {
        targets = new address[](1);
        targets[0] = address(treasury);
        values = new uint256[](1);
        values[0] = 0;
        calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSelector(
            Treasury.release.selector,
            payable(recipient),
            1 ether
        );
        string memory description = "Release 1 ETH";
        descriptionHash = keccak256(bytes(description));

        proposalId = governor.propose(targets, values, calldatas, description);
    }

    function testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed()
        public
    {
        (uint256 proposalId, , , , ) = _propose();

        vm.roll(block.number + governor.votingDelay() + 1); // now Active — the snapshot block is in the PAST

        // Simulate a flash loan: the attacker held ZERO tokens at the real snapshot block, but
        // acquires a huge amount RIGHT NOW, in the current block, well after that snapshot.
        vm.prank(proposer);
        token.transfer(attacker, 10_000 ether);

        vm.prank(attacker);
        token.delegate(attacker);

        vm.prank(attacker);
        governor.castVote(proposalId, 1);

        // The vote was accepted (castVote itself doesn't revert), but check what weight it ACTUALLY counted —
        // read via the proposal's own historical snapshot, not the attacker's current, flash-loaded balance.
        (, uint256 forVotes, ) = governor.proposalVotes(proposalId);
        assertEq(forVotes, 0); // the attacker's real historical checkpoint, as of the snapshot block, was zero
    }

    function testFix_UnanimousSupportStillFailsWithoutQuorum() public {
        // A small minority — 1% of supply, well under the 4% quorum — votes, unanimously, in favor.
        address smallVoter = address(0xD1);
        vm.prank(proposer);
        token.transfer(smallVoter, 10_000 ether); // 1% of the 1,000,000 ether total supply
        vm.prank(smallVoter);
        token.delegate(smallVoter);
        vm.roll(block.number + 1);

        (uint256 proposalId, , , , ) = _propose();
        vm.roll(block.number + governor.votingDelay() + 1);

        vm.prank(smallVoter);
        governor.castVote(proposalId, 1); // unanimous — the ONLY vote cast, and it's "For"

        vm.roll(block.number + governor.votingPeriod() + 1);

        // In OpenZeppelin Governor, the enum value 3 = Defeated.
        assertEq(uint8(governor.state(proposalId)), 3); // NOT Succeeded
    }

    function testExploit_LowBalanceAddressCannotProposeAtAll() public {
        address lowBalanceAddress = address(0xE1);
        vm.prank(proposer);
        token.transfer(lowBalanceAddress, 1 ether); // far below the 1000 ether proposalThreshold
        vm.prank(lowBalanceAddress);
        token.delegate(lowBalanceAddress);
        vm.roll(block.number + 1);

        address[] memory targets = new address[](1);
        targets[0] = address(treasury);
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSelector(
            Treasury.release.selector,
            payable(recipient),
            1 ether
        );

        vm.prank(lowBalanceAddress);
        vm.expectRevert(); // GovernorInsufficientProposerVotes (exact error name may vary by version)
        governor.propose(targets, values, calldatas, "Spam proposal");
    }
}
