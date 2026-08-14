// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract DenormalizedRegistry {
    struct UserProfile {
        string name;
        uint256 registeredAt;
        uint256 balance;
    }

    mapping(address => UserProfile) public profiles;

    function register(string calldata name) external {
        profiles[msg.sender].name = name;
        profiles[msg.sender].registeredAt = block.timestamp;
    }

    function deposit() external payable {
        profiles[msg.sender].balance += msg.value;
    }

    function getUserSummary(
        address user
    ) external view returns (string memory name, uint256 amount) {
        UserProfile storage p = profiles[user];

        name = p.name;
        amount = p.balance;
    }
}
