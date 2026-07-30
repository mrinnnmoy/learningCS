// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// Deliberately naive — slot 0 is `owner`, colliding with NaiveProxy's own slot 0 below (Concept 2).
contract NaiveImplementation {
    address public owner;    // slot 0
    uint256 public balance;  // slot 1

    function setOwner(address newOwner) external {
        owner = newOwner;
    }
}