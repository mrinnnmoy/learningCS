// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract LoopGasDemo {
    function sumChecked(
        uint256[] calldata values
    ) external pure returns (uint256 total) {
        for (uint256 i = 0; i < values.length; i++) {
            total += values[i];
        }
    }

    function sumUnchecked(
        uint256[] calldata values
    ) external pure returns (uint256 total) {
        uint256 length = values.length; // Concept 7 — cached once
        for (uint256 i = 0; i < length; ) {
            total += values[i];
            unchecked {
                ++i;
            } // Concept 4 — provably safe, bounded by a real array's own length
        }
    }
}
