// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Groth16Verifier} from "./Verifier.sol";

contract PrivateAccessControl {
    Groth16Verifier public immutable verifier;
    uint256 public immutable expectedHash;
    mapping(bytes32 => bool) public usedProofs;
    mapping(address => bool) public hasAccess;

    error InvalidProof();
    error ProofAlreadyUsed();

    constructor(address _verifier, uint256 _expectedHash) {
        verifier = Groth16Verifier(_verifier);
        expectedHash = _expectedHash;
    }

    function claimAccess(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256 nonce
    ) external {
        uint256[1] memory publicSignals = [expectedHash];

        bytes32 proofId = keccak256(abi.encode(pA, pB, pC, nonce)); // Week 36's own replay-protection pattern
        if (usedProofs[proofId]) revert ProofAlreadyUsed();

        bool valid = verifier.verifyProof(pA, pB, pC, publicSignals);
        if (!valid) revert InvalidProof();

        usedProofs[proofId] = true;
        hasAccess[msg.sender] = true;
    }
}
