// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {NativeToken} from "../src/NativeToken.sol";
import {MultisigBridge} from "../src/MultisigBridge.sol";

contract BurnAndMintMultisigTest is Test {
    MultisigBridge bridgeB;
    NativeToken tokenB;

    uint256 relayer1Key = 0x1;
    uint256 relayer2Key = 0x2;
    uint256 relayer3Key = 0x3;
    address relayer1;
    address relayer2;
    address relayer3;

    address user = address(0xCAFE);

    function setUp() public {
        relayer1 = vm.addr(relayer1Key);
        relayer2 = vm.addr(relayer2Key);
        relayer3 = vm.addr(relayer3Key);

        address[] memory relayers = new address[](3);
        relayers[0] = relayer1;
        relayers[1] = relayer2;
        relayers[2] = relayer3;

        bridgeB = new MultisigBridge(relayers, 2); // 2-of-3 threshold
        tokenB = new NativeToken("Native Token B", "NATB", address(bridgeB));
        bridgeB.setToken(address(tokenB));
    }

    function _sign(
        uint256 privateKey,
        bytes32 messageHash
    ) internal pure returns (bytes memory) {
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, ethSignedHash);
        return abi.encodePacked(r, s, v);
    }

    function testFix_FewerThanThresholdSignaturesReverts() public {
        bytes32 messageHash = keccak256(
            abi.encode(
                user,
                100 ether,
                uint256(1),
                block.chainid,
                address(bridgeB)
            )
        );
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = _sign(relayer1Key, messageHash); // only ONE signature — below the 2-of-3 threshold

        vm.expectRevert(MultisigBridge.InsufficientSignatures.selector);
        bridgeB.mintWithSignatures(user, 100 ether, 1, signatures);
    }

    function testFix_ExactlyThresholdDistinctSignaturesSucceeds() public {
        bytes32 messageHash = keccak256(
            abi.encode(
                user,
                100 ether,
                uint256(1),
                block.chainid,
                address(bridgeB)
            )
        );
        bytes[] memory signatures = new bytes[](2);
        signatures[0] = _sign(relayer1Key, messageHash);
        signatures[1] = _sign(relayer2Key, messageHash);

        bridgeB.mintWithSignatures(user, 100 ether, 1, signatures);
        assertEq(tokenB.balanceOf(user), 100 ether);
    }

    function testFix_RepeatedMessageRevertsEvenWithFreshSignatures() public {
        bytes32 messageHash = keccak256(
            abi.encode(
                user,
                100 ether,
                uint256(1),
                block.chainid,
                address(bridgeB)
            )
        );
        bytes[] memory signatures = new bytes[](2);
        signatures[0] = _sign(relayer1Key, messageHash);
        signatures[1] = _sign(relayer2Key, messageHash);
        bridgeB.mintWithSignatures(user, 100 ether, 1, signatures); // succeeds once

        // The SAME nonce/recipient/amount, re-signed by a DIFFERENT pair of relayers this time —
        // still the identical underlying message, still rejected (Concept 9's own defense).
        bytes[] memory freshSignatures = new bytes[](2);
        freshSignatures[0] = _sign(relayer2Key, messageHash);
        freshSignatures[1] = _sign(relayer3Key, messageHash);

        vm.expectRevert(MultisigBridge.MessageAlreadyProcessed.selector);
        bridgeB.mintWithSignatures(user, 100 ether, 1, freshSignatures);
    }
}
