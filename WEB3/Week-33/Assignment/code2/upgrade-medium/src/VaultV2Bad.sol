// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    UUPSUpgradeable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/// @custom:oz-upgrades-from VaultV1
contract VaultV2Bad is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 public lastDepositTimestamp; // UNSAFE — INSERTED before `balance`, shifting it to slot 1 (Concept 5)
    uint256 public balance;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _owner) public initializer {
        __Ownable_init(_owner);
    }

    function deposit() external payable {
        balance += msg.value;
        lastDepositTimestamp = block.timestamp;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
