// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract GuardedVault {
    mapping(address => uint256) public balances;
    bool private locked;

    error ReentrantCall();
    error TransferFailed();

    modifier nonReentrant() {
        if (locked) revert ReentrantCall();
        locked = true;
        _;
        locked = false;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "nothing to withdraw");

        balances[msg.sender] = 0;                          // EFFECT before INTERACTION (Concept 9)

        (bool ok, ) = msg.sender.call{value: bal}("");
        if (!ok) revert TransferFailed();
    }

    function vaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}