// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SafeImplementation is Initializable, OwnableUpgradeable {
    uint256 public balance;

    constructor() {
        _disableInitializers(); // Concept 6, 9 — the ONLY difference from VulnerableImplementation
    }

    function initialize(address _owner) public initializer {
        __Ownable_init(_owner);
    }
}
