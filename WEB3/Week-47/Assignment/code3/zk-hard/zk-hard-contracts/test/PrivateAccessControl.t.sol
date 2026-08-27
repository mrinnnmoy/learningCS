// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Test} from "forge-std/Test.sol";
import {Groth16Verifier} from "../src/Verifier.sol";
import {PrivateAccessControl} from "../src/PrivateAccessControl.sol";

contract PrivateAccessControlTest is Test {
    Groth16Verifier verifier;
    PrivateAccessControl access;

    // Filled in from `snarkjs zkey export soliditycalldata`, How to Build step 3 — real values.
    uint256[2] pA = [
        0x1c44c1d46dda463f3ca9bb7880d89310d30ada68cc2e5e13fceaf8d5c9e31039,
        0x08c1f42412ce306ad2feddf72ed36208a600d7e85a36b06d9344afbb7750f8d5
    ];

    uint256[2][2] pB = [
        [
            0x0cd23a3c8ddb88015b00b651ccbcecd99b026fd1d9be42b5cc7462191eb01532,
            0x218f69bb5747b0b991b2722f97002a0b3c972776c8ba116e171c2573058b2cfe
        ],
        [
            0x27262d62b59f76ea9de5e5668706a9fa19046d40530790de6d03802f9f593505,
            0x0a8798c3c52687e6ec040fe5c12d9d9a28369d0395a98d86b497acac23069222
        ]
    ];

    uint256[2] pC = [
        0x21ab02fdfd1a44306371efbb9a0fd0b7810415e1795de47bb5c0149e2ccf4aef,
        0x05152f3fcf282f8d9e45df9c9cd1524a1073562ccf1c05062f2faa4ea811a418
    ];

    uint256 realExpectedHash =
        7110303097080024260800444665787206606103183587082596139871399733998958991511; // the REAL Poseidon hash from input.json

    address claimant = address(0xA1);

    function setUp() public {
        verifier = new Groth16Verifier();
        access = new PrivateAccessControl(address(verifier), realExpectedHash);
    }

    function testFix_ValidProofGrantsAccessWithoutRevealingTheSecret() public {
        vm.prank(claimant);
        access.claimAccess(pA, pB, pC, 1);

        assertTrue(access.hasAccess(claimant)); // access granted — the actual `secret` never appeared anywhere on-chain
    }

    function testExploit_IdenticalProofCannotBeReplayed() public {
        vm.prank(claimant);
        access.claimAccess(pA, pB, pC, 1);

        vm.prank(claimant);
        vm.expectRevert(PrivateAccessControl.ProofAlreadyUsed.selector);
        access.claimAccess(pA, pB, pC, 1); // the IDENTICAL proof and nonce, submitted again
    }

    function testExploit_TamperedProofFailsOutright() public {
        uint256[2] memory tamperedA = [pA[0] + 1, pA[1]]; // ANY change at all breaks the real cryptographic proof

        vm.prank(claimant);
        vm.expectRevert(PrivateAccessControl.InvalidProof.selector);
        access.claimAccess(tamperedA, pB, pC, 2);
    }
}
