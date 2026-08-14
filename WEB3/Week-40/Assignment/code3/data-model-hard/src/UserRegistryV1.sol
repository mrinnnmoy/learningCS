// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract UserRegistryV1 {
    struct UserV1 {
        string name;
        uint256 registeredAt;
    }

    mapping(address => UserV1) public usersV1;

    function register(string calldata name) external {
        usersV1[msg.sender] = UserV1(name, block.timestamp);
    }
}
