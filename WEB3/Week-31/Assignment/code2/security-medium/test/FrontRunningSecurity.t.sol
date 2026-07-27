// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {VulnerableGuessTheNumber} from "../src/VulnerableGuessTheNumber.sol";
import {CommitRevealGuess} from "../src/CommitRevealGuess.sol";

contract FrontRunningSecurityTest is Test {
    function testExploit_AnswerVisibleInCalldataCanBeCopied() public {
        VulnerableGuessTheNumber game = new VulnerableGuessTheNumber{
            value: 5 ether
        }(42);

        address honestPlayer = address(0xA1);
        vm.deal(honestPlayer, 1 ether);

        // The honest player's real transaction would carry answer=42 as PLAIN, readable
        // calldata (Week 26, Concept 6) sitting in the mempool (Concept 4) before it's
        // mined — an attacker reads it and submits an identical copy with higher gas,
        // landing first. Simulated directly here: the attacker simply acts first with
        // the same value, since the vulnerability is that NOTHING stops them from
        // knowing it in advance.
        address attacker = address(0xBEEF);
        vm.deal(attacker, 1 ether);
        vm.prank(attacker);
        game.guess{value: 1 ether}(42); // the copied answer — the attacker wins, not the honest player

        assertEq(attacker.balance, 1 ether - 1 ether + 6 ether); // attacker collected the pot
    }

    function testFix_CommitRevealHidesTheAnswerUntilItsUseless() public {
        CommitRevealGuess game = new CommitRevealGuess{value: 5 ether}(42);

        address honestPlayer = address(0xA1);
        uint256 guess = 42;
        bytes32 salt = keccak256("honest player's own secret salt");
        bytes32 commitment = keccak256(
            abi.encodePacked(guess, salt, honestPlayer)
        );

        vm.prank(honestPlayer);
        game.commit(commitment); // only a HASH is public here — no attacker can extract 42 from this

        game.openReveals();

        vm.prank(honestPlayer);
        game.reveal(guess, salt); // reveals only once it's too late for anyone to front-run a NEW commit

        assertEq(honestPlayer.balance, 5 ether);
    }
}
