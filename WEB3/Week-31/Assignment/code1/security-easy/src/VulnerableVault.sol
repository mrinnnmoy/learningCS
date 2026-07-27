// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// VULNERABLE ON PURPOSE — unprotected initializer (Concept 3). Never ship this.
contract VulnerableVault {
    address public owner;

    function initialize(address _owner) external {
        owner = _owner;   // NO check that this hasn't already been called
    }

    function withdraw() external {
        require(msg.sender == owner, "not owner");
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}
}