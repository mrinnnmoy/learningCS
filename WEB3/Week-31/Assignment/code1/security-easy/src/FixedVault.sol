// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract FixedVault {
    address public immutable owner;

    constructor(address _owner) {
        owner = _owner;   // set exactly once, at deploy time (Week 27, Concept 5) — no separate initializer exists
    }

    function withdraw() external {
        require(msg.sender == owner, "not owner");
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}
}