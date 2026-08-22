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

contract MinimalAccount is IAccount {
    address public owner;
    address public immutable entryPoint;

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

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external onlyEntryPoint returns (uint256 validationData) {
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            userOpHash
        );
        address signer = ECDSA.recover(ethSignedHash, userOp.signature);
        validationData = (signer == owner) ? 0 : 1; // ERC-4337's own real convention — Concept 3

        if (missingAccountFunds > 0) {
            (bool ok, ) = payable(msg.sender).call{value: missingAccountFunds}(
                ""
            );
            (ok); // best-effort funding, matching the reference SimpleAccount's own pattern
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
}
