// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract CalldataVsMemory {
    function sumMemory(
        uint256[] memory values
    ) external pure returns (uint256 total) {
        for (uint256 i = 0; i < values.length; i++) {
            total += values[i];
        }
    }

    function sumCalldata(
        uint256[] calldata values
    ) external pure returns (uint256 total) {
        for (uint256 i = 0; i < values.length; i++) {
            total += values[i];
        }
    }
}
