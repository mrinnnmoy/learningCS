// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract SimpleVault {
    mapping(address => uint256) private balances;

    error InsufficientBalance(uint256 requested, uint256 available);
    error ETHTransferFailed();

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event FallbackTriggered(address indexed from, uint256 amount, bytes data);

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    fallback() external payable {
        emit FallbackTriggered(msg.sender, msg.value, msg.data);
    }

    function withdraw(uint256 amount) external {
        uint256 bal = balances[msg.sender];
        if (amount > bal) revert InsufficientBalance(amount, bal);

        balances[msg.sender] = bal - amount; // EFFECT before INTERACTION (Concept 9)

        (bool ok, ) = msg.sender.call{value: amount}("");
        if (!ok) revert ETHTransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}
