// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract SimpleVault {
    mapping(address => uint256) public balances;

    error InsufficientBalance();
    error WithdrawFailed();

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        if (amount > balances[msg.sender]) revert InsufficientBalance(); // correct: strictly greater-than
        balances[msg.sender] -= amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WithdrawFailed();
    }
}
