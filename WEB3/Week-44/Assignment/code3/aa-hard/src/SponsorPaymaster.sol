// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {IPaymaster} from "account-abstraction/interfaces/IPaymaster.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {
    PackedUserOperation
} from "account-abstraction/interfaces/PackedUserOperation.sol";

contract SponsorPaymaster is IPaymaster {
    IEntryPoint public immutable entryPoint;
    address public immutable sponsoredAccount;

    error NotEntryPoint();

    constructor(address _entryPoint, address _sponsoredAccount) {
        entryPoint = IEntryPoint(_entryPoint);
        sponsoredAccount = _sponsoredAccount;
    }

    function fund() external payable {
        entryPoint.depositTo{value: msg.value}(address(this)); // Concept 6 — REQUIRED before sponsoring anything
    }

    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32,
        uint256
    ) external view returns (bytes memory context, uint256 validationData) {
        if (msg.sender != address(entryPoint)) revert NotEntryPoint();
        validationData = (userOp.sender == sponsoredAccount) ? 0 : 1; // sponsors ONLY the allowlisted account
        context = "";
    }

    function postOp(PostOpMode, bytes calldata, uint256, uint256) external {}
}
