// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

contract PackedStorage {
    struct Item {
        uint128 quantity; // slot 0, bytes 0-15
        uint128 price; // slot 0, bytes 16-31
        bool active; // slot 1, byte 0
        uint88 createdAt; // slot 1, bytes 1-11
    }

    mapping(uint256 => Item) public items;

    function create(uint256 id, uint128 quantity, uint128 price) external {
        items[id] = Item(quantity, price, true, uint88(block.timestamp));
    }
}
