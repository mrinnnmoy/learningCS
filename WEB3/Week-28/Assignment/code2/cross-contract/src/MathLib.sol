// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract MathLib {
    uint256 public lastResult;   // storage slot 0 — MUST match Delegator's slot 0 layout

    function multiply(uint256 a, uint256 b) external returns (uint256) {
        lastResult = a * b;
        return lastResult;
    }
}