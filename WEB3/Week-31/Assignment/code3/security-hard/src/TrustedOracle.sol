// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

// A stand-in for a real external oracle (Chainlink/Pyth, Week 41) — owner-set,
// deliberately disconnected from any AMM's own reserves, so a single transaction's
// worth of trading has no effect on it at all.
contract TrustedOracle {
    address public immutable owner;
    uint256 public priceBPerA;

    error NotOwner();

    constructor(address _owner, uint256 _initialPrice) {
        owner = _owner;
        priceBPerA = _initialPrice;
    }

    function setPrice(uint256 newPrice) external {
        if (msg.sender != owner) revert NotOwner();
        priceBPerA = newPrice;
    }
}