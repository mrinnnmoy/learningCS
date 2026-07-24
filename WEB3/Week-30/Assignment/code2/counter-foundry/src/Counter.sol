// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract Counter {
    address public immutable owner;
    uint256 private count;

    error NotOwner(address caller);
    error CountUnderflow();

    event CountIncreased(address indexed by, uint256 newCount);
    event CountDecreased(address indexed by, uint256 newCount);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function increment() external {
        count += 1;
        emit CountIncreased(msg.sender, count);
    }

    function incrementBy(uint256 amount) external onlyOwner {
        count += amount;
        emit CountIncreased(msg.sender, count);
    }

    function decrement() external {
        if (count == 0) revert CountUnderflow();
        count -= 1;
        emit CountDecreased(msg.sender, count);
    }

    function getCount() external view returns (uint256) {
        return count;
    }
}
