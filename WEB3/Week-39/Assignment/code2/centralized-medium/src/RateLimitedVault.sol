// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {MockERC20} from "./MockERC20.sol";

contract RateLimitedVault {
    MockERC20 public immutable token;
    mapping(address => uint256) public balances;
    mapping(address => uint256) public withdrawnInWindow;
    mapping(address => uint256) public windowStart;

    uint256 public constant DAILY_LIMIT = 100 ether;
    uint256 public constant WINDOW = 1 days;

    error RateLimitExceeded();

    constructor(address _token) {
        token = MockERC20(_token);
    }

    function deposit(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        if (block.timestamp >= windowStart[msg.sender] + WINDOW) {
            windowStart[msg.sender] = block.timestamp; // Concept 4 — a fresh window, reset the counter
            withdrawnInWindow[msg.sender] = 0;
        }

        if (withdrawnInWindow[msg.sender] + amount > DAILY_LIMIT)
            revert RateLimitExceeded();

        withdrawnInWindow[msg.sender] += amount;
        balances[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }
}
