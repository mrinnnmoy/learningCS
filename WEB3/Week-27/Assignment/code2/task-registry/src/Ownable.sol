// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

abstract contract Ownable {
    address public owner;

    error NotOwner(address caller);

    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(address initialOwner) {
        owner = initialOwner;
        emit OwnerChanged(address(0), initialOwner);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }
}
