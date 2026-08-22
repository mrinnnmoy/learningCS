// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {IAccount} from "account-abstraction/interfaces/IAccount.sol";
import {
    PackedUserOperation
} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    MessageHashUtils
} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract SocialRecoveryAccount is IAccount {
    address public owner;
    address public immutable entryPoint;
    address[] public guardians;
    uint256 public immutable threshold;

    error NotEntryPoint();
    error NotOwnerOrEntryPoint();
    error ExecutionFailed();
    error InsufficientGuardianSignatures();
    error NotAGuardian(address signer);
    error DuplicateGuardianSigner();

    modifier onlyEntryPoint() {
        if (msg.sender != entryPoint) revert NotEntryPoint();
        _;
    }

    constructor(
        address _entryPoint,
        address _owner,
        address[] memory _guardians,
        uint256 _threshold
    ) {
        entryPoint = _entryPoint;
        owner = _owner;
        guardians = _guardians;
        threshold = _threshold;
    }

    receive() external payable {}

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external onlyEntryPoint returns (uint256 validationData) {
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            userOpHash
        );
        address signer = ECDSA.recover(ethSignedHash, userOp.signature);
        validationData = (signer == owner) ? 0 : 1;

        if (missingAccountFunds > 0) {
            (bool ok, ) = payable(msg.sender).call{value: missingAccountFunds}(
                ""
            );
            (ok);
        }
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external {
        if (msg.sender != owner && msg.sender != entryPoint)
            revert NotOwnerOrEntryPoint();
        (bool ok, ) = target.call{value: value}(data);
        if (!ok) revert ExecutionFailed();
    }

    function recoverOwnership(
        address newOwner,
        bytes[] calldata guardianSignatures
    ) external {
        bytes32 messageHash = keccak256(abi.encode(newOwner, address(this)));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );

        address[] memory seen = new address[](guardianSignatures.length);
        uint256 validCount;
        for (uint256 i = 0; i < guardianSignatures.length; i++) {
            address signer = ECDSA.recover(
                ethSignedHash,
                guardianSignatures[i]
            );
            if (!_isGuardian(signer)) revert NotAGuardian(signer);
            for (uint256 j = 0; j < validCount; j++) {
                if (seen[j] == signer) revert DuplicateGuardianSigner();
            }
            seen[validCount] = signer;
            validCount++;
        }
        if (validCount < threshold) revert InsufficientGuardianSignatures();

        owner = newOwner; // Concept 9 — the OLD key stops working immediately; the NEW one starts
    }

    function _isGuardian(address addr) internal view returns (bool) {
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i] == addr) return true;
        }
        return false;
    }
}
