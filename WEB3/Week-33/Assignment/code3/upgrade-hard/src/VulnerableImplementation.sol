// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// VULNERABLE ON PURPOSE — no _disableInitializers() in the constructor (Concept 9). Never ship this.
contract VulnerableImplementation is Initializable, OwnableUpgradeable {
    uint256 public balance;

    // NO constructor at all here — meaning NO _disableInitializers() call ever happens,
    // meaning this contract's own `initialize` stays callable by anyone, forever, on its
    // own address, entirely independent of whatever proxy might separately point at it.

    function initialize(address _owner) public initializer {
        __Ownable_init(_owner);
    }
}
