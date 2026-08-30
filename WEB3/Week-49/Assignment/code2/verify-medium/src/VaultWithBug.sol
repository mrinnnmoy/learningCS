// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract VaultWithBug {
    mapping(address => uint256) public balances;

    error InsufficientBalance();
    error WithdrawFailed();

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        if (amount > balances[msg.sender]) revert InsufficientBalance();
        balances[msg.sender] -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WithdrawFailed();
    }

    // VULNERABLE ON PURPOSE — Concept 1's own real, catchable bug. Never ship this.
    // Meant to credit interest, but never checks that real ETH actually backs the credit.
    function creditReward(address user, uint256 amount) external {
        balances[user] += amount; // BUG — no real ETH ever enters the contract here at all
    }
}
