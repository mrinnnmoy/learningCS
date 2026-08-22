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

contract SessionKeyAccount is IAccount {
    address public owner;
    address public immutable entryPoint;

    address public sessionKey;
    address public sessionAllowedTarget;
    uint256 public sessionExpiry;

    error NotEntryPoint();
    error NotOwnerOrEntryPoint();
    error ExecutionFailed();

    modifier onlyEntryPoint() {
        if (msg.sender != entryPoint) revert NotEntryPoint();
        _;
    }

    constructor(address _entryPoint, address _owner) {
        entryPoint = _entryPoint;
        owner = _owner;
    }

    receive() external payable {}

    function setSessionKey(
        address key,
        address allowedTarget,
        uint256 expiry
    ) external {
        if (msg.sender != owner) revert NotOwnerOrEntryPoint();
        sessionKey = key;
        sessionAllowedTarget = allowedTarget;
        sessionExpiry = expiry;
    }

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external onlyEntryPoint returns (uint256 validationData) {
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            userOpHash
        );
        address signer = ECDSA.recover(ethSignedHash, userOp.signature);

        if (signer == owner) {
            validationData = 0; // full authority, exactly Easy's own MinimalAccount
        } else if (signer == sessionKey) {
            address calledTarget = _extractTarget(userOp.callData);
            bool withinScope = (calledTarget == sessionAllowedTarget) &&
                (block.timestamp <= sessionExpiry);
            validationData = withinScope ? 0 : 1; // Concept 8 — scoped, temporary authority ONLY
        } else {
            validationData = 1;
        }

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

    function _extractTarget(
        bytes calldata callData
    ) internal pure returns (address target) {
        // execute(address target, uint256 value, bytes data) — `target` is the first parameter,
        // sitting right after the 4-byte selector in the encoded calldata.
        target = address(bytes20(callData[16:36]));
    }
}
