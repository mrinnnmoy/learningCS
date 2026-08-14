// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract NormalizedRegistry {
    struct User {
        string name;
        uint256 registeredAt;
    }

    struct Balance {
        uint256 amount;
    }

    mapping(address => User) public users;
    mapping(address => Balance) public balances;

    function register(string calldata name) external {
        users[msg.sender] = User(name, block.timestamp);
    }

    function deposit() external payable {
        balances[msg.sender].amount += msg.value;
    }

    function getUserSummary(
        address user
    ) external view returns (string memory name, uint256 amount) {
        name = users[user].name;
        amount = balances[user].amount;
    }
}
