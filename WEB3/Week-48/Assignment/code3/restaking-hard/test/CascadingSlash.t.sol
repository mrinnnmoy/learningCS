// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MultiAVSRestaking} from "../src/MultiAVSRestaking.sol";

contract CascadingSlashTest is Test {
    MultiAVSRestaking manager;
    address restaker = address(0xA1);
    address slasherA = address(0xB1);
    address slasherB = address(0xC1);
    bytes32 constant AVS_A = keccak256("AVS_A");
    bytes32 constant AVS_B = keccak256("AVS_B");

    function setUp() public {
        manager = new MultiAVSRestaking();
        manager.registerAVS(AVS_A, slasherA, 5000); // up to 50% of CURRENT stake
        manager.registerAVS(AVS_B, slasherB, 5000); // up to 50% of CURRENT stake — same underlying capital

        vm.deal(restaker, 100 ether);
        vm.startPrank(restaker);
        manager.restake{value: 100 ether}();
        manager.optIntoAVS(AVS_A); // Concept 1 — the SAME 100 ether now backs BOTH AVSs simultaneously
        manager.optIntoAVS(AVS_B);
        vm.stopPrank();
    }

    function testExploit_CascadingSlashLeavesTwentyFivePercentNotZeroOrFifty()
        public
    {
        vm.prank(slasherA);
        uint256 slashedByA = manager.slash(restaker, AVS_A);
        assertEq(slashedByA, 50 ether); // 50% of the ORIGINAL 100 — A's own expectation, correctly met
        assertEq(manager.restaked(restaker), 50 ether);

        vm.prank(slasherB);
        uint256 slashedByB = manager.slash(restaker, AVS_B);
        // B only gets 50% of what's LEFT (50), not 50% of the ORIGINAL 100 — Concept 5's own real point.
        assertEq(slashedByB, 25 ether);
        assertEq(manager.restaked(restaker), 25 ether); // NOT 0%, and NOT 50% — the real, compounding result
    }

    function testFix_SlashOrderChangesEachAVSsOwnRecoveryButNotTheFinalTotal()
        public
    {
        // Reverse order: B slashes FIRST this time.
        vm.prank(slasherB);
        uint256 slashedByB = manager.slash(restaker, AVS_B);
        assertEq(slashedByB, 50 ether); // now B is the one who gets the FULL 50% of the original amount

        vm.prank(slasherA);
        uint256 slashedByA = manager.slash(restaker, AVS_A);
        assertEq(slashedByA, 25 ether); // now A is the one left with only 25 ether to draw from

        // The RESTAKER's own final remaining balance is identical either way — only WHICH AVS
        // ends up under-recovered changes, a real, concrete "first come, first served" risk.
        assertEq(manager.restaked(restaker), 25 ether);
    }
}
