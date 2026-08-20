// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract BatchPoster {
    event BatchPosted(uint256 indexed batchId, uint256 dataLength);
    uint256 public batchCount;

    // Isolating the ONE variable this assignment measures (Week 40's own discipline):
    // the real gas cost of the calldata itself, not any processing logic around it.
    function postBatch(bytes calldata data) external {
        emit BatchPosted(batchCount, data.length);
        batchCount++;
    }
}
