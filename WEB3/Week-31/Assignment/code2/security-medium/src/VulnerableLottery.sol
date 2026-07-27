// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// VULNERABLE ON PURPOSE — timestamp-dependent randomness (Concept 9). Never ship this.
contract VulnerableLottery {
    address[] public players;

    function enter() external payable {
        require(msg.value == 1 ether, "entry is exactly 1 ether");
        players.push(msg.sender);
    }

    function drawWinner() external returns (address winner) {
        uint256 index = uint256(keccak256(abi.encode(block.timestamp))) % players.length;
        winner = players[index];
        payable(winner).transfer(address(this).balance);
    }
}