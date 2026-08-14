// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

interface IUserRegistryV1 {
    function usersV1(
        address user
    ) external view returns (string memory name, uint256 registeredAt);
}

contract UserRegistryV2 {
    struct UserV2 {
        string name;
        uint256 registeredAt;
        uint8 version; // 0 = never touched V2's own storage; 2 = migrated
        string bio;
    }

    IUserRegistryV1 public immutable legacyRegistry;
    mapping(address => UserV2) public usersV2;

    constructor(address _legacyRegistry) {
        legacyRegistry = IUserRegistryV1(_legacyRegistry);
    }

    function getUser(
        address user
    )
        public
        view
        returns (string memory name, uint256 registeredAt, string memory bio)
    {
        UserV2 memory local = usersV2[user];
        if (local.version == 2) {
            return (local.name, local.registeredAt, local.bio); // already migrated — read directly
        }
        (string memory legacyName, uint256 legacyRegisteredAt) = legacyRegistry
            .usersV1(user);
        return (legacyName, legacyRegisteredAt, ""); // never migrated — fall back to V1
    }

    function setBio(string calldata bio) external {
        if (usersV2[msg.sender].version != 2) {
            (
                string memory legacyName,
                uint256 legacyRegisteredAt
            ) = legacyRegistry.usersV1(msg.sender);
            usersV2[msg.sender] = UserV2(
                legacyName,
                legacyRegisteredAt,
                2,
                bio
            ); // lazy migration, HERE
        } else {
            usersV2[msg.sender].bio = bio;
        }
    }
}
