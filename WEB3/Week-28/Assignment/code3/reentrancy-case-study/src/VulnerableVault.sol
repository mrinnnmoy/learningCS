// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // VIOLATES Checks-Effects-Interactions (Concept 9) ON PURPOSE — case study only.
    function withdraw() external {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "nothing to withdraw");

        (bool ok, ) = msg.sender.call{value: bal}("");   // INTERACTION before EFFECT — the bug
        require(ok, "transfer failed");

        balances[msg.sender] = 0;                          // EFFECT, too late
    }

    function vaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}