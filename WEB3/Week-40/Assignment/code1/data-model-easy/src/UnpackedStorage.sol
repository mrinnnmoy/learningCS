// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract UnpackedStorage {
    struct Item {
        uint256 quantity; // slot 0
        uint256 price; // slot 1
        bool active; // slot 2
        uint256 createdAt; // slot 3
    }

    mapping(uint256 => Item) public items;

    function create(uint256 id, uint256 quantity, uint256 price) external {
        items[id] = Item(quantity, price, true, block.timestamp);
    }
}
