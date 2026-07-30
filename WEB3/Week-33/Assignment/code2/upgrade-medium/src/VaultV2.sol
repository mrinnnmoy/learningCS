// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {VaultV1} from "./VaultV1.sol";

/// @custom:oz-upgrades-from VaultV1
contract VaultV2 is VaultV1 {
    uint256 public lastDepositTimestamp;   // SAFE — appended AFTER everything VaultV1 already had (Concept 5)

    function deposit() external payable override {
        balance += msg.value;
        lastDepositTimestamp = block.timestamp;
    }
}