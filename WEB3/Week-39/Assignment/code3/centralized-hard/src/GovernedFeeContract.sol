// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract GovernedFeeContract is Ownable {
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 1000; // 10% hard cap — Concept 6's own point, even governance can't exceed this

    error FeeTooHigh();

    event FeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(
        address initialOwner,
        uint256 initialFeeBps
    ) Ownable(initialOwner) {
        if (initialFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = initialFeeBps;
    }

    function setFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        emit FeeUpdated(feeBps, newFeeBps);
        feeBps = newFeeBps;
    }
}
