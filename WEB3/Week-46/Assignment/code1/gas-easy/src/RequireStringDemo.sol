// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract RequireStringDemo {
    uint256 public value;

    function setValue(uint256 newValue) external {
        require(
            newValue > 0,
            "value must be greater than zero, this is a long descriptive error message"
        );
        require(
            newValue < 1_000_000,
            "value must be less than one million, this is another long descriptive message"
        );
        value = newValue;
    }
}
