// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// VULNERABLE ON PURPOSE — front-runnable reveal (Concept 4). Never ship this.
contract VulnerableGuessTheNumber {
    uint256 private immutable secretNumber;

    constructor(uint256 _secretNumber) payable {
        secretNumber = _secretNumber;
    }

    function guess(uint256 answer) external payable {
        require(msg.value == 1 ether, "entry is exactly 1 ether");
        if (answer == secretNumber) {
            payable(msg.sender).transfer(address(this).balance);
        }
    }
}