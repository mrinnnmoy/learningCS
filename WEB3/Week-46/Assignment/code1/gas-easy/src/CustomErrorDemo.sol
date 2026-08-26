// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract CustomErrorDemo {
    uint256 public value;

    error ValueTooLow();
    error ValueTooHigh();

    function setValue(uint256 newValue) external {
        if (newValue == 0) revert ValueTooLow();
        if (newValue >= 1_000_000) revert ValueTooHigh();
        value = newValue;
    }
}
